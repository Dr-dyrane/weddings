import {
  immutableCopy,
  PublicationConflictError,
  type PublicationAddress,
  type PublicationIdentity,
  type PublishedWeddingRevision,
  type PublishingRepository,
  type PublishingTransaction,
} from "./publishing";

interface RepositoryState {
  activeRevisions: Map<string, number>;
  publications: Map<string, PublishedWeddingRevision>;
}

function identityKey(identity: PublicationIdentity) {
  return `${identity.tenantId}\u0000${identity.weddingId}`;
}

function addressKey(address: PublicationAddress) {
  return `${identityKey(address)}\u0000${address.revision}`;
}

function cloneState(state: RepositoryState): RepositoryState {
  return {
    activeRevisions: new Map(state.activeRevisions),
    publications: new Map(
      [...state.publications].map(([key, publication]) => [
        key,
        immutableCopy(publication),
      ]),
    ),
  };
}

class InMemoryPublishingTransaction implements PublishingTransaction {
  constructor(
    private readonly state: RepositoryState,
    private readonly beforeActivate: () => void,
  ) {}

  async getActiveRevision(identity: PublicationIdentity) {
    return this.state.activeRevisions.get(identityKey(identity)) ?? null;
  }

  async getNextRevision(identity: PublicationIdentity) {
    const prefix = `${identityKey(identity)}\u0000`;
    let greatestRevision = 0;

    for (const key of this.state.publications.keys()) {
      if (key.startsWith(prefix)) {
        greatestRevision = Math.max(
          greatestRevision,
          Number(key.slice(prefix.length)),
        );
      }
    }

    return greatestRevision + 1;
  }

  async getPublishedRevision(address: PublicationAddress) {
    const publication = this.state.publications.get(addressKey(address));
    return publication ? immutableCopy(publication) : null;
  }

  async appendPublishedRevision(publication: PublishedWeddingRevision) {
    const key = addressKey(publication);
    const duplicateSourceRevision = [...this.state.publications.values()].some(
      (existing) =>
        existing.tenantId === publication.tenantId &&
        existing.weddingId === publication.weddingId &&
        existing.sourceDraftRevision === publication.sourceDraftRevision,
    );

    if (this.state.publications.has(key) || duplicateSourceRevision) {
      throw new PublicationConflictError(
        "Published revisions are append-only and each draft revision may publish only once.",
      );
    }

    this.state.publications.set(key, immutableCopy(publication));
  }

  async setActiveRevision(
    identity: PublicationIdentity,
    revision: number,
    expectedActiveRevision: number | null,
  ) {
    this.beforeActivate();

    const key = identityKey(identity);
    const activeRevision = this.state.activeRevisions.get(key) ?? null;

    if (activeRevision !== expectedActiveRevision) {
      throw new PublicationConflictError();
    }

    if (!this.state.publications.has(addressKey({ ...identity, revision }))) {
      throw new PublicationConflictError(
        "The active revision must reference an existing immutable snapshot.",
      );
    }

    this.state.activeRevisions.set(key, revision);
  }
}

export class InMemoryPublishingRepository implements PublishingRepository {
  private state: RepositoryState = {
    activeRevisions: new Map(),
    publications: new Map(),
  };

  private transactionTail: Promise<void> = Promise.resolve();
  private activationFailure: Error | null = null;

  async transaction<T>(
    operation: (transaction: PublishingTransaction) => Promise<T>,
  ): Promise<T> {
    const previousTransaction = this.transactionTail;
    let releaseTransaction = () => {};
    this.transactionTail = new Promise<void>((resolve) => {
      releaseTransaction = resolve;
    });

    await previousTransaction;

    try {
      const workingState = cloneState(this.state);
      const transaction = new InMemoryPublishingTransaction(
        workingState,
        () => {
          if (this.activationFailure) {
            const failure = this.activationFailure;
            this.activationFailure = null;
            throw failure;
          }
        },
      );
      const result = await operation(transaction);
      this.state = workingState;
      return immutableCopy(result);
    } finally {
      releaseTransaction();
    }
  }

  failNextActivation(error = new Error("Simulated activation failure")) {
    this.activationFailure = error;
  }

  getActiveRevision(identity: PublicationIdentity) {
    return this.state.activeRevisions.get(identityKey(identity)) ?? null;
  }

  getPublishedRevision(address: PublicationAddress) {
    const publication = this.state.publications.get(addressKey(address));
    return publication ? immutableCopy(publication) : null;
  }
}

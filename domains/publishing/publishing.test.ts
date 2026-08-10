import { describe, expect, it } from "vitest";

import { InMemoryPublishingRepository } from "./in-memory-publishing-repository";
import {
  PublicationValidationError,
  publishWedding,
  rollbackPublication,
  type AuthoringWedding,
} from "./publishing";

function createApprovedDraft(
  overrides: Partial<AuthoringWedding> = {},
): AuthoringWedding {
  return {
    tenantId: "tenant-dyrane",
    weddingId: "wedding-alexander-chioma",
    draftRevision: 1,
    slug: "the_ogranyas",
    locale: "en-NG",
    timezone: "Africa/Lagos",
    approval: "approved",
    couple: { first: "Alexander", second: "Chioma" },
    shareCard: {
      portraitMediaId: "media-couple-portrait",
      portraitOpacity: 1,
    },
    invitation: {
      eyebrow: "Together with their families",
      headline: "You’re invited to celebrate with us.",
      introduction: "invite you to witness the beginning of their forever.",
    },
    dateLabel: "September 15, 2027",
    locationLabel: "Lagos, Nigeria",
    story: [
      {
        id: "public-story",
        sequence: "01",
        eyebrow: "Where it began",
        title: "One conversation.",
        dateLabel: "2021 · Lagos",
        sortOrder: 1,
        visibility: "public",
      },
      {
        id: "draft-story",
        sequence: "DRAFT",
        eyebrow: "Do not publish",
        title: "A private draft fact",
        dateLabel: "Unconfirmed",
        narrative: "Private narrative",
        artDirection: "Private art direction",
        sortOrder: 2,
        visibility: "private",
        privateNotes: "Internal story note",
      },
    ],
    events: [
      {
        id: "ceremony",
        title: "The Vow",
        eyebrow: "02:00 PM",
        startsAt: "2027-09-15T14:00:00+01:00",
        endsAt: "2027-09-15T15:30:00+01:00",
        venue: "The Glass House",
        address: "Lagos, Nigeria",
        map: {
          label: "Directions",
          href: "https://example.com/directions",
        },
        sortOrder: 1,
        visibility: "public",
      },
    ],
    dress: {
      eyebrow: "Dress the part",
      title: "Dusk, devotion & a little magic.",
      guidance: "Formal",
      palette: [{ name: "Pitch black", hex: "#000000" }],
    },
    people: [
      {
        id: "public-person",
        displayName: "Adaeze Ojukwu",
        role: "Maid of Honour",
        group: "wedding-party",
        sortOrder: 1,
        visibility: "public",
        consent: "approved",
        privateContact: "adaeze@example.test",
        privateNotes: "Never reveal this note",
      },
      {
        id: "private-person",
        displayName: "Private Person",
        role: "Unconfirmed role",
        group: "family",
        sortOrder: 2,
        visibility: "private",
        consent: "pending",
        privateContact: "+234-555-0100",
      },
    ],
    vendors: [
      {
        id: "public-vendor",
        displayName: "Violet & Palm Atelier",
        category: "Floral direction",
        sortOrder: 1,
        visibility: "public",
        consent: "approved",
        contactVisibility: "private",
        privateContact: "vendor@example.test",
      },
    ],
    mediaAssets: [
      {
        id: "media-couple-portrait",
        publishedAsset: "alexander-chioma-line-v5",
        sourceKey: "private/source/couple.png",
        width: 1200,
        height: 1600,
        focalPoint: { x: 0.5, y: 0.4 },
        cropVariants: {
          share: { key: "derived/share.png", width: 1200, height: 630 },
        },
        altTreatment: "decorative",
        rights: "approved",
        consent: "approved",
        approval: "approved",
        visibility: "public",
        provenance: { source: "approved-intake" },
        privateNotes: "Source files stay private",
      },
    ],
    theme: {
      id: "modern-heirloom",
      version: 1,
      approval: "approved",
    },
    privateNotes: "Unconfirmed rehearsal at noon",
    ...overrides,
  };
}

describe("publishing boundary", () => {
  it("compiles only approved public facts into a validated snapshot", async () => {
    const repository = new InMemoryPublishingRepository();
    const publication = await publishWedding(repository, {
      draft: createApprovedDraft(),
      publishedBy: "studio-user-1",
      expectedActiveRevision: null,
      generatedAt: new Date("2026-08-09T12:00:00.000Z"),
    });

    expect(publication).toMatchObject({
      tenantId: "tenant-dyrane",
      weddingId: "wedding-alexander-chioma",
      revision: 1,
      sourceDraftRevision: 1,
      shareCardEdition: "revision-1",
      snapshot: {
        id: "wedding-alexander-chioma",
        revision: 1,
        status: "published",
      },
    });
    expect(publication.snapshot.story.map(({ id }) => id)).toEqual([
      "public-story",
    ]);
    expect(publication.snapshot.people.map(({ id }) => id)).toEqual([
      "public-person",
    ]);

    const serialized = JSON.stringify(publication);
    expect(serialized).not.toContain("Private Person");
    expect(serialized).not.toContain("private/source/couple.png");
    expect(serialized).not.toContain("example.test");
    expect(serialized).not.toContain("privateNotes");
  });

  it("rejects a public name or image without explicit approval", async () => {
    const repository = new InMemoryPublishingRepository();
    const draft = createApprovedDraft();
    draft.people[0].consent = "pending";

    await expect(
      publishWedding(repository, {
        draft,
        publishedBy: "studio-user-1",
        expectedActiveRevision: null,
      }),
    ).rejects.toBeInstanceOf(PublicationValidationError);
    expect(
      repository.getActiveRevision({
        tenantId: draft.tenantId,
        weddingId: draft.weddingId,
      }),
    ).toBeNull();
  });

  it("does not expose a partially appended revision when activation fails", async () => {
    const repository = new InMemoryPublishingRepository();
    const draft = createApprovedDraft();
    repository.failNextActivation();

    await expect(
      publishWedding(repository, {
        draft,
        publishedBy: "studio-user-1",
        expectedActiveRevision: null,
      }),
    ).rejects.toThrow("Simulated activation failure");

    expect(
      repository.getPublishedRevision({
        tenantId: draft.tenantId,
        weddingId: draft.weddingId,
        revision: 1,
      }),
    ).toBeNull();
    expect(
      repository.getActiveRevision({
        tenantId: draft.tenantId,
        weddingId: draft.weddingId,
      }),
    ).toBeNull();
  });

  it("keeps earlier snapshots immutable and rollback-addressable", async () => {
    const repository = new InMemoryPublishingRepository();
    const firstDraft = createApprovedDraft();
    const first = await publishWedding(repository, {
      draft: firstDraft,
      publishedBy: "studio-user-1",
      expectedActiveRevision: null,
    });
    const second = await publishWedding(repository, {
      draft: createApprovedDraft({
        draftRevision: 2,
        invitation: {
          ...firstDraft.invitation,
          headline: "A revised invitation headline.",
        },
      }),
      publishedBy: "studio-user-1",
      expectedActiveRevision: 1,
    });

    expect(second.revision).toBe(2);
    expect(() => {
      first.snapshot.invitation.headline = "mutated";
    }).toThrow();
    expect(
      repository.getPublishedRevision({
        tenantId: first.tenantId,
        weddingId: first.weddingId,
        revision: 1,
      })?.snapshot.invitation.headline,
    ).toBe("You’re invited to celebrate with us.");

    const restored = await rollbackPublication(repository, {
      tenantId: first.tenantId,
      weddingId: first.weddingId,
      revision: 1,
      expectedActiveRevision: 2,
    });

    expect(restored.revision).toBe(1);
    expect(
      repository.getActiveRevision({
        tenantId: first.tenantId,
        weddingId: first.weddingId,
      }),
    ).toBe(1);
    expect(
      repository.getPublishedRevision({
        tenantId: second.tenantId,
        weddingId: second.weddingId,
        revision: 2,
      })?.snapshot.invitation.headline,
    ).toBe("A revised invitation headline.");

    const third = await publishWedding(repository, {
      draft: createApprovedDraft({
        draftRevision: 3,
        invitation: {
          ...firstDraft.invitation,
          headline: "A third invitation headline.",
        },
      }),
      publishedBy: "studio-user-1",
      expectedActiveRevision: 1,
    });

    expect(third.revision).toBe(3);
  });

  it("scopes revision identity and rollback to the tenant and wedding", async () => {
    const repository = new InMemoryPublishingRepository();
    const firstTenant = createApprovedDraft();
    const secondTenant = createApprovedDraft({ tenantId: "tenant-other" });

    await publishWedding(repository, {
      draft: firstTenant,
      publishedBy: "studio-user-1",
      expectedActiveRevision: null,
    });
    await publishWedding(repository, {
      draft: secondTenant,
      publishedBy: "studio-user-2",
      expectedActiveRevision: null,
    });
    await rollbackPublication(repository, {
      tenantId: firstTenant.tenantId,
      weddingId: firstTenant.weddingId,
      revision: 1,
      expectedActiveRevision: 1,
    });

    expect(
      repository.getActiveRevision({
        tenantId: secondTenant.tenantId,
        weddingId: secondTenant.weddingId,
      }),
    ).toBe(1);
    expect(
      repository.getPublishedRevision({
        tenantId: "tenant-missing",
        weddingId: firstTenant.weddingId,
        revision: 1,
      }),
    ).toBeNull();
  });
});

"use client";

import Link from "next/link";
import { useState } from "react";

import {
  MAX_PHOTO_BYTES,
  PHOTO_CONSENT_VERSION,
} from "@/domains/event-collaboration/event-policy";
import type { ResolvedPhotoCollection } from "@/domains/event-collaboration/event-store";
import type { PublishedWedding } from "@/domains/weddings/published-wedding";
import styles from "@/features/event-collaboration/celebration.module.css";

type UploadState =
  | { kind: "idle" }
  | { kind: "uploading"; progress: number }
  | { kind: "error"; message: string }
  | { kind: "received" };

function newIdempotencyKey() {
  return crypto.randomUUID().replaceAll("-", "");
}

export function GuestPhotoCollection({
  collection,
  credential,
  wedding,
}: {
  collection: ResolvedPhotoCollection;
  credential: string;
  wedding: PublishedWedding;
}) {
  const coupleName = `${wedding.couple.first} & ${wedding.couple.second}`;
  const [state, setState] = useState<UploadState>({ kind: "idle" });
  const [photo, setPhoto] = useState<File | null>(null);
  const [idempotencyKey] = useState(() => newIdempotencyKey());
  const uploadPath = `/api/weddings/${encodeURIComponent(
    wedding.slug,
  )}/celebration/photos/${encodeURIComponent(credential)}`;

  const send = (form: HTMLFormElement) => {
    const data = new FormData(form);
    data.set("idempotencyKey", idempotencyKey);
    const request = new XMLHttpRequest();
    request.open("POST", uploadPath);
    request.responseType = "json";
    request.upload.addEventListener("progress", (event) => {
      if (!event.lengthComputable) return;
      setState({
        kind: "uploading",
        progress: Math.max(0, Math.min(100, (event.loaded / event.total) * 100)),
      });
    });
    request.addEventListener("load", () => {
      if (request.status >= 200 && request.status < 300) {
        setState({ kind: "received" });
        return;
      }
      setState({
        kind: "error",
        message:
          request.response?.error ??
          "The photo did not arrive. Your original is still safe on this device.",
      });
    });
    request.addEventListener("error", () => {
      setState({
        kind: "error",
        message:
          "The connection was interrupted. Your original is still safe—try again when the signal improves.",
      });
    });
    setState({ kind: "uploading", progress: 0 });
    request.send(data);
  };

  return (
    <main className={`${styles.shell} ${styles.photoShell}`}>
      <nav aria-label="Guest camera navigation" className={styles.navigation}>
        <Link className={styles.coupleLink} href={`/${wedding.slug}`}>
          {coupleName}
        </Link>
        <span aria-current="page">Guest camera</span>
      </nav>

      <header className={styles.uploadHero}>
        <p className={styles.eyebrow}>Guest camera · {collection.label}</p>
        <h1>Your view belongs in their story.</h1>
        <p>
          Send one photograph to the private {coupleName} collection. It will
          be reviewed before any use and scheduled for deletion {" "}
          {collection.retentionDays} days after this collection closes.
        </p>
      </header>

      {collection.availability !== "active" ? (
        <section className={styles.collectionClosed} role="status">
          <p className={styles.eyebrow}>Guest camera</p>
          <h2>
            {collection.availability === "not-open"
              ? "The camera opens with the celebration."
              : "This collection is closed."}
          </h2>
          <p>Keep the original photograph on your device.</p>
        </section>
      ) : state.kind === "received" ? (
        <section className={styles.receivedState} role="status">
          <span aria-hidden="true" />
          <p className={styles.eyebrow}>Received privately</p>
          <h2>Thank you for seeing the moment.</h2>
          <p>The couple’s team can now review your photograph.</p>
        </section>
      ) : (
        <form
          className={styles.uploadForm}
          encType="multipart/form-data"
          onSubmit={(event) => {
            event.preventDefault();
            if (!photo || state.kind === "uploading") return;
            send(event.currentTarget);
          }}
        >
          <label className={styles.photoPicker}>
            <input
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
              capture="environment"
              name="photo"
              onChange={(event) => {
                const nextPhoto = event.target.files?.[0] ?? null;
                setPhoto(nextPhoto);
                setState({ kind: "idle" });
              }}
              required
              type="file"
            />
            <span>{photo ? photo.name : "Choose or take one photo"}</span>
            <small>JPEG, PNG, WebP or HEIC · up to 12 MB</small>
          </label>

          <label className={styles.optionalName}>
            <span>Your name <small>Optional</small></span>
            <input autoComplete="name" maxLength={80} name="uploaderName" />
          </label>

          <label className={styles.consentChoice}>
            <input
              name="consent"
              required
              type="checkbox"
              value={PHOTO_CONSENT_VERSION}
            />
            <span>
              I took or may share this photograph. I allow the couple and their
              moderators to privately receive, review, download or delete it.
              Nothing is published automatically.
            </span>
          </label>

          {photo && photo.size > MAX_PHOTO_BYTES ? (
            <p className={styles.formError} role="alert">
              This photo is larger than 12 MB. Choose a smaller original.
            </p>
          ) : null}
          {state.kind === "error" ? (
            <p className={styles.formError} role="alert">
              {state.message}
            </p>
          ) : null}

          {state.kind === "uploading" ? (
            <div
              aria-label={`Sending photo: ${Math.round(state.progress)}%`}
              aria-valuemax={100}
              aria-valuemin={0}
              aria-valuenow={Math.round(state.progress)}
              className={styles.uploadProgress}
              role="progressbar"
            >
              <span style={{ width: `${state.progress}%` }} />
            </div>
          ) : null}

          <button
            disabled={
              !photo || photo.size > MAX_PHOTO_BYTES || state.kind === "uploading"
            }
            type="submit"
          >
            {state.kind === "uploading" ? "Sending…" : "Send privately"}
          </button>
        </form>
      )}

      <footer className={styles.footer}>
        <p>{coupleName}</p>
        <Link href={`/${wedding.slug}`}>Back to invitation</Link>
      </footer>
    </main>
  );
}

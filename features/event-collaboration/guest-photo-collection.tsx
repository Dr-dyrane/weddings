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
import {
  IntakeActions,
  IntakeError,
  IntakeField,
  IntakeJourney,
  IntakeReview,
  IntakeSuccess,
  type IntakeStep,
} from "@/features/intake/intake-journey";
import { ArrowRight } from "@/ui/icons";

type UploadState =
  | { kind: "idle" }
  | { kind: "uploading"; progress: number }
  | { kind: "error"; message: string }
  | { kind: "received" };

function newIdempotencyKey() {
  return crypto.randomUUID().replaceAll("-", "");
}

const photoSteps = [
  { id: "photo", label: "Photograph" },
  { id: "name", label: "Name" },
  { id: "consent", label: "Privacy" },
  { id: "review", label: "Review" },
] as const satisfies readonly IntakeStep[];

type PhotoStep = (typeof photoSteps)[number]["id"];

const photoTitles: Record<PhotoStep, string> = {
  photo: "Choose one moment.",
  name: "Who saw it?",
  consent: "Keep it private until approved.",
  review: "Ready to send?",
};

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
  const [uploaderName, setUploaderName] = useState("");
  const [consent, setConsent] = useState(false);
  const [activeStep, setActiveStep] = useState<PhotoStep>("photo");
  const [idempotencyKey] = useState(() => newIdempotencyKey());
  const uploadPath = `/api/weddings/${encodeURIComponent(
    wedding.slug,
  )}/celebration/photos/${encodeURIComponent(credential)}`;

  const send = () => {
    if (!photo || !consent) return;
    const data = new FormData();
    data.set("photo", photo);
    data.set("uploaderName", uploaderName.trim());
    data.set("consent", PHOTO_CONSENT_VERSION);
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
  const activeIndex = photoSteps.findIndex((step) => step.id === activeStep);
  const goBack = () => {
    setActiveStep(photoSteps[Math.max(0, activeIndex - 1)].id);
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
          One photograph. Received privately. Nothing is published automatically.
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
          <IntakeSuccess title="Thank you for seeing the moment.">
            The couple’s team can now review your photograph privately.
          </IntakeSuccess>
        </section>
      ) : (
        <form
          className={styles.uploadForm}
          encType="multipart/form-data"
          onSubmit={(event) => {
            event.preventDefault();
            if (!photo || !consent || state.kind === "uploading") return;
            send();
          }}
        >
          <IntakeJourney
            activeIndex={activeIndex}
            eyebrow={`${photoSteps[activeIndex].label} · Guest camera`}
            headingLevel={2}
            steps={photoSteps}
            title={photoTitles[activeStep]}
            variant="embedded"
          >
            {activeStep === "photo" ? (
              <>
                <label className={styles.photoPicker}>
                  <input
                    accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                    capture="environment"
                    name="photo"
                    onChange={(event) => {
                      const nextPhoto = event.target.files?.[0] ?? null;
                      setPhoto(nextPhoto);
                      setState({ kind: "idle" });
                      if (nextPhoto && nextPhoto.size <= MAX_PHOTO_BYTES) {
                        setActiveStep("name");
                      }
                    }}
                    required
                    type="file"
                  />
                  <span>{photo ? photo.name : "Choose or take one photo"}</span>
                  <small>JPEG, PNG, WebP or HEIC · up to 12 MB</small>
                </label>
                {photo && photo.size > MAX_PHOTO_BYTES ? (
                  <IntakeError>
                    This photo is larger than 12 MB. Choose a smaller original.
                  </IntakeError>
                ) : null}
              </>
            ) : null}

            {activeStep === "name" ? (
              <>
                <IntakeField hint="Optional" label="Your name">
                  <input
                    autoComplete="name"
                    autoFocus
                    maxLength={80}
                    onChange={(event) => setUploaderName(event.target.value)}
                    placeholder="How should the couple know you?"
                    value={uploaderName}
                  />
                </IntakeField>
                <IntakeActions onBack={goBack} onContinue={() => setActiveStep("consent")} />
              </>
            ) : null}

            {activeStep === "consent" ? (
              <>
                <label className={styles.consentChoice}>
                  <input
                    checked={consent}
                    name="consent"
                    onChange={(event) => setConsent(event.target.checked)}
                    required
                    type="checkbox"
                    value={PHOTO_CONSENT_VERSION}
                  />
                  <span>
                    I took or may share this photograph. I allow the couple and
                    their moderators to privately receive, review, download or
                    delete it. Nothing is published automatically.
                  </span>
                </label>
                <p className={styles.retentionCopy}>
                  Scheduled for deletion {collection.retentionDays} days after this
                  collection closes.
                </p>
                <IntakeActions
                  canContinue={consent}
                  onBack={goBack}
                  onContinue={() => setActiveStep("review")}
                />
              </>
            ) : null}

            {activeStep === "review" ? (
              <>
                <IntakeReview
                  rows={[
                    { label: "Photo", value: photo?.name ?? "No photo", onEdit: () => setActiveStep("photo") },
                    { label: "From", value: uploaderName.trim() || "Anonymous guest", onEdit: () => setActiveStep("name") },
                    { label: "Privacy", value: "Private review only", onEdit: () => setActiveStep("consent") },
                  ]}
                />
                {state.kind === "error" ? <IntakeError>{state.message}</IntakeError> : null}
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
                <IntakeActions onBack={goBack}>
                  <button
                    disabled={
                      !photo ||
                      photo.size > MAX_PHOTO_BYTES ||
                      !consent ||
                      state.kind === "uploading"
                    }
                    type="submit"
                  >
                    {state.kind === "uploading" ? "Sending…" : "Send privately"}
                    <ArrowRight aria-hidden="true" size={17} strokeWidth={1.7} />
                  </button>
                </IntakeActions>
              </>
            ) : null}
          </IntakeJourney>
        </form>
      )}

      <footer className={styles.footer}>
        <p>{coupleName}</p>
        <Link href={`/${wedding.slug}`}>Back to invitation</Link>
      </footer>
    </main>
  );
}

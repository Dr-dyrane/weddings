"use client";

import Link from "next/link";
import QRCode from "qrcode";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { StudioDashboard } from "@/domains/event-collaboration/event-store";
import type { StudioIdentity } from "@/domains/event-collaboration/studio-auth";
import styles from "@/features/event-collaboration/studio.module.css";

type EventKit = { target: string; qrDataUrl: string };

function localDateTime(date: Date) {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function CelebrationStudio({
  coupleName,
  dashboard,
  defaultClose,
  defaultOpen,
  identity,
  weddingSlug,
}: {
  coupleName: string;
  dashboard: StudioDashboard;
  defaultClose: string;
  defaultOpen: string;
  identity: StudioIdentity;
  weddingSlug: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [eventKit, setEventKit] = useState<EventKit | null>(null);
  const actionPath = `/api/studio/${weddingSlug}/celebration`;
  const defaultOpenValue = localDateTime(new Date(defaultOpen));
  const defaultCloseValue = localDateTime(new Date(defaultClose));

  const mutate = async (
    key: string,
    url: string,
    options: RequestInit,
  ) => {
    setBusy(key);
    setMessage(null);
    try {
      const response = await fetch(url, options);
      const body = response.status === 204 ? null : await response.json();
      if (!response.ok) throw new Error(body?.error ?? "The change did not save.");
      router.refresh();
      return body;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The change did not save.");
      return null;
    } finally {
      setBusy(null);
    }
  };

  return (
    <main className={styles.shell}>
      <nav className={styles.navigation}>
        <Link href={`/${weddingSlug}`}>{coupleName}</Link>
        <span>{identity.displayName}</span>
      </nav>

      <header className={styles.hero}>
        <p>Celebration Studio</p>
        <h1>Run the shared parts of the day.</h1>
        <p>
          Publish approved credits, issue the guest-camera QR, and privately
          review every photograph before it goes anywhere else.
        </p>
      </header>

      {message ? <p className={styles.alert} role="alert">{message}</p> : null}

      <section className={styles.panel}>
        <div className={styles.panelHeading}>
          <div>
            <p>Public credits</p>
            <h2>Wedding circle and vendors</h2>
          </div>
          <button
            disabled={busy !== null}
            onClick={() =>
              void mutate("visibility", actionPath, {
                body: JSON.stringify({
                  action: "visibility",
                  visibility:
                    dashboard.hubVisibility === "public" ? "closed" : "public",
                }),
                headers: { "Content-Type": "application/json" },
                method: "POST",
              })
            }
            type="button"
          >
            {dashboard.hubVisibility === "public" ? "Hide credits" : "Publish credits"}
          </button>
        </div>

        <form
          className={styles.formGrid}
          onSubmit={(event) => {
            event.preventDefault();
            const formElement = event.currentTarget;
            const form = new FormData(formElement);
            void mutate("credit", actionPath, {
              body: JSON.stringify({
                action: "credit",
                approvedForPublicDisplay:
                  form.get("approvedForPublicDisplay") === "on",
                displayName: form.get("displayName"),
                groupName: form.get("groupName"),
                kind: form.get("kind"),
                role: form.get("role"),
                sortOrder: Number(form.get("sortOrder")),
              }),
              headers: { "Content-Type": "application/json" },
              method: "POST",
            }).then((body) => {
              if (body) formElement.reset();
            });
          }}
        >
          <label>
            <span>Type</span>
            <select defaultValue="person" name="kind">
              <option value="person">Person</option>
              <option value="vendor">Vendor</option>
            </select>
          </label>
          <label>
            <span>Name</span>
            <input maxLength={80} name="displayName" required />
          </label>
          <label>
            <span>Role or service</span>
            <input maxLength={80} name="role" required />
          </label>
          <label>
            <span>Group</span>
            <input defaultValue="wedding-party" maxLength={64} name="groupName" required />
          </label>
          <label>
            <span>Order</span>
            <input defaultValue="0" max="999" min="0" name="sortOrder" type="number" />
          </label>
          <label className={styles.approval}>
            <input name="approvedForPublicDisplay" type="checkbox" />
            <span>The couple approved this exact public credit.</span>
          </label>
          <button disabled={busy !== null} type="submit">Add credit</button>
        </form>

        <ul className={styles.rows}>
          {dashboard.credits.map((credit) => (
            <li key={credit.id}>
              <div>
                <strong>{credit.displayName}</strong>
                <span>{credit.role} · {credit.groupName}</span>
              </div>
              <span>{credit.visibility === "public" ? "Approved public" : "Private draft"}</span>
              <button
                disabled={busy !== null}
                onClick={() =>
                  void mutate(
                    `credit-${credit.id}`,
                    `${actionPath}/credits/${credit.id}`,
                    { method: "DELETE" },
                  )
                }
                type="button"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeading}>
          <div>
            <p>Event Kit</p>
            <h2>Guest-camera QR</h2>
          </div>
        </div>
        <form
          className={styles.formGrid}
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            void mutate("collection", actionPath, {
              body: JSON.stringify({
                action: "collection",
                expiresAt: new Date(String(form.get("expiresAt"))).toISOString(),
                label: form.get("label"),
                opensAt: new Date(String(form.get("opensAt"))).toISOString(),
                retentionDays: Number(form.get("retentionDays")),
              }),
              headers: { "Content-Type": "application/json" },
              method: "POST",
            }).then(async (body) => {
              if (!body?.target) return;
              setEventKit({
                target: body.target,
                qrDataUrl: await QRCode.toDataURL(body.target, {
                  color: { dark: "#000000", light: "#FFD21E" },
                  errorCorrectionLevel: "H",
                  margin: 2,
                  width: 480,
                }),
              });
            });
          }}
        >
          <label>
            <span>Collection label</span>
            <input defaultValue="Wedding day" maxLength={64} name="label" required />
          </label>
          <label>
            <span>Opens</span>
            <input defaultValue={defaultOpenValue} name="opensAt" required type="datetime-local" />
          </label>
          <label>
            <span>Closes</span>
            <input defaultValue={defaultCloseValue} name="expiresAt" required type="datetime-local" />
          </label>
          <label>
            <span>Retention after close</span>
            <select defaultValue="90" name="retentionDays">
              <option value="30">30 days</option>
              <option value="60">60 days</option>
              <option value="90">90 days</option>
              <option value="180">180 days</option>
            </select>
          </label>
          <button disabled={busy !== null} type="submit">Issue private QR</button>
        </form>

        {eventKit ? (
          <article className={styles.eventKit}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="Guest-camera QR code" height="480" src={eventKit.qrDataUrl} width="480" />
            <div>
              <p>Save or print this now. The credential is stored only as a hash and cannot be shown again.</p>
              <a href={eventKit.target}>{eventKit.target}</a>
              <button onClick={() => window.print()} type="button">Print Event Kit</button>
            </div>
          </article>
        ) : null}

        <ul className={styles.rows}>
          {dashboard.collections.map((collection) => (
            <li key={collection.id}>
              <div>
                <strong>{collection.label}</strong>
                <span>{new Date(collection.opensAt).toLocaleString()} → {new Date(collection.expiresAt).toLocaleString()}</span>
              </div>
              <span>{collection.state}</span>
              <button
                disabled={busy !== null || collection.state === "revoked"}
                onClick={() =>
                  void mutate(
                    `collection-${collection.id}`,
                    `${actionPath}/collections/${collection.id}`,
                    { method: "PATCH" },
                  )
                }
                type="button"
              >
                Revoke
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeading}>
          <div>
            <p>Private inbox</p>
            <h2>Guest photographs</h2>
          </div>
          <span>{dashboard.submissions.length} received</span>
        </div>
        <div className={styles.inbox}>
          {dashboard.submissions.length === 0 ? (
            <p className={styles.empty}>No photographs yet. The inbox will update after a guest sends one.</p>
          ) : dashboard.submissions.map((submission) => {
            const mediaPath = `${actionPath}/submissions/${submission.id}`;
            return (
              <article key={submission.id}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt="Private guest contribution" src={`${mediaPath}?inline=1`} />
                <div>
                  <strong>{submission.uploaderName || "Anonymous guest"}</strong>
                  <span>{new Date(submission.createdAt).toLocaleString()} · {submission.moderationState}</span>
                </div>
                <div className={styles.inboxActions}>
                  <a download href={mediaPath}>Download</a>
                  <button onClick={() => void mutate(`approve-${submission.id}`, mediaPath, { body: JSON.stringify({ state: "approved" }), headers: { "Content-Type": "application/json" }, method: "PATCH" })} type="button">Approve</button>
                  <button onClick={() => void mutate(`reject-${submission.id}`, mediaPath, { body: JSON.stringify({ state: "rejected" }), headers: { "Content-Type": "application/json" }, method: "PATCH" })} type="button">Reject</button>
                  <button onClick={() => void mutate(`delete-${submission.id}`, mediaPath, { method: "DELETE" })} type="button">Delete</button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeading}>
          <div>
            <p>Guest replies</p>
            <h2>RSVP responses</h2>
          </div>
          <span>{dashboard.rsvps.length} received</span>
        </div>
        {dashboard.rsvps.length === 0 ? (
          <p className={styles.empty}>
            Responses from the public invitation will arrive here.
          </p>
        ) : (
          <ul className={styles.rsvpRows}>
            {dashboard.rsvps.map((rsvp) => (
              <li key={rsvp.id}>
                <div>
                  <strong>{rsvp.guestName}</strong>
                  <span>
                    {rsvp.attendance === "yes" ? "Attending" : "Unable to attend"}
                    {rsvp.menuChoice ? ` · ${rsvp.menuChoice}` : ""}
                  </span>
                </div>
                {rsvp.note ? <p>{rsvp.note}</p> : null}
                <div className={styles.rsvpMeta}>
                  <time>{new Date(rsvp.createdAt).toLocaleString()}</time>
                  <button
                    disabled={busy !== null}
                    onClick={() =>
                      void mutate(
                        `rsvp-${rsvp.id}`,
                        `${actionPath}/rsvps/${rsvp.id}`,
                        { method: "DELETE" },
                      )
                    }
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

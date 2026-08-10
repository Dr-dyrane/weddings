import Link from "next/link";

import type { CelebrationProjection } from "@/domains/event-collaboration/celebration";
import styles from "@/features/event-collaboration/celebration.module.css";

export function GuestPhotoEntry({
  celebration,
  fallbackUrl,
}: {
  celebration: CelebrationProjection;
  fallbackUrl: string;
}) {
  const coupleName = `${celebration.couple.first} & ${celebration.couple.second}`;

  return (
    <main className={`${styles.shell} ${styles.photoShell}`}>
      <nav aria-label="Guest camera navigation" className={styles.navigation}>
        <Link
          className={styles.coupleLink}
          href={`/${celebration.weddingSlug}`}
        >
          {coupleName}
        </Link>
        <span aria-current="page">Guest camera</span>
      </nav>

      <header className={styles.photoHero}>
        <p className={styles.eyebrow}>Guest camera</p>
        <p className={styles.closedStatus} role="status">
          <span aria-hidden="true" />
          Event QR required
        </p>
        <h1>The guest camera stays private.</h1>
        <p>
          This public page never accepts files. The couple’s team issues a
          separate event QR that opens a time-limited, revocable private
          collection.
        </p>
      </header>

      <section aria-labelledby="readiness-heading" className={styles.readiness}>
        <div className={styles.readinessHeading}>
          <p className={styles.eyebrow}>How it works</p>
          <h2 id="readiness-heading">Private by default.</h2>
        </div>
        <ol>
          <li>
            <span aria-hidden="true">01</span>
            <div><h3>Scan the current QR</h3><p>Each event link can be closed or replaced without affecting the invitation.</p></div>
          </li>
          <li>
            <span aria-hidden="true">02</span>
            <div><h3>Choose one photograph</h3><p>Permission and retention terms appear before anything is sent.</p></div>
          </li>
          <li>
            <span aria-hidden="true">03</span>
            <div><h3>Private review</h3><p>The couple’s team receives it privately. Nothing is published automatically.</p></div>
          </li>
        </ol>
      </section>

      <section aria-labelledby="fallback-heading" className={styles.fallback}>
        <p className={styles.eyebrow}>No-scan fallback</p>
        <h2 id="fallback-heading">Save this address.</h2>
        <p>
          If the QR cannot be scanned, ask the couple’s team to share the same
          private guest-camera link. Keep the original on your device until the
          collection confirms receipt. No upload happens on this public page.
        </p>
        <p className={styles.canonicalUrl}>
          <span>Guest camera fallback address</span>
          <a href={fallbackUrl}>{fallbackUrl}</a>
        </p>
      </section>

      <footer className={styles.footer}>
        <p>{coupleName}</p>
        <Link href={`/${celebration.weddingSlug}`}>Back to invitation</Link>
      </footer>
    </main>
  );
}

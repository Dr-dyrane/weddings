import Link from "next/link";

import type { CelebrationProjection } from "@/domains/event-collaboration/celebration";
import styles from "@/features/event-collaboration/celebration.module.css";

export function CelebrationHub({
  celebration,
}: {
  celebration: CelebrationProjection;
}) {
  const coupleName = `${celebration.couple.first} & ${celebration.couple.second}`;

  return (
    <main className={styles.shell}>
      <nav aria-label="Celebration navigation" className={styles.navigation}>
        <Link className={styles.coupleLink} href={`/${celebration.weddingSlug}`}>
          {coupleName}
        </Link>
        <span aria-current="page">Celebration hub</span>
      </nav>

      <header className={styles.hero}>
        <p className={styles.eyebrow}>Celebration hub</p>
        <h1>Made by many. Shared with everyone.</h1>
        <p className={styles.heroCopy}>
          Meet the people helping shape the day, discover the creative teams
          behind it, and find the guest camera when contributions open.
        </p>
        <p className={styles.eventLine}>
          <time>{celebration.dateLabel}</time>
          <span aria-hidden="true"> · </span>
          {celebration.locationLabel}
        </p>
      </header>

      <section aria-labelledby="circle-heading" className={styles.section}>
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>The wedding circle</p>
          <h2 id="circle-heading">People with a part in the story.</h2>
        </div>

        <div className={styles.peopleGroups}>
          {celebration.peopleGroups.length === 0 ? (
            <p className={styles.emptyCopy}>
              The wedding circle will unfold here as each name is confirmed.
            </p>
          ) : null}
          {celebration.peopleGroups.map((group) => (
            <section className={styles.peopleGroup} key={group.id}>
              <h3>{group.label}</h3>
              <ul className={styles.creditList}>
                {group.people.map((person) => (
                  <li key={person.id}>
                    <div>
                      <strong>{person.displayName}</strong>
                      <span>{person.role}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </section>

      <section aria-labelledby="credits-heading" className={styles.section}>
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>Creative credits</p>
          <h2 id="credits-heading">The hands behind the atmosphere.</h2>
        </div>

        {celebration.vendors.length === 0 ? (
          <p className={styles.emptyCopy}>
            The creative credits will appear as the celebration takes shape.
          </p>
        ) : (
          <ul className={`${styles.creditList} ${styles.vendorList}`}>
            {celebration.vendors.map((vendor) => (
              <li key={vendor.id}>
                <div>
                  <strong>{vendor.displayName}</strong>
                  <span>{vendor.category}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="camera-heading" className={styles.cameraCallout}>
        <p className={styles.cameraEyebrow}>Guest camera</p>
        <h2 id="camera-heading">Your view of the celebration belongs here.</h2>
        <p>
          Scan the event-day guest-camera QR to send one photograph privately.
          Every collection can be closed immediately, and nothing appears
          publicly without review.
        </p>
        <Link href={celebration.photoContribution.fallbackPath}>
          How the guest camera works
          <span aria-hidden="true">↗</span>
        </Link>
      </section>

      <footer className={styles.footer}>
        <p>{coupleName}</p>
        <Link href={`/${celebration.weddingSlug}`}>Return to invitation</Link>
      </footer>
    </main>
  );
}

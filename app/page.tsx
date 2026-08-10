import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { weddingPackages } from "@/domains/offers/wedding-packages";
import { getDyraneWeddingsMetadata } from "@/domains/invitations/root-metadata";

export const revalidate = 3600;

export function generateMetadata(): Metadata {
  return getDyraneWeddingsMetadata();
}

const liveInvitationPath = "/the_ogranyas";
const consultationPath = "/start";

function getPackageConsultationPath(packageId: string) {
  return `/start?package=${packageId}`;
}

export default function HomePage() {
  return (
    <div className="weddings-offer-shell">
      <nav className="offer-nav" aria-label="Primary navigation">
        <Link className="offer-wordmark" href="/" aria-label="Dyrane Weddings home">
          Dyrane Weddings
        </Link>
        <Link className="offer-nav-link" href={liveInvitationPath}>
          View the invitation
          <span aria-hidden="true">↗</span>
        </Link>
      </nav>

      <main className="weddings-offer">
        <section className="offer-hero" aria-labelledby="offer-title">
          <div className="offer-hero-copy">
            <p className="offer-eyebrow">Digital wedding experiences</p>
            <h1 id="offer-title">An invitation should feel like arrival.</h1>
            <p className="offer-hero-summary">
              We turn your wedding card into a personal digital experience—
              beautiful to receive, effortless to use and impossible to forget.
            </p>
            <div className="offer-hero-actions">
              <Link className="offer-primary-action" href={liveInvitationPath}>
                Enter Alexander &amp; Chioma
                <span aria-hidden="true">↗</span>
              </Link>
              <a className="offer-text-action" href="#packages">
                Explore the packages
              </a>
            </div>
          </div>

          <div className="offer-hero-art" aria-hidden="true">
            <span className="offer-case-label">Our first yardstick</span>
            <Image
              className="offer-couple-portrait"
              src="/journey/alexander-chioma-line-portrait-v5.png"
              alt=""
              fill
              priority
              sizes="(max-width: 760px) 92vw, 47vw"
            />
            <span className="offer-case-name">Alexander &amp; Chioma</span>
          </div>

          <div className="offer-threshold" aria-hidden="true">
            <span />
          </div>
          <p className="offer-scroll-cue">Three ways to begin</p>
        </section>

        <section className="offer-intro" id="packages" aria-labelledby="packages-title">
          <p className="offer-eyebrow">The offer</p>
          <h2 id="packages-title">One experience. Three depths.</h2>
          <p>
            Every package carries the wedding essentials. Each step adds more
            of your story, your people and the atmosphere that belongs only to you.
          </p>
        </section>

        <div className="offer-packages">
          {weddingPackages.map((weddingPackage, index) => (
            <article
              className={`offer-package offer-package-${weddingPackage.id}`}
              id={weddingPackage.id}
              key={weddingPackage.id}
            >
              <div className="offer-package-index" aria-hidden="true">
                {weddingPackage.level}
              </div>

              <div className="offer-package-heading">
                <div className="offer-package-label-line">
                  <p>{weddingPackage.label}</p>
                  {"badge" in weddingPackage ? (
                    <span>{weddingPackage.badge}</span>
                  ) : null}
                </div>
                <h2>{weddingPackage.name}</h2>
                <p className="offer-package-promise">{weddingPackage.promise}</p>
                <p className="offer-package-price">
                  {"pricePrefix" in weddingPackage ? (
                    <span>{weddingPackage.pricePrefix}</span>
                  ) : null}
                  {weddingPackage.price}
                </p>
                {"note" in weddingPackage ? (
                  <p className="offer-package-note">{weddingPackage.note}</p>
                ) : null}
              </div>

              <div className="offer-package-inclusions">
                <p>
                  {index === 0
                    ? "Your invitation includes"
                    : `Everything in ${weddingPackages[index - 1].label}, plus`}
                </p>
                <ul>
                  {weddingPackage.benefits.map((benefit) => (
                    <li key={benefit}>{benefit}</li>
                  ))}
                </ul>
                <Link
                  className="offer-package-action"
                  href={getPackageConsultationPath(weddingPackage.id)}
                >
                  Choose {weddingPackage.label}
                  <span aria-hidden="true">↗</span>
                </Link>
              </div>
            </article>
          ))}
        </div>

        <section className="offer-terms" aria-labelledby="terms-title">
          <p className="offer-eyebrow">Clear from the beginning</p>
          <h2 id="terms-title">A calm process. No surprises.</h2>
          <dl>
            <div>
              <dt>To begin</dt>
              <dd>60% secures production. The balance is due before launch.</dd>
            </div>
            <div>
              <dt>Your package</dt>
              <dd>Scope, timings and every deliverable are agreed before work begins.</dd>
            </div>
            <div>
              <dt>After the wedding</dt>
              <dd>Your experience remains live for the hosting period in your package.</dd>
            </div>
            <div>
              <dt>Custom domain</dt>
              <dd>Connection is included in Premium. Registration is billed separately.</dd>
            </div>
          </dl>
        </section>

        <section className="offer-closing" id="start" aria-labelledby="closing-title">
          <p className="offer-eyebrow">Dyrane Weddings</p>
          <h2 id="closing-title">Let your guests enter the feeling first.</h2>
          <p>
            Begin with the package that fits. We will shape the rest around the wedding.
          </p>
          <Link className="offer-primary-action" href={consultationPath}>
            Start a conversation
            <span aria-hidden="true">↗</span>
          </Link>
          <Link className="offer-text-action" href={liveInvitationPath}>
            Or experience Alexander &amp; Chioma
          </Link>
        </section>
      </main>

      <footer className="offer-footer">
        <p>Dyrane Weddings</p>
        <p>Built for celebrations that deserve to be felt.</p>
        <small>© {new Date().getFullYear()} Dyrane</small>
      </footer>
    </div>
  );
}

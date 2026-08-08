"use client";

import dynamic from "next/dynamic";
import {
  useCallback,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";

import type { InvitationProjection } from "@/domains/invitations/invitation";
import type { PublishedWedding } from "@/domains/weddings/published-wedding";
import { Button } from "@/ui/primitives/button";
import { Choice, ChoiceGroup } from "@/ui/primitives/choice-group";
import {
  CalendarPlus,
  Heart,
  MapPin,
  Share2,
  Sparkles as SparklesIcon,
} from "@/ui/icons";

const SpatialInvitation = dynamic(
  () =>
    import("@/features/invitation/spatial-invitation").then(
      (module) => module.SpatialInvitation,
    ),
  { ssr: false },
);

const subscribeToHydration = () => () => undefined;
let cachedWebGLSupport: boolean | undefined;

function supportsWebGL() {
  if (cachedWebGLSupport !== undefined) return cachedWebGLSupport;

  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2") || canvas.getContext("webgl");
    cachedWebGLSupport = Boolean(context);
    context?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    cachedWebGLSupport = false;
  }

  return cachedWebGLSupport;
}

const subscribeToReducedMotion = (notify: () => void) => {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
};

function useClientCapabilities() {
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => true,
  );
  const webgl = hydrated && !reducedMotion ? supportsWebGL() : false;
  return { reducedMotion, webgl };
}

function RSVP({
  invitation,
  wedding,
}: {
  invitation: InvitationProjection;
  wedding: PublishedWedding;
}) {
  const [answer, setAnswer] = useState<"yes" | "no" | "">("");
  const [meal, setMeal] = useState("Celebration menu");

  return (
    <form className="rsvp-card" onSubmit={(event) => event.preventDefault()}>
      <p className="kicker">Kindly reply</p>
      <h2>Will you join us?</h2>
      <ChoiceGroup
        aria-label="Will you join us?"
        className="rsvp-choices"
        value={answer}
        onChange={(value) => setAnswer(value as "yes" | "no")}
      >
        <Choice value="yes">
          <SparklesIcon aria-hidden="true" size={18} strokeWidth={1.75} />
          Joyfully, yes
        </Choice>
        <Choice value="no">
          <Heart aria-hidden="true" size={18} strokeWidth={1.75} />
          With love, no
        </Choice>
      </ChoiceGroup>
      {answer === "yes" && (
        <div className="form-reveal">
          <label>
            How should we welcome you?
            <input
              required
              defaultValue={invitation.guestDisplayName ?? ""}
              placeholder="Your name"
            />
          </label>
          <label>
            Your table preference
            <select value={meal} onChange={(event) => setMeal(event.target.value)}>
              <option>Celebration menu</option>
              <option>Vegetarian menu</option>
              <option>Tell us privately</option>
            </select>
          </label>
        </div>
      )}
      {answer && (
        <label className="form-reveal">
          Leave a little love
          <textarea
            placeholder={`A note for ${wedding.couple.first} & ${wedding.couple.second}`}
          />
        </label>
      )}
      <Button
        className="send-response"
        type="submit"
        isDisabled={!answer || !invitation.canRespond}
      >
        {invitation.canRespond ? "Send my response" : "Replies open soon"}
        <span aria-hidden="true">→</span>
      </Button>
      {!invitation.canRespond && (
        <p className="rsvp-availability">
          Your invitation is reserved. Personal replies will open after the
          celebration details are confirmed.
        </p>
      )}
    </form>
  );
}

function ShareInvitation({
  invitation,
  wedding,
}: {
  invitation: InvitationProjection;
  wedding: PublishedWedding;
}) {
  const [feedback, setFeedback] = useState("");

  const share = async (personalized = false) => {
    const publicUrl = new URL(`/${wedding.slug}`, window.location.origin);
    publicUrl.searchParams.set("edition", String(invitation.cardEdition));
    const personalizedUrl = new URL(window.location.href);
    personalizedUrl.searchParams.set("edition", String(invitation.cardEdition));
    personalizedUrl.hash = "";
    const shareData = {
      title: `${wedding.couple.first} & ${wedding.couple.second} — You’re invited`,
      text: `${wedding.dateLabel} · ${wedding.locationLabel}`,
      url: personalized ? personalizedUrl.href : publicUrl.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setFeedback("Invitation shared");
        return;
      }

      await navigator.clipboard.writeText(shareData.url);
      setFeedback("Invitation link copied");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setFeedback("Use your browser’s share menu to send this invitation");
    }
  };

  return (
    <div className="share-action">
      <Button tone="light" onPress={() => share(false)}>
        {invitation.kind === "personalized"
          ? "Share public card"
          : "Share invitation"}
        <Share2 aria-hidden="true" size={16} strokeWidth={1.75} />
      </Button>
      {invitation.kind === "personalized" && (
        <details className="named-share">
          <summary>Share my named card</summary>
          <p>
            Anyone with this link can open your named invitation. Social apps
            may keep its preview after it is shared.
          </p>
          <Button tone="quiet" onPress={() => share(true)}>
            Share named card
            <Share2 aria-hidden="true" size={16} strokeWidth={1.75} />
          </Button>
        </details>
      )}
      <span aria-live="polite">{feedback}</span>
    </div>
  );
}

export type WeddingExperienceProps = {
  wedding: PublishedWedding;
  invitation: InvitationProjection;
  calendarHref: string;
};

export function WeddingExperience({
  wedding,
  invitation,
  calendarHref,
}: WeddingExperienceProps) {
  const [begun, setBegun] = useState(false);
  const [spatialUnavailable, setSpatialUnavailable] = useState(false);
  const { reducedMotion, webgl } = useClientCapabilities();
  const introHidden = begun && !reducedMotion;
  const markSpatialUnavailable = useCallback(
    () => setSpatialUnavailable(true),
    [],
  );

  useEffect(() => {
    const markOpened = () => {
      setBegun(window.scrollY > 24);
    };
    markOpened();
    addEventListener("scroll", markOpened, { passive: true });
    return () => removeEventListener("scroll", markOpened);
  }, []);

  const begin = () => {
    setBegun(true);
    requestAnimationFrame(() => {
      const story = document.querySelector<HTMLElement>("#story");
      story?.focus({ preventScroll: true });
      story?.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
      });
    });
  };

  const guestEyebrow =
    invitation.kind === "personalized"
      ? `Reserved for ${invitation.salutation}`
      : `${wedding.couple.first} & ${wedding.couple.second} — You’re invited`;

  return (
    <main className={begun ? "experience begun" : "experience"}>
      <a
        className="skip-link"
        href="#details"
        onClick={() => {
          requestAnimationFrame(() =>
            document.querySelector<HTMLElement>("#details")?.focus({
              preventScroll: true,
            }),
          );
        }}
      >
        Skip to celebration details
      </a>
      {webgl && !spatialUnavailable ? (
        <SpatialInvitation onUnavailable={markSpatialUnavailable} />
      ) : (
        <div className="fallback-world" aria-hidden="true">
          <div className="fallback-glow" />
          <div className="fallback-envelope">
            <div className="fallback-flap" />
            <div className="fallback-card">
              <i>{wedding.couple.first.slice(0, 1)}</i>
              <span>&</span>
              <i>{wedding.couple.second.slice(0, 1)}</i>
            </div>
            <div className="fallback-seal">∞</div>
          </div>
        </div>
      )}
      <div className="vignette" />
      <div className="noise" />

      <header className="invitation-header">
        <a className="monogram" href="#invitation" aria-label="Back to invitation">
          {wedding.couple.first.slice(0, 1)}
          <span>∞</span>
          {wedding.couple.second.slice(0, 1)}
        </a>
        <div className="journey-line" aria-hidden="true">
          <i />
          <span>{wedding.couple.first} & {wedding.couple.second}</span>
        </div>
        <a className="header-action" href="#rsvp">Kindly reply</a>
      </header>

      <section
        id="invitation"
        className="beat beat-intro"
        data-journey-progress="0"
      >
        <div
          aria-hidden={introHidden}
          className="intro-copy"
          inert={introHidden ? true : undefined}
        >
          <p className="kicker">{guestEyebrow}</p>
          <h1>{wedding.invitation.headline}</h1>
          <div className="intro-actions">
            <Button className="enter" tone="light" onPress={begin}>
              <span>Open your invitation</span>
              <i aria-hidden="true">↓</i>
            </Button>
            <a href="#details">View invitation details</a>
          </div>
        </div>
        <p className="gesture">Scroll to unfold the story</p>
      </section>

      <section
        id="story"
        className="beat beat-card"
        data-journey-progress="0.2"
        tabIndex={-1}
      >
        <div className="glass-copy">
          <p className="kicker">{wedding.invitation.eyebrow}</p>
          <h2>
            {wedding.couple.first}
            <br />
            <i>&</i> {wedding.couple.second}
          </h2>
          <p>{wedding.invitation.introduction}</p>
        </div>
      </section>

      {wedding.story.map((milestone, index) => (
        <section
          className={`beat ${index === 0 ? "beat-begin" : "beat-yes"}`}
          data-journey-progress={String(
            0.28 +
              index * (0.18 / Math.max(1, wedding.story.length - 1)),
          )}
          key={milestone.id}
        >
          <div className={`story-label ${index % 2 === 0 ? "left" : "right"}`}>
            <span>{milestone.sequence}</span>
            <p>{milestone.eyebrow}</p>
            <h3>{milestone.title}</h3>
            <time>{milestone.dateLabel}</time>
          </div>
        </section>
      ))}

      <section className="beat beat-circle" data-journey-progress="0.5">
        <div className="circle-copy">
          <p className="kicker">The wedding circle</p>
          <h2>The people beside us.</h2>
          <ul>
            {wedding.people.map((person) => (
              <li key={person.id}>
                <span>{person.role}</span>
                <strong>{person.displayName}</strong>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="details"
        className="beat beat-venue"
        data-journey-progress="0.58"
        tabIndex={-1}
      >
        <div className="detail-copy">
          <p className="kicker">Celebration details</p>
          <h2>
            {wedding.dateLabel}
            <br />
            <i>{wedding.locationLabel}</i>
          </h2>
          <div className="details">
            {wedding.events.map((event) => (
              <div key={event.id}>
                <span>{event.eyebrow}</span>
                <p>
                  {event.title}
                  <br />
                  {event.venue}, {event.address}
                </p>
                <a href={event.map.href} target="_blank" rel="noreferrer">
                  <MapPin aria-hidden="true" size={15} strokeWidth={1.75} />
                  {event.map.label}
                </a>
              </div>
            ))}
          </div>
          <div className="detail-actions">
            <a className="calendar-action" href={calendarHref}>
              Add to calendar
              <CalendarPlus aria-hidden="true" size={16} strokeWidth={1.75} />
            </a>
            <ShareInvitation invitation={invitation} wedding={wedding} />
          </div>
        </div>
      </section>

      <section className="beat beat-dress" data-journey-progress="0.72">
        <div className="dress-copy">
          <p className="kicker">{wedding.dress.eyebrow}</p>
          <h2>{wedding.dress.title}</h2>
          <p>{wedding.dress.guidance}</p>
          <ul className="dress-palette" aria-label="Suggested colours">
            {wedding.dress.palette.map((colour) => (
              <li key={colour.name}>
                <span
                  aria-hidden="true"
                  className="colour-swatch"
                  style={{ background: colour.hex }}
                />
                <span>{colour.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="beat beat-vendors" data-journey-progress="0.8">
        <div className="vendors-copy">
          <p className="kicker">Made possible by</p>
          <h2>Hands behind the celebration.</h2>
          <ul>
            {wedding.vendors.map((vendor) => (
              <li key={vendor.id}>
                <span>{vendor.category}</span>
                <strong>{vendor.displayName}</strong>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="rsvp" className="beat beat-rsvp" data-journey-progress="0.9">
        <div className="sunset" aria-hidden="true"><i /><i /><i /></div>
        <RSVP invitation={invitation} wedding={wedding} />
        <footer>
          <span>{wedding.couple.monogram}</span>
          <p>{wedding.dateLabel} · {wedding.locationLabel}</p>
          <small>Created with Dyrane Weddings</small>
        </footer>
      </section>
    </main>
  );
}

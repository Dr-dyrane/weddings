"use client";

import dynamic from "next/dynamic";
import {
  Component,
  type CSSProperties,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import type { InvitationProjection } from "@/domains/invitations/invitation";
import {
  getWeddingDateParts,
  getWeddingDayProgress,
} from "@/domains/invitations/wedding-progress";
import type { PublishedWedding } from "@/domains/weddings/published-wedding";
import { LiveInvitationOpening } from "@/features/invitation/live-invitation-opening";
import { Button } from "@/ui/primitives/button";
import { Choice, ChoiceGroup } from "@/ui/primitives/choice-group";
import {
  ArrowRight,
  CalendarPlus,
  Heart,
  MapPin,
  Share2,
  Sparkles,
} from "@/ui/icons";

const JourneySpatialWorld = dynamic(
  () =>
    import("@/features/invitation/journey-spatial-world").then(
      (module) => module.JourneySpatialWorld,
    ),
  { ssr: false },
);

class JourneySpatialBoundary extends Component<
  { children: ReactNode; onUnavailable: () => void },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onUnavailable();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

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

function useClientPreferences() {
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
  return { hydrated, reducedMotion, webgl };
}

type JourneyChapter =
  | "welcome"
  | "story-one"
  | "story-two"
  | "celebration"
  | "dress"
  | "rsvp";

const chapterLabels: Record<JourneyChapter, string> = {
  welcome: "Welcome",
  "story-one": "Our story · 01",
  "story-two": "Our story · 02",
  celebration: "The celebration",
  dress: "Dress guidance",
  rsvp: "Kindly reply",
};

function useJourneyPosition(
  rootRef: React.RefObject<HTMLElement | null>,
  enabled: boolean,
) {
  const [activeChapter, setActiveChapter] =
    useState<JourneyChapter>("welcome");
  const activeRef = useRef<JourneyChapter>("welcome");

  useEffect(() => {
    if (!enabled) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const root = rootRef.current;
      if (!root) return;

      const maxScroll = Math.max(1, root.scrollHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
      root.style.setProperty("--journey-progress", String(progress));

      const readingLine = window.innerHeight * 0.48;
      let nearest: { chapter: JourneyChapter; distance: number } | null = null;
      root
        .querySelectorAll<HTMLElement>("[data-journey-chapter]")
        .forEach((section) => {
          const chapter = section.dataset.journeyChapter as JourneyChapter;
          const bounds = section.getBoundingClientRect();
          const center = bounds.top + Math.min(bounds.height, innerHeight) * 0.5;
          const distance = Math.abs(center - readingLine);
          if (!nearest || distance < nearest.distance) {
            nearest = { chapter, distance };
          }
        });

      const next = nearest as { chapter: JourneyChapter; distance: number } | null;
      if (next && next.chapter !== activeRef.current) {
        activeRef.current = next.chapter;
        setActiveChapter(next.chapter);
      }
    };

    const requestUpdate = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    addEventListener("scroll", requestUpdate, { passive: true });
    addEventListener("resize", requestUpdate, { passive: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      removeEventListener("scroll", requestUpdate);
      removeEventListener("resize", requestUpdate);
    };
  }, [enabled, rootRef]);

  return activeChapter;
}

function ShareInvitation({
  invitation,
  wedding,
}: {
  invitation: InvitationProjection;
  wedding: PublishedWedding;
}) {
  const [feedback, setFeedback] = useState("");

  const share = async () => {
    const publicUrl = new URL(`/${wedding.slug}`, window.location.origin);
    publicUrl.searchParams.set("edition", String(invitation.cardEdition));
    const data = {
      title: `${wedding.couple.first} & ${wedding.couple.second} — You’re invited`,
      text: `${wedding.dateLabel} · ${wedding.locationLabel}`,
      url: publicUrl.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(data);
        setFeedback("Invitation shared");
      } else {
        await navigator.clipboard.writeText(data.url);
        setFeedback("Invitation link copied");
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setFeedback("Use your browser’s share menu to send this invitation");
    }
  };

  return (
    <div className="journey-share">
      <Button tone="quiet" onPress={share}>
        Share invitation
        <Share2 aria-hidden="true" size={16} strokeWidth={1.7} />
      </Button>
      <span aria-live="polite">{feedback}</span>
    </div>
  );
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
    <form className="journey-rsvp-form" onSubmit={(event) => event.preventDefault()}>
      <ChoiceGroup
        aria-label="Will you join us?"
        className="journey-rsvp-choices"
        isDisabled={!invitation.canRespond}
        value={answer}
        onChange={(value) => setAnswer(value as "yes" | "no")}
      >
        <Choice value="yes">
          <Sparkles aria-hidden="true" size={18} strokeWidth={1.7} />
          Joyfully, yes
        </Choice>
        <Choice value="no">
          <Heart aria-hidden="true" size={18} strokeWidth={1.7} />
          With love, no
        </Choice>
      </ChoiceGroup>

      {answer === "yes" ? (
        <div className="journey-form-fields">
          <label>
            <span>Your name</span>
            <input
              defaultValue={invitation.guestDisplayName ?? ""}
              placeholder="How should we welcome you?"
              required
            />
          </label>
          <label>
            <span>Table preference</span>
            <select value={meal} onChange={(event) => setMeal(event.target.value)}>
              <option>Celebration menu</option>
              <option>Vegetarian menu</option>
              <option>Tell us privately</option>
            </select>
          </label>
        </div>
      ) : null}

      {answer ? (
        <label className="journey-note-field">
          <span>Leave a little love</span>
          <textarea
            placeholder={`A note for ${wedding.couple.first} & ${wedding.couple.second}`}
          />
        </label>
      ) : null}

      <Button
        className="journey-submit"
        isDisabled={!answer || !invitation.canRespond}
        type="submit"
      >
        {invitation.canRespond ? "Send my response" : "Replies open soon"}
        <ArrowRight aria-hidden="true" size={17} strokeWidth={1.7} />
      </Button>

      {!invitation.canRespond ? (
        <p className="journey-rsvp-status">
          Your invitation is reserved. Personal replies open when the final
          celebration details are confirmed.
        </p>
      ) : null}
    </form>
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
  const [opened, setOpened] = useState(false);
  const [spatialUnavailable, setSpatialUnavailable] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const { hydrated, reducedMotion, webgl } = useClientPreferences();
  const activeChapter = useJourneyPosition(rootRef, opened);
  const date = useMemo(
    () => getWeddingDateParts(wedding.dateLabel),
    [wedding.dateLabel],
  );
  const progress = useMemo(
    () => getWeddingDayProgress(wedding.dateLabel, wedding.timezone),
    [wedding.dateLabel, wedding.timezone],
  );
  const dateParts = `${String(date.month).padStart(2, "0")} ${String(
    date.day,
  ).padStart(2, "0")}`;
  const portraitUrl = `/${wedding.slug}/opening-portrait?v=${encodeURIComponent(
    wedding.shareCard?.portraitAsset ?? String(wedding.revision),
  )}`;

  const openExperience = () => {
    setOpened(true);
    requestAnimationFrame(() => {
      document.querySelector<HTMLElement>("#welcome-copy")?.focus({
        preventScroll: true,
      });
    });
  };

  return (
    <main
      className={`editorial-experience${opened ? " is-open" : ""}`}
      data-active-chapter={activeChapter}
      ref={rootRef}
      style={{
        "--opening-progress": progress,
        "--journey-progress": 0,
      } as CSSProperties}
    >
      <a className="journey-skip" href="#details">
        Skip to celebration details
      </a>

      {opened && webgl && !spatialUnavailable ? (
        <JourneySpatialBoundary onUnavailable={() => setSpatialUnavailable(true)}>
          <JourneySpatialWorld />
        </JourneySpatialBoundary>
      ) : null}

      <div className="journey-chrome" aria-hidden={!opened}>
        <a href="#invitation">
          {wedding.couple.first} &amp; {wedding.couple.second}
        </a>
        <span>{chapterLabels[activeChapter]}</span>
      </div>

      <div className="journey-progress" aria-hidden="true">
        <i />
      </div>

      <section
        className="journey-welcome"
        data-journey-chapter="welcome"
        id="invitation"
      >
        <div className="journey-welcome-stage">
          <p className="journey-welcome-couple">
            {wedding.couple.first} &amp; {wedding.couple.second}
          </p>

          {/* Generated portrait is decorative; semantic identity remains text. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt=""
            aria-hidden="true"
            className="journey-welcome-portrait"
            height="1536"
            src={portraitUrl}
            width="1024"
          />

          <p className="journey-welcome-date" aria-hidden="true">
            {dateParts}
          </p>

          <span className="journey-welcome-threshold" aria-hidden="true">
            <i />
          </span>

          <div className="journey-welcome-copy" id="welcome-copy" tabIndex={-1}>
            <p>
              {invitation.kind === "personalized"
                ? `For ${invitation.salutation}`
                : wedding.invitation.eyebrow}
            </p>
            <h2>{wedding.invitation.headline}</h2>
            <time dateTime={`${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`}>
              {wedding.dateLabel} · {wedding.locationLabel}
            </time>
          </div>

          <p className="journey-scroll-cue">Scroll to enter</p>
        </div>

        <LiveInvitationOpening
          hidden={opened}
          hydrated={hydrated}
          onOpen={openExperience}
          reducedMotion={reducedMotion}
          wedding={wedding}
        />
      </section>

      {wedding.story.map((milestone, index) => (
        <section
          className={`journey-chapter journey-story journey-story-${index + 1}`}
          data-journey-chapter={index === 0 ? "story-one" : "story-two"}
          id={index === 0 ? "story" : undefined}
          key={milestone.id}
        >
          <div className="journey-chapter-copy">
            <p className="journey-index">{milestone.sequence}</p>
            <p className="journey-eyebrow">{milestone.eyebrow}</p>
            <h2>{milestone.title}</h2>
            <time>{milestone.dateLabel}</time>
          </div>
        </section>
      ))}

      <section
        className="journey-chapter journey-celebration"
        data-journey-chapter="celebration"
        id="details"
        tabIndex={-1}
      >
        <div className="journey-date-art" aria-hidden="true">
          {String(date.day).padStart(2, "0")}
        </div>
        <div className="journey-chapter-copy">
          <p className="journey-index">03</p>
          <p className="journey-eyebrow">The celebration</p>
          <h2>{wedding.dateLabel}</h2>
          <p className="journey-location">{wedding.locationLabel}</p>

          <div className="journey-events">
            {wedding.events.map((event) => (
              <article key={event.id}>
                <time>{event.eyebrow}</time>
                <div>
                  <h3>{event.title}</h3>
                  <p>{event.venue} · {event.address}</p>
                  <a href={event.map.href} rel="noreferrer" target="_blank">
                    <MapPin aria-hidden="true" size={15} strokeWidth={1.7} />
                    Directions
                  </a>
                </div>
              </article>
            ))}
          </div>

          <div className="journey-actions">
            <a className="journey-action" href={calendarHref}>
              Add to calendar
              <CalendarPlus aria-hidden="true" size={16} strokeWidth={1.7} />
            </a>
            <ShareInvitation invitation={invitation} wedding={wedding} />
          </div>
        </div>
      </section>

      <section
        className="journey-chapter journey-dress"
        data-journey-chapter="dress"
      >
        <div className="journey-chapter-copy">
          <p className="journey-index">04</p>
          <p className="journey-eyebrow">{wedding.dress.eyebrow}</p>
          <h2>{wedding.dress.title}</h2>
          <p className="journey-dress-guidance">{wedding.dress.guidance}</p>
          <ul className="journey-palette" aria-label="Suggested colours">
            {wedding.dress.palette.map((colour) => (
              <li key={colour.name}>
                <i aria-hidden="true" style={{ background: colour.hex }} />
                <span>{colour.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        className="journey-chapter journey-rsvp"
        data-journey-chapter="rsvp"
        id="rsvp"
      >
        <div className="journey-chapter-copy">
          <p className="journey-index">05</p>
          <p className="journey-eyebrow">Kindly reply</p>
          <h2>Will you join us?</h2>
          <RSVP invitation={invitation} wedding={wedding} />
        </div>
        <footer>
          <p>{wedding.couple.first} &amp; {wedding.couple.second}</p>
          <time>{wedding.dateLabel} · {wedding.locationLabel}</time>
          <small>Created with Dyrane Weddings</small>
        </footer>
      </section>
    </main>
  );
}

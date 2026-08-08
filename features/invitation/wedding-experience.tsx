"use client";

import dynamic from "next/dynamic";
import { getImageProps } from "next/image";
import {
  Component,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

import type { InvitationProjection } from "@/domains/invitations/invitation";
import type { PublishedWedding } from "@/domains/weddings/published-wedding";
import {
  journeyById,
  milestoneProgress,
} from "@/features/invitation/journey";
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

class SpatialErrorBoundary extends Component<
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

type StaticScene = 1 | 2 | 3 | 4 | 5 | 6 | 7;

function useActiveStaticScene() {
  const [scene, setScene] = useState<StaticScene>(1);

  useEffect(() => {
    const update = () => {
      const point = window.scrollY + window.innerHeight * 0.52;
      let closest: { distance: number; scene: StaticScene } | undefined;

      document.querySelectorAll<HTMLElement>("[data-scene]").forEach((beat) => {
        const nextScene = Number(beat.dataset.scene) as StaticScene;
        if (nextScene < 1 || nextScene > 7) return;
        const center = beat.offsetTop + Math.min(beat.offsetHeight, innerHeight) * 0.45;
        const distance = Math.abs(center - point);
        if (!closest || distance < closest.distance) {
          closest = { distance, scene: nextScene };
        }
      });

      if (closest) setScene((current) =>
        current === closest?.scene ? current : closest!.scene,
      );
    };

    update();
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update, { passive: true });
    return () => {
      removeEventListener("scroll", update);
      removeEventListener("resize", update);
    };
  }, []);

  return scene;
}

function StaticWeddingWorld({ scene }: { scene: StaticScene }) {
  const basename = `/concepts/scene-${scene}-${
    scene === 1
      ? "envelope"
      : scene === 2
        ? "threshold"
        : scene === 3
          ? "story-garden"
          : scene === 4
            ? "wedding-circle"
            : scene === 5
              ? "pavilion"
              : scene === 6
                ? "dress-atmosphere"
                : "rsvp"
  }`;
  const desktop = getImageProps({
    alt: "",
    fetchPriority: scene === 1 ? "high" : "auto",
    height: 960,
    loading: scene === 1 ? "eager" : "lazy",
    quality: 82,
    sizes: "100vw",
    src: `${basename}-desktop.webp`,
    width: 1440,
  }).props;
  const mobile = getImageProps({
    alt: "",
    height: 1600,
    quality: 82,
    sizes: "100vw",
    src: `${basename}-mobile.webp`,
    width: 900,
  }).props;

  return (
    <div className="static-world" data-static-scene={scene} aria-hidden="true">
      <picture key={scene}>
        <source media="(max-width: 850px)" srcSet={mobile.srcSet} />
        {/* getImageProps preserves responsive Next image optimization in picture. */}
        <img {...desktop} className="static-world-image" alt="" />
      </picture>
      <div className="static-world-wash" />
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
  const [introDeparted, setIntroDeparted] = useState(false);
  const [spatialReady, setSpatialReady] = useState(false);
  const [spatialUnavailable, setSpatialUnavailable] = useState(false);
  const { reducedMotion, webgl } = useClientCapabilities();
  const activeStaticScene = useActiveStaticScene();
  const spatialStoryProgress = useMemo(
    () =>
      wedding.story.map((_, index) =>
        milestoneProgress(index, wedding.story.length),
      ),
    [wedding.story],
  );
  const spatialPalette = useMemo(
    () => wedding.dress.palette.map((colour) => colour.hex),
    [wedding.dress.palette],
  );
  const spatialActive = webgl && !spatialUnavailable;
  const introHidden = introDeparted && !reducedMotion;
  const markSpatialUnavailable = useCallback(
    () => {
      setSpatialReady(false);
      setSpatialUnavailable(true);
    },
    [],
  );
  const markSpatialPending = useCallback(() => setSpatialReady(false), []);
  const markSpatialReady = useCallback(() => setSpatialReady(true), []);

  useEffect(() => {
    const markOpened = () => {
      const story = document.querySelector<HTMLElement>("#story");
      const departAt = Math.min(
        420,
        Math.max(220, (story?.offsetTop ?? window.innerHeight) * 0.34),
      );
      if (window.scrollY > 24) setBegun(true);
      setIntroDeparted(window.scrollY > departAt);
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
    <main
      className={[
        "experience",
        begun ? "begun" : "",
        introDeparted ? "intro-departed" : "",
        spatialActive ? "spatial-active" : "static-active",
        spatialActive
          ? spatialReady
            ? "spatial-ready"
            : "spatial-loading"
          : "",
      ].filter(Boolean).join(" ")}
    >
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
      <StaticWeddingWorld scene={activeStaticScene} />
      {spatialActive && (
        <SpatialErrorBoundary onUnavailable={markSpatialUnavailable}>
          <SpatialInvitation
            onPending={markSpatialPending}
            onReady={markSpatialReady}
            onUnavailable={markSpatialUnavailable}
            palette={spatialPalette}
            peopleCount={wedding.people.length}
            storyProgress={spatialStoryProgress}
            vendorCount={wedding.vendors.length}
          />
        </SpatialErrorBoundary>
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
        data-chapter={journeyById.invitation.id}
        data-journey-progress={journeyById.invitation.progress}
        data-scene={journeyById.invitation.scene}
      >
        <div
          aria-hidden={introHidden}
          className="intro-copy copy-surface copy-surface-night"
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
        data-chapter={journeyById.threshold.id}
        data-journey-progress={journeyById.threshold.progress}
        data-scene={journeyById.threshold.scene}
        tabIndex={-1}
      >
        <div className="glass-copy copy-surface copy-surface-night">
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
          data-chapter={journeyById.story.id}
          data-journey-progress={milestoneProgress(index, wedding.story.length)}
          data-scene={journeyById.story.scene}
          key={milestone.id}
        >
          <div className={`story-label copy-surface copy-surface-night ${index % 2 === 0 ? "left" : "right"}`}>
            <span>{milestone.sequence}</span>
            <p>{milestone.eyebrow}</p>
            <h3>{milestone.title}</h3>
            <time>{milestone.dateLabel}</time>
          </div>
        </section>
      ))}

      <section
        className="beat beat-circle"
        data-chapter={journeyById.circle.id}
        data-journey-progress={journeyById.circle.progress}
        data-scene={journeyById.circle.scene}
      >
        <div className="circle-copy">
          <div className="circle-heading copy-surface copy-surface-night">
            <p className="kicker">The wedding circle</p>
            <h2>The people beside us.</h2>
          </div>
          <ul className="circle-people" aria-label="The wedding circle">
            {wedding.people.map((person) => (
              <li className="copy-surface copy-surface-night" key={person.id}>
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
        data-chapter={journeyById.pavilion.id}
        data-journey-progress={journeyById.pavilion.progress}
        data-scene={journeyById.pavilion.scene}
        tabIndex={-1}
      >
        <div className="detail-copy copy-surface copy-surface-paper">
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

      <section
        className="beat beat-dress"
        data-chapter={journeyById.dress.id}
        data-journey-progress={journeyById.dress.progress}
        data-scene={journeyById.dress.scene}
      >
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

      <section
        className="beat beat-vendors"
        data-chapter={journeyById.vendors.id}
        data-journey-progress={journeyById.vendors.progress}
        data-scene={journeyById.vendors.scene}
      >
        <div className="vendors-copy copy-surface copy-surface-paper">
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

      <section
        id="rsvp"
        className="beat beat-rsvp"
        data-chapter={journeyById.rsvp.id}
        data-journey-progress={journeyById.rsvp.progress}
        data-scene={journeyById.rsvp.scene}
      >
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

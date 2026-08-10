"use client";

import {
  type CSSProperties,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getWeddingDateParts,
  getWeddingDayProgress,
} from "@/domains/invitations/wedding-progress";
import type { PublishedWedding } from "@/domains/weddings/published-wedding";
import { Play } from "@/ui/icons";

type OpeningPhase =
  | "month"
  | "day"
  | "fill"
  | "portrait"
  | "collapse"
  | "ready";

function twoDigits(value: number) {
  return String(value).padStart(2, "0");
}

export function LiveInvitationOpening({
  hidden,
  hydrated,
  onOpen,
  reducedMotion,
  wedding,
}: {
  hidden: boolean;
  hydrated: boolean;
  onOpen: () => void;
  reducedMotion: boolean;
  wedding: PublishedWedding;
}) {
  const target = useMemo(
    () => getWeddingDateParts(wedding.dateLabel),
    [wedding.dateLabel],
  );
  const progress = useMemo(
    () => getWeddingDayProgress(wedding.dateLabel, wedding.timezone),
    [wedding.dateLabel, wedding.timezone],
  );
  const [month, setMonth] = useState(0);
  const [day, setDay] = useState(0);
  const [phase, setPhase] = useState<OpeningPhase>("month");
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!hydrated || reducedMotion) return;

    const timers: number[] = [];
    const schedule = (callback: () => void, delay: number) => {
      timers.push(window.setTimeout(callback, delay));
    };
    let elapsed = 220;

    for (let value = 1; value <= target.month; value += 1) {
      schedule(() => setMonth(value), elapsed);
      elapsed += 72;
    }

    elapsed += 120;
    schedule(() => setPhase("day"), elapsed);
    for (let value = 1; value <= target.day; value += 1) {
      schedule(() => setDay(value), elapsed);
      elapsed += 46;
    }

    elapsed += 140;
    schedule(() => setPhase("fill"), elapsed);
    elapsed += 820;
    schedule(() => setPhase("portrait"), elapsed);
    elapsed += 620;
    schedule(() => setPhase("collapse"), elapsed);
    elapsed += 420;
    schedule(() => setPhase("ready"), elapsed);

    return () => timers.forEach(window.clearTimeout);
  }, [hydrated, reducedMotion, target.day, target.month]);

  useEffect(() => {
    if (hidden) return;
    document.body.classList.add("live-opening-locked");
    return () => document.body.classList.remove("live-opening-locked");
  }, [hidden]);

  // Keep the server and first client frame at 00 00. Reduced-motion clients
  // resolve directly to the finished frame as soon as their preference is known.
  const finalFrame = hydrated && reducedMotion;
  const visibleMonth = finalFrame ? target.month : month;
  const visibleDay = finalFrame ? target.day : day;
  const visiblePhase = leaving
    ? "leaving"
    : finalFrame
      ? "ready"
      : phase;
  const ready = visiblePhase === "ready";
  const portraitUrl = `/${wedding.slug}/opening-portrait?v=${encodeURIComponent(
    wedding.shareCard?.portraitAsset ?? String(wedding.revision),
  )}`;

  const open = () => {
    if (!ready || leaving) return;
    setLeaving(true);
    onOpen();
  };

  return (
    <div
      aria-hidden={hidden}
      className={`live-ogb-opening${hidden ? " is-hidden" : ""}`}
      data-phase={visiblePhase}
      inert={hidden ? true : undefined}
      style={{ "--opening-progress": progress } as CSSProperties}
    >
      <h1 className="live-ogb-couple">
        {wedding.couple.first} &amp; {wedding.couple.second}
      </h1>

      <div className="live-ogb-date" aria-hidden="true">
        <span key={`month-${visibleMonth}`}>{twoDigits(visibleMonth)}</span>
        <span key={`day-${visibleDay}`}>{twoDigits(visibleDay)}</span>
      </div>
      <time className="sr-only" dateTime={`${target.year}-${twoDigits(target.month)}-${twoDigits(target.day)}`}>
        {wedding.dateLabel}
      </time>

      {/* The generated portrait is decorative; the couple names carry identity. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt=""
        aria-hidden="true"
        className="live-ogb-portrait"
        height="1536"
        src={portraitUrl}
        width="1024"
      />

      <button
        aria-label="Play invitation"
        className="live-ogb-threshold"
        disabled={!ready}
        onClick={open}
        type="button"
      >
        <span className="live-ogb-threshold-fill" aria-hidden="true" />
        <span className="live-ogb-threshold-label" aria-hidden="true">
          <Play fill="currentColor" size={21} strokeWidth={1.5} />
        </span>
      </button>

      <span className="sr-only" aria-live="polite">
        {ready ? "Invitation ready. Play invitation." : "Preparing invitation."}
      </span>
    </div>
  );
}

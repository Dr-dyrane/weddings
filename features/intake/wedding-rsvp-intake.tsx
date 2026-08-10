"use client";

import { useState } from "react";

import type { InvitationProjection } from "@/domains/invitations/invitation";
import type { PublishedWedding } from "@/domains/weddings/published-wedding";
import {
  IntakeActions,
  IntakeError,
  IntakeField,
  IntakeJourney,
  IntakeReview,
  IntakeSuccess,
  type IntakeStep,
} from "@/features/intake/intake-journey";
import { ArrowRight, Heart, Sparkles } from "@/ui/icons";
import { Button } from "@/ui/primitives/button";
import { Choice, ChoiceGroup } from "@/ui/primitives/choice-group";

type RsvpStep = "attendance" | "name" | "meal" | "note" | "review";

const titles: Record<RsvpStep, string> = {
  attendance: "Will you join us?",
  name: "How should we welcome you?",
  meal: "Which table should we prepare?",
  note: "Leave a little love.",
  review: "Ready to send?",
};

export function WeddingRsvpIntake({
  invitation,
  wedding,
}: {
  invitation: InvitationProjection;
  wedding: PublishedWedding;
}) {
  const [answer, setAnswer] = useState<"yes" | "no" | "">("");
  const [meal, setMeal] = useState("Celebration menu");
  const [guestName, setGuestName] = useState(invitation.guestDisplayName ?? "");
  const [note, setNote] = useState("");
  const [activeStep, setActiveStep] = useState<RsvpStep>("attendance");
  const [idempotencyKey, setIdempotencyKey] = useState<string | null>(null);
  const [submission, setSubmission] = useState<
    | { state: "idle" }
    | { state: "sending" }
    | { state: "error"; message: string }
    | { state: "received" }
  >({ state: "idle" });
  const steps: readonly IntakeStep[] = answer === "yes"
    ? [
        { id: "attendance", label: "Attendance" },
        { id: "name", label: "Name" },
        { id: "meal", label: "Table" },
        { id: "note", label: "Note" },
        { id: "review", label: "Review" },
      ]
    : [
        { id: "attendance", label: "Attendance" },
        { id: "name", label: "Name" },
        { id: "note", label: "Note" },
        { id: "review", label: "Review" },
      ];
  const activeIndex = Math.max(
    0,
    steps.findIndex((step) => step.id === activeStep),
  );
  const goBack = () => {
    const previous = steps[Math.max(0, activeIndex - 1)];
    setActiveStep(previous.id as RsvpStep);
  };

  if (submission.state === "received") {
    return (
      <div className="journey-rsvp-received">
        <IntakeSuccess title={`Thank you, ${guestName}.`}>
          {answer === "yes"
            ? `${wedding.couple.first} & ${wedding.couple.second} will be delighted to welcome you.`
            : "Your message has been shared with the couple."}
        </IntakeSuccess>
      </div>
    );
  }

  return (
    <form
      className="journey-rsvp-form"
      onSubmit={async (event) => {
        event.preventDefault();
        if (!answer || !guestName.trim() || submission.state === "sending") return;
        const key = idempotencyKey ?? crypto.randomUUID().replaceAll("-", "");
        if (!idempotencyKey) setIdempotencyKey(key);
        setSubmission({ state: "sending" });
        try {
          const response = await fetch(
            `/api/weddings/${encodeURIComponent(wedding.slug)}/rsvp`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                attendance: answer,
                guestName: guestName.trim(),
                idempotencyKey: key,
                menuChoice: answer === "yes" ? meal : null,
                note: note.trim() || null,
              }),
            },
          );
          const body = (await response.json().catch(() => null)) as
            | { error?: string }
            | null;
          if (!response.ok) {
            throw new Error(body?.error ?? "Your response could not be saved.");
          }
          setSubmission({ state: "received" });
        } catch (error) {
          setSubmission({
            state: "error",
            message:
              error instanceof Error
                ? error.message
                : "Your response could not be saved.",
          });
        }
      }}
    >
      <IntakeJourney
        activeIndex={activeIndex}
        eyebrow={`${steps[activeIndex].label} · RSVP`}
        headingLevel={3}
        steps={steps}
        title={titles[activeStep]}
        variant="embedded"
      >
        {activeStep === "attendance" ? (
          <ChoiceGroup
            aria-label="Will you join us?"
            className="journey-rsvp-choices"
            onChange={(value) => {
              setAnswer(value as "yes" | "no");
              setActiveStep("name");
            }}
            value={answer}
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
        ) : null}

        {activeStep === "name" ? (
          <>
            <IntakeField label="Your name">
              <input
                autoComplete="name"
                autoFocus
                maxLength={96}
                onChange={(event) => setGuestName(event.target.value)}
                placeholder="How should we welcome you?"
                required
                value={guestName}
              />
            </IntakeField>
            <IntakeActions
              canContinue={Boolean(guestName.trim())}
              onBack={goBack}
              onContinue={() => setActiveStep(answer === "yes" ? "meal" : "note")}
            />
          </>
        ) : null}

        {activeStep === "meal" ? (
          <>
            <IntakeField label="Table preference">
              <select value={meal} onChange={(event) => setMeal(event.target.value)}>
                <option>Celebration menu</option>
                <option>Vegetarian menu</option>
                <option>Tell us privately</option>
              </select>
            </IntakeField>
            <IntakeActions onBack={goBack} onContinue={() => setActiveStep("note")} />
          </>
        ) : null}

        {activeStep === "note" ? (
          <>
            <IntakeField hint="Optional" label={`A note for ${wedding.couple.first} & ${wedding.couple.second}`}>
              <textarea
                autoFocus
                maxLength={600}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Leave a little love"
                value={note}
              />
            </IntakeField>
            <IntakeActions onBack={goBack} onContinue={() => setActiveStep("review")} />
          </>
        ) : null}

        {activeStep === "review" ? (
          <>
            <IntakeReview
              rows={[
                {
                  label: "Reply",
                  value: answer === "yes" ? "Joyfully, yes" : "With love, no",
                  onEdit: () => setActiveStep("attendance"),
                },
                { label: "Name", value: guestName, onEdit: () => setActiveStep("name") },
                ...(answer === "yes"
                  ? [{ label: "Table", value: meal, onEdit: () => setActiveStep("meal") }]
                  : []),
                { label: "Note", value: note || "No note", onEdit: () => setActiveStep("note") },
              ]}
            />
            {submission.state === "error" ? (
              <IntakeError>{submission.message}</IntakeError>
            ) : null}
            <IntakeActions onBack={goBack}>
              <Button
                className="journey-submit"
                isDisabled={submission.state === "sending"}
                type="submit"
              >
                {submission.state === "sending" ? "Sending…" : "Send my response"}
                <ArrowRight aria-hidden="true" size={17} strokeWidth={1.7} />
              </Button>
            </IntakeActions>
          </>
        ) : null}
      </IntakeJourney>
    </form>
  );
}

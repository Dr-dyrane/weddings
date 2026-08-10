"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import {
  getPackageEnquiryHandoffs,
  type PackageEnquiry,
} from "@/domains/offers/package-enquiry";
import {
  weddingPackages,
  type WeddingPackage,
} from "@/domains/offers/wedding-packages";
import {
  IntakeActions,
  IntakeChoice,
  IntakeChoiceGrid,
  IntakeField,
  IntakeFieldPair,
  IntakeJourney,
  IntakeReview,
  type IntakeStep,
} from "@/features/intake/intake-journey";
import { ArrowRight } from "@/ui/icons";
import styles from "@/features/intake/package-enquiry.module.css";

const steps = [
  { id: "package", label: "Package" },
  { id: "couple", label: "Couple" },
  { id: "date", label: "Date" },
  { id: "location", label: "Location" },
  { id: "reply", label: "Reply" },
  { id: "review", label: "Review" },
] as const satisfies readonly IntakeStep[];

type StepId = (typeof steps)[number]["id"];

const stepTitles: Record<StepId, string> = {
  package: "How should your wedding feel?",
  couple: "Who are we celebrating?",
  date: "When is your day?",
  location: "Where will it unfold?",
  reply: "Where should I meet you?",
  review: "Here’s what I heard.",
};

function getPackage(packageId: WeddingPackage["id"]) {
  return weddingPackages.find((item) => item.id === packageId) ?? weddingPackages[0];
}

function getPackageId(value: string | null) {
  return weddingPackages.some((item) => item.id === value)
    ? (value as WeddingPackage["id"])
    : undefined;
}

function isReplyAddressValid(channel: "whatsapp" | "email", value: string) {
  const trimmed = value.trim();
  if (channel === "email") return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  return trimmed.replace(/\D/g, "").length >= 7;
}

export function PackageEnquiryJourney({
  initialPackageId,
}: {
  initialPackageId?: WeddingPackage["id"];
}) {
  const searchParams = useSearchParams();
  const requestedPackageId = initialPackageId ?? getPackageId(searchParams.get("package"));
  const [activeIndex, setActiveIndex] = useState(requestedPackageId ? 1 : 0);
  const [packageId, setPackageId] = useState<WeddingPackage["id"]>(
    requestedPackageId ?? "basic",
  );
  const [firstName, setFirstName] = useState("");
  const [secondName, setSecondName] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [location, setLocation] = useState("");
  const [preferredReply, setPreferredReply] = useState<"whatsapp" | "email">(
    "whatsapp",
  );
  const [replyAddress, setReplyAddress] = useState("");
  const activeStep = steps[activeIndex];
  const selectedPackage = getPackage(packageId);
  const enquiry: PackageEnquiry = {
    packageId,
    packageLabel: selectedPackage.label,
    firstName,
    secondName,
    weddingDate,
    location,
    preferredReply,
    replyAddress,
  };
  const handoffs = getPackageEnquiryHandoffs(enquiry);

  const goTo = (step: StepId) => {
    setActiveIndex(steps.findIndex((item) => item.id === step));
  };
  const back = activeIndex > 0 ? () => setActiveIndex((index) => index - 1) : undefined;
  const next = () => setActiveIndex((index) => Math.min(index + 1, steps.length - 1));

  return (
    <div className={styles.page}>
      <nav className={styles.navigation} aria-label="Enquiry navigation">
        <Link href="/">Dyrane Weddings</Link>
        <span>Private enquiry</span>
      </nav>

      <main>
        <IntakeJourney
          activeIndex={activeIndex}
          eyebrow="A private conversation"
          headingLevel={1}
          steps={steps}
          title={stepTitles[activeStep.id]}
        >
          {activeStep.id === "package" ? (
            <IntakeChoiceGrid>
              {weddingPackages.map((item) => (
                <IntakeChoice
                  description={`${"pricePrefix" in item ? `${item.pricePrefix} ` : ""}${item.price} · ${item.name}`}
                  isSelected={packageId === item.id}
                  key={item.id}
                  onSelect={() => {
                    setPackageId(item.id);
                    setActiveIndex(1);
                  }}
                >
                  {item.label}
                </IntakeChoice>
              ))}
            </IntakeChoiceGrid>
          ) : null}

          {activeStep.id === "couple" ? (
            <>
              <IntakeFieldPair>
                <IntakeField label="First partner">
                  <input
                    autoComplete="given-name"
                    autoFocus
                    maxLength={80}
                    onChange={(event) => setFirstName(event.target.value)}
                    placeholder="First name"
                    value={firstName}
                  />
                </IntakeField>
                <IntakeField label="Second partner">
                  <input
                    autoComplete="off"
                    maxLength={80}
                    onChange={(event) => setSecondName(event.target.value)}
                    placeholder="First name"
                    value={secondName}
                  />
                </IntakeField>
              </IntakeFieldPair>
              <IntakeActions
                canContinue={Boolean(firstName.trim() && secondName.trim())}
                onBack={back}
                onContinue={next}
              />
            </>
          ) : null}

          {activeStep.id === "date" ? (
            <>
              <IntakeField hint="An approximate date is fine." label="Wedding date">
                <input
                  autoFocus
                  onChange={(event) => setWeddingDate(event.target.value)}
                  type="date"
                  value={weddingDate}
                />
              </IntakeField>
              <IntakeActions onBack={back} onContinue={next} />
            </>
          ) : null}

          {activeStep.id === "location" ? (
            <>
              <IntakeField hint="City, venue, or “still deciding”." label="Celebration location">
                <input
                  autoFocus
                  maxLength={120}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="Lagos, Nigeria"
                  value={location}
                />
              </IntakeField>
              <IntakeActions onBack={back} onContinue={next} />
            </>
          ) : null}

          {activeStep.id === "reply" ? (
            <>
              <IntakeChoiceGrid>
                <IntakeChoice
                  description="Fastest for planning"
                  isSelected={preferredReply === "whatsapp"}
                  onSelect={() => {
                    setPreferredReply("whatsapp");
                    setReplyAddress("");
                  }}
                >
                  WhatsApp
                </IntakeChoice>
                <IntakeChoice
                  description="Keep the conversation in your inbox"
                  isSelected={preferredReply === "email"}
                  onSelect={() => {
                    setPreferredReply("email");
                    setReplyAddress("");
                  }}
                >
                  Email
                </IntakeChoice>
              </IntakeChoiceGrid>
              <div className={styles.replyField}>
                <IntakeField
                  label={preferredReply === "whatsapp" ? "WhatsApp number" : "Email address"}
                >
                  <input
                    autoComplete={preferredReply === "whatsapp" ? "tel" : "email"}
                    inputMode={preferredReply === "whatsapp" ? "tel" : "email"}
                    maxLength={120}
                    onChange={(event) => setReplyAddress(event.target.value)}
                    placeholder={preferredReply === "whatsapp" ? "+234…" : "you@example.com"}
                    type={preferredReply === "whatsapp" ? "tel" : "email"}
                    value={replyAddress}
                  />
                </IntakeField>
              </div>
              <IntakeActions
                canContinue={isReplyAddressValid(preferredReply, replyAddress)}
                onBack={back}
                onContinue={next}
              />
            </>
          ) : null}

          {activeStep.id === "review" ? (
            <>
              <IntakeReview
                rows={[
                  { label: "Package", value: selectedPackage.label, onEdit: () => goTo("package") },
                  { label: "Couple", value: `${firstName.trim()} & ${secondName.trim()}`, onEdit: () => goTo("couple") },
                  { label: "Date", value: weddingDate || "Still deciding", onEdit: () => goTo("date") },
                  { label: "Location", value: location.trim() || "Still deciding", onEdit: () => goTo("location") },
                  { label: "Reply", value: replyAddress.trim(), onEdit: () => goTo("reply") },
                ]}
              />
              <p className={styles.privacy}>
                Your answers leave this page only when you choose a handoff below.
              </p>
              <IntakeActions onBack={back}>
                <div className={styles.handoffs}>
                  <a href={handoffs.whatsapp} rel="noreferrer" target="_blank">
                    Continue on WhatsApp
                    <ArrowRight aria-hidden="true" size={17} strokeWidth={1.7} />
                  </a>
                  <a href={handoffs.email}>Send by email</a>
                </div>
              </IntakeActions>
            </>
          ) : null}
        </IntakeJourney>
      </main>
    </div>
  );
}

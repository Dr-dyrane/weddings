"use client";

import { useState } from "react";

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

export type CreditIntakeValue = {
  approvedForPublicDisplay: boolean;
  displayName: string;
  groupName: string;
  kind: "person" | "vendor";
  role: string;
  sortOrder: number;
};

const creditSteps = [
  { id: "kind", label: "Type" },
  { id: "name", label: "Name" },
  { id: "role", label: "Role" },
  { id: "group", label: "Group" },
  { id: "approval", label: "Approval" },
  { id: "review", label: "Review" },
] as const satisfies readonly IntakeStep[];

type CreditStep = (typeof creditSteps)[number]["id"];

const creditTitles: Record<CreditStep, string> = {
  kind: "Who are we crediting?",
  name: "What name should guests see?",
  role: "What part did they play?",
  group: "Where do they belong?",
  approval: "May this exact credit be public?",
  review: "Ready to add this credit?",
};

export function StudioCreditIntake({
  isBusy,
  onCreate,
}: {
  isBusy: boolean;
  onCreate: (value: CreditIntakeValue) => Promise<boolean>;
}) {
  const [activeStep, setActiveStep] = useState<CreditStep>("kind");
  const [kind, setKind] = useState<"person" | "vendor">("person");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState("");
  const [groupName, setGroupName] = useState("wedding-party");
  const [sortOrder, setSortOrder] = useState(0);
  const [approvedForPublicDisplay, setApprovedForPublicDisplay] = useState(false);
  const activeIndex = creditSteps.findIndex((step) => step.id === activeStep);
  const back = () => setActiveStep(creditSteps[Math.max(0, activeIndex - 1)].id);
  const reset = () => {
    setActiveStep("kind");
    setDisplayName("");
    setRole("");
    setGroupName("wedding-party");
    setSortOrder(0);
    setApprovedForPublicDisplay(false);
  };

  return (
    <IntakeJourney
      activeIndex={activeIndex}
      eyebrow="Public credit"
      headingLevel={3}
      steps={creditSteps}
      title={creditTitles[activeStep]}
      variant="studio"
    >
      {activeStep === "kind" ? (
        <IntakeChoiceGrid>
          <IntakeChoice
            description="Family, wedding party, or another person"
            isSelected={kind === "person"}
            onSelect={() => {
              setKind("person");
              setActiveStep("name");
            }}
          >
            Person
          </IntakeChoice>
          <IntakeChoice
            description="A creative or service partner"
            isSelected={kind === "vendor"}
            onSelect={() => {
              setKind("vendor");
              setActiveStep("name");
            }}
          >
            Vendor
          </IntakeChoice>
        </IntakeChoiceGrid>
      ) : null}

      {activeStep === "name" ? (
        <>
          <IntakeField label="Public name">
            <input
              autoFocus
              maxLength={80}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder={kind === "person" ? "Chioma Okafor" : "Moon Garden Florals"}
              value={displayName}
            />
          </IntakeField>
          <IntakeActions
            canContinue={Boolean(displayName.trim())}
            onBack={back}
            onContinue={() => setActiveStep("role")}
          />
        </>
      ) : null}

      {activeStep === "role" ? (
        <>
          <IntakeField label="Role or service">
            <input
              autoFocus
              maxLength={80}
              onChange={(event) => setRole(event.target.value)}
              placeholder={kind === "person" ? "Maid of honour" : "Floral design"}
              value={role}
            />
          </IntakeField>
          <IntakeActions
            canContinue={Boolean(role.trim())}
            onBack={back}
            onContinue={() => setActiveStep("group")}
          />
        </>
      ) : null}

      {activeStep === "group" ? (
        <>
          <IntakeFieldPair>
            <IntakeField label="Group">
              <input
                autoFocus
                maxLength={64}
                onChange={(event) => setGroupName(event.target.value)}
                value={groupName}
              />
            </IntakeField>
            <IntakeField hint="Lower numbers appear first." label="Order">
              <input
                max={999}
                min={0}
                onChange={(event) => setSortOrder(Number(event.target.value))}
                type="number"
                value={sortOrder}
              />
            </IntakeField>
          </IntakeFieldPair>
          <IntakeActions
            canContinue={Boolean(groupName.trim())}
            onBack={back}
            onContinue={() => setActiveStep("approval")}
          />
        </>
      ) : null}

      {activeStep === "approval" ? (
        <>
          <IntakeChoiceGrid>
            <IntakeChoice
              description="The couple approved this exact wording"
              isSelected={approvedForPublicDisplay}
              onSelect={() => {
                setApprovedForPublicDisplay(true);
                setActiveStep("review");
              }}
            >
              Approved public
            </IntakeChoice>
            <IntakeChoice
              description="Keep it private until approval arrives"
              isSelected={!approvedForPublicDisplay}
              onSelect={() => {
                setApprovedForPublicDisplay(false);
                setActiveStep("review");
              }}
            >
              Private draft
            </IntakeChoice>
          </IntakeChoiceGrid>
          <IntakeActions onBack={back} />
        </>
      ) : null}

      {activeStep === "review" ? (
        <>
          <IntakeReview
            rows={[
              { label: "Type", value: kind, onEdit: () => setActiveStep("kind") },
              { label: "Name", value: displayName, onEdit: () => setActiveStep("name") },
              { label: "Role", value: role, onEdit: () => setActiveStep("role") },
              { label: "Group", value: groupName, onEdit: () => setActiveStep("group") },
              {
                label: "Visibility",
                value: approvedForPublicDisplay ? "Approved public" : "Private draft",
                onEdit: () => setActiveStep("approval"),
              },
            ]}
          />
          <IntakeActions
            continueLabel="Add credit"
            isBusy={isBusy}
            onBack={back}
            onContinue={() => {
              void onCreate({
                approvedForPublicDisplay,
                displayName: displayName.trim(),
                groupName: groupName.trim(),
                kind,
                role: role.trim(),
                sortOrder,
              }).then((created) => {
                if (created) reset();
              });
            }}
          />
        </>
      ) : null}
    </IntakeJourney>
  );
}

export type CollectionIntakeValue = {
  expiresAt: string;
  label: string;
  opensAt: string;
  retentionDays: number;
};

const collectionSteps = [
  { id: "label", label: "Name" },
  { id: "window", label: "Window" },
  { id: "retention", label: "Retention" },
  { id: "review", label: "Review" },
] as const satisfies readonly IntakeStep[];

type CollectionStep = (typeof collectionSteps)[number]["id"];

const collectionTitles: Record<CollectionStep, string> = {
  label: "What should guests call this camera?",
  window: "When may guests send photographs?",
  retention: "How long should originals remain?",
  review: "Ready to issue the private QR?",
};

export function StudioCollectionIntake({
  defaultClose,
  defaultOpen,
  isBusy,
  onCreate,
}: {
  defaultClose: string;
  defaultOpen: string;
  isBusy: boolean;
  onCreate: (value: CollectionIntakeValue) => Promise<boolean>;
}) {
  const [activeStep, setActiveStep] = useState<CollectionStep>("label");
  const [label, setLabel] = useState("Wedding day");
  const [opensAt, setOpensAt] = useState(defaultOpen);
  const [expiresAt, setExpiresAt] = useState(defaultClose);
  const [retentionDays, setRetentionDays] = useState(90);
  const activeIndex = collectionSteps.findIndex((step) => step.id === activeStep);
  const back = () => setActiveStep(collectionSteps[Math.max(0, activeIndex - 1)].id);

  return (
    <IntakeJourney
      activeIndex={activeIndex}
      eyebrow="Guest camera"
      headingLevel={3}
      steps={collectionSteps}
      title={collectionTitles[activeStep]}
      variant="studio"
    >
      {activeStep === "label" ? (
        <>
          <IntakeField label="Collection label">
            <input
              autoFocus
              maxLength={64}
              onChange={(event) => setLabel(event.target.value)}
              value={label}
            />
          </IntakeField>
          <IntakeActions
            canContinue={Boolean(label.trim())}
            onContinue={() => setActiveStep("window")}
          />
        </>
      ) : null}

      {activeStep === "window" ? (
        <>
          <IntakeFieldPair>
            <IntakeField label="Opens">
              <input
                onChange={(event) => setOpensAt(event.target.value)}
                type="datetime-local"
                value={opensAt}
              />
            </IntakeField>
            <IntakeField label="Closes">
              <input
                onChange={(event) => setExpiresAt(event.target.value)}
                type="datetime-local"
                value={expiresAt}
              />
            </IntakeField>
          </IntakeFieldPair>
          <IntakeActions
            canContinue={Boolean(opensAt && expiresAt && new Date(expiresAt) > new Date(opensAt))}
            onBack={back}
            onContinue={() => setActiveStep("retention")}
          />
        </>
      ) : null}

      {activeStep === "retention" ? (
        <>
          <IntakeChoiceGrid>
            {[30, 60, 90, 180].map((days) => (
              <IntakeChoice
                isSelected={retentionDays === days}
                key={days}
                onSelect={() => {
                  setRetentionDays(days);
                  setActiveStep("review");
                }}
              >
                {days} days
              </IntakeChoice>
            ))}
          </IntakeChoiceGrid>
          <IntakeActions onBack={back} />
        </>
      ) : null}

      {activeStep === "review" ? (
        <>
          <IntakeReview
            rows={[
              { label: "Name", value: label, onEdit: () => setActiveStep("label") },
              { label: "Opens", value: new Date(opensAt).toLocaleString(), onEdit: () => setActiveStep("window") },
              { label: "Closes", value: new Date(expiresAt).toLocaleString(), onEdit: () => setActiveStep("window") },
              { label: "Retention", value: `${retentionDays} days`, onEdit: () => setActiveStep("retention") },
            ]}
          />
          <IntakeActions
            continueLabel="Issue private QR"
            isBusy={isBusy}
            onBack={back}
            onContinue={() => {
              void onCreate({ expiresAt, label: label.trim(), opensAt, retentionDays }).then(
                (created) => {
                  if (created) setActiveStep("label");
                },
              );
            }}
          />
        </>
      ) : null}
    </IntakeJourney>
  );
}

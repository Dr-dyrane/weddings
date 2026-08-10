"use client";

import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
} from "react";

import { ArrowRight, Check } from "@/ui/icons";
import styles from "@/features/intake/intake-journey.module.css";

export type IntakeStep = {
  id: string;
  label: string;
};

type IntakeJourneyProps = {
  activeIndex: number;
  children: ReactNode;
  description?: ReactNode;
  eyebrow: string;
  headingLevel?: 1 | 2 | 3;
  isComplete?: boolean;
  steps: readonly IntakeStep[];
  title: string;
  variant?: "page" | "embedded" | "studio";
};

export function IntakeJourney({
  activeIndex,
  children,
  description,
  eyebrow,
  headingLevel = 2,
  isComplete = false,
  steps,
  title,
  variant = "page",
}: IntakeJourneyProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const safeIndex = Math.max(0, Math.min(activeIndex, steps.length - 1));
  const progress = isComplete ? 100 : ((safeIndex + 1) / steps.length) * 100;
  const Heading = `h${headingLevel}` as const;

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, [safeIndex, title]);

  return (
    <section
      className={`${styles.journey} ${styles[variant]}`}
      data-intake-step={steps[safeIndex]?.id}
    >
      <div className={styles.atmosphere} aria-hidden="true">
        <i />
        <i />
      </div>

      <div className={styles.progressColumn}>
        <div
          aria-label={`${steps[safeIndex]?.label}: ${Math.round(progress)}% complete`}
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={Math.round(progress)}
          className={`${styles.orb} ${isComplete ? styles.orbComplete : ""}`}
          role="progressbar"
          style={{ "--intake-progress": `${progress}%` } as CSSProperties}
        >
          <span aria-hidden="true">{isComplete ? <Check size={24} /> : null}</span>
        </div>
        <p className={styles.progressCopy} aria-hidden="true">
          <span>{String(safeIndex + 1).padStart(2, "0")}</span>
          <span>{String(steps.length).padStart(2, "0")}</span>
        </p>
      </div>

      <div className={styles.content}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <Heading className={styles.title} ref={headingRef} tabIndex={-1}>
          {title}
        </Heading>
        {description ? <div className={styles.description}>{description}</div> : null}
        <div className={styles.answer} key={steps[safeIndex]?.id}>
          {children}
        </div>
      </div>
    </section>
  );
}

export function IntakeActions({
  backLabel = "Back",
  canContinue = true,
  children,
  continueLabel = "Continue",
  isBusy = false,
  onBack,
  onContinue,
}: {
  backLabel?: string;
  canContinue?: boolean;
  children?: ReactNode;
  continueLabel?: string;
  isBusy?: boolean;
  onBack?: () => void;
  onContinue?: () => void;
}) {
  return (
    <div className={styles.actions}>
      {onBack ? (
        <button className={styles.back} onClick={onBack} type="button">
          {backLabel}
        </button>
      ) : (
        <span />
      )}
      {children ?? (onContinue ? (
        <button
          className={styles.continue}
          disabled={!canContinue || isBusy}
          onClick={onContinue}
          type="button"
        >
          {isBusy ? "Saving…" : continueLabel}
          <ArrowRight aria-hidden="true" size={17} strokeWidth={1.7} />
        </button>
      ) : null)}
    </div>
  );
}

export function IntakeChoiceGrid({ children }: { children: ReactNode }) {
  return <div className={styles.choiceGrid}>{children}</div>;
}

export function IntakeChoice({
  children,
  description,
  isSelected = false,
  onSelect,
}: {
  children: ReactNode;
  description?: ReactNode;
  isSelected?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      aria-pressed={isSelected}
      className={styles.choice}
      onClick={onSelect}
      type="button"
    >
      <strong>{children}</strong>
      {description ? <span>{description}</span> : null}
    </button>
  );
}

export function IntakeField({
  children,
  hint,
  label,
}: {
  children: ReactNode;
  hint?: ReactNode;
  label: ReactNode;
}) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      {children}
      {hint ? <small>{hint}</small> : null}
    </label>
  );
}

export function IntakeFieldPair({ children }: { children: ReactNode }) {
  return <div className={styles.fieldPair}>{children}</div>;
}

export function IntakeReview({
  rows,
}: {
  rows: readonly {
    label: string;
    value: ReactNode;
    onEdit?: () => void;
  }[];
}) {
  return (
    <dl className={styles.review}>
      {rows.map((row) => (
        <div key={row.label}>
          <dt>{row.label}</dt>
          <dd>{row.value}</dd>
          {row.onEdit ? (
            <button onClick={row.onEdit} type="button">
              Edit <span className={styles.srOnly}>{row.label}</span>
            </button>
          ) : null}
        </div>
      ))}
    </dl>
  );
}

export function IntakeError({ children }: { children: ReactNode }) {
  return (
    <p className={styles.error} role="alert">
      {children}
    </p>
  );
}

export function IntakeSuccess({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <div className={styles.success} role="status">
      <Check aria-hidden="true" size={34} strokeWidth={1.5} />
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}

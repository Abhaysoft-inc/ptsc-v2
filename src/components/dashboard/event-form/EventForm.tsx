"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import type { AdminEvent, EventInput } from "@/lib/types/admin";
import Stepper from "./Stepper";
import { FieldError } from "./FormParts";
import {
  LAST_STEP,
  STEPS,
  STEP_OF,
  clearDraft,
  readDraft,
  saveDraft,
  toInput,
  validate,
  valuesFromEvent,
  type ErrorKey,
  type FormValues,
} from "./formModel";
import { StepBasics, StepExtras, StepRegistration, StepReview, StepWhen } from "./steps";

interface EventFormProps {
  /** Saves the event. Resolves to an error message to show, or null on success. */
  onSubmit: (eventData: EventInput) => Promise<string | null>;
  /** Where the Cancel link goes. */
  cancelHref: string;
  /** Fills the form when editing an existing event. */
  initial?: AdminEvent;
  submitLabel?: string;
  /** Discards a restored draft and starts again. Create mode only. */
  onStartOver?: () => void;
}

const TIME = new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit" });

const ghostButton =
  "inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-neutral-300 transition-colors hover:bg-white/5 hover:text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black shadow-md transition-colors hover:bg-neutral-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed";

export default function EventForm({
  onSubmit,
  cancelHref,
  initial,
  submitLabel = "Create Event",
  onStartOver,
}: EventFormProps) {
  const editing = Boolean(initial);

  // A half-filled create form is restored from this browser. (This component only
  // renders on the client, so reading localStorage here is safe.)
  const [draft] = useState(() => (editing ? null : readDraft()));
  const [v, setV] = useState<FormValues>(() => draft?.values ?? valuesFromEvent(initial));
  const [step, setStep] = useState(() => draft?.step ?? 0);

  // Steps already opened, so the progress bar only ticks off sections you've seen.
  const [visited, setVisited] = useState<Set<number>>(
    () => new Set(Array.from({ length: (draft?.step ?? 0) + 1 }, (_, i) => i))
  );
  // Fields the person has left, and steps they've tried to continue past: errors
  // appear only for those, so a fresh form isn't covered in red.
  const [touched, setTouched] = useState<Set<ErrorKey>>(new Set());
  const [attempted, setAttempted] = useState<Set<number>>(new Set());

  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(draft?.savedAt ?? null);
  const topRef = useRef<HTMLDivElement>(null);

  const errors = useMemo(() => validate(v), [v]);
  const errorKeys = Object.keys(errors) as ErrorKey[];
  const stepHasErrors = (i: number) => errorKeys.some((k) => STEP_OF[k] === i);

  const set: <K extends keyof FormValues>(key: K, value: FormValues[K]) => void = (key, value) =>
    setV((prev) => ({ ...prev, [key]: value }));

  const touch = (key: ErrorKey) =>
    setTouched((prev) => (prev.has(key) ? prev : new Set(prev).add(key)));

  const err = (key: ErrorKey) =>
    touched.has(key) || attempted.has(STEP_OF[key]) ? errors[key] : undefined;

  // Autosave (create only): shortly after the last change, keep a copy in this browser.
  useEffect(() => {
    if (editing) return;
    const timer = setTimeout(() => {
      const at = saveDraft(v, step);
      if (at) setSavedAt(at);
    }, 800);
    return () => clearTimeout(timer);
  }, [v, step, editing]);

  const focusField = (key: ErrorKey) => {
    // After the step has rendered.
    setTimeout(() => document.getElementById(`ev-${key}`)?.focus(), 60);
  };

  const goTo = (index: number) => {
    setStep(index);
    setVisited((prev) => new Set(prev).add(index));
    topRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  };

  const next = () => {
    const problems = errorKeys.filter((k) => STEP_OF[k] === step);
    if (problems.length > 0) {
      setAttempted((prev) => new Set(prev).add(step));
      focusField(problems[0]);
      return;
    }
    goTo(Math.min(step + 1, LAST_STEP));
  };

  const submit = async () => {
    if (saving) return;

    if (errorKeys.length > 0) {
      // Take them to the first thing that needs fixing.
      const first = [...errorKeys].sort((a, b) => STEP_OF[a] - STEP_OF[b])[0];
      setAttempted(new Set(STEPS.map((_, i) => i)));
      setFormError("A few fields need attention. We've taken you to the first one.");
      goTo(STEP_OF[first]);
      focusField(first);
      return;
    }

    setFormError(null);
    setSaving(true);
    const failure = await onSubmit(toInput(v));
    if (failure) {
      setFormError(failure);
      setSaving(false);
      return;
    }
    // Saved. The caller navigates away, so the form stays disabled.
    if (!editing) clearDraft();
  };

  const saveDraftNow = () => {
    const at = saveDraft(v, step);
    setSavedAt(at ?? Date.now());
  };

  const completed = STEPS.map((_, i) => i < LAST_STEP && visited.has(i) && i !== step && !stepHasErrors(i));
  const invalid = STEPS.map((_, i) => attempted.has(i) && stepHasErrors(i));

  const stepProps = { v, set, err, touch };
  const isLast = step === LAST_STEP;
  const createLabel = editing ? submitLabel : v.published ? "Create & publish" : "Create as draft";

  return (
    <form
      noValidate
      onSubmit={(e) => {
        // Enter in a text box moves on rather than saving half a form.
        e.preventDefault();
        if (isLast) void submit();
        else next();
      }}
      className="space-y-8"
    >
      {draft && (
        <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/3 px-4 py-3 text-xs text-neutral-300 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Restored your unsaved draft from {TIME.format(new Date(draft.savedAt))}. Pick up where you
            left off.
          </p>
          {onStartOver && (
            <button
              type="button"
              onClick={onStartOver}
              className="self-start font-medium text-white underline underline-offset-4 hover:text-neutral-300 cursor-pointer sm:self-auto"
            >
              Start over
            </button>
          )}
        </div>
      )}

      <div ref={topRef} className="scroll-mt-24">
        <Stepper
          steps={STEPS}
          current={step}
          completed={completed}
          invalid={invalid}
          onSelect={goTo}
        />
      </div>

      {formError && (
        <div role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-400">
          {formError}
        </div>
      )}

      <div key={step}>
        {step === 0 && <StepBasics {...stepProps} />}
        {step === 1 && <StepWhen {...stepProps} />}
        {step === 2 && <StepRegistration {...stepProps} />}
        {step === 3 && <StepExtras {...stepProps} />}
        {step === 4 && (
          <>
            <StepReview v={v} onEdit={goTo} editing={editing} />
            {errorKeys.length > 0 && (
              <div className="mt-4">
                <FieldError message="Some fields still need attention. Saving will take you to the first one." />
              </div>
            )}
          </>
        )}
      </div>

      {/* Sticky navigation */}
      <div className="sticky bottom-0 z-30 -mx-6 sm:mx-0">
        <div className="flex items-center gap-2 border-t border-white/10 bg-[#0b0b0d]/95 px-4 py-3 backdrop-blur sm:rounded-2xl sm:border">
          {step === 0 ? (
            <Link href={cancelHref} className={ghostButton}>
              Cancel
            </Link>
          ) : (
            <button type="button" onClick={() => goTo(step - 1)} className={ghostButton} disabled={saving}>
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
          )}

          <p className="ml-1 hidden min-w-0 flex-1 truncate text-xs text-neutral-500 md:block" aria-live="polite">
            {editing
              ? "Changes aren't saved until you save."
              : savedAt
              ? `Draft saved on this device at ${TIME.format(new Date(savedAt))}`
              : "Your progress is saved on this device as you go."}
          </p>
          <span className="flex-1 md:hidden" />

          {!editing && (
            <button type="button" onClick={saveDraftNow} className={ghostButton} disabled={saving}>
              <span>Save draft</span>
            </button>
          )}

          {editing && !isLast && (
            <button type="button" onClick={() => void submit()} className={ghostButton} disabled={saving}>
              <span>{submitLabel}</span>
            </button>
          )}

          {isLast ? (
            <button type="button" onClick={() => void submit()} className={primaryButton} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 stroke-[2.5]" />}
              <span>{saving ? "Saving…" : createLabel}</span>
            </button>
          ) : (
            <button type="button" onClick={next} className={primaryButton} disabled={saving}>
              <span>Continue</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

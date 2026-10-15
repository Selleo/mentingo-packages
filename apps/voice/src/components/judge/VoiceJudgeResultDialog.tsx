import * as Dialog from "@radix-ui/react-dialog";
import { Check, Info, Sparkles, X } from "lucide-react";
import { useMemo, useRef, type ReactNode } from "react";

import { cn } from "../../lib/utils";
import { Button } from "../ui/button";

import { resolveVoiceJudgeLabels, type VoiceJudgeLabels } from "./judgeLabels";
import { VOICE_JUDGE_TEST_IDS } from "./judgeTestIds";

import type { VoiceJudgeEvaluation } from "./judge.types";

export type VoiceJudgeResultDialogProps = {
  evaluation: VoiceJudgeEvaluation;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labels?: Partial<VoiceJudgeLabels>;
  /** Line under the title, e.g. the scenario and persona. */
  subtitle?: ReactNode;
  /** Overrides the AI Mentor suggestion; by default it is the feedback of the lowest-scoring criterion. Pass `null` to hide it. */
  tip?: string | null;
  /** Footer content; defaults to a single close button. */
  actions?: ReactNode;
  className?: string;
};

type Criterion = NonNullable<VoiceJudgeEvaluation["criteria"]>[number];

const ratio = (awarded: number, max: number) => (max > 0 ? awarded / max : 0);

const resolveRequiredScore = (evaluation: VoiceJudgeEvaluation) => {
  if (evaluation.minScore != null) return evaluation.minScore;
  if (evaluation.requiredScore != null && evaluation.maxScore != null && evaluation.maxScore > 0) {
    return Math.ceil((evaluation.requiredScore * evaluation.maxScore) / 100);
  }

  return null;
};

const resolveThresholdPercentage = (
  evaluation: VoiceJudgeEvaluation,
  requiredScore: number | null,
) => {
  if (evaluation.requiredScore != null) return Math.round(evaluation.requiredScore);
  if (requiredScore !== null && evaluation.maxScore != null && evaluation.maxScore > 0) {
    return Math.ceil((requiredScore / evaluation.maxScore) * 100);
  }

  return null;
};

const resolveDefaultTip = (criteria: Criterion[]) => {
  const weakest = [...criteria].sort(
    (a, b) => ratio(a.awardedScore, a.maxScore) - ratio(b.awardedScore, b.maxScore),
  )[0];
  return weakest?.learnerSafeFeedback || null;
};

const sectionLabelClass =
  "text-xs font-semibold uppercase leading-relaxed tracking-[0.1em] text-neutral-500";

export function VoiceJudgeResultDialog({
  evaluation,
  open,
  onOpenChange,
  labels: labelsInput,
  subtitle,
  tip: tipInput,
  actions,
  className,
}: VoiceJudgeResultDialogProps) {
  const labels = useMemo(() => resolveVoiceJudgeLabels(labelsInput), [labelsInput]);
  const contentRef = useRef<HTMLDivElement>(null);
  const passed = Boolean(evaluation.passed);
  const score = evaluation.score ?? 0;
  const maxScore = evaluation.maxScore ?? 0;
  const percentage = evaluation.percentage ?? 0;
  const requiredScore = resolveRequiredScore(evaluation);
  const threshold = resolveThresholdPercentage(evaluation, requiredScore);
  const criteria = evaluation.criteria ?? [];
  const blockingErrors = evaluation.blockingErrors ?? [];
  const hasFeedback = criteria.length > 0 || blockingErrors.length > 0;
  const tip = tipInput === undefined ? resolveDefaultTip(criteria) : tipInput;
  const statusDescription = passed ? labels.passedDescription : labels.failedDescription;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-lg" />
        <Dialog.Content
          ref={contentRef}
          data-testid={VOICE_JUDGE_TEST_IDS.DIALOG}
          tabIndex={-1}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            contentRef.current?.focus();
          }}
          className={cn(
            "fixed left-1/2 top-1/2 z-[70] max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-[800px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl bg-background text-neutral-950 shadow-xl focus:outline-none sm:rounded-[32px]",
            className,
          )}
        >
          <div className="relative flex flex-col items-start px-6 py-8 sm:px-12 sm:py-10">
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label={labels.close}
                className="absolute right-4 top-4 inline-grid size-11 place-items-center rounded-full text-neutral-950 transition-colors hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950"
              >
                <X className="size-6" aria-hidden="true" />
              </button>
            </Dialog.Close>

            <span className="inline-flex items-center rounded-full bg-primary-300 px-4 py-1 text-sm font-semibold uppercase leading-relaxed tracking-[0.1em] text-neutral-950">
              {labels.kicker}
            </span>
            <Dialog.Title className="mt-4 text-xl font-semibold leading-snug text-neutral-950 sm:text-2xl">
              {labels.title}
            </Dialog.Title>
            <Dialog.Description className="sr-only">{statusDescription}</Dialog.Description>
            {subtitle && (
              <p className="mt-1 text-sm leading-relaxed text-neutral-500">{subtitle}</p>
            )}

            <div
              className={cn(
                "mt-6 flex w-full items-start gap-3 rounded-2xl border bg-background px-6 py-4",
                passed ? "border-primary-300" : "border-red-200",
              )}
            >
              <span
                className={cn(
                  "grid size-10 shrink-0 place-items-center rounded-full",
                  passed ? "bg-primary-100 text-primary-700" : "bg-red-50 text-red-600",
                )}
              >
                {passed ? (
                  <Check className="size-5" aria-hidden="true" />
                ) : (
                  <X className="size-5" aria-hidden="true" />
                )}
              </span>
              <div>
                <h3 className="text-lg font-semibold leading-snug text-neutral-950">
                  {passed ? labels.passedTitle : labels.failedTitle}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-neutral-500">{statusDescription}</p>
              </div>
            </div>

            <div className="mt-6 grid w-full gap-6 sm:grid-cols-2 sm:items-start sm:gap-10">
              <div>
                {maxScore > 0 && (
                  <>
                    <div className="flex items-baseline gap-2">
                      <b className="text-5xl font-semibold leading-none tabular-nums text-neutral-950">
                        {score}
                      </b>
                      <span className="text-lg text-neutral-500">
                        {labels.scoreTotal({ maxScore })}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                      {labels.summary({ percentage, requiredScore, maxScore, threshold })}
                    </p>
                  </>
                )}

                {criteria.length > 0 && (
                  <>
                    <p className={cn(sectionLabelClass, "mt-6")}>{labels.criteriaTitle}</p>
                    <ul className="mt-3 grid gap-3">
                      {criteria.map((criterion, index) => (
                        <li
                          key={criterion.criterionId ?? index}
                          className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 gap-y-2"
                        >
                          <span className="text-base leading-relaxed text-neutral-950">
                            {criterion.title.trim() || labels.criterionFallback(index + 1)}
                          </span>
                          <b className="tabular-nums text-neutral-950">
                            {labels.criterionScore({
                              score: criterion.awardedScore,
                              maxScore: criterion.maxScore,
                            })}
                          </b>
                          <span className="col-span-2 block h-2 overflow-hidden rounded-full bg-neutral-100">
                            <span
                              className="block h-full rounded-full bg-primary-500"
                              style={{
                                width: `${ratio(criterion.awardedScore, criterion.maxScore) * 100}%`,
                              }}
                            />
                          </span>
                          {criterion.learnerSafeFeedback && (
                            <p className="col-span-2 text-sm leading-relaxed text-neutral-500">
                              {criterion.learnerSafeFeedback}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {!hasFeedback && (
                  <div className="mt-6 flex items-start gap-3 rounded-2xl bg-neutral-50 px-6 py-4">
                    <Info className="mt-0.5 size-5 shrink-0 text-neutral-500" aria-hidden="true" />
                    <div>
                      <p className="font-semibold text-neutral-950">{labels.noFeedbackTitle}</p>
                      <p className="mt-1 text-sm leading-relaxed text-neutral-500">
                        {labels.noFeedbackDescription}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4">
                {blockingErrors.length > 0 && (
                  <section className="flex flex-col gap-3 rounded-2xl bg-red-50 p-6">
                    <h3 className={cn(sectionLabelClass, "text-neutral-950")}>
                      {labels.criticalErrorsTitle}
                    </h3>
                    <ul className="grid gap-3">
                      {blockingErrors.map((blockingError, index) => (
                        <li key={blockingError.blockingErrorId ?? index}>
                          <p className="font-semibold leading-relaxed text-neutral-950">
                            {blockingError.description}
                          </p>
                          {blockingError.learnerSafeFeedback && (
                            <p className="mt-1 text-sm leading-relaxed text-neutral-500">
                              {blockingError.learnerSafeFeedback}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {tip && (
                  <aside
                    aria-label={labels.tipTitle}
                    className="flex flex-col gap-3 rounded-2xl bg-primary-100 p-6"
                  >
                    <p className="flex items-center gap-3 text-xs font-semibold uppercase leading-relaxed tracking-[0.1em] text-primary-700">
                      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-background">
                        <Sparkles className="size-5" aria-hidden="true" />
                      </span>
                      {labels.tipTitle}
                    </p>
                    <p className="text-base leading-relaxed text-neutral-950">{tip}</p>
                    <p className="text-sm leading-relaxed text-neutral-500">{labels.tipNote}</p>
                  </aside>
                )}
              </div>
            </div>

            <div className="mt-8 grid w-full gap-3 sm:grid-cols-2 sm:gap-10">
              {actions ?? (
                <Button
                  data-testid={VOICE_JUDGE_TEST_IDS.CLOSE_BUTTON}
                  type="button"
                  variant="primary"
                  className="h-12 rounded-full sm:col-start-2"
                  onClick={() => onOpenChange(false)}
                >
                  {labels.close}
                </Button>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

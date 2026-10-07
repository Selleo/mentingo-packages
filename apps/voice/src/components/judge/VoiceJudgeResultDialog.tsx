import * as Dialog from "@radix-ui/react-dialog";
import { CheckCircle2, Info, ShieldAlert, XCircle } from "lucide-react";
import { useMemo } from "react";

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
  className?: string;
};

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

export function VoiceJudgeResultDialog({
  evaluation,
  open,
  onOpenChange,
  labels: labelsInput,
  className,
}: VoiceJudgeResultDialogProps) {
  const labels = useMemo(() => resolveVoiceJudgeLabels(labelsInput), [labelsInput]);
  const passed = Boolean(evaluation.passed);
  const score = evaluation.score ?? 0;
  const maxScore = evaluation.maxScore ?? 0;
  const percentage = evaluation.percentage ?? 0;
  const requiredScore = resolveRequiredScore(evaluation);
  const thresholdPercentage = resolveThresholdPercentage(evaluation, requiredScore);
  const criteria = evaluation.criteria ?? [];
  const blockingErrors = evaluation.blockingErrors ?? [];
  const statusTitle = passed ? labels.passedTitle : labels.failedTitle;
  const statusDescription = passed ? labels.passedDescription : labels.failedDescription;
  const StatusIcon = passed ? CheckCircle2 : XCircle;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-black/50" />
        <Dialog.Content
          data-testid={VOICE_JUDGE_TEST_IDS.DIALOG}
          className={cn(
            "fixed inset-x-0 bottom-0 z-[70] flex max-h-[85dvh] w-full flex-col overflow-hidden rounded-t-xl bg-background shadow-lg focus:outline-none sm:inset-auto sm:left-1/2 sm:top-1/2 sm:max-h-[82vh] sm:w-[calc(100%-2rem)] sm:max-w-xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-lg sm:border sm:border-neutral-200",
            className,
          )}
        >
          <div className="shrink-0 border-b border-neutral-100 px-6 py-4 text-left">
            <Dialog.Title className="text-lg font-semibold text-neutral-950">
              {labels.title}
            </Dialog.Title>
            <Dialog.Description className="sr-only">{statusDescription}</Dialog.Description>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5">
            <div className="grid gap-5">
              <div
                className={cn(
                  "flex items-start gap-3 rounded-md border bg-white p-4 text-left",
                  passed ? "border-emerald-200" : "border-red-200",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md",
                    passed ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700",
                  )}
                >
                  <StatusIcon className="size-5" aria-hidden="true" />
                </span>
                <div className="grid gap-1">
                  <h3 className="text-base font-semibold text-neutral-950">{statusTitle}</h3>
                  <p className="text-sm leading-relaxed text-neutral-600">{statusDescription}</p>
                </div>
              </div>

              {maxScore > 0 && (
                <div className="grid gap-3 rounded-md border border-neutral-200 bg-neutral-50/70 p-4 sm:grid-cols-2">
                  <div className="grid gap-1">
                    <span className="text-xs font-medium text-neutral-500">
                      {labels.scoreLabel}
                    </span>
                    <span className="text-base font-semibold text-neutral-950">
                      {labels.scoreValue({ score, maxScore, percentage })}
                    </span>
                  </div>
                  {requiredScore !== null && thresholdPercentage !== null && (
                    <div className="grid gap-1">
                      <span className="text-xs font-medium uppercase text-neutral-500">
                        {labels.thresholdLabel}
                      </span>
                      <span className="text-lg font-semibold text-neutral-950">
                        {labels.thresholdValue({
                          requiredScore,
                          maxScore,
                          threshold: thresholdPercentage,
                        })}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {blockingErrors.length > 0 && (
                <section className="grid gap-3">
                  <div className="flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-full bg-red-50 text-red-700">
                      <ShieldAlert className="size-4" aria-hidden="true" />
                    </span>
                    <h3 className="text-sm font-semibold text-neutral-950">
                      {labels.criticalErrorsTitle}
                    </h3>
                  </div>
                  <div className="overflow-hidden rounded-md border border-neutral-200 bg-white">
                    {blockingErrors.map((blockingError, index) => (
                      <div
                        key={blockingError.blockingErrorId ?? index}
                        className="grid gap-1 border-b border-neutral-100 px-4 py-3 last:border-b-0"
                      >
                        <p className="text-sm font-semibold text-neutral-950">
                          {blockingError.description}
                        </p>
                        <p className="text-sm leading-relaxed text-neutral-600">
                          {blockingError.learnerSafeFeedback}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {criteria.length > 0 && (
                <section className="grid gap-3">
                  <h3 className="text-sm font-semibold text-neutral-950">{labels.criteriaTitle}</h3>
                  <div className="grid gap-2">
                    {criteria.map((criterion, index) => (
                      <div
                        key={criterion.criterionId ?? index}
                        className="grid gap-2 rounded-md border border-neutral-200 bg-white p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-semibold text-neutral-950">
                            {criterion.title.trim() || labels.criterionFallback(index + 1)}
                          </p>
                          <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-1 text-xs font-semibold text-neutral-700">
                            {labels.criterionScore({
                              score: criterion.awardedScore,
                              maxScore: criterion.maxScore,
                            })}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed text-neutral-600">
                          {criterion.learnerSafeFeedback}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {criteria.length === 0 && blockingErrors.length === 0 && (
                <div className="flex items-start gap-3 rounded-md border border-neutral-200 bg-neutral-50 p-4">
                  <Info className="mt-0.5 size-5 shrink-0 text-neutral-500" aria-hidden="true" />
                  <div className="grid gap-1">
                    <h3 className="text-sm font-semibold text-neutral-950">
                      {labels.noFeedbackTitle}
                    </h3>
                    <p className="text-sm leading-relaxed text-neutral-600">
                      {labels.noFeedbackDescription}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex shrink-0 justify-end border-t border-neutral-100 px-6 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
            <Button
              data-testid={VOICE_JUDGE_TEST_IDS.CLOSE_BUTTON}
              type="button"
              variant="primary"
              onClick={() => onOpenChange(false)}
            >
              {labels.close}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

import { LoaderCircle } from "lucide-react";

import { cn } from "../../lib/utils";

import { DEFAULT_VOICE_JUDGE_LABELS, type VoiceJudgeLabels } from "./judgeLabels";
import { VOICE_JUDGE_TEST_IDS } from "./judgeTestIds";

export type VoiceJudgeEvaluationLoaderProps = {
  labels?: Partial<Pick<VoiceJudgeLabels, "loadingTitle" | "loadingDescription">>;
  className?: string;
};

export function VoiceJudgeEvaluationLoader({ labels, className }: VoiceJudgeEvaluationLoaderProps) {
  const loadingTitle = labels?.loadingTitle ?? DEFAULT_VOICE_JUDGE_LABELS.loadingTitle;
  const loadingDescription =
    labels?.loadingDescription ?? DEFAULT_VOICE_JUDGE_LABELS.loadingDescription;

  return (
    <div
      role="status"
      aria-live="polite"
      data-testid={VOICE_JUDGE_TEST_IDS.LOADER}
      className={cn("border-y border-neutral-200 py-4", className)}
    >
      <div className="flex items-start gap-3">
        <LoaderCircle
          className="mt-0.5 size-5 shrink-0 animate-spin text-primary-700 motion-reduce:animate-none"
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-neutral-950">{loadingTitle}</p>
          <p className="mt-1 text-sm leading-relaxed text-neutral-600">{loadingDescription}</p>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-neutral-100">
            <div className="voice-judge-progress h-full w-1/3 rounded-full bg-primary-600" />
          </div>
        </div>
      </div>
    </div>
  );
}

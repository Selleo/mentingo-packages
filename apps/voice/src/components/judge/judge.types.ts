export const VOICE_JUDGE_CRITERION_STATUS = {
  NOT_MET: "not_met",
  PARTIAL: "partial",
  MET: "met",
} as const;

export type VoiceJudgeCriterionStatus =
  (typeof VOICE_JUDGE_CRITERION_STATUS)[keyof typeof VOICE_JUDGE_CRITERION_STATUS];

export type VoiceJudgeEvaluation = {
  passed?: boolean | null;
  minScore?: number | null;
  score?: number | null;
  maxScore?: number | null;
  percentage?: number | null;
  requiredScore?: number | null;
  criteria?: Array<{
    criterionId: string | null;
    title: string;
    awardedScore: number;
    maxScore: number;
    status: string;
    learnerSafeFeedback: string;
  }>;
  blockingErrors?: Array<{
    blockingErrorId: string | null;
    description: string;
    learnerSafeFeedback: string;
  }>;
};

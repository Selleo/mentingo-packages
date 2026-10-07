export type VoiceJudgeLabels = {
  title: string;
  passedTitle: string;
  failedTitle: string;
  passedDescription: string;
  failedDescription: string;
  scoreLabel: string;
  scoreValue: (values: { score: number; maxScore: number; percentage: number }) => string;
  thresholdLabel: string;
  thresholdValue: (values: {
    requiredScore: number;
    maxScore: number;
    threshold: number;
  }) => string;
  criticalErrorsTitle: string;
  criteriaTitle: string;
  criterionScore: (values: { score: number; maxScore: number }) => string;
  criterionFallback: (number: number) => string;
  noFeedbackTitle: string;
  noFeedbackDescription: string;
  loadingTitle: string;
  loadingDescription: string;
  close: string;
};

export const DEFAULT_VOICE_JUDGE_LABELS: VoiceJudgeLabels = {
  title: "Result",
  passedTitle: "Lesson passed",
  failedTitle: "Lesson not passed",
  passedDescription: "Your answer met the requirements for this lesson.",
  failedDescription: "Review the feedback and try again when you're ready.",
  scoreLabel: "Score",
  scoreValue: ({ score, maxScore, percentage }) =>
    `${score}/${maxScore} conditions met (${percentage}%)`,
  thresholdLabel: "Passing threshold",
  thresholdValue: ({ requiredScore, maxScore, threshold }) =>
    `${requiredScore}/${maxScore} required (${threshold}%)`,
  criticalErrorsTitle: "What prevented completion",
  criteriaTitle: "Criteria breakdown",
  criterionScore: ({ score, maxScore }) => `${score}/${maxScore} pts`,
  criterionFallback: (number) => `Criterion ${number}`,
  noFeedbackTitle: "No detailed feedback available",
  noFeedbackDescription:
    "This assessment has no scored criteria, and no blocking errors were detected in your attempt.",
  loadingTitle: "Checking your attempt",
  loadingDescription:
    "Reviewing the conversation against the lesson criteria. This may take a moment.",
  close: "Close",
};

export function resolveVoiceJudgeLabels(labels?: Partial<VoiceJudgeLabels>): VoiceJudgeLabels {
  return { ...DEFAULT_VOICE_JUDGE_LABELS, ...labels };
}

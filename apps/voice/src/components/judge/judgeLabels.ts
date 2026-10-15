export type VoiceJudgeLabels = {
  kicker: string;
  title: string;
  passedTitle: string;
  failedTitle: string;
  passedDescription: string;
  failedDescription: string;
  scoreTotal: (values: { maxScore: number }) => string;
  summary: (values: {
    percentage: number;
    requiredScore: number | null;
    maxScore: number;
    threshold: number | null;
  }) => string;
  criteriaTitle: string;
  criterionScore: (values: { score: number; maxScore: number }) => string;
  criterionFallback: (number: number) => string;
  criticalErrorsTitle: string;
  tipTitle: string;
  tipNote: string;
  noFeedbackTitle: string;
  noFeedbackDescription: string;
  loadingTitle: string;
  loadingDescription: string;
  close: string;
};

export const DEFAULT_VOICE_JUDGE_LABELS: VoiceJudgeLabels = {
  kicker: "AI Mentor review",
  title: "Conversation summary",
  passedTitle: "Passed",
  failedTitle: "Not passed yet",
  passedDescription: "Your answer met the requirements for this lesson.",
  failedDescription: "Review the feedback and try again when you're ready.",
  scoreTotal: ({ maxScore }) => `/ ${maxScore} pts`,
  summary: ({ percentage, requiredScore, maxScore }) =>
    requiredScore === null
      ? `${percentage}%`
      : `${percentage}% · passing threshold ${requiredScore}/${maxScore} pts`,
  criteriaTitle: "Criteria breakdown",
  criterionScore: ({ score, maxScore }) => `${score}/${maxScore}`,
  criterionFallback: (number) => `Criterion ${number}`,
  criticalErrorsTitle: "What prevented completion",
  tipTitle: "Suggestion from the AI Mentor",
  tipNote: "Based on what you said in this conversation",
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

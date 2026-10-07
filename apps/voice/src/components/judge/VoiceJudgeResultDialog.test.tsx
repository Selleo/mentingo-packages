import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { VOICE_JUDGE_TEST_IDS } from "./judgeTestIds";
import { VoiceJudgeEvaluationLoader } from "./VoiceJudgeEvaluationLoader";
import { VoiceJudgeResultDialog } from "./VoiceJudgeResultDialog";

import type { VoiceJudgeEvaluation } from "./judge.types";

const failedEvaluation: VoiceJudgeEvaluation = {
  passed: false,
  minScore: 4,
  score: 3,
  maxScore: 6,
  percentage: 50,
  criteria: [
    {
      criterionId: "C1",
      title: "Explores the client's needs",
      awardedScore: 2,
      maxScore: 2,
      status: "met",
      learnerSafeFeedback: "You asked about priorities.",
    },
    {
      criterionId: "C2",
      title: "",
      awardedScore: 1,
      maxScore: 2,
      status: "partial",
      learnerSafeFeedback: "Value stayed general.",
    },
  ],
  blockingErrors: [
    {
      blockingErrorId: "B1",
      description: "Rude to the client",
      learnerSafeFeedback: "You dismissed the client's concern.",
    },
  ],
};

describe("VoiceJudgeResultDialog", () => {
  it("shows the outcome, score, threshold, blocking errors and criteria", () => {
    render(<VoiceJudgeResultDialog evaluation={failedEvaluation} open onOpenChange={vi.fn()} />);

    expect(screen.getByRole("heading", { name: "Lesson not passed" })).toBeInTheDocument();
    expect(screen.getByText("3/6 conditions met (50%)")).toBeInTheDocument();
    expect(screen.getByText("4/6 required (67%)")).toBeInTheDocument();
    expect(screen.getByText("Rude to the client")).toBeInTheDocument();
    expect(screen.getByText("Explores the client's needs")).toBeInTheDocument();
    expect(screen.getByText("Criterion 2")).toBeInTheDocument();
    expect(screen.getByText("1/2 pts")).toBeInTheDocument();
  });

  it("uses provided labels and closes from the close button", () => {
    const onOpenChange = vi.fn();
    render(
      <VoiceJudgeResultDialog
        evaluation={{ passed: true, score: 6, maxScore: 6, minScore: 4, percentage: 100 }}
        open
        onOpenChange={onOpenChange}
        labels={{ passedTitle: "Zaliczone", close: "Zamknij" }}
      />,
    );

    expect(screen.getByRole("heading", { name: "Zaliczone" })).toBeInTheDocument();
    expect(screen.getByText("No detailed feedback available")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId(VOICE_JUDGE_TEST_IDS.CLOSE_BUTTON));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("renders nothing while closed", () => {
    render(
      <VoiceJudgeResultDialog evaluation={failedEvaluation} open={false} onOpenChange={vi.fn()} />,
    );

    expect(screen.queryByTestId(VOICE_JUDGE_TEST_IDS.DIALOG)).not.toBeInTheDocument();
  });
});

describe("VoiceJudgeEvaluationLoader", () => {
  it("announces progress with default or provided labels", () => {
    render(<VoiceJudgeEvaluationLoader labels={{ loadingTitle: "Sprawdzamy" }} />);

    expect(screen.getByRole("status")).toHaveTextContent("Sprawdzamy");
    expect(screen.getByRole("status")).toHaveTextContent("Reviewing the conversation");
  });
});

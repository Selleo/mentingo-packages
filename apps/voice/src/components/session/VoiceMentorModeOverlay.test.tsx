import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { VOICE_CONNECTION_STATE, VOICE_MODE_STATE } from "../../core/constants";

import { VOICE_SESSION_TEST_IDS } from "./test-ids";
import { VoiceMentorModeOverlay } from "./VoiceMentorModeOverlay";

vi.mock("../visualizers/agent-audio-visualizer-aura", () => ({
  AgentAudioVisualizerAura: () => <div data-testid="mentor-aura" />,
}));

vi.mock("../visualizers/agent-audio-visualizer-wave", () => ({
  AgentAudioVisualizerWave: () => <div data-testid="mentor-wave" />,
}));

const renderOverlay = ({
  onJudge = vi.fn(async () => undefined),
  onMicMutedChange = vi.fn(),
  onRestart = vi.fn(),
  onExit = vi.fn(),
  connectionState = VOICE_CONNECTION_STATE.CONNECTED,
  response = "",
  canJudge = true,
}: {
  onJudge?: () => Promise<void>;
  onMicMutedChange?: (muted: boolean) => void;
  onRestart?: () => void;
  onExit?: () => void;
  connectionState?: (typeof VOICE_CONNECTION_STATE)[keyof typeof VOICE_CONNECTION_STATE];
  response?: string;
  canJudge?: boolean;
} = {}) => {
  render(
    <VoiceMentorModeOverlay
      open
      state={VOICE_MODE_STATE.IDLE}
      voiceLevel={0}
      mentorVoiceLevel={0}
      learnerTranscript={null}
      response={response}
      mentorSpeech={null}
      mentorName="Mentor"
      learnerName="Kaylah Admin"
      taskContent={<div>Practice the customer conversation.</div>}
      onJudge={onJudge}
      isJudgePending={false}
      canJudge={canJudge}
      isMicMuted={false}
      connectionState={connectionState}
      isRestarting={false}
      onMicMutedChange={onMicMutedChange}
      onRestart={onRestart}
      onExit={onExit}
    />,
  );

  return { onExit, onJudge, onMicMutedChange, onRestart };
};

describe("VoiceMentorModeOverlay", () => {
  it("disables evaluation on desktop and mobile until the Practice turn is ready", () => {
    const { onJudge } = renderOverlay({ canJudge: false });
    const desktop = screen.getByTestId(VOICE_SESSION_TEST_IDS.CHECK_BUTTON);
    const mobile = screen.getByTestId(VOICE_SESSION_TEST_IDS.MOBILE_CHECK_BUTTON);
    expect(desktop).toBeDisabled();
    expect(mobile).toBeDisabled();
    fireEvent.click(desktop);
    fireEvent.click(mobile);
    expect(onJudge).not.toHaveBeenCalled();
  });

  it("opens the task panel by default when entering voice mode", () => {
    renderOverlay();

    expect(screen.getByTestId(VOICE_SESSION_TEST_IDS.OVERLAY)).toBeInTheDocument();
    expect(screen.getByTestId(VOICE_SESSION_TEST_IDS.TASK_PANEL)).toBeInTheDocument();
  });

  it("shows the last mentor response when entering voice mode", () => {
    renderOverlay({ response: "Welcome back." });

    expect(screen.getByText("Welcome back.")).toBeInTheDocument();
  });

  it("offers an in-overlay action to request AI Judge feedback", () => {
    const { onJudge } = renderOverlay();

    fireEvent.click(screen.getByTestId(VOICE_SESSION_TEST_IDS.CHECK_BUTTON));

    expect(onJudge).toHaveBeenCalledOnce();
  });

  it("keeps the mobile voice controls available while the task is open", () => {
    const { onExit, onJudge, onMicMutedChange } = renderOverlay();

    expect(screen.getByTestId(VOICE_SESSION_TEST_IDS.TASK_PANEL)).toBeInTheDocument();
    expect(screen.getByTestId(VOICE_SESSION_TEST_IDS.MUTE_BUTTON)).toBeInTheDocument();
    expect(screen.getByTestId(VOICE_SESSION_TEST_IDS.MOBILE_CHECK_BUTTON)).toBeInTheDocument();
    expect(screen.getByTestId(VOICE_SESSION_TEST_IDS.MOBILE_EXIT_BUTTON)).toBeInTheDocument();

    fireEvent.click(screen.getByTestId(VOICE_SESSION_TEST_IDS.MUTE_BUTTON));
    fireEvent.click(screen.getByTestId(VOICE_SESSION_TEST_IDS.MOBILE_CHECK_BUTTON));
    fireEvent.click(screen.getByTestId(VOICE_SESSION_TEST_IDS.MOBILE_EXIT_BUTTON));

    expect(onMicMutedChange).toHaveBeenCalledWith(true);
    expect(onJudge).toHaveBeenCalledOnce();
    expect(onExit).toHaveBeenCalledOnce();
  });

  it("offers a restart action when voice recovery fails", () => {
    const { onRestart } = renderOverlay({
      connectionState: VOICE_CONNECTION_STATE.FAILED,
    });

    fireEvent.click(screen.getByTestId(VOICE_SESSION_TEST_IDS.RESTART_BUTTON));

    expect(onRestart).toHaveBeenCalledOnce();
  });

  it("keeps automatic voice recovery under the hood", () => {
    renderOverlay({
      connectionState: VOICE_CONNECTION_STATE.RECOVERING,
    });

    expect(screen.queryByTestId(VOICE_SESSION_TEST_IDS.RECOVERY_STATUS)).not.toBeInTheDocument();
  });

  it("hides the check and task controls when not provided", () => {
    render(
      <VoiceMentorModeOverlay
        open
        state={VOICE_MODE_STATE.IDLE}
        voiceLevel={0}
        mentorVoiceLevel={0}
        learnerTranscript={null}
        response=""
        mentorSpeech={null}
        mentorName="Mentor"
        learnerName="Visitor"
        isMicMuted={false}
        connectionState={VOICE_CONNECTION_STATE.CONNECTED}
        onMicMutedChange={vi.fn()}
        onRestart={vi.fn()}
        onExit={vi.fn()}
        labels={{ exit: "Leave" }}
      />,
    );

    expect(screen.queryByTestId(VOICE_SESSION_TEST_IDS.CHECK_BUTTON)).not.toBeInTheDocument();
    expect(screen.queryByTestId(VOICE_SESSION_TEST_IDS.TASK_BUTTON)).not.toBeInTheDocument();
    expect(screen.getByTestId(VOICE_SESSION_TEST_IDS.EXIT_BUTTON)).toHaveTextContent("Leave");
  });
});

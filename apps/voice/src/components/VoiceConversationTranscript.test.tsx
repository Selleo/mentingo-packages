import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LEARNER_TRANSCRIPT_STATUSES } from "../core/constants";

import {
  VOICE_TRANSCRIPT_ROLE,
  VoiceConversationTranscript,
  type VoiceTranscriptMessage,
  type VoiceTranscriptRole,
} from "./VoiceConversationTranscript";

const message = (id: string, role: VoiceTranscriptRole, text: string): VoiceTranscriptMessage => ({
  id,
  role,
  text,
});

describe("VoiceConversationTranscript", () => {
  it("shows recent canonical history and updates a streamed reply in place", () => {
    const props = {
      mentorName: "Mentor",
      mentorSpeech: null,
      mentorResponse: "Welcome",
      learnerTranscript: null,
    };
    const history = Array.from({ length: 15 }, (_, index) =>
      message(String(index), VOICE_TRANSCRIPT_ROLE.MENTOR, `History ${index}`),
    );
    const { rerender } = render(
      <VoiceConversationTranscript learnerName="Kaylah Admin" {...props} messages={history} />,
    );
    expect(screen.queryByText("History 2")).not.toBeInTheDocument();
    expect(screen.getByText("History 3")).toBeInTheDocument();
    expect(screen.queryByText("unfinished")).not.toBeInTheDocument();
    rerender(
      <VoiceConversationTranscript
        learnerName="Kaylah Admin"
        {...props}
        messages={[
          ...history,
          message("final", VOICE_TRANSCRIPT_ROLE.LEARNER, "Final transcript"),
          message("reply", VOICE_TRANSCRIPT_ROLE.MENTOR, "Reply draft"),
        ]}
      />,
    );
    rerender(
      <VoiceConversationTranscript
        learnerName="Kaylah Admin"
        {...props}
        messages={[
          ...history,
          message("final", VOICE_TRANSCRIPT_ROLE.LEARNER, "Final transcript"),
          message("reply", VOICE_TRANSCRIPT_ROLE.MENTOR, "Complete reply"),
        ]}
      />,
    );
    expect(screen.getAllByText("Final transcript")).toHaveLength(1);
    expect(screen.queryByText("Reply draft")).not.toBeInTheDocument();
    expect(screen.getAllByText("Complete reply")).toHaveLength(1);
  });

  it("replaces a partial with its final in the same element, including delayed chat updates", () => {
    const props = { mentorName: "Mentor", mentorSpeech: null, mentorResponse: "Welcome" };
    const history = [message("welcome", VOICE_TRANSCRIPT_ROLE.MENTOR, "Welcome")];
    const partial = {
      turnId: "turn-1",
      segmentId: "partial-segment",
      revision: 1,
      status: LEARNER_TRANSCRIPT_STATUSES.PARTIAL,
      text: "I would",
    };
    const { rerender } = render(
      <VoiceConversationTranscript
        learnerName="Kaylah Admin"
        {...props}
        messages={history}
        learnerTranscript={partial}
      />,
    );
    const element = screen.getByText("I would");
    expect(element).not.toHaveClass("transcript-finalized-text");
    rerender(
      <VoiceConversationTranscript
        learnerName="Kaylah Admin"
        {...props}
        messages={history}
        learnerTranscript={{
          ...partial,
          segmentId: "another-segment",
          revision: 2,
          text: "I would like",
        }}
      />,
    );
    expect(screen.getByText("I would like")).toBe(element);
    const final = {
      ...partial,
      segmentId: "final-segment",
      revision: 3,
      status: LEARNER_TRANSCRIPT_STATUSES.FINAL,
      text: "I would like help.",
    };
    rerender(
      <VoiceConversationTranscript
        learnerName="Kaylah Admin"
        {...props}
        messages={history}
        learnerTranscript={final}
      />,
    );
    expect(screen.getByText(final.text)).toBe(element);
    expect(element).toHaveClass("transcript-finalized-text");
    const updatedHistory = [
      ...history,
      message(final.turnId, VOICE_TRANSCRIPT_ROLE.LEARNER, final.text),
    ];
    rerender(
      <VoiceConversationTranscript
        learnerName="Kaylah Admin"
        {...props}
        messages={updatedHistory}
        learnerTranscript={final}
      />,
    );
    expect(screen.getAllByText(final.text)).toHaveLength(1);
    expect(screen.getByText(final.text)).toBe(element);
    fireEvent.animationEnd(element);
    rerender(
      <VoiceConversationTranscript
        learnerName="Kaylah Admin"
        {...props}
        messages={[...updatedHistory, message("reply", VOICE_TRANSCRIPT_ROLE.MENTOR, "Of course.")]}
        learnerTranscript={final}
      />,
    );
    expect(element).not.toHaveClass("transcript-finalized-text");
    expect(screen.queryByText("I would")).not.toBeInTheDocument();
  });

  it("does not animate final messages when entering voice mode", () => {
    const { container } = render(
      <VoiceConversationTranscript
        learnerName="Kaylah Admin"
        messages={[
          message("learner", VOICE_TRANSCRIPT_ROLE.LEARNER, "Earlier answer"),
          message("mentor", VOICE_TRANSCRIPT_ROLE.MENTOR, "Earlier reply"),
        ]}
        learnerTranscript={null}
        mentorName="Mentor"
        mentorResponse="Earlier reply"
        mentorSpeech={null}
      />,
    );
    expect(screen.getByText("Earlier answer")).toBeInTheDocument();
    expect(container.querySelector(".transcript-finalized-text")).toBeNull();
  });

  it("swishes a newly finalized transcript even without a partial, but not on re-entry", () => {
    const props = { mentorName: "Mentor", mentorSpeech: null, mentorResponse: "Welcome" };
    const transcript = {
      turnId: "fresh-final",
      segmentId: "segment",
      revision: 1,
      status: LEARNER_TRANSCRIPT_STATUSES.FINAL,
      text: "Final answer",
    };
    const history = [message(transcript.turnId, VOICE_TRANSCRIPT_ROLE.LEARNER, transcript.text)];
    const { rerender, unmount } = render(
      <VoiceConversationTranscript
        learnerName="Kaylah Admin"
        {...props}
        learnerTranscript={null}
        messages={[]}
      />,
    );
    rerender(
      <VoiceConversationTranscript
        learnerName="Kaylah Admin"
        {...props}
        learnerTranscript={transcript}
        messages={history}
      />,
    );
    const text = screen.getByText(transcript.text);
    expect(text).toHaveClass("transcript-finalized-text");
    fireEvent.animationEnd(text);
    rerender(
      <VoiceConversationTranscript
        learnerName="Kaylah Admin"
        {...props}
        learnerTranscript={{ ...transcript, revision: 2 }}
        messages={history}
      />,
    );
    expect(text).not.toHaveClass("transcript-finalized-text");
    unmount();
    render(
      <VoiceConversationTranscript
        learnerName="Kaylah Admin"
        {...props}
        learnerTranscript={transcript}
        messages={history}
      />,
    );
    expect(screen.getByText(transcript.text)).not.toHaveClass("transcript-finalized-text");
  });

  it("does not resurrect a finalized turn when playback refreshes history with database IDs", () => {
    const props = { mentorName: "Mentor", mentorSpeech: null, mentorResponse: "Of course." };
    const transcript = {
      turnId: "voice-turn",
      segmentId: "segment",
      revision: 1,
      status: LEARNER_TRANSCRIPT_STATUSES.FINAL,
      text: "I need help.",
    };
    const { rerender, container } = render(
      <VoiceConversationTranscript
        learnerName="Kaylah Admin"
        {...props}
        learnerTranscript={transcript}
        messages={[
          message("voice-turn", VOICE_TRANSCRIPT_ROLE.LEARNER, transcript.text),
          message("voice-reply", VOICE_TRANSCRIPT_ROLE.MENTOR, "Of course."),
        ]}
      />,
    );
    const savedMessages = [
      message("database-user", VOICE_TRANSCRIPT_ROLE.LEARNER, transcript.text),
      message("database-mentor", VOICE_TRANSCRIPT_ROLE.MENTOR, "Of course."),
    ];
    rerender(
      <VoiceConversationTranscript
        learnerName="Kaylah Admin"
        {...props}
        learnerTranscript={transcript}
        messages={savedMessages}
      />,
    );
    expect(screen.getAllByText(transcript.text)).toHaveLength(1);
    expect(container.querySelector(".transcript-finalized-text")).toBeNull();
    rerender(
      <VoiceConversationTranscript
        learnerName="Kaylah Admin"
        {...props}
        learnerTranscript={{
          ...transcript,
          turnId: "next-turn",
          status: LEARNER_TRANSCRIPT_STATUSES.PARTIAL,
        }}
        messages={savedMessages}
      />,
    );
    expect(screen.getAllByText(transcript.text)).toHaveLength(2);
  });

  it("follows instantly, preserves manual scroll, and removes the fade at the top", () => {
    const props = {
      learnerTranscript: null,
      mentorSpeech: null,
      mentorName: "Mentor",
      mentorResponse: "",
    };
    const { rerender } = render(
      <VoiceConversationTranscript
        learnerName="Kaylah Admin"
        {...props}
        messages={[message("1", VOICE_TRANSCRIPT_ROLE.MENTOR, "Welcome")]}
      />,
    );
    const viewport = screen.getByRole("region");
    Object.defineProperties(viewport, {
      scrollHeight: { value: 900, configurable: true },
      clientHeight: { value: 200, configurable: true },
    });
    rerender(
      <VoiceConversationTranscript
        learnerName="Kaylah Admin"
        {...props}
        messages={[message("1", VOICE_TRANSCRIPT_ROLE.MENTOR, "Welcome back")]}
      />,
    );
    expect(viewport.scrollTop).toBe(900);
    fireEvent.scroll(viewport, { target: { scrollTop: 100 } });
    rerender(
      <VoiceConversationTranscript
        learnerName="Kaylah Admin"
        {...props}
        messages={[message("1", VOICE_TRANSCRIPT_ROLE.MENTOR, "Welcome back again")]}
      />,
    );
    expect(viewport.scrollTop).toBe(100);
    fireEvent.scroll(viewport, { target: { scrollTop: 0 } });
    expect(viewport.style.maskImage).toContain("rgba(0,0,0,1)");
    fireEvent.scroll(viewport, { target: { scrollTop: 700 } });
    rerender(
      <VoiceConversationTranscript
        learnerName="Kaylah Admin"
        {...props}
        messages={[message("1", VOICE_TRANSCRIPT_ROLE.MENTOR, "Latest reply")]}
      />,
    );
    expect(viewport.scrollTop).toBe(900);
  });

  it("keeps learner messages on the left with the mentor conversation", () => {
    render(
      <VoiceConversationTranscript
        learnerName="Kaylah Admin"
        learnerTranscript={{
          text: "I would like a discount",
          turnId: "turn-1",
          segmentId: "segment-1",
          revision: 1,
          status: LEARNER_TRANSCRIPT_STATUSES.FINAL,
        }}
        mentorResponse="How can I help?"
        mentorSpeech={null}
        mentorName="Mentor"
      />,
    );

    const learnerMessage = screen.getByText("I would like a discount").parentElement;
    const learnerRow = learnerMessage?.parentElement?.parentElement;
    const learnerAvatar = screen.getByText("Kaylah Admin").parentElement?.previousElementSibling;

    expect(screen.getByText("Kaylah Admin")).toBeInTheDocument();
    expect(screen.getByText("Mentor")).toBeInTheDocument();
    expect(learnerAvatar).toHaveClass("mt-0.5", "shrink-0");
    expect(learnerAvatar?.querySelector(".size-9")).toBeInTheDocument();
    expect(learnerRow).toHaveClass("self-start");
    expect(learnerMessage).toHaveClass("rounded-bl-md");
    expect(learnerMessage).not.toHaveClass("ml-auto", "rounded-br-md");
  });
});

describe("canonical mentor display with speech alignment", () => {
  it("highlights only the current mentor reply in the recent history", () => {
    const { container } = render(
      <VoiceConversationTranscript
        learnerName="Kaylah Admin"
        messages={[
          message("old", VOICE_TRANSCRIPT_ROLE.MENTOR, "Hello again"),
          message("learner", VOICE_TRANSCRIPT_ROLE.LEARNER, "Hello"),
          message("current", VOICE_TRANSCRIPT_ROLE.MENTOR, "Hello again"),
        ]}
        learnerTranscript={null}
        mentorResponse="Hello again"
        mentorSpeech={{
          turnId: "current",
          sequence: 1,
          words: [{ text: "Hello", startMs: 0, endMs: 100 }],
          activeWordIndex: 0,
        }}
        mentorName="Mentor"
      />,
    );
    expect(container.querySelectorAll("span.bg-primary-100")).toHaveLength(1);
    expect(container.querySelector("span.bg-primary-100")?.textContent).toBe("Hello");
  });

  it.each([
    { text: "Wynik: 0,47.\nUżyj <button>", word: "0,47", highlighted: true },
    { text: "Wynik: 0,47.", word: "zero przecinek cztery siedem", highlighted: false },
    { text: "Wynik: 0,47.", word: "47", highlighted: false },
    { text: "Hello,  world!", word: "Hello", highlighted: true },
  ])("preserves $text when alignment contains $word", ({ text, word, highlighted }) => {
    const { container } = render(
      <VoiceConversationTranscript
        learnerName="Kaylah Admin"
        learnerTranscript={null}
        mentorResponse={text}
        mentorSpeech={{
          turnId: "turn-1",
          sequence: 1,
          words: [{ text: word, startMs: 0, endMs: 100 }],
          activeWordIndex: 0,
        }}
        mentorName="Mentor"
      />,
    );
    const visibleText = container.querySelector("span[aria-hidden='true']");
    expect(visibleText?.textContent).toBe(text);
    expect(visibleText?.querySelector("button")).toBeNull();
    expect(Boolean(visibleText?.querySelector(".bg-primary-100"))).toBe(highlighted);
  });

  it("keeps the full response visible when timing covers only its beginning", () => {
    const { container } = render(
      <VoiceConversationTranscript
        learnerName="Kaylah Admin"
        learnerTranscript={null}
        mentorResponse="Hello, world! More words arrive."
        mentorSpeech={{
          turnId: "turn-1",
          sequence: 1,
          words: [{ text: "Hello", startMs: 0, endMs: 100 }],
          activeWordIndex: 0,
        }}
        mentorName="Mentor"
      />,
    );
    expect(container.querySelector("span[aria-hidden='true']")?.textContent).toBe(
      "Hello, world! More words arrive.",
    );
  });
});

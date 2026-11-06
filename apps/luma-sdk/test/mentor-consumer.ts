/** Compile the native chat surface used by an authorized assistant tool loop. */
import { createLumaClient } from "../src/index";
import type { MentorChatEvent, NativeChatResult } from "../src/contracts";
import type { MentorChatOptions, PublicAiMessage } from "../src/index";

const client = createLumaClient({ apiKey: "synthetic-key" });
const signal = new AbortController().signal;
const messages: PublicAiMessage[] = [
  { role: "user", content: "Read the course." },
  {
    role: "assistant",
    content: "",
    toolCalls: [{ id: "call-1", name: "read_course", arguments: { courseId: "course-1" } }],
  },
  { role: "tool", content: '{"title":"Course"}', toolCallId: "call-1" },
];
const options: MentorChatOptions = {
  messages,
  tools: [{ name: "read_course", inputSchema: { type: "object" } }],
  toolChoice: { name: "read_course" },
  streamFormat: "events",
  maxOutputTokens: 2500,
  topP: 0.9,
  stopSequences: ["<stop>"],
};
void client.mentor.streamChat(options, { signal });
const nativeResult: Promise<NativeChatResult> = client.mentor.generateChat(
  { ...options, streamFormat: "events" },
  { signal },
);
void nativeResult;
void client.mentor.generateChat({ messages: [{ role: "user", content: "Plain text" }] });

function consume(event: MentorChatEvent): string {
  switch (event.type) {
    case "text-delta":
      return event.text;
    case "tool-call":
      return `${event.id}:${event.name}:${JSON.stringify(event.arguments)}`;
    case "finish":
      return event.finishReason;
    case "error":
      return event.code;
  }
}
void consume;

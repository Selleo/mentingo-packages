# @mentingo/luma-sdk

## 0.4.1

### Patch Changes

- 9eae0b0: Expose optional dimensions and resolved model identity on the existing native embeddings contract. Add native Mentor chat tool/history/event-stream types and optional cancellation for one-shot generation. Preserve text-only chat and embedding calls; use the existing `client.mentor` and `client.ai.createEmbeddings()` methods without a chat-completions relay.

## 0.4.0

### Minor Changes

- c837d34: Expose the voice TTS vendor in capability status and API key metadata for provider selection, with write-only credential presence flags.

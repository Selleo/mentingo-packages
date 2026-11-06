---
"@mentingo/luma-sdk": patch
---

Expose optional dimensions and resolved model identity on the existing native embeddings contract. Add native Mentor chat tool/history/event-stream types and optional cancellation for one-shot generation. Preserve text-only chat and embedding calls; use the existing `client.mentor` and `client.ai.createEmbeddings()` methods without a chat-completions relay.

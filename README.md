# mentingo-ui

Reusable UI building blocks extracted from [Mentingo](https://github.com/Selleo/mentingo).

Turborepo + pnpm. Each publishable element is its own package in `apps/`:

| Package                         | Path         | Description                                                            |
| ------------------------------- | ------------ | ---------------------------------------------------------------------- |
| [`@mentingo/voice`](apps/voice) | `apps/voice` | Voice mentor: Silero VAD capture, PCM playback, turn state, session UI |

## Commands

```bash
pnpm install
pnpm build      # turbo run build
pnpm test       # turbo run test
pnpm typecheck  # turbo run typecheck
pnpm format     # prettier
```

## Publishing

Packages are published publicly to npm under the `@mentingo` scope:

```bash
pnpm build
cd apps/voice && pnpm publish --access public
```

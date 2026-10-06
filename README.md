# mentingo-ui

Reusable UI building blocks extracted from [Mentingo](https://github.com/Selleo/mentingo) and
published to npm under the `@mentingo` scope. Each package is versioned and released independently
and never talks to an API on its own; the consuming application provides the transport.

## Packages

| Package                         | Path         | Description                                                                      |
| ------------------------------- | ------------ | -------------------------------------------------------------------------------- |
| [`@mentingo/voice`](apps/voice) | `apps/voice` | Voice mentor: microphone capture with Silero VAD, mentor playback and session UI |

Every publishable package lives in `apps/`. `packages/` holds internal tooling that is never
published, currently `@mentingo/typescript-config` with the `base` and `react-library` presets.

## Requirements

Node.js 20 or newer and pnpm 10 (the exact version is pinned in `packageManager`).

## Development

```sh
pnpm install
pnpm typecheck
pnpm test
pnpm build
pnpm format
```

Commands run through Turborepo for every package; use `pnpm --filter <package> <command>` to
target one. CI runs `format:check`, `typecheck`, `test` and `build` on every pull request.

## Adding a package

Create `apps/<name>` with a `package.json` that:

- is named `@mentingo/<name>` with `"publishConfig": { "access": "public" }`,
- lists only build output, `README.md` and `LICENSE` in `files`,
- declares entry points in `exports` with types,
- defines `build`, `typecheck` and `test` scripts so Turborepo and CI pick them up,
- runs `typecheck`, `test` and `build` in a `prepack` script,
- pins `devDependencies` to exact versions and uses compatible ranges for runtime `dependencies`,
- keeps React and other singletons in `peerDependencies`.

Extend `@mentingo/typescript-config/react-library.json` (or `base.json` without React), add a
`README.md` following [`apps/voice`](apps/voice/README.md) and add the package to the table above.

## Releasing

Versions are managed with [Changesets](https://github.com/changesets/changesets). Every pull
request that changes a published package adds a changeset with `pnpm changeset`, naming the package,
the bump (`patch`, `minor` or `major`) and a summary for the changelog. Changes that need no release
add one with `pnpm changeset add --empty`. CI fails on pull requests without a changeset.

To release from an up-to-date `main`:

```sh
pnpm version-packages
```

This applies pending changesets, bumps package versions and writes each `CHANGELOG.md`. Update the
versioned install command in the package README, then merge the result through a pull request
titled `chore: release packages`. From `main` after the merge:

```sh
pnpm release
git push origin --tags
```

`pnpm release` publishes every package version that is not on npm yet, running each package's
`prepack` checks, and tags the commit as `@mentingo/<name>@<version>`. The publisher needs
permission for the `@mentingo` npm scope, and published versions cannot be reused.

## Contributing

Branches, commits and pull requests follow the Mentingo
[conventions](https://github.com/Selleo/mentingo/blob/main/CONTRIBUTING.md): branches named
`[initials]_[type]_[module]_[ticket]_[short_description]`, Conventional Commits, and pull request
titles such as `feat: add voice session controls`. Keep code comments for non-obvious constraints
only.

## License

MIT. See [LICENSE](./LICENSE).

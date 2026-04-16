# Pensjonskalkulator Frontend Monorepo

A pnpm monorepo for Pensjonskalkulator frontend applications.

## Structure

```
├── apps/
│   └── intern/          # Internal React app (Vite + TypeScript)
├── packages/
│   └── api/             # Shared API utilities
└── .github/
    ├── actions/         # Reusable GitHub Actions
    └── workflows/       # CI/CD pipelines
```

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm >= 9

### Installation

```bash
pnpm install
```

### Development

```bash
# Start intern app
pnpm dev

# Or explicitly
pnpm dev:intern
```

### Scripts

| Command          | Description               |
| ---------------- | ------------------------- |
| `pnpm dev`       | Start development server  |
| `pnpm build`     | Build all packages        |
| `pnpm lint`      | Run ESLint                |
| `pnpm format`    | Format code with Prettier |
| `pnpm typecheck` | Run TypeScript checks     |
| `pnpm test`      | Run unit tests            |
| `pnpm clean`     | Remove node_modules       |

## Tech Stack

- **Framework:** React 19
- **Build:** Vite
- **Language:** TypeScript
- **Package Manager:** pnpm
- **Linting:** ESLint 9 (flat config)
- **Formatting:** Prettier
- **Testing:** Vitest, Playwright

## Dependency Security

- CI installs dependencies with a frozen lockfile through the shared setup action.
- Dependabot delays npm update pull requests for 7 days after a new release before proposing them.
- Pull requests that change `pnpm-lock.yaml` run an extra lockfile security review job.
- The lockfile review reports added package entries, highlights `preinstall`, `install`, and `postinstall` scripts, and prints `pnpm why` output for newly added package names.
- `CODEOWNERS` for lockfile and workflow files only becomes mandatory protection when GitHub branch protection is configured to require review from code owners.

### Advisory Response

If a package advisory affects the JavaScript ecosystem, use this checklist:

1. Run `pnpm why <package>` to find whether the package is direct or transitive.
2. Confirm the resolved version in `pnpm-lock.yaml`.
3. Check pull request and CI logs to see whether the affected version was installed during the exposure window.
4. Pin or override to a known-safe version, then regenerate the lockfile in a dedicated pull request.
5. If the affected version may have executed on a developer machine or persistent runner, rotate secrets and follow incident-response procedures for that environment.

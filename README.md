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

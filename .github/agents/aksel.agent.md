---
name: aksel-agent
description: Expert on Nav Aksel Design System components, tokens, and patterns as used in this pensjonskalkulator monorepo
tools:
  - execute
  - read
  - edit
  - search
  - web
---

# Aksel Design System Agent

Expert on `@navikt/ds-react` usage in this pensjonskalkulator monorepo.

## Core Principles

1. **Use Aksel components** — Always prefer `@navikt/ds-react` over custom HTML elements
2. **Use DS spacing tokens** — `--a-spacing-*` CSS custom properties, never hardcoded pixels
3. **SCSS modules** — Per-component `.module.scss` files, no utility-class frameworks
4. **Accessibility first** — Proper heading levels, ARIA labels, keyboard navigation
5. **react-intl for all text** — All user-facing strings via `useIntl()` / `<FormattedMessage>`

## SCSS Patterns

Import shared variables in every module:

```scss
@use '../../scss/variables';
```

### Spacing Tokens

```scss
.radiogroup {
	margin-top: var(--a-spacing-6);
	margin-bottom: var(--a-spacing-2);
}
```

### Responsive Breakpoints

Mobile-first using `variables.$a-breakpoint-*` (`xs`, `sm`, `sm-down`, `md`, `lg`, `lg-down`, `xl`, `2xl`):

```scss
.wrapper {
	flex-direction: column;
	@media (min-width: variables.$a-breakpoint-md) {
		flex-direction: row;
	}
}
```

### CSS Modules Composition

Shared layout modules in `apps/ekstern/src/scss/modules/`:

```scss
.wrapper {
	composes: frame from '../../scss/modules/frame.module.scss';
}
.card {
	composes: whitesection from '../../scss/modules/whitesection.module.scss';
}
```

### Overriding Aksel Internals with `:global()`

```scss
.selectSivilstand {
	:global(.navds-select__container) {
		width: variables.$input-width-m;
	}
}
```

## Key Composition Patterns

**Card** — Composes from shared `whitesection`/`innerframe` modules. `CardContent` wraps children with `Heading`, optional ingress, and optional `Button`.

**PageFramework** — Wraps pages with `FrameComponent` (width-capped centered frame), `CheckLoginOnFocus`, and document title management.

## react-intl Integration

All user-facing text uses `react-intl`: `intl.formatMessage({ id: 'key' })` for strings, `<FormattedMessage>` for JSX. Rich text uses `getFormatMessageValues()` which provides `{ br, link, bold, list }`. Aksel's `Provider` (as `AkselProvider`) syncs locale in `LanguageProvider`.

## Component Guidance

See `.github/skills/` for detailed usage guides per component (50+ skill files covering every Aksel component used in this repo, icons, and patterns).

## Boundaries

### ✅ Always

- Use `@navikt/ds-react` components and `--a-spacing-*` tokens
- Use SCSS modules with `composes` from shared frame/whitesection modules
- Follow semantic heading hierarchy with `level` prop
- Use `react-intl` for all user-facing text
- Use `variables.$a-breakpoint-*` for responsive queries

### ⚠️ Ask First

- Creating custom components that overlap with DS
- Overriding DS component styles via `:global()`
- Adding new breakpoint variables

### 🚫 Never

- Hardcoded pixel values for spacing
- Utility class frameworks (Tailwind, etc.) or inline styles for layout
- Skip accessibility attributes on interactive elements
- Hardcode user-facing strings (must use react-intl)

## Resources

- Aksel documentation: https://aksel.nav.no
- Component examples: https://aksel.nav.no/komponenter
- Icon library: `@navikt/aksel-icons`

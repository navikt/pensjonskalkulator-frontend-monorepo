# Provider — `@navikt/ds-react`

Provider is an app-level configuration component that supplies global context to the Aksel Design System component tree. It controls portal root elements and locale/translation settings for all child components.

## Import

```tsx
import { Provider } from '@navikt/ds-react'
```

Available locales are imported separately:

```tsx
import { en, nb, nn } from '@navikt/ds-react/locales'
```

## Props

| Prop           | Type                                           | Default | Description                                                                                         |
| -------------- | ---------------------------------------------- | ------- | --------------------------------------------------------------------------------------------------- |
| `children`     | `ReactNode`                                    | —       | Application tree to wrap                                                                            |
| `rootElement`  | `HTMLElement`                                  | —       | Global root element for portals. Used by Tooltip, Modal, and ActionMenu                             |
| `locale`       | `Translations`                                 | `nb`    | Aksel locale object (`nb`, `nn`, or `en` from `@navikt/ds-react/locales`)                           |
| `translations` | `PartialTranslations \| PartialTranslations[]` | —       | Override specific default translations. Must be used together with `locale`. Single object or array |

> **Note:** `locale` and `translations` are paired — you cannot provide `translations` without also providing `locale`.

## Usage Examples

### Basic — portal root override

```tsx
import { Provider } from '@navikt/ds-react'

const rootElement = document.getElementById('custom-root')!

function App() {
	return (
		<Provider rootElement={rootElement}>
			<MyApplication />
		</Provider>
	)
}
```

### With locale (Nynorsk)

```tsx
import { Provider } from '@navikt/ds-react'
import { nn } from '@navikt/ds-react/locales'

function App() {
	return (
		<Provider locale={nn}>
			<MyApplication />
		</Provider>
	)
}
```

### With locale and translation overrides

```tsx
import { Provider } from '@navikt/ds-react'
import { nn } from '@navikt/ds-react/locales'

function App() {
	return (
		<Provider locale={nn} translations={{ Combobox: { addOption: 'Opprett' } }}>
			<MyApplication />
		</Provider>
	)
}
```

### Full setup with rootElement and locale

```tsx
import { Provider } from '@navikt/ds-react'
import { en } from '@navikt/ds-react/locales'

const rootElement = document.getElementById('app-root')!

function App() {
	return (
		<Provider rootElement={rootElement} locale={en}>
			<MyApplication />
		</Provider>
	)
}
```

## Accessibility

- Provider itself does not render any DOM elements — it only supplies React context.
- Setting `locale` ensures all component-internal labels, aria-labels, and screen reader text are properly translated.
- When using portals (Tooltip, Modal, ActionMenu), set `rootElement` to ensure portaled content remains within the correct DOM subtree for assistive technology, especially in shadow DOM or micro-frontend setups.

## Do's and Don'ts

### ✅ Do

- Wrap the entire application tree in a single `Provider` at the root level.
- Set `rootElement` when using shadow DOM, micro-frontends, or custom portal roots.
- Use the `locale` prop to match your application's language setting.
- Use `translations` for minor text overrides (e.g., a Combobox "add" label) rather than forking components.
- Import locale objects from `@navikt/ds-react/locales` — do not construct them manually.

### 🚫 Don't

- Don't nest multiple `Provider` instances unless intentionally overriding context for a subtree.
- Don't provide `translations` without also providing `locale`.
- Don't construct locale objects by hand — always import `nb`, `nn`, or `en` from `@navikt/ds-react/locales`.
- Don't use Provider to solve component-level translation needs — individual components also accept a `translations` prop for local overrides.

## Common Patterns in This Codebase

This codebase does **not** currently use `Provider` from `@navikt/ds-react`. The application uses its own `LanguageProvider` context (from `@/context/LanguageProvider`) for i18n and `react-intl` for message formatting. If you need to configure Aksel DS component portals or translations globally, wrap the app root with `Provider`:

```tsx
import { Provider as ReduxProvider } from 'react-redux'

import { Provider } from '@navikt/ds-react'
import { nb } from '@navikt/ds-react/locales'

import { LanguageProvider } from '@/context/LanguageProvider'

createRoot(document.getElementById('root')!).render(
	<Provider locale={nb}>
		<ReduxProvider store={store}>
			<LanguageProvider>
				<RouterProvider router={router} />
			</LanguageProvider>
		</ReduxProvider>
	</Provider>
)
```

> **Tip:** When combining with Redux `Provider`, use a named import alias to avoid confusion: `import { Provider as ReduxProvider } from 'react-redux'`.

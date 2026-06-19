# InternalHeader Component Skill

Application header for internal NAV systems from the Aksel Design System (`@navikt/ds-react`).

InternalHeader provides a standardized dark-themed header bar for internal-facing applications. It collects navigation, application title, and user information in a consistent layout. The component is always rendered in "dark" mode regardless of the surrounding theme.

**Source:** [aksel.nav.no/komponenter/core/i-header](https://aksel.nav.no/komponenter/core/i-header)

## Import

```tsx
import { InternalHeader, Spacer } from '@navikt/ds-react'
```

## Sub-components

| Sub-component               | Purpose                                                                                                                                   |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `InternalHeader`            | Root `<header>` wrapper. Always renders in dark theme.                                                                                    |
| `InternalHeader.Title`      | Application name. Renders as `<a>` by default (supports `as` prop for polymorphism).                                                      |
| `InternalHeader.Button`     | Generic icon/action button in the header (supports `as` prop).                                                                            |
| `InternalHeader.User`       | Static display of user name and optional description.                                                                                     |
| `InternalHeader.UserButton` | Interactive user button with name, optional description, and a chevron-down icon. Designed as an ActionMenu trigger (supports `as` prop). |

## Props Reference

### InternalHeader (Root)

| Prop         | Type               | Default      | Description                                  |
| ------------ | ------------------ | ------------ | -------------------------------------------- |
| `children`   | `ReactNode`        | **required** | Header content (Title, User, buttons, etc.). |
| `className?` | `string`           | —            | Additional CSS class names.                  |
| `ref?`       | `Ref<HTMLElement>` | —            | Ref to the root `<header>` element.          |

### InternalHeader.Title

| Prop         | Type                     | Default      | Description                                                      |
| ------------ | ------------------------ | ------------ | ---------------------------------------------------------------- |
| `children`   | `ReactNode`              | **required** | Application title text.                                          |
| `as?`        | `React.ElementType`      | `"a"`        | Render as a different element (e.g. `"h1"` for non-link titles). |
| `href?`      | `string`                 | —            | Link destination when rendered as an anchor.                     |
| `className?` | `string`                 | —            | Additional CSS class names.                                      |
| `ref?`       | `Ref<HTMLAnchorElement>` | —            | Ref to the element.                                              |

### InternalHeader.Button

| Prop         | Type                     | Default      | Description                         |
| ------------ | ------------------------ | ------------ | ----------------------------------- |
| `children`   | `ReactNode`              | **required** | Button content (typically an icon). |
| `as?`        | `React.ElementType`      | `"button"`   | Render as a different element.      |
| `className?` | `string`                 | —            | Additional CSS class names.         |
| `ref?`       | `Ref<HTMLButtonElement>` | —            | Ref to the element.                 |

### InternalHeader.User

| Prop           | Type                  | Default      | Description                               |
| -------------- | --------------------- | ------------ | ----------------------------------------- |
| `name`         | `ReactNode`           | **required** | User's display name.                      |
| `description?` | `ReactNode`           | —            | Secondary text (e.g. ident number, unit). |
| `className?`   | `string`              | —            | Additional CSS class names.               |
| `ref?`         | `Ref<HTMLDivElement>` | —            | Ref to the element.                       |

### InternalHeader.UserButton

| Prop           | Type                     | Default      | Description                               |
| -------------- | ------------------------ | ------------ | ----------------------------------------- |
| `name`         | `string`                 | **required** | User's display name.                      |
| `description?` | `string`                 | —            | Secondary text (e.g. ident number, unit). |
| `as?`          | `React.ElementType`      | —            | Render as a different element.            |
| `className?`   | `string`                 | —            | Additional CSS class names.               |
| `ref?`         | `Ref<HTMLButtonElement>` | —            | Ref to the element.                       |

## Usage Examples

### Basic Header with Title as Link

```tsx
<InternalHeader>
	<InternalHeader.Title href="/">Sykepenger</InternalHeader.Title>
	<Spacer />
	<InternalHeader.User name="Ola Normann" />
</InternalHeader>
```

### Title as Heading (Non-link)

```tsx
<InternalHeader>
	<InternalHeader.Title as="h1">Sykepenger</InternalHeader.Title>
</InternalHeader>
```

### User with Description

```tsx
<InternalHeader>
	<InternalHeader.Title href="/">Sykepenger</InternalHeader.Title>
	<Spacer />
	<InternalHeader.User name="Ola Normann" description="id: 123456" />
</InternalHeader>
```

### UserButton with ActionMenu (User Dropdown)

```tsx
import { CogIcon, LeaveIcon } from '@navikt/aksel-icons'
import {
	ActionMenu,
	BodyShort,
	Detail,
	InternalHeader,
	Spacer,
} from '@navikt/ds-react'

;<InternalHeader>
	<InternalHeader.Title as="h1">Sykepenger</InternalHeader.Title>
	<Spacer />
	<ActionMenu>
		<ActionMenu.Trigger>
			<InternalHeader.UserButton name="Ola N." description="Enhet: Skien" />
		</ActionMenu.Trigger>
		<ActionMenu.Content align="end">
			<ActionMenu.Label>
				<dl style={{ margin: '0' }}>
					<BodyShort as="dt" size="small">
						Ola Normann
					</BodyShort>
					<Detail as="dd">D123456</Detail>
				</dl>
			</ActionMenu.Label>
			<ActionMenu.Divider />
			<ActionMenu.Group aria-label="Handlinger">
				<ActionMenu.Item
					as="a"
					href="/settings"
					icon={<CogIcon aria-hidden fontSize="1.5rem" />}
				>
					Innstillinger
				</ActionMenu.Item>
				<ActionMenu.Item
					onClick={() => console.log('logg ut')}
					icon={<LeaveIcon aria-hidden fontSize="1.5rem" />}
				>
					Logg ut
				</ActionMenu.Item>
			</ActionMenu.Group>
		</ActionMenu.Content>
	</ActionMenu>
</InternalHeader>
```

### App Switcher (System Menu)

```tsx
import { ExternalLinkIcon, MenuGridIcon } from '@navikt/aksel-icons'
import { ActionMenu, InternalHeader } from '@navikt/ds-react'

;<InternalHeader>
	<InternalHeader.Title href="/">Sykepenger</InternalHeader.Title>
	<ActionMenu>
		<ActionMenu.Trigger>
			<InternalHeader.Button style={{ marginLeft: 'auto' }}>
				<MenuGridIcon
					style={{ fontSize: '1.5rem' }}
					title="Systemer og oppslagsverk"
				/>
			</InternalHeader.Button>
		</ActionMenu.Trigger>
		<ActionMenu.Content>
			<ActionMenu.Group aria-label="Systemer og oppslagsverk">
				<ActionMenu.Item
					icon={<ExternalLinkIcon aria-hidden fontSize="0.875rem" />}
				>
					A.Inntekt
				</ActionMenu.Item>
				<ActionMenu.Item
					icon={<ExternalLinkIcon aria-hidden fontSize="0.875rem" />}
				>
					Gosys
				</ActionMenu.Item>
			</ActionMenu.Group>
		</ActionMenu.Content>
	</ActionMenu>
	<InternalHeader.User name="Ola Normann" description="id: 123456" />
</InternalHeader>
```

### Full Header with App Switcher and User Menu

```tsx
import {
	ChevronDownIcon,
	ExternalLinkIcon,
	LeaveIcon,
	MenuGridIcon,
} from '@navikt/aksel-icons'
import {
	ActionMenu,
	BodyShort,
	Detail,
	InternalHeader,
	Spacer,
} from '@navikt/ds-react'

;<InternalHeader>
	<InternalHeader.Title href="/">Sykepenger</InternalHeader.Title>

	{/* App switcher */}
	<ActionMenu>
		<ActionMenu.Trigger>
			<InternalHeader.Button style={{ marginLeft: 'auto' }}>
				<MenuGridIcon
					style={{ fontSize: '1.5rem' }}
					title="Systemer og oppslagsverk"
				/>
			</InternalHeader.Button>
		</ActionMenu.Trigger>
		<ActionMenu.Content align="end">
			<ActionMenu.Group aria-label="Systemer og oppslagsverk">
				<ActionMenu.Item
					icon={<ExternalLinkIcon aria-hidden fontSize="0.875rem" />}
				>
					A.Inntekt
				</ActionMenu.Item>
				<ActionMenu.Item
					icon={<ExternalLinkIcon aria-hidden fontSize="0.875rem" />}
				>
					Aa-registeret
				</ActionMenu.Item>
			</ActionMenu.Group>
		</ActionMenu.Content>
	</ActionMenu>

	{/* User menu */}
	<ActionMenu>
		<ActionMenu.Trigger>
			<InternalHeader.UserButton name="Ola N." description="Enhet: Skien" />
		</ActionMenu.Trigger>
		<ActionMenu.Content align="end">
			<ActionMenu.Label>
				<dl style={{ margin: '0' }}>
					<BodyShort as="dt" size="small">
						Ola Normann
					</BodyShort>
					<Detail as="dd">D123456</Detail>
				</dl>
			</ActionMenu.Label>
			<ActionMenu.Divider />
			<ActionMenu.Group aria-label="Handlinger">
				<ActionMenu.Item
					onClick={() => console.log('logg ut')}
					icon={<LeaveIcon aria-hidden fontSize="1.5rem" />}
				>
					Logg ut
				</ActionMenu.Item>
			</ActionMenu.Group>
		</ActionMenu.Content>
	</ActionMenu>
</InternalHeader>
```

## Accessibility

- InternalHeader renders a semantic `<header>` element, providing a landmark for screen readers.
- The component is always forced into dark theme — ensure sufficient contrast when placing custom content inside.
- `InternalHeader.Title` defaults to an `<a>` element; use `as="h1"` when the title is not a navigation link.
- Icons used in `InternalHeader.Button` must have an accessible `title` prop (for standalone icon buttons) or `aria-hidden` (when there is visible text).
- App switcher links that open in a new tab should indicate this to screen readers (e.g. include "opens in new tab" in icon title or use `ExternalLinkIcon`).
- `ActionMenu` patterns inside the header follow standard WAI-ARIA menu button patterns with full keyboard support.
- Use `Spacer` to push items to the right side of the header rather than custom margin hacks.

## Do's and Don'ts

### ✅ Do

- Use `InternalHeader` only on **internal** NAV applications (not public-facing pages).
- Always include an `InternalHeader.Title` with the application name.
- Use `Spacer` (from `@navikt/ds-react`) to push user/action elements to the right.
- Use `InternalHeader.UserButton` with `ActionMenu` when the user area needs to be interactive (dropdown with logout, settings, etc.).
- Use `InternalHeader.User` for static (non-interactive) display of the logged-in user.
- Use `InternalHeader.Button` with `MenuGridIcon` for app switcher menus.
- Provide accessible labels on icon-only buttons via the icon's `title` prop.
- Use `as="h1"` on `InternalHeader.Title` when the title should be a heading, not a link.

### 🚫 Don't

- Don't use `InternalHeader` on external/public-facing pages — use the standard NAV header instead.
- Don't place heavy/complex navigation inside the header — it is meant for simple actions and links.
- Don't use `InternalHeader.User` as a button or link — use `InternalHeader.UserButton` for interactive user menus.
- Don't forget to import `@navikt/ds-css` — InternalHeader relies on Aksel CSS for all styling.
- Don't override the dark theme — InternalHeader is designed to always appear in dark mode.
- Don't use inline styles for layout/spacing; use `Spacer` and standard Aksel patterns.
- Don't nest multiple headers — use one `InternalHeader` per page at the top level.

## Common Patterns in This Codebase

### With react-intl Translations

```tsx
const intl = useIntl()

<InternalHeader>
  <InternalHeader.Title as="h1">
    {intl.formatMessage({ id: "application.title" })}
  </InternalHeader.Title>
  <Spacer />
  <InternalHeader.User name={userName} />
</InternalHeader>
```

### With React Router Link

```tsx
import { Link } from 'react-router-dom'

;<InternalHeader>
	<InternalHeader.Title as={Link} to="/">
		{intl.formatMessage({ id: 'application.title' })}
	</InternalHeader.Title>
	<Spacer />
	<InternalHeader.User name={userName} />
</InternalHeader>
```

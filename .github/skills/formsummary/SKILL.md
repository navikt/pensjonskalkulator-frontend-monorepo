# FormSummary — `@navikt/ds-react`

Displays a summary of a completed form so users can review their answers before submission. Designed for multi-step forms, typically on a summary/review page.

## Import

```tsx
import { FormSummary } from '@navikt/ds-react'
```

## Sub-components

| Component              | Element       | Description                                             |
| ---------------------- | ------------- | ------------------------------------------------------- |
| `FormSummary`          | `<div>`       | Root wrapper for the entire form summary                |
| `FormSummary.Header`   | `<div>`       | Header section — must contain `FormSummary.Heading`     |
| `FormSummary.Heading`  | `<h2>`–`<h6>` | Heading for the summary section                         |
| `FormSummary.Answers`  | `<dl>`        | Container for one or more `FormSummary.Answer` items    |
| `FormSummary.Answer`   | `<div>`       | A single question–answer pair                           |
| `FormSummary.Label`    | `<dt>`        | The label/question (renders as description term)        |
| `FormSummary.Value`    | `<dd>`        | The answer/value (renders as description details)       |
| `FormSummary.Footer`   | `<div>`       | Footer section — typically wraps `FormSummary.EditLink` |
| `FormSummary.EditLink` | `<a>`         | Link to edit the answers for this section               |

## Props

### FormSummary

| Prop        | Type                  | Default | Description                                               |
| ----------- | --------------------- | ------- | --------------------------------------------------------- |
| `children`  | `ReactNode`           | —       | Must include `Header`, `Answers`, and optionally `Footer` |
| `className` | `string`              | —       | Additional CSS class                                      |
| `ref`       | `Ref<HTMLDivElement>` | —       | Ref to root element                                       |

### FormSummary.Header

| Prop        | Type                  | Default | Description                        |
| ----------- | --------------------- | ------- | ---------------------------------- |
| `children`  | `ReactNode`           | —       | Must include `FormSummary.Heading` |
| `className` | `string`              | —       | Additional CSS class               |
| `ref`       | `Ref<HTMLDivElement>` | —       | Ref to root element                |

### FormSummary.Heading

| Prop        | Type                              | Default | Description            |
| ----------- | --------------------------------- | ------- | ---------------------- |
| `children`  | `ReactNode`                       | —       | Heading text           |
| `level`     | `"2" \| "3" \| "4" \| "5" \| "6"` | —       | The heading level      |
| `className` | `string`                          | —       | Additional CSS class   |
| `ref`       | `Ref<HTMLHeadingElement>`         | —       | Ref to heading element |

### FormSummary.Answers

| Prop        | Type                    | Default | Description                                |
| ----------- | ----------------------- | ------- | ------------------------------------------ |
| `children`  | `ReactNode`             | —       | One or more `FormSummary.Answer` instances |
| `className` | `string`                | —       | Additional CSS class                       |
| `ref`       | `Ref<HTMLDListElement>` | —       | Ref to root `<dl>` element                 |

### FormSummary.Answer

| Prop        | Type                  | Default | Description                                   |
| ----------- | --------------------- | ------- | --------------------------------------------- |
| `children`  | `ReactNode`           | —       | Must include `Label` and one or more `Value`s |
| `className` | `string`              | —       | Additional CSS class                          |
| `ref`       | `Ref<HTMLDivElement>` | —       | Ref to root element                           |

### FormSummary.Label

| Prop        | Type               | Default | Description          |
| ----------- | ------------------ | ------- | -------------------- |
| `children`  | `ReactNode`        | —       | Label text           |
| `className` | `string`           | —       | Additional CSS class |
| `ref`       | `Ref<HTMLElement>` | —       | Ref to root element  |

### FormSummary.Value

| Prop        | Type                  | Default | Description                                       |
| ----------- | --------------------- | ------- | ------------------------------------------------- |
| `children`  | `ReactNode`           | —       | Answer text, JSX, or nested `FormSummary.Answers` |
| `className` | `string`              | —       | Additional CSS class                              |
| `ref`       | `Ref<HTMLDivElement>` | —       | Ref to root element                               |

### FormSummary.Footer

| Prop        | Type                  | Default | Description                      |
| ----------- | --------------------- | ------- | -------------------------------- |
| `children`  | `ReactNode`           | —       | Typically `FormSummary.EditLink` |
| `className` | `string`              | —       | Additional CSS class             |
| `ref`       | `Ref<HTMLDivElement>` | —       | Ref to root element              |

### FormSummary.EditLink

| Prop        | Type                     | Default        | Description                                        |
| ----------- | ------------------------ | -------------- | -------------------------------------------------- |
| `href`      | `string`                 | —              | URL to the form step where answers can be edited   |
| `children`  | `ReactNode`              | `"Endre svar"` | Link text (defaults to Norwegian "Change answers") |
| `as`        | `React.ElementType`      | —              | Override rendered element (e.g. React Router Link) |
| `className` | `string`                 | —              | Additional CSS class                               |
| `ref`       | `Ref<HTMLAnchorElement>` | —              | Ref to anchor element                              |

## Usage Examples

### Basic summary

```tsx
<FormSummary>
	<FormSummary.Header>
		<FormSummary.Heading level="2">Personalia</FormSummary.Heading>
	</FormSummary.Header>
	<FormSummary.Answers>
		<FormSummary.Answer>
			<FormSummary.Label>Navn</FormSummary.Label>
			<FormSummary.Value>Ola Nordmann</FormSummary.Value>
		</FormSummary.Answer>
		<FormSummary.Answer>
			<FormSummary.Label>Fødselsnummer</FormSummary.Label>
			<FormSummary.Value>123456 78910</FormSummary.Value>
		</FormSummary.Answer>
	</FormSummary.Answers>
</FormSummary>
```

### With edit link

```tsx
<FormSummary>
	<FormSummary.Header>
		<FormSummary.Heading level="2">Inntekt</FormSummary.Heading>
	</FormSummary.Header>
	<FormSummary.Answers>
		<FormSummary.Answer>
			<FormSummary.Label>Årsinntekt</FormSummary.Label>
			<FormSummary.Value>550 000 kr</FormSummary.Value>
		</FormSummary.Answer>
	</FormSummary.Answers>
	<FormSummary.Footer>
		<FormSummary.EditLink href="/steg/inntekt" />
	</FormSummary.Footer>
</FormSummary>
```

### Multiple answers for one question

```tsx
<FormSummary.Answer>
	<FormSummary.Label>Hvordan vil du bli varslet?</FormSummary.Label>
	<FormSummary.Value>E-post</FormSummary.Value>
	<FormSummary.Value>SMS</FormSummary.Value>
</FormSummary.Answer>
```

### Nested/grouped answers

Use nested `FormSummary.Answers` inside a `FormSummary.Value` for hierarchical data (e.g. user-added entries like children or employers):

```tsx
<FormSummary.Answer>
	<FormSummary.Label>Barn nr. 1</FormSummary.Label>
	<FormSummary.Value>
		<FormSummary.Answers>
			<FormSummary.Answer>
				<FormSummary.Label>Navn</FormSummary.Label>
				<FormSummary.Value>Kari Nordmann</FormSummary.Value>
			</FormSummary.Answer>
			<FormSummary.Answer>
				<FormSummary.Label>Kjønn</FormSummary.Label>
				<FormSummary.Value>Jente</FormSummary.Value>
			</FormSummary.Answer>
		</FormSummary.Answers>
	</FormSummary.Value>
</FormSummary.Answer>
```

### With custom EditLink element (e.g. React Router)

```tsx
import { Link } from 'react-router-dom'

;<FormSummary.Footer>
	<FormSummary.EditLink as={Link} to="/steg/personalia">
		Endre svar
	</FormSummary.EditLink>
</FormSummary.Footer>
```

### Multiple sections on a summary page

```tsx
<div>
	<FormSummary>
		<FormSummary.Header>
			<FormSummary.Heading level="2">Personalia</FormSummary.Heading>
		</FormSummary.Header>
		<FormSummary.Answers>
			<FormSummary.Answer>
				<FormSummary.Label>Navn</FormSummary.Label>
				<FormSummary.Value>Ola Nordmann</FormSummary.Value>
			</FormSummary.Answer>
		</FormSummary.Answers>
		<FormSummary.Footer>
			<FormSummary.EditLink href="/steg/personalia" />
		</FormSummary.Footer>
	</FormSummary>

	<FormSummary>
		<FormSummary.Header>
			<FormSummary.Heading level="2">Inntekt</FormSummary.Heading>
		</FormSummary.Header>
		<FormSummary.Answers>
			<FormSummary.Answer>
				<FormSummary.Label>Årsinntekt</FormSummary.Label>
				<FormSummary.Value>550 000 kr</FormSummary.Value>
			</FormSummary.Answer>
		</FormSummary.Answers>
		<FormSummary.Footer>
			<FormSummary.EditLink href="/steg/inntekt" />
		</FormSummary.Footer>
	</FormSummary>
</div>
```

## Accessibility

- Renders as a `<dl>` (description list) which provides semantic meaning for label–value pairs. Screen readers announce labels and values as associated terms and definitions.
- `FormSummary.Heading` renders the correct heading element (`<h2>`–`<h6>`) based on the `level` prop — always set this to match your page's heading hierarchy.
- `FormSummary.EditLink` renders as an `<a>` element, so it is keyboard-focusable and announced as a link.
- The default link text `"Endre svar"` is in Norwegian. Override `children` if you need a different language or more descriptive link text.

## Do's and Don'ts

### ✅ Do

- Use FormSummary on a dedicated review/summary page in multi-step forms.
- Match `FormSummary.Label` text to the original form field labels for consistency.
- Use multiple `FormSummary.Value` elements for questions with multiple answers.
- Place `FormSummary.EditLink` inside `FormSummary.Footer` (not in `Header`).
- Use nested `FormSummary.Answers` inside `FormSummary.Value` for grouped/repeated data.
- Use punctuation after each value when answers can be long, so boundaries are clear.
- Set the correct `level` on `FormSummary.Heading` to maintain heading hierarchy.

### 🚫 Don't

- Don't use FormSummary for inline editing of form fields.
- Don't use bullet lists (`<ul>`) for listing multiple answers — use multiple `FormSummary.Value` elements or plain unmarked lists instead.
- Don't place `FormSummary.EditLink` in the `Header` — it belongs in `FormSummary.Footer`.
- Don't omit `FormSummary.Header` or `FormSummary.Answers` — both are required children.
- Don't use FormSummary for displaying read-only data outside of a form context — use a regular description list or `BodyLong` instead.

## See Also

- [Oppsummeringsside for søknadsdialoger](https://aksel.nav.no/monster-maler/soknadsdialog/oppsummeringsside-for-soknadsdialoger) — summary page template
- [FormProgress](https://aksel.nav.no/komponenter/core/formprogress) — step indicator for multi-step forms
- [GuidePanel](https://aksel.nav.no/komponenter/core/guidepanel) — contextual guidance panel

# Process — `@navikt/ds-react`

Process displays a vertical list of events or steps in a workflow. Each event can contain rich content such as information, actions, links, or status indicators. Use it when progress is not user-controlled (e.g., showing the status of a case).

## Import

```tsx
import { Process } from '@navikt/ds-react'
```

## Sub-components

| Component       | Element | Description                           |
| --------------- | ------- | ------------------------------------- |
| `Process`       | `<ol>`  | Root ordered list wrapping all events |
| `Process.Event` | `<li>`  | Individual event/step in the process  |

## Props

### `Process`

| Prop             | Type                                | Default | Description                                                                                      |
| ---------------- | ----------------------------------- | ------- | ------------------------------------------------------------------------------------------------ |
| `children`       | `ReactElement<ProcessEventProps>[]` | —       | `<Process.Event />` elements                                                                     |
| `hideStatusText` | `boolean`                           | `false` | Hides the "aktiv" label text when an event has `status="active"`                                 |
| `isTruncated`    | `"start" \| "end" \| "both"`        | —       | Shows visual connectors indicating more events exist before, after, or on both sides of the list |
| `className`      | `string`                            | —       | Additional CSS class                                                                             |
| `ref`            | `Ref<HTMLOListElement>`             | —       | Ref to the root `<ol>` element                                                                   |

### `Process.Event`

| Prop          | Type                                       | Default         | Description                                           |
| ------------- | ------------------------------------------ | --------------- | ----------------------------------------------------- |
| `title`       | `string`                                   | —               | Event title                                           |
| `timestamp`   | `string`                                   | —               | Timestamp or date to display for the event            |
| `status`      | `"active" \| "completed" \| "uncompleted"` | `"uncompleted"` | Current event status                                  |
| `bullet`      | `ReactNode`                                | —               | Icon or number to display inside the bullet indicator |
| `children`    | `ReactNode`                                | —               | Rich content displayed under the title and timestamp  |
| `hideContent` | `boolean`                                  | —               | Hides the content section of the event                |
| `className`   | `string`                                   | —               | Additional CSS class                                  |
| `ref`         | `Ref<HTMLLIElement>`                       | —               | Ref to the `<li>` element                             |

## Usage Examples

### Basic process

```tsx
<Process>
	<Process.Event
		title="Søknad mottatt"
		status="completed"
		timestamp="01.01.2025"
	>
		Vi har mottatt søknaden din.
	</Process.Event>
	<Process.Event
		title="Under behandling"
		status="active"
		timestamp="15.01.2025"
	>
		Saken din er under behandling.
	</Process.Event>
	<Process.Event title="Vedtak" status="uncompleted">
		Du vil motta vedtaket når saken er ferdig behandlet.
	</Process.Event>
</Process>
```

### With custom bullet icons

```tsx
import { CheckmarkIcon, HourglassIcon } from '@navikt/aksel-icons'

;<Process>
	<Process.Event
		title="Søknad sendt"
		status="completed"
		timestamp="01.03.2025"
		bullet={<CheckmarkIcon aria-hidden />}
	>
		Søknaden er registrert.
	</Process.Event>
	<Process.Event
		title="Venter på dokumentasjon"
		status="active"
		bullet={<HourglassIcon aria-hidden />}
	>
		Vi trenger mer informasjon fra deg.
	</Process.Event>
</Process>
```

### Truncated process (partial view)

```tsx
<Process isTruncated="both">
	<Process.Event title="Steg 3" status="completed" timestamp="10.02.2025">
		Fullført.
	</Process.Event>
	<Process.Event title="Steg 4" status="active" timestamp="20.02.2025">
		Pågår nå.
	</Process.Event>
	<Process.Event title="Steg 5" status="uncompleted">
		Neste steg.
	</Process.Event>
</Process>
```

### Hidden status text

```tsx
<Process hideStatusText>
	<Process.Event title="Registrert" status="completed" timestamp="01.01.2025" />
	<Process.Event title="Behandles" status="active" timestamp="05.01.2025" />
</Process>
```

### Event with hidden content

```tsx
<Process>
	<Process.Event title="Steg 1" status="completed" hideContent />
	<Process.Event title="Steg 2" status="active">
		Bare dette steget viser innhold.
	</Process.Event>
</Process>
```

## Accessibility

- Process renders as an `<ol>` element with `aria-controls` set to the ID of the active event.
- This allows JAWS screen reader users to jump between events using the shortcut `Alt + Jaws + M` (Jaws key is Insert or CapsLock depending on keyboard layout).
- Each event is an `<li>`, maintaining proper list semantics for assistive technologies.
- Use descriptive `title` and `timestamp` values so screen readers convey meaningful step information.

## Do's and Don'ts

### ✅ Do

- Use Process to show the progression of a case or workflow where the user cannot control the steps.
- Provide a `title` for every `Process.Event` so the purpose of each step is clear.
- Use `timestamp` to give temporal context to each event.
- Use `isTruncated` when only showing a subset of a longer process.
- Place rich interactive content (links, buttons) inside `Process.Event` children when needed.
- Use `status` to clearly indicate which steps are completed, active, or upcoming.

### 🚫 Don't

- Don't use Process for navigable wizards or multi-step forms — use `Stepper` or `FormProgress` instead.
- Don't use Process when the user can control the progression between steps.
- Don't omit `status` — it is essential for visual and semantic clarity.
- Don't put overly complex layouts inside a single event — keep content focused and concise.
- Don't confuse Process with Timeline — Process is for ordered status progression, not chronological event display.

## Common Patterns

### Case status tracking

Use Process to show the current state of a user's application or case:

```tsx
<Process>
	<Process.Event
		title="Søknad mottatt"
		status="completed"
		timestamp="01.01.2025"
	>
		<BodyLong>Søknaden din er registrert i systemet.</BodyLong>
	</Process.Event>
	<Process.Event
		title="Dokumenter bekreftet"
		status="completed"
		timestamp="10.01.2025"
	>
		<BodyLong>Alle nødvendige dokumenter er mottatt.</BodyLong>
	</Process.Event>
	<Process.Event title="Under vurdering" status="active" timestamp="15.01.2025">
		<BodyLong>En saksbehandler vurderer søknaden din.</BodyLong>
	</Process.Event>
	<Process.Event title="Vedtak" status="uncompleted">
		<BodyLong>Du vil motta vedtaket når behandlingen er ferdig.</BodyLong>
	</Process.Event>
</Process>
```

### Paginated process with truncation

When showing only a portion of a long process, use `isTruncated` to indicate hidden events:

```tsx
<Process isTruncated="start">
	<Process.Event title="Nåværende steg" status="active" timestamp="20.03.2025">
		Behandling pågår.
	</Process.Event>
	<Process.Event title="Neste steg" status="uncompleted">
		Venter på forrige steg.
	</Process.Event>
</Process>
```

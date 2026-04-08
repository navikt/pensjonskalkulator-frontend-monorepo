# Timeline — `@navikt/ds-react`

Timeline displays a horizontal visualization of time-based events across multiple rows. Designed for internal (NAV "interne flater") desktop applications to show periods, markers, and date ranges. Not suited for small screens.

## Import

```tsx
import { Timeline } from '@navikt/ds-react'
```

## Sub-components

| Component              | Element            | Description                                          |
| ---------------------- | ------------------ | ---------------------------------------------------- |
| `Timeline`             | `<div>`            | Root wrapper providing date context for all children |
| `Timeline.Row`         | `<ol>`             | A labeled row containing periods                     |
| `Timeline.Period`      | `<div>`/`<button>` | A date range block within a row                      |
| `Timeline.Pin`         | `<button>`         | A vertical marker at a specific date                 |
| `Timeline.Zoom`        | `<ul>`             | Container for zoom buttons                           |
| `Timeline.Zoom.Button` | `<button>`         | A button that zooms the timeline to a date range     |

## Props

### `Timeline`

| Prop        | Type                  | Default  | Description                                                                 |
| ----------- | --------------------- | -------- | --------------------------------------------------------------------------- |
| `startDate` | `Date`                | —        | Override start date. Disables built-in zoom; you must control zoom yourself |
| `endDate`   | `Date`                | —        | Override end date. Disables built-in zoom; you must control zoom yourself   |
| `direction` | `"left" \| "right"`   | `"left"` | Sort direction. `"left"` = earliest date on the left                        |
| `children`  | `ReactNode`           | —        | `Timeline.Row`, `Timeline.Pin`, and `Timeline.Zoom` children                |
| `className` | `string`              | —        | Additional CSS class                                                        |
| `ref`       | `Ref<HTMLDivElement>` | —        | Ref to root element                                                         |

### `Timeline.Row`

| Prop         | Type                                   | Default | Description                                            |
| ------------ | -------------------------------------- | ------- | ------------------------------------------------------ |
| `label`      | `string \| ReactNode`                  | —       | Row label. When `string`, uses `icon` and `headingTag` |
| `headingTag` | `"h2" \| "h3" \| "h4" \| "h5" \| "h6"` | `"h3"`  | Heading level for string labels                        |
| `icon`       | `ReactNode`                            | —       | Icon next to label (only when `label` is a string)     |
| `children`   | `ReactNode`                            | —       | `Timeline.Period` children                             |
| `className`  | `string`                               | —       | Additional CSS class                                   |
| `ref`        | `Ref<HTMLOListElement>`                | —       | Ref to root element                                    |

### `Timeline.Period`

| Prop             | Type                                                        | Default     | Description                                            |
| ---------------- | ----------------------------------------------------------- | ----------- | ------------------------------------------------------ |
| `start`          | `Date`                                                      | —           | Period start date (required)                           |
| `end`            | `Date`                                                      | —           | Period end date (required)                             |
| `status`         | `"success" \| "warning" \| "danger" \| "info" \| "neutral"` | `"neutral"` | Visual status color                                    |
| `data-color`     | `AkselColor`                                                | —           | Overrides color set by status                          |
| `icon`           | `ReactNode`                                                 | —           | Icon for visual identification                         |
| `statusLabel`    | `string`                                                    | —           | Accessible label for screen readers (e.g. "Sykemeldt") |
| `onSelectPeriod` | `(event: MouseEvent \| KeyboardEvent) => void`              | —           | Callback on period selection (makes it clickable)      |
| `children`       | `ReactNode`                                                 | —           | Content displayed in Popover on click                  |
| `isActive`       | `boolean`                                                   | —           | Visual active indication. Only one at a time           |
| `placement`      | `"top" \| "bottom"`                                         | `"top"`     | Default orientation of popover                         |
| `className`      | `string`                                                    | —           | Additional CSS class                                   |
| `ref`            | `Ref<HTMLDivElement \| HTMLButtonElement>`                  | —           | Ref to root element                                    |

### `Timeline.Pin`

| Prop       | Type                     | Default | Description               |
| ---------- | ------------------------ | ------- | ------------------------- |
| `date`     | `Date`                   | —       | Date position for the pin |
| `children` | `ReactNode`              | —       | Content in pin popover    |
| `ref`      | `Ref<HTMLButtonElement>` | —       | Ref to button element     |

### `Timeline.Zoom`

| Prop        | Type                    | Default | Description                     |
| ----------- | ----------------------- | ------- | ------------------------------- |
| `children`  | `ReactNode`             | —       | `Timeline.Zoom.Button` children |
| `className` | `string`                | —       | Additional CSS class            |
| `ref`       | `Ref<HTMLUListElement>` | —       | Ref to root element             |

### `Timeline.Zoom.Button`

| Prop       | Type                     | Default | Description                                      |
| ---------- | ------------------------ | ------- | ------------------------------------------------ |
| `label`    | `string`                 | —       | Button label (e.g. "3 mnd", "1 år")              |
| `interval` | `"month" \| "year"`      | —       | Zoom interval unit                               |
| `count`    | `number`                 | —       | Number of interval units (e.g. 3 months, 1 year) |
| `ref`      | `Ref<HTMLButtonElement>` | —       | Ref to button element                            |

## Usage Examples

### Basic

```tsx
<Timeline>
	<Timeline.Row
		label="Sykepenger"
		icon={<CheckmarkCircleFillIcon aria-hidden />}
	>
		<Timeline.Period
			start={new Date('2022-01-01')}
			end={new Date('2022-03-31')}
			status="success"
		/>
	</Timeline.Row>
	<Timeline.Row label="Foreldrepenger">
		<Timeline.Period
			start={new Date('2022-04-01')}
			end={new Date('2022-06-30')}
			status="info"
		/>
	</Timeline.Row>
</Timeline>
```

### With active period selection

```tsx
function TimelineWithSelection() {
	const [activePeriodId, setActivePeriodId] = useState<string | null>(null)

	const periods = [
		{
			id: '1',
			start: new Date('2022-01-01'),
			end: new Date('2022-01-31'),
			status: 'success' as const,
		},
		{
			id: '2',
			start: new Date('2022-02-01'),
			end: new Date('2022-03-15'),
			status: 'danger' as const,
		},
		{
			id: '3',
			start: new Date('2022-05-01'),
			end: new Date('2022-05-25'),
			status: 'warning' as const,
		},
	]

	return (
		<Timeline>
			<Timeline.Row
				label="Rad 1"
				icon={<CheckmarkCircleFillIcon aria-hidden />}
			>
				{periods.map((p) => (
					<Timeline.Period
						key={p.id}
						start={p.start}
						end={p.end}
						status={p.status}
						onSelectPeriod={() => setActivePeriodId(p.id)}
						isActive={activePeriodId === p.id}
						statusLabel="Sykemeldt"
					/>
				))}
			</Timeline.Row>
		</Timeline>
	)
}
```

### With Popover content on periods

```tsx
<Timeline>
	<Timeline.Row label="Utbetalinger">
		<Timeline.Period
			start={new Date('2022-01-01')}
			end={new Date('2022-03-31')}
			status="success"
			icon={<CheckmarkCircleFillIcon aria-hidden />}
			statusLabel="Utbetalt"
			onSelectPeriod={() => console.log('selected')}
		>
			<div>
				<p>Periode: 01.01.2022 - 31.03.2022</p>
				<p>Utbetalt: 45 000 kr</p>
			</div>
		</Timeline.Period>
	</Timeline.Row>
</Timeline>
```

### With pins (date markers)

```tsx
<Timeline>
	<Timeline.Pin date={new Date('2022-04-15')}>Søknadsdato</Timeline.Pin>
	<Timeline.Pin date={new Date('2022-06-12')}>Vedtaksdato</Timeline.Pin>
	<Timeline.Row
		label="Sykepenger"
		icon={<CheckmarkCircleFillIcon aria-hidden />}
	>
		<Timeline.Period
			start={new Date('2022-01-01')}
			end={new Date('2022-08-30')}
			status="success"
		/>
	</Timeline.Row>
</Timeline>
```

### With zoom controls

```tsx
<Timeline>
	<Timeline.Row label="Rad 1" icon={<CheckmarkCircleFillIcon aria-hidden />}>
		<Timeline.Period
			start={new Date('2022-01-01')}
			end={new Date('2022-08-30')}
			status="success"
		/>
	</Timeline.Row>
	<Timeline.Zoom>
		<Timeline.Zoom.Button label="3 mnd" interval="month" count={3} />
		<Timeline.Zoom.Button label="7 mnd" interval="month" count={7} />
		<Timeline.Zoom.Button label="9 mnd" interval="month" count={9} />
		<Timeline.Zoom.Button label="1 år" interval="year" count={1} />
	</Timeline.Zoom>
</Timeline>
```

### With custom row labels

```tsx
import { Button, Link } from '@navikt/ds-react'

;<Timeline>
	<Timeline.Row
		label={
			<Button data-color="neutral" size="small" variant="tertiary">
				Custom label button
			</Button>
		}
	>
		<Timeline.Period
			start={new Date('2022-01-01')}
			end={new Date('2022-03-31')}
			status="success"
		/>
	</Timeline.Row>
	<Timeline.Row label={<Link href="#">Custom label link</Link>}>
		<Timeline.Period
			start={new Date('2022-04-01')}
			end={new Date('2022-06-30')}
			status="info"
		/>
	</Timeline.Row>
</Timeline>
```

### English locale

```tsx
import { Provider } from '@navikt/ds-react'
import en from '@navikt/ds-react/esm/utils/i18n/locales/en'

;<Provider locale={en}>
	<Timeline>
		<Timeline.Row label="Sick leave">
			<Timeline.Period
				start={new Date('2022-01-01')}
				end={new Date('2022-03-31')}
				status="success"
			/>
		</Timeline.Row>
	</Timeline>
</Provider>
```

## Accessibility

- Each `Timeline.Row` generates an `<ol>` with an `aria-label` describing the date range of its periods.
- `Timeline.Pin` renders as a `<button>` with an `aria-label` including the pin's formatted date. When a pin has children, it uses `aria-expanded` to indicate popover state.
- Periods with `onSelectPeriod` or `children` render as `<button>` elements; otherwise they are non-interactive `<div>` elements.
- Use `statusLabel` on `Timeline.Period` to provide screen-reader-friendly descriptions (e.g. "Sykemeldt", "Foreldrepermisjon").
- Arrow keys (`ArrowUp` / `ArrowDown`) navigate between rows when a period is focused.
- Pin and Period popovers open in a dialog with focus management via `FloatingFocusManager`.
- Use `aria-controls` on active periods to connect them to external detail panels.
- The component supports `nb`, `nn`, and `en` locales via the `Provider` component.

## Do's and Don'ts

### ✅ Do

- Use Timeline for **internal desktop applications** that need to display date-range data across multiple categories.
- Always provide `statusLabel` on `Timeline.Period` for screen readers.
- Use semantic `status` values (`success`, `warning`, `danger`, `info`, `neutral`) to convey meaning visually.
- Provide icons on periods and rows for quicker visual scanning.
- Use `Timeline.Pin` to mark important single dates (e.g. application date, decision date).
- Use `Timeline.Zoom` to let users focus on specific time ranges in long timelines.
- Ensure only **one** period has `isActive={true}` at a time.
- Wrap in `<Provider locale={en}>` when the application uses English.

### 🚫 Don't

- Don't use Timeline on **mobile** or responsive layouts — the component is designed for desktop only.
- Don't set `startDate` or `endDate` and expect built-in `Timeline.Zoom` to work — custom dates disable automatic zoom.
- Don't omit `aria-hidden` on decorative icons passed to `icon` props.
- Don't nest interactive elements inside `Timeline.Period` children if the period already has `onSelectPeriod`.
- Don't use Timeline for simple lists of events without date ranges — use a regular list instead.
- Don't create overlapping periods in the same row without clear visual differentiation.

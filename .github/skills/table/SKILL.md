# Table — `@navikt/ds-react`

Table displays data in rows and columns. Use it to organise and present structured information so users can scan, compare, and act on it.

## Import

```tsx
import { Table } from '@navikt/ds-react'
```

## Sub-components

| Component             | Element     | Description                                          |
| --------------------- | ----------- | ---------------------------------------------------- |
| `Table`               | `<table>`   | Root table element. Provides sort context            |
| `Table.Header`        | `<thead>`   | Table header section                                 |
| `Table.Body`          | `<tbody>`   | Table body section                                   |
| `Table.Row`           | `<tr>`      | Standard table row                                   |
| `Table.HeaderCell`    | `<th>`      | Header cell for row/column headings                  |
| `Table.DataCell`      | `<td>`      | Standard data cell                                   |
| `Table.ColumnHeader`  | `<th>`      | Sortable column header with built-in sort indicators |
| `Table.ExpandableRow` | `<tr>` pair | Row with expandable content section                  |

## Props

### `Table`

| Prop           | Type                             | Default    | Description                              |
| -------------- | -------------------------------- | ---------- | ---------------------------------------- |
| `size`         | `"large" \| "medium" \| "small"` | `"medium"` | Padding around cells                     |
| `zebraStripes` | `boolean`                        | `false`    | Alternating row background               |
| `stickyHeader` | `boolean`                        | `false`    | Makes the header sticky on scroll        |
| `sort`         | `SortState`                      | —          | Current sort state                       |
| `onSortChange` | `(sortKey: string) => void`      | —          | Called when a sortable column is clicked |
| `className`    | `string`                         | —          | Additional CSS class                     |
| `ref`          | `Ref<HTMLTableElement>`          | —          | Ref to table element                     |

#### `SortState`

```ts
interface SortState {
	orderBy: string
	direction: 'ascending' | 'descending' | 'none'
}
```

### `Table.Row`

| Prop           | Type                                               | Default | Description                                                                                           |
| -------------- | -------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------- |
| `selected`     | `boolean`                                          | `false` | Highlights the row as selected                                                                        |
| `shadeOnHover` | `boolean`                                          | `true`  | Shade row on hover                                                                                    |
| `onRowClick`   | `(event: MouseEvent<HTMLTableRowElement>) => void` | —       | Click handler (not fired for interactive children). **Not keyboard-accessible — provide alternative** |
| `className`    | `string`                                           | —       | Additional CSS class                                                                                  |
| `ref`          | `Ref<HTMLTableRowElement>`                         | —       | Ref to row element                                                                                    |

### `Table.HeaderCell`

| Prop        | Type                            | Default  | Description          |
| ----------- | ------------------------------- | -------- | -------------------- |
| `scope`     | `string`                        | —        | `"col"` or `"row"`   |
| `align`     | `"left" \| "center" \| "right"` | `"left"` | Content alignment    |
| `textSize`  | `"medium" \| "small"`           | —        | Adjusts font-size    |
| `className` | `string`                        | —        | Additional CSS class |
| `ref`       | `Ref<HTMLTableCellElement>`     | —        | Ref to cell element  |

### `Table.DataCell`

| Prop        | Type                            | Default  | Description          |
| ----------- | ------------------------------- | -------- | -------------------- |
| `align`     | `"left" \| "center" \| "right"` | `"left"` | Content alignment    |
| `textSize`  | `"medium" \| "small"`           | —        | Adjusts font-size    |
| `className` | `string`                        | —        | Additional CSS class |
| `ref`       | `Ref<HTMLTableCellElement>`     | —        | Ref to cell element  |

### `Table.ColumnHeader`

Extends all `Table.HeaderCell` props plus:

| Prop       | Type      | Default | Description                                            |
| ---------- | --------- | ------- | ------------------------------------------------------ |
| `sortable` | `boolean` | `false` | Enables sort indicators and click behaviour            |
| `sortKey`  | `string`  | —       | Key passed to `onSortChange`. Required when `sortable` |

### `Table.ExpandableRow`

| Prop                | Type                          | Default                   | Description                               |
| ------------------- | ----------------------------- | ------------------------- | ----------------------------------------- |
| `content`           | `ReactNode`                   | — (required)              | Content shown when row is expanded        |
| `togglePlacement`   | `"left" \| "right"`           | `"left"`                  | Position of the expand/collapse button    |
| `open`              | `boolean`                     | —                         | Controlled open state                     |
| `defaultOpen`       | `boolean`                     | `false`                   | Initial open state (uncontrolled)         |
| `onOpenChange`      | `(open: boolean) => void`     | —                         | Called when open state changes            |
| `expansionDisabled` | `boolean`                     | `false`                   | Disables expansion                        |
| `expandOnRowClick`  | `boolean`                     | `false`                   | Makes the entire row clickable to toggle  |
| `colSpan`           | `number`                      | `999`                     | Column span for the expanded content cell |
| `contentGutter`     | `"left" \| "right" \| "none"` | Same as `togglePlacement` | Gutter alignment for expanded content     |
| `selected`          | `boolean`                     | `false`                   | Highlights the row as selected            |
| `shadeOnHover`      | `boolean`                     | `true`                    | Shade row on hover                        |

## Usage Examples

### Basic

```tsx
<Table>
	<Table.Header>
		<Table.Row>
			<Table.HeaderCell scope="col">Navn</Table.HeaderCell>
			<Table.HeaderCell scope="col">Fødselsnr.</Table.HeaderCell>
			<Table.HeaderCell scope="col">Start</Table.HeaderCell>
		</Table.Row>
	</Table.Header>
	<Table.Body>
		{data.map(({ name, fnr, start }) => (
			<Table.Row key={fnr}>
				<Table.HeaderCell scope="row">{name}</Table.HeaderCell>
				<Table.DataCell>{fnr}</Table.DataCell>
				<Table.DataCell>{start}</Table.DataCell>
			</Table.Row>
		))}
	</Table.Body>
</Table>
```

### Sortable

```tsx
function SortableTable() {
	const [sort, setSort] = useState<SortState | undefined>()

	const handleSortChange = (sortKey: string) => {
		setSort((prev) => {
			if (prev && prev.orderBy === sortKey && prev.direction === 'descending') {
				return undefined
			}
			return {
				orderBy: sortKey,
				direction:
					prev && prev.orderBy === sortKey && prev.direction === 'ascending'
						? 'descending'
						: 'ascending',
			}
		})
	}

	const sortedData = useMemo(() => {
		if (!sort) return data
		return [...data].sort((a, b) => {
			const comparator = a[sort.orderBy] > b[sort.orderBy] ? 1 : -1
			return sort.direction === 'ascending' ? comparator : -comparator
		})
	}, [data, sort])

	return (
		<Table sort={sort} onSortChange={handleSortChange}>
			<Table.Header>
				<Table.Row>
					<Table.ColumnHeader sortKey="name" sortable>
						Navn
					</Table.ColumnHeader>
					<Table.ColumnHeader sortKey="age" sortable>
						Alder
					</Table.ColumnHeader>
					<Table.HeaderCell scope="col">Status</Table.HeaderCell>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{sortedData.map((row) => (
					<Table.Row key={row.id}>
						<Table.DataCell>{row.name}</Table.DataCell>
						<Table.DataCell>{row.age}</Table.DataCell>
						<Table.DataCell>{row.status}</Table.DataCell>
					</Table.Row>
				))}
			</Table.Body>
		</Table>
	)
}
```

### Expandable Rows

```tsx
<Table>
	<Table.Header>
		<Table.Row>
			<Table.HeaderCell />
			<Table.HeaderCell scope="col">Navn</Table.HeaderCell>
			<Table.HeaderCell scope="col">Beløp</Table.HeaderCell>
		</Table.Row>
	</Table.Header>
	<Table.Body>
		{data.map((row) => (
			<Table.ExpandableRow
				key={row.id}
				content={<div>Detaljer for {row.name}</div>}
				expandOnRowClick
			>
				<Table.DataCell>{row.name}</Table.DataCell>
				<Table.DataCell>{row.amount}</Table.DataCell>
			</Table.ExpandableRow>
		))}
	</Table.Body>
</Table>
```

### Zebra Stripes

```tsx
<Table zebraStripes>
	<Table.Header>
		<Table.Row>
			<Table.HeaderCell scope="col">Kolonne 1</Table.HeaderCell>
			<Table.HeaderCell scope="col">Kolonne 2</Table.HeaderCell>
		</Table.Row>
	</Table.Header>
	<Table.Body>
		{data.map((row, i) => (
			<Table.Row key={i}>
				<Table.DataCell>{row.col1}</Table.DataCell>
				<Table.DataCell>{row.col2}</Table.DataCell>
			</Table.Row>
		))}
	</Table.Body>
</Table>
```

### Small Size with Right-Aligned Numbers

```tsx
<Table size="small">
	<Table.Header>
		<Table.Row>
			<Table.HeaderCell scope="col">Beskrivelse</Table.HeaderCell>
			<Table.HeaderCell scope="col" align="right">
				Beløp
			</Table.HeaderCell>
		</Table.Row>
	</Table.Header>
	<Table.Body>
		{data.map((row) => (
			<Table.Row key={row.id}>
				<Table.DataCell>{row.description}</Table.DataCell>
				<Table.DataCell align="right">{row.amount} kr</Table.DataCell>
			</Table.Row>
		))}
	</Table.Body>
</Table>
```

### With Caption

```tsx
<Table>
	<caption>Oversikt over pensjonsavtaler</caption>
	<Table.Header>
		<Table.Row>
			<Table.HeaderCell scope="col">Avtale</Table.HeaderCell>
			<Table.HeaderCell scope="col">Leverandør</Table.HeaderCell>
		</Table.Row>
	</Table.Header>
	<Table.Body>{/* rows */}</Table.Body>
</Table>
```

## Accessibility

- Always use `<Table.HeaderCell>` (renders `<th>`) for **all header cells** — both column headers in `<Table.Header>` and row headers in the first column of `<Table.Body>`.
- Set `scope="col"` on column headers and `scope="row"` on row headers.
- Add a `<caption>` element for screen readers, especially when multiple tables appear on the same page.
- Keep cells simple — avoid more than one interactive element per cell.
- Do not merge cells (`colSpan`/`rowSpan`) unless necessary; it complicates screen reader navigation.
- For sortable columns, `Table.ColumnHeader` automatically sets `aria-sort` based on current sort state.
- `Table.ExpandableRow` uses `aria-expanded` and `aria-controls` on its toggle button automatically.
- `onRowClick` on `Table.Row` is **not keyboard-accessible** — always provide an alternative (checkbox, button, link).

### Screen Reader Navigation

- **JAWS/NVDA:** Ctrl + Alt + Arrow keys to move between cells.
- **VoiceOver (Mac):** Control + Option + Arrow keys.

## Do's and Don'ts

### ✅ Do

- Right-align numeric columns using `align="right"` for easy comparison.
- Use `Table.HeaderCell scope="row"` for the first column when it identifies the row.
- Use `Table.ColumnHeader` with `sortable` and `sortKey` for sortable columns.
- Add a `<caption>` when the table context isn't obvious or when multiple tables exist on the page.
- Use `zebraStripes` for wide tables where tracking a row across columns is difficult.
- Use `size="small"` for dense data tables with many rows.
- Use `expandOnRowClick` on `Table.ExpandableRow` for better usability.

### 🚫 Don't

- Don't use `<Table.DataCell>` where `<Table.HeaderCell>` belongs — screen readers rely on `<th>` elements.
- Don't put multiple interactive elements (buttons, links) in a single cell — use `ActionMenu` instead.
- Don't use `onRowClick` as the only way to interact with a row — it is not keyboard-accessible.
- Don't merge cells with `colSpan`/`rowSpan` unless absolutely necessary.
- Don't use tables for layout — only for tabular data.
- Don't set `sortable` on `Table.ColumnHeader` without providing a `sortKey`.
- Don't forget to sort your data array yourself — `Table` only manages sort state UI, not data ordering.

## Common Patterns in This Codebase

### TabellVisning — Expandable Rows on Mobile

This repo uses `Table.ExpandableRow` for mobile views and regular `Table.Row` for desktop, rendered in separate `Table.Body` elements with CSS-based visibility toggling:

```tsx
import { Table } from '@navikt/ds-react'

;<Table>
	<Table.Header>
		<Table.Row>
			<Table.HeaderCell scope="col">Alder</Table.HeaderCell>
			<Table.HeaderCell scope="col" className={styles.detailsItemRight}>
				Sum
			</Table.HeaderCell>
		</Table.Row>
	</Table.Header>
	{/* Mobile: expandable rows */}
	<Table.Body className={styles.tableMobileOnly}>
		{tableData.map(({ alder, sum, detaljer }, i) => (
			<Table.ExpandableRow
				key={i}
				content={<Details data={detaljer} />}
				expandOnRowClick
			>
				<Table.DataCell>{alder}</Table.DataCell>
				<Table.DataCell className={styles.detailsItemRight}>
					{formatInntekt(sum)}
				</Table.DataCell>
			</Table.ExpandableRow>
		))}
	</Table.Body>
	{/* Desktop: flat rows with all columns visible */}
	<Table.Body className={styles.tableDesktopOnly}>
		{tableData.map(({ alder, sum, detaljer }, i) => (
			<Table.Row key={i}>
				<Table.HeaderCell>{alder}</Table.HeaderCell>
				<Table.DataCell>{formatInntekt(sum)} kr</Table.DataCell>
				{detaljer.map(({ subSum }, j) => (
					<Table.DataCell key={j}>{formatInntekt(subSum)} kr</Table.DataCell>
				))}
			</Table.Row>
		))}
	</Table.Body>
</Table>
```

### Right-Aligning Currency Values

Use `align="right"` or a CSS class to right-align monetary amounts so digits line up for comparison:

```tsx
<Table.HeaderCell scope="col" align="right">Beløp</Table.HeaderCell>
<Table.DataCell align="right">{formatInntekt(amount)} kr</Table.DataCell>
```

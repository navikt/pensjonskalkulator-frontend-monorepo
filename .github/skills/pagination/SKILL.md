# Pagination — `@navikt/ds-react`

Pagination lets users navigate between multiple pages of content and shows which page they are on. Suitable for search results and large data sets such as tables.

## Import

```tsx
import { Pagination } from '@navikt/ds-react'
```

## Props

| Prop            | Type                                                          | Default          | Description                                                      |
| --------------- | ------------------------------------------------------------- | ---------------- | ---------------------------------------------------------------- |
| `page`          | `number`                                                      | —                | Current page (indexing starts at 1)                              |
| `onPageChange`  | `(page: number) => void`                                      | —                | Callback when the current page changes                           |
| `count`         | `number`                                                      | —                | Total number of pages                                            |
| `siblingCount`  | `number`                                                      | `1`              | Number of always-visible pages before and after the current page |
| `boundaryCount` | `number`                                                      | `1`              | Number of always-visible pages at the beginning and end          |
| `size`          | `"medium" \| "small" \| "xsmall"`                             | `"medium"`       | Changes padding, height, and font-size                           |
| `prevNextTexts` | `boolean`                                                     | `false`          | Display text labels alongside "previous" and "next" icons        |
| `renderItem`    | `(item: RenderItemProps) => ReactNode`                        | `PaginationItem` | Override pagination item rendering                               |
| `srHeading`     | `{ tag: "h2" \| "h3" \| "h4" \| "h5" \| "h6"; text: string }` | —                | Screen-reader heading for the nav landmark                       |
| `className`     | `string`                                                      | —                | Additional CSS class                                             |
| `ref`           | `Ref<HTMLElement>`                                            | —                | Ref to root element                                              |

## Usage Examples

### Basic

```tsx
import { useState } from 'react'

import { Pagination } from '@navikt/ds-react'

function BasicPagination() {
	const [page, setPage] = useState(1)

	return <Pagination page={page} onPageChange={setPage} count={10} />
}
```

### With previous/next labels

```tsx
<Pagination page={page} onPageChange={setPage} count={10} prevNextTexts />
```

### Small size

```tsx
<Pagination page={page} onPageChange={setPage} count={10} size="small" />
```

### With screen-reader heading

```tsx
<Pagination
	page={page}
	onPageChange={setPage}
	count={10}
	srHeading={{ tag: 'h2', text: 'Navigasjon for søkeresultater' }}
/>
```

### More visible siblings and boundaries

```tsx
<Pagination
	page={page}
	onPageChange={setPage}
	count={20}
	siblingCount={2}
	boundaryCount={2}
/>
```

### With data table

```tsx
import { useState } from 'react'

import { Pagination, Table } from '@navikt/ds-react'

const PAGE_SIZE = 10

function PaginatedTable({ data }: { data: Item[] }) {
	const [page, setPage] = useState(1)
	const totalPages = Math.ceil(data.length / PAGE_SIZE)
	const pageData = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

	return (
		<>
			<Table>
				<Table.Header>
					<Table.Row>
						<Table.HeaderCell>Navn</Table.HeaderCell>
						<Table.HeaderCell>Status</Table.HeaderCell>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{pageData.map((item) => (
						<Table.Row key={item.id}>
							<Table.DataCell>{item.name}</Table.DataCell>
							<Table.DataCell>{item.status}</Table.DataCell>
						</Table.Row>
					))}
				</Table.Body>
			</Table>
			<Pagination
				page={page}
				onPageChange={setPage}
				count={totalPages}
				prevNextTexts
				srHeading={{ tag: 'h2', text: 'Sidenavigasjon for tabell' }}
			/>
		</>
	)
}
```

### Custom renderItem (e.g. with React Router)

```tsx
import { Link } from 'react-router-dom'

;<Pagination
	page={page}
	onPageChange={setPage}
	count={10}
	renderItem={(item) => (
		<Link to={`/results?page=${item.page}`} {...item}>
			{item.children}
		</Link>
	)}
/>
```

## Accessibility

- Pagination renders a `<nav>` landmark. Use `srHeading` to give it a descriptive heading — this helps screen-reader users distinguish it from other navigation landmarks on the page.
- Prefer `srHeading` over `aria-label` since a heading provides an extra navigation stop for assistive technologies.
- If the page has multiple Pagination components, give each a unique `srHeading` text.
- When page changes update visible content, ensure the new content is announced or focus is managed appropriately (e.g. move focus to the top of the results).

## Do's and Don'ts

### ✅ Do

- Use Pagination for search results or large data sets split across pages.
- Always control state with `page` + `onPageChange` — Pagination is a controlled component.
- Add `srHeading` to improve screen-reader navigation.
- Use `prevNextTexts` when there is enough horizontal space to improve clarity.
- Consider using `size="small"` or `size="xsmall"` in tight layouts.
- Pair with a "results per page" selector when the user should control page size.

### 🚫 Don't

- Don't use Pagination for step-by-step wizards — use `FormProgress` instead.
- Don't rely on Pagination alone on mobile — the component is **not responsive**. Consider swapping to a `Select` dropdown on small screens.
- Don't set `count` to 0 or 1 — hide Pagination entirely when there is only one page.
- Don't forget to reset `page` to 1 when the underlying data set changes (e.g. new search query or filter).
- Don't place Pagination inside a `<form>` where button clicks could trigger form submission.

## Common Patterns

### Responsive fallback

Since Pagination is not responsive, a common pattern is to render a `Select` on mobile:

```tsx
import { useMediaQuery } from 'react-responsive'

import { Pagination, Select } from '@navikt/ds-react'

function ResponsivePagination({ page, count, onPageChange }) {
	const isMobile = useMediaQuery({ maxWidth: 768 })

	if (isMobile) {
		return (
			<Select
				label="Side"
				value={String(page)}
				onChange={(e) => onPageChange(Number(e.target.value))}
			>
				{Array.from({ length: count }, (_, i) => (
					<option key={i + 1} value={i + 1}>
						Side {i + 1} av {count}
					</option>
				))}
			</Select>
		)
	}

	return (
		<Pagination
			page={page}
			onPageChange={onPageChange}
			count={count}
			prevNextTexts
		/>
	)
}
```

### Reset page on filter change

```tsx
const [page, setPage] = useState(1)
const [query, setQuery] = useState('')

// Reset to page 1 whenever the search query changes
useEffect(() => {
	setPage(1)
}, [query])
```

## See Also

- [Select](/komponenter/core/select) — alternative navigation on mobile
- [Table](/komponenter/core/table) — commonly paired with Pagination
- [FormProgress](/komponenter/core/formprogress) — for step-by-step flows (not page navigation)

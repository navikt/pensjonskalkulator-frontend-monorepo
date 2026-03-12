# CopyButton

**Package:** `@navikt/ds-react`
**Status:** Stable

CopyButton lets users copy text to the clipboard. Use it to save time and reduce errors when transferring information such as fødselsnummer, phone numbers, or URLs.

## Import

```tsx
import { CopyButton } from '@navikt/ds-react'
```

## Props

| Prop             | Type                                                              | Default             | Description                                                                     |
| ---------------- | ----------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------- |
| `copyText`       | `string`                                                          | **required**        | Text to copy to clipboard                                                       |
| `text`           | `string`                                                          | —                   | Optional visible label text on the button                                       |
| `activeText`     | `string`                                                          | `"Kopiert!"`        | Text shown after click. Used as accessible label (`title`) if `text` is not set |
| `title`          | `string`                                                          | `"Kopier"`          | Accessible label for icon-only mode (ignored when `text` is set)                |
| `icon`           | `ReactNode`                                                       | `<FilesIcon />`     | Icon shown in default state                                                     |
| `activeIcon`     | `ReactNode`                                                       | `<CheckmarkIcon />` | Icon shown in active (copied) state                                             |
| `iconPosition`   | `"left" \| "right"`                                               | `"left"`            | Icon position relative to text                                                  |
| `size`           | `"medium" \| "small" \| "xsmall"`                                 | `"medium"`          | Controls padding, height, and font-size                                         |
| `activeDuration` | `number`                                                          | `2000`              | Duration in ms before reverting to default state                                |
| `data-color`     | `AkselMainColorRole \| AkselBrandColorRole \| AkselMetaColorRole` | `"neutral"`         | Color override. Only `"accent"` and `"neutral"` are recommended                 |
| `onActiveChange` | `(state: boolean) => void`                                        | —                   | Callback when internal copy-state changes                                       |
| `className`      | `string`                                                          | —                   | Additional CSS class                                                            |
| `ref`            | `Ref<HTMLButtonElement>`                                          | —                   | Ref to the underlying button element                                            |

> **Deprecated:** `variant` prop (`"action" | "neutral"`) — use `data-color` instead.

## Usage Examples

### Icon-only (default)

```tsx
<CopyButton copyText="12345678901" />
```

### With text label

```tsx
<CopyButton copyText="12345678901" text="Kopier fødselsnummer" />
```

### With custom active text

```tsx
<CopyButton
	copyText="12345678901"
	text="Kopier"
	activeText="Kopiert til utklippstavlen!"
/>
```

### Small size — inline with data

```tsx
<HStack align="center" gap="1">
	<BodyShort size="small" weight="semibold">
		F.nr.: 123456 78901
	</BodyShort>
	<CopyButton size="small" copyText="12345678901" />
</HStack>
```

### Custom icons (icon-only)

When using custom icons without `text`, set `title` on each icon for accessibility:

```tsx
import { LinkIcon } from '@navikt/aksel-icons'

;<CopyButton
	copyText="https://nav.no"
	icon={<LinkIcon title="Kopier lenke" />}
	activeIcon={<LinkIcon title="Kopierte lenke" />}
/>
```

### Custom icons (with text)

When `text` is provided, set `aria-hidden` on icons instead of `title`:

```tsx
import { LinkIcon } from '@navikt/aksel-icons'

;<CopyButton
	copyText="https://nav.no"
	icon={<LinkIcon aria-hidden />}
	activeIcon={<LinkIcon aria-hidden />}
	text="Kopier lenke"
	activeText="Kopierte lenke"
/>
```

### With callback

```tsx
<CopyButton
	copyText="sensitive-data"
	onActiveChange={(active) => {
		if (active) {
			logAmplitudeEvent('copied-data')
		}
	}}
/>
```

### xsmall in a Table

```tsx
<Table.DataCell>
	<HStack align="center" gap="1">
		<span>{phoneNumber}</span>
		<CopyButton size="xsmall" copyText={phoneNumber} />
	</HStack>
</Table.DataCell>
```

## Accessibility

- **Icon-only mode:** The component has a built-in accessible `title` prop (defaults to `"Kopier"`). The `activeText` (defaults to `"Kopiert!"`) announces the copied state.
- **With `text` prop:** The visible text serves as the accessible label; `title` is ignored.
- **Custom icons without `text`:** You **must** set `title` on both `icon` and `activeIcon`.
- **Custom icons with `text`:** You **must** set `aria-hidden` on both `icon` and `activeIcon` (the visible `text` provides the label).
- The component uses the [Clipboard API](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API) internally.

## Best Practices

### Do

- ✅ Place the CopyButton visually close to the data it copies so there is no ambiguity.
- ✅ Use `size="small"` or `size="xsmall"` when placing inline next to data.
- ✅ Ensure the copied text is correctly formatted and compatible with other applications.
- ✅ Use `onActiveChange` for analytics tracking.
- ✅ Prefer icon-only mode for compact layouts (tables, inline data).
- ✅ Add `text` when the copy action needs more context (e.g., "Kopier lenke").

### Don't

- ❌ Don't use the copied data itself as the button label — it causes layout and accessibility issues.
- ❌ Don't use CopyButton for rich content (HTML, formatted text) — it only supports plain text.
- ❌ Don't use status colors via `data-color` — stick to `"neutral"` or `"accent"`.
- ❌ Don't use the deprecated `variant` prop — use `data-color` instead.
- ❌ Don't forget `title` on custom icons in icon-only mode.

## Security Note

Copying sensitive data (e.g., fødselsnummer) to the clipboard means it persists until overwritten. The clipboard may be accessible to subsequent users of the same machine. Be aware of this when handling sensitive information, though mitigating it is typically the machine owner's responsibility.

## Real-World Example from This Repo

```tsx
// src/components/veileder/BorgerInformasjon/BorgerInformasjon.tsx
import { BodyShort, CopyButton, HStack } from '@navikt/ds-react'

;<HStack align="center" gap="1">
	<BodyShort size="small" weight="semibold">
		F.nr.: {formatFnr(fnr)}
	</BodyShort>
	<CopyButton size="small" copyText={fnr} />
</HStack>
```

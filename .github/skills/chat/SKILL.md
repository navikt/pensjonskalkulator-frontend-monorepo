# Chat — `@navikt/ds-react`

The Chat component displays a conversation between two or more participants, such as a user and a chatbot or a user and a counsellor (veileder). Each participant gets an avatar and one or more speech bubbles.

## Import

```tsx
import { Chat } from '@navikt/ds-react'
```

## Sub-components

| Component     | Element | Description                                           |
| ------------- | ------- | ----------------------------------------------------- |
| `Chat`        | `<div>` | Root wrapper representing one participant's messages. |
| `Chat.Bubble` | `<div>` | Individual speech bubble containing message text.     |

## Props

### `Chat`

| Prop                  | Type                                                              | Default            | Description                                                          |
| --------------------- | ----------------------------------------------------------------- | ------------------ | -------------------------------------------------------------------- |
| `children`            | `ReactNode`                                                       | —                  | Children of type `<Chat.Bubble />`.                                  |
| `name`                | `string`                                                          | —                  | Name/sender displayed above the first bubble.                        |
| `timestamp`           | `string`                                                          | —                  | Timestamp displayed above the first bubble.                          |
| `avatar`              | `ReactNode`                                                       | —                  | SVG or text initials for the avatar. **Hidden from screen readers.** |
| `position`            | `"left" \| "right"`                                               | `"left"`           | Positions avatar and bubbles to the left or right.                   |
| `toptextPosition`     | `"left" \| "right"`                                               | same as `position` | Horizontal position of the name/timestamp text.                      |
| `size`                | `"medium" \| "small"`                                             | `"medium"`         | Affects padding and font size in bubbles.                            |
| `toptextHeadingLevel` | `"2" \| "3" \| "4" \| "5" \| "6"`                                 | `"3"`              | Heading level for the top text (name/timestamp).                     |
| `data-color`          | `AkselMainColorRole \| AkselBrandColorRole \| AkselMetaColorRole` | —                  | Overrides color for avatar and bubble. Status colors are disallowed. |
| `className`           | `string`                                                          | —                  | Additional CSS class.                                                |
| `ref`                 | `Ref<HTMLDivElement>`                                             | —                  | Ref to root element.                                                 |

**Deprecated props:**

| Prop      | Type                              | Note                           |
| --------- | --------------------------------- | ------------------------------ |
| `variant` | `"subtle" \| "info" \| "neutral"` | Use `data-color` prop instead. |

### `Chat.Bubble`

| Prop                  | Type                              | Default | Description                                            |
| --------------------- | --------------------------------- | ------- | ------------------------------------------------------ |
| `children`            | `ReactNode`                       | —       | Bubble message text.                                   |
| `name`                | `string`                          | —       | Name/sender for this specific bubble (overrides root). |
| `timestamp`           | `string`                          | —       | Timestamp for this specific bubble.                    |
| `toptextPosition`     | `"left" \| "right"`               | —       | Overrides horizontal position of top text.             |
| `toptextHeadingLevel` | `"2" \| "3" \| "4" \| "5" \| "6"` | `"3"`   | Heading level for the top text.                        |
| `className`           | `string`                          | —       | Additional CSS class.                                  |
| `ref`                 | `Ref<HTMLDivElement>`             | —       | Ref to root element.                                   |

## Available `data-color` values

| Category | Values                                             |
| -------- | -------------------------------------------------- |
| Main     | `"neutral"`, `"accent"`                            |
| Brand    | `"brand-magenta"`, `"brand-beige"`, `"brand-blue"` |
| Meta     | `"meta-purple"`, `"meta-lime"`                     |

> Status colors (`"info"`, `"success"`, `"warning"`, `"danger"`) are **not** allowed on Chat.

## Usage Examples

### Basic two-participant conversation

```tsx
import { Chat, VStack } from '@navikt/ds-react'

;<VStack gap="space-40">
	<Chat avatar="EVA" name="EVA" timestamp="01.01.21 14:00">
		<Chat.Bubble>Hei! Mitt navn er Eva.</Chat.Bubble>
		<Chat.Bubble>Hva kan jeg hjelpe deg med?</Chat.Bubble>
	</Chat>
	<Chat
		avatar="ON"
		name="Ola Normann"
		timestamp="01.01.21 14:00"
		position="right"
	>
		<Chat.Bubble>Hei Eva.</Chat.Bubble>
		<Chat.Bubble>
			Hvor sjekker jeg statusen på foreldrepengersøknaden min?
		</Chat.Bubble>
	</Chat>
</VStack>
```

### With custom colors

```tsx
<VStack gap="space-40">
	<Chat avatar="🤖" name="Chatbot" data-color="brand-blue">
		<Chat.Bubble>Velkommen! Hvordan kan jeg hjelpe?</Chat.Bubble>
	</Chat>
	<Chat avatar="BN" name="Bruker" position="right" data-color="neutral">
		<Chat.Bubble>Jeg lurer på noe om pensjon.</Chat.Bubble>
	</Chat>
</VStack>
```

### Small size

```tsx
<Chat avatar="V" name="Veileder" size="small" timestamp="14:32">
	<Chat.Bubble>Meldingen vises i liten størrelse.</Chat.Bubble>
</Chat>
```

### Per-bubble name and timestamp

```tsx
<Chat avatar="V" name="Veileder">
	<Chat.Bubble timestamp="14:00">Første melding.</Chat.Bubble>
	<Chat.Bubble name="Veileder" timestamp="14:05">
		Andre melding litt senere.
	</Chat.Bubble>
</Chat>
```

### With heading level override

```tsx
{
	/* Inside a section where h2 is already used */
}
;<Chat avatar="V" name="Veileder" toptextHeadingLevel="4">
	<Chat.Bubble>Innholdet her.</Chat.Bubble>
</Chat>
```

## Accessibility

- **Avatar is hidden** from assistive technologies (`aria-hidden`). Initials in the avatar would be read without context. Use the `name` prop to communicate the sender accessibly.
- **No automatic screen reader announcements** for dynamically inserted messages. The component does not add `aria-live` regions.
- Set `toptextHeadingLevel` appropriately to maintain a correct heading hierarchy on the page.
- Use `name` on every `Chat` block so screen reader users know who is speaking.

## Do's and Don'ts

### ✅ Do

- Use `position="right"` for the current user's messages and `position="left"` for the other participant — this follows the standard chat UI convention.
- Always provide a `name` prop so assistive technologies can identify the sender.
- Use `data-color` to visually distinguish different participants in multi-party conversations.
- Group consecutive messages from the same sender under one `Chat` component with multiple `Chat.Bubble` children.
- Wrap multiple `Chat` blocks in a `VStack` with appropriate gap for consistent spacing.
- Set `toptextHeadingLevel` to fit the page's heading hierarchy.

### 🚫 Don't

- Don't use Chat for **real-time chat** — messages are not automatically read aloud by screen readers.
- Don't rely on the `avatar` alone to communicate the sender — it is hidden from assistive technologies.
- Don't use status colors (`"info"`, `"success"`, `"warning"`, `"danger"`) with `data-color`.
- Don't use the deprecated `variant` prop — use `data-color` instead.
- Don't place interactive elements (buttons, links) inside `Chat.Bubble` if the conversation is meant to be read-only.
- Don't create a separate `Chat` component for every single message from the same sender — group them in one `Chat` with multiple `Chat.Bubble` children.

## Suitable For

- Communication between user and chatbot.
- Direct messages between user and counsellor (veileder).

## Not Suitable For

- Real-time chat (messages are not read aloud automatically).

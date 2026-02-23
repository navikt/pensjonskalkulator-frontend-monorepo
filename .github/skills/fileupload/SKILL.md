# FileUpload — `@navikt/ds-react`

FileUpload provides a set of components for file uploading with drag-and-drop support, file validation, progress/status display, and error handling.

## Import

```tsx
import { FileUpload } from '@navikt/ds-react'
```

## Sub-components

| Component             | Element      | Description                                                                |
| --------------------- | ------------ | -------------------------------------------------------------------------- |
| `FileUpload.Dropzone` | `<div>`      | Drag-and-drop area where users can drop files or click to open file picker |
| `FileUpload.Trigger`  | wrapper      | Wraps a `Button` to create a simple file upload button (no drag-and-drop)  |
| `FileUpload.Item`     | `<div>/<li>` | Represents an individual file with status, errors, and action buttons      |

## Types

```tsx
// Returned by onSelect for each file
interface FileObject {
	file: File
	error?: boolean
	reasons?: string[]
}

// Partition of selected files
interface FilesPartitioned {
	accepted: FileObject[]
	rejected: FileObject[]
}

// For FileUpload.Item file prop — either a native File or metadata
type FileItem = File | { name: string; size: number }
```

## Props

### `FileUpload.Dropzone`

| Prop             | Type                                                           | Default       | Description                                               |
| ---------------- | -------------------------------------------------------------- | ------------- | --------------------------------------------------------- |
| `label`          | `string`                                                       | —             | **Required.** Text shown to the user                      |
| `description`    | `ReactNode`                                                    | —             | Extends the label with additional context                 |
| `onSelect`       | `(files: FileObject[], partitioned: FilesPartitioned) => void` | —             | **Required.** Callback when files are selected            |
| `accept`         | `string`                                                       | —             | Accepted file types (e.g. `".pdf,.doc,.docx"`)            |
| `multiple`       | `boolean`                                                      | `true`        | Allow selecting multiple files at once                    |
| `maxSizeInBytes` | `number`                                                       | —             | Maximum file size in bytes                                |
| `fileLimit`      | `{ max: number; current: number }`                             | —             | Disables dropzone when `current >= max`                   |
| `validator`      | `(file: File) => string \| true`                               | —             | Custom validation function. Return error string or `true` |
| `error`          | `ReactNode`                                                    | —             | Error message (e.g. "No files attached")                  |
| `errorId`        | `string`                                                       | —             | Override internal error element ID                        |
| `disabled`       | `boolean`                                                      | —             | Disables the dropzone. Avoid if possible for a11y         |
| `icon`           | `ComponentType<any>`                                           | `CloudUpIcon` | Custom icon                                               |
| `id`             | `string`                                                       | —             | Override internal ID                                      |
| `translations`   | `RecursivePartial<DropzoneTranslations>`                       | —             | i18n overrides for texts and labels                       |
| `className`      | `string`                                                       | —             | Additional CSS class                                      |
| `ref`            | `Ref<HTMLInputElement>`                                        | —             | Ref to the underlying input element                       |

### `FileUpload.Trigger`

| Prop             | Type                                                           | Default | Description                                    |
| ---------------- | -------------------------------------------------------------- | ------- | ---------------------------------------------- |
| `onSelect`       | `(files: FileObject[], partitioned: FilesPartitioned) => void` | —       | **Required.** Callback when files are selected |
| `multiple`       | `boolean`                                                      | `true`  | Allow selecting multiple files at once         |
| `accept`         | `string`                                                       | —       | Accepted file types                            |
| `maxSizeInBytes` | `number`                                                       | —       | Maximum file size in bytes                     |
| `validator`      | `(file: File) => string \| true`                               | —       | Custom validation function                     |
| `children`       | `ReactNode`                                                    | —       | Should be a `<Button>` element                 |
| `ref`            | `Ref<HTMLInputElement>`                                        | —       | Ref to the underlying input element            |

### `FileUpload.Item`

| Prop           | Type                                                                              | Default  | Description                                                                                                     |
| -------------- | --------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------- |
| `file`         | `FileItem`                                                                        | —        | **Required.** Native `File` or file metadata object                                                             |
| `as`           | `"div" \| "li"`                                                                   | `"div"`  | HTML element to render as                                                                                       |
| `status`       | `"idle" \| "uploading" \| "downloading"`                                          | `"idle"` | Shows a loading indicator for `uploading`/`downloading`                                                         |
| `error`        | `string`                                                                          | —        | Error message for this specific file                                                                            |
| `description`  | `string`                                                                          | —        | Replaces file size when idle (e.g. upload date). Not for errors                                                 |
| `button`       | `{ action: "delete" \| "retry"; onClick: (e) => void; id?: string } \| ReactNode` | —        | Action button config or custom ReactNode                                                                        |
| `href`         | `string`                                                                          | —        | Makes the file name a link                                                                                      |
| `onFileClick`  | `(e: MouseEvent<HTMLAnchorElement>) => void`                                      | —        | Click handler on file name. If neither `href` nor this is set and `file` is native, clicking downloads the file |
| `translations` | `RecursivePartial<ItemTranslations>`                                              | —        | i18n overrides for texts and labels                                                                             |
| `className`    | `string`                                                                          | —        | Additional CSS class                                                                                            |
| `ref`          | `Ref<HTMLDivElement>`                                                             | —        | Ref to root element                                                                                             |

## Usage Examples

### Drag and drop with file list

```tsx
import { useState } from 'react'

import { FileUpload, Heading, VStack } from '@navikt/ds-react'

function DragAndDropUpload() {
	const [files, setFiles] = useState<FileObject[]>([])

	const acceptedFiles = files.filter((f) => !f.error)
	const rejectedFiles = files.filter((f) => f.error)

	const removeFile = (fileToRemove: FileObject) => {
		setFiles((prev) => prev.filter((f) => f !== fileToRemove))
	}

	return (
		<VStack gap="space-24">
			<FileUpload.Dropzone
				label="Last opp filer til søknaden"
				description="Du kan laste opp Word- og PDF-filer. Maks størrelse 10 MB."
				accept=".doc,.docx,.pdf"
				maxSizeInBytes={10 * 1024 * 1024}
				fileLimit={{ max: 3, current: acceptedFiles.length }}
				onSelect={(newFiles) => setFiles((prev) => [...prev, ...newFiles])}
			/>
			{acceptedFiles.length > 0 && (
				<VStack gap="space-8">
					<Heading level="3" size="xsmall">
						{`Vedlegg (${acceptedFiles.length})`}
					</Heading>
					<VStack as="ul" gap="space-12">
						{acceptedFiles.map((file, index) => (
							<FileUpload.Item
								as="li"
								key={index}
								file={file.file}
								button={{
									action: 'delete',
									onClick: () => removeFile(file),
								}}
							/>
						))}
					</VStack>
				</VStack>
			)}
		</VStack>
	)
}
```

### Button trigger (no drag-and-drop)

```tsx
import { useState } from 'react'

import { UploadIcon } from '@navikt/aksel-icons'
import { Button, FileUpload, VStack } from '@navikt/ds-react'

function ButtonUpload() {
	const [files, setFiles] = useState<FileObject[]>([])

	return (
		<VStack gap="space-24">
			<FileUpload.Trigger onSelect={(newFiles) => setFiles(newFiles)}>
				<Button variant="secondary" icon={<UploadIcon aria-hidden />}>
					Last opp fil
				</Button>
			</FileUpload.Trigger>
			<VStack as="ul" gap="space-12">
				{files.map((file, index) => (
					<FileUpload.Item
						as="li"
						key={index}
						file={file.file}
						button={{
							action: 'delete',
							onClick: () =>
								setFiles((prev) => prev.filter((_, i) => i !== index)),
						}}
					/>
				))}
			</VStack>
		</VStack>
	)
}
```

### With custom validation

```tsx
function ValidatedUpload() {
	const [files, setFiles] = useState<FileObject[]>([])
	const existingNames = files.map((f) => f.file.name)

	return (
		<FileUpload.Dropzone
			label="Last opp filer"
			accept=".pdf"
			maxSizeInBytes={5 * 1024 * 1024}
			onSelect={(newFiles, { accepted, rejected }) => {
				setFiles((prev) => [...prev, ...newFiles])
				if (rejected.length > 0) {
					console.log('Rejected files:', rejected)
				}
			}}
			validator={(file: File) => {
				if (existingNames.includes(file.name)) {
					return 'Filen eksisterer allerede'
				}
				return true
			}}
		/>
	)
}
```

### With upload status and error handling

```tsx
function UploadWithStatus() {
	const [files, setFiles] = useState<
		{ file: File; status: 'idle' | 'uploading'; error?: string }[]
	>([])

	return (
		<VStack as="ul" gap="space-12">
			{files.map((item, index) => (
				<FileUpload.Item
					as="li"
					key={index}
					file={item.file}
					status={item.status}
					error={item.error}
					button={{
						action: item.error ? 'retry' : 'delete',
						onClick: () => {
							if (item.error) {
								// retry upload logic
							} else {
								setFiles((prev) => prev.filter((_, i) => i !== index))
							}
						},
					}}
				/>
			))}
		</VStack>
	)
}
```

### With error on Dropzone (missing files)

```tsx
<FileUpload.Dropzone
	label="Last opp dokumentasjon"
	description="Du kan laste opp PDF-filer."
	accept=".pdf"
	error={
		hasSubmitted && files.length === 0
			? 'Du må laste opp minst én fil'
			: undefined
	}
	onSelect={(newFiles) => setFiles(newFiles)}
/>
```

## Accessibility

- `FileUpload.Dropzone` renders an accessible file input with proper labeling from the `label` and `description` props.
- Screen readers announce the dropzone purpose, accepted formats, and any error messages.
- File lists should use semantic `<ul>` and `<li>` elements — set `as="li"` on `FileUpload.Item` and wrap in a `<ul>` (or `VStack as="ul"`).
- The `button` prop on `FileUpload.Item` automatically provides accessible labels ("Slett" / "Prøv på nytt").
- Avoid using `disabled` on Dropzone when possible — prefer `fileLimit` to naturally disable when the maximum is reached.
- When using `ErrorSummary`, summarize multiple file errors into a single entry linking to the first file with an error.

## Do's and Don'ts

### ✅ Do

- Start the `label` with "Last opp" (e.g. "Last opp dokumentasjon").
- Describe file restrictions in the `description` using positive phrasing and separate sentences.
- Use `<ul>` and `<li>` for file lists (`as="li"` on `FileUpload.Item`).
- Show file-specific errors on `FileUpload.Item`, not on `Dropzone`.
- Show "no files uploaded" errors on `Dropzone`.
- Use `fileLimit` to automatically disable the dropzone when the max is reached.
- Validate on the server side as well — client-side validation is not sufficient. Run virus checks.
- Use `InlineMessage` above the file list for "too many files" errors.

### 🚫 Don't

- Don't show file-specific errors (wrong format, too large) on the `Dropzone` — show them on each `FileUpload.Item`.
- Don't use negative phrasing for restrictions (e.g. ~~"Ikke last opp filer over 10 MB"~~).
- Don't skip server-side validation — client validation can be bypassed.
- Don't use `FileUpload` for file previews or thumbnails — it is not designed for that.
- Don't render files outside of a list element when displaying multiple files.
- Don't use `disabled` prop directly when `fileLimit` can handle the disabling logic.
- Don't rely solely on `accept` for type validation — users can still drag-and-drop other file types.

import { ChevronDownIcon } from '@sanity/icons'
import { Box, Button, Dialog, Menu, MenuButton, MenuItem } from '@sanity/ui'
import {
	type Dispatch,
	type ReactNode,
	type SetStateAction,
	createContext,
	useContext,
	useEffect,
	useEffectEvent,
	useId,
	useState,
} from 'react'
import {
	type ArrayOfObjectsInputProps,
	type BlockProps,
	type ObjectInputProps,
	PatchEvent,
	type StringInputProps,
	set,
} from 'sanity'

interface TypeOption {
	value: string
	text: string
}

const TypeChangeContext = createContext<((value: string) => void) | null>(null)

interface InlineEditor {
	key: string
	form: ReactNode
	title: string
	onClose: () => void
}

const InlineEditorContext = createContext<Dispatch<
	SetStateAction<InlineEditor | null>
> | null>(null)

export const DynamicValuePortableTextInput = (
	props: ArrayOfObjectsInputProps
) => {
	const inheritedEditor = useContext(InlineEditorContext)
	const [editor, setEditor] = useState<InlineEditor | null>(null)
	const dialogId = useId()

	const onClose = () => {
		setEditor(null)
		editor?.onClose()
	}

	if (inheritedEditor) {
		return props.renderDefault(props)
	}

	return (
		<InlineEditorContext.Provider value={setEditor}>
			{props.renderDefault(props)}
			{editor && (
				<Dialog
					id={dialogId}
					header={editor.title}
					width={1}
					onClose={onClose}
					onClickOutside={onClose}
				>
					<Box padding={4}>{editor.form}</Box>
				</Dialog>
			)}
		</InlineEditorContext.Provider>
	)
}

export const DynamicValueInlineEditor = (props: BlockProps) => {
	const setEditor = useContext(InlineEditorContext)
	const key = props.path
		.map((segment) =>
			typeof segment === 'object' && '_key' in segment ? segment._key : segment
		)
		.join('/')
	const valueVersion = JSON.stringify(props.value)
	const currentEditor: InlineEditor = {
		key,
		form: props.children,
		title: props.schemaType.title ?? 'Dynamisk verdi',
		onClose: props.onClose,
	}
	const updateEditor = useEffectEvent(() => {
		setEditor?.((editor) =>
			editor?.key === key || (!editor && props.open) ? currentEditor : editor
		)
	})

	useEffect(() => {
		updateEditor()
	}, [key, valueVersion, props.open])

	if (!setEditor) {
		return props.renderDefault(props)
	}

	return props.renderDefault({
		...props,
		open: false,
		onOpen: () => {
			setEditor(currentEditor)
			props.onOpen()
		},
	})
}

export const DynamicValueTypeInput = (props: StringInputProps) => {
	const onTypeChange = useContext(TypeChangeContext)
	const options: TypeOption[] = (props.schemaType.options?.list ?? []).flatMap(
		(option) =>
			typeof option === 'string'
				? [{ value: option, text: option }]
				: typeof option.value === 'string'
					? [{ value: option.value, text: option.title }]
					: []
	)

	return (
		<MenuButton
			id={props.elementProps.id}
			popover={{ portal: false }}
			button={
				<Button
					{...props.elementProps}
					mode="ghost"
					iconRight={ChevronDownIcon}
					disabled={props.readOnly}
					text={
						options.find((option) => option.value === props.value)?.text ??
						'Velg type'
					}
				/>
			}
			menu={
				<Menu>
					{options.map((option) => (
						<MenuItem
							key={option.value}
							text={option.text}
							selected={option.value === props.value}
							onClick={() => {
								if (option.value !== props.value) {
									if (onTypeChange) {
										onTypeChange(option.value)
									} else {
										props.onChange(set(option.value))
									}
								}
							}}
						/>
					))}
				</Menu>
			}
		/>
	)
}

const typeSpecificFields = [
	'key',
	'label',
	'anchorId',
	'url',
	'openInNewTab',
	'gMultiplier',
] as const

export const DynamicValueInput = (props: ObjectInputProps) => {
	const onTypeChange = (value: string) => {
		props.onChange(
			PatchEvent.from(set(value, ['valueType'])).append(
				...typeSpecificFields
					.filter((field) => props.value && Object.hasOwn(props.value, field))
					.map((field) => set(field === 'openInNewTab' ? false : '', [field]))
			)
		)
	}

	return (
		<TypeChangeContext.Provider value={onTypeChange}>
			{props.renderDefault(props)}
		</TypeChangeContext.Provider>
	)
}

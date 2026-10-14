import { ChevronDownIcon } from '@sanity/icons'
import { Box, Button, Dialog, Menu, MenuButton, MenuItem } from '@sanity/ui'
import {
	type Dispatch,
	type ReactNode,
	type SetStateAction,
	createContext,
	useCallback,
	useContext,
	useEffect,
	useEffectEvent,
	useId,
	useLayoutEffect,
	useRef,
	useState,
} from 'react'
import {
	type ArrayOfObjectsFormNode,
	type ArrayOfObjectsInputProps,
	type BlockAnnotationProps,
	type BlockProps,
	type ObjectInputProps,
	PatchEvent,
	type StringInputProps,
	set,
	unset,
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

const suppressNativeAnnotationDialog = (
	members: ArrayOfObjectsInputProps['members'],
	editorKey: string
) =>
	members.map((block) => {
		if (block.kind !== 'item') {
			return block
		}

		let blockChanged = false
		const fields = block.item.members.map((field) => {
			if (field.kind !== 'field' || field.name !== 'markDefs') {
				return field
			}

			const annotationField = field.field as ArrayOfObjectsFormNode
			let fieldChanged = false
			const annotations = annotationField.members.map((annotation) => {
				if (
					annotation.kind !== 'item' ||
					!annotation.open ||
					getEditorKey(annotation.item.path) !== editorKey
				) {
					return annotation
				}

				fieldChanged = true
				return { ...annotation, open: false }
			})

			if (!fieldChanged) {
				return field
			}
			blockChanged = true
			return {
				...field,
				field: { ...annotationField, members: annotations },
			}
		})

		return blockChanged
			? { ...block, item: { ...block.item, members: fields } }
			: block
	})

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

	const members = editor
		? suppressNativeAnnotationDialog(props.members, editor.key)
		: props.members

	return (
		<InlineEditorContext.Provider value={setEditor}>
			{props.renderDefault(editor ? { ...props, members } : props)}
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

const getEditorKey = (path: BlockProps['path']) =>
	path
		.map((segment) =>
			typeof segment === 'object' && '_key' in segment ? segment._key : segment
		)
		.join('/')

const useHostedEditor = <Props extends BlockProps | BlockAnnotationProps>(
	props: Props
): Props => {
	const setEditor = useContext(InlineEditorContext)
	const key = getEditorKey(props.path)
	const valueVersion = JSON.stringify(props.value)
	const validationVersion = JSON.stringify(props.validation)
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
	}, [key, valueVersion, validationVersion, props.open])

	const latestEditor = useRef({ currentEditor, onOpen: props.onOpen })
	useLayoutEffect(() => {
		latestEditor.current = { currentEditor, onOpen: props.onOpen }
	})
	const onOpen = useCallback(() => {
		setEditor?.(latestEditor.current.currentEditor)
		latestEditor.current.onOpen()
	}, [setEditor])

	if (!setEditor) {
		return props
	}

	return {
		...props,
		open: false,
		onOpen,
	}
}

export const DynamicValueInlineEditor = (props: BlockProps) =>
	props.renderDefault(useHostedEditor(props))

export const LinkAnnotationEditor = (props: BlockAnnotationProps) =>
	props.renderDefault(useHostedEditor(props))

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
			popover={{ portal: false, placement: 'bottom-start' }}
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

const renderTypeChangingInput = (
	props: ObjectInputProps,
	typeField: 'linkType' | 'valueType',
	resetValues: Record<string, string | boolean | undefined>
) => {
	const onTypeChange = (value: string) => {
		props.onChange(
			PatchEvent.from(set(value, [typeField])).append(
				...Object.entries(resetValues)
					.filter(([field]) => props.value && Object.hasOwn(props.value, field))
					.map(([field, resetValue]) =>
						resetValue === undefined ? unset([field]) : set(resetValue, [field])
					)
			)
		)
	}

	return (
		<TypeChangeContext.Provider value={onTypeChange}>
			{props.renderDefault(props)}
		</TypeChangeContext.Provider>
	)
}

const linkValueFields = ['href', 'anchorId', 'route'] as const
const typeSpecificFields = ['key', 'gMultiplier'] as const

const useClearEmptyFields = (
	props: ObjectInputProps,
	fields: readonly string[]
) => {
	useEffect(() => {
		const emptyFields = fields.filter((field) => props.value?.[field] === '')
		if (emptyFields.length > 0) {
			props.onChange(
				PatchEvent.from(emptyFields.map((field) => unset([field])))
			)
		}
	}, [props.value, props.onChange, fields])
}

export const LinkAnnotationInput = (props: ObjectInputProps) => {
	useClearEmptyFields(props, linkValueFields)
	return renderTypeChangingInput(props, 'linkType', {
		href: undefined,
		anchorId: undefined,
		route: undefined,
		blank: false,
	})
}

export const DynamicValueInput = (props: ObjectInputProps) => {
	useClearEmptyFields(props, typeSpecificFields)

	return renderTypeChangingInput(props, 'valueType', {
		key: undefined,
		gMultiplier: undefined,
	})
}

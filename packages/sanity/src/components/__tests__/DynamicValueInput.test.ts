import type { DialogProps, MenuButtonProps } from '@sanity/ui'
import {
	type ReactElement,
	type ReactNode,
	createElement,
	useCallback,
	useContext,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from 'react'
import {
	type ArrayOfObjectsInputProps,
	type BlockAnnotationProps,
	type BlockProps,
	type ObjectInputProps,
	PatchEvent,
	type StringInputProps,
	type Workspace,
	createSchema,
	set,
	unset,
	validateDocument,
} from 'sanity'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { innholdField } from '../../schemaTypes/common/commonSchemaTypes'
import {
	DynamicValueInlineEditor,
	DynamicValueInput,
	DynamicValuePortableTextInput,
	DynamicValueTypeInput,
	LinkAnnotationEditor,
	LinkAnnotationInput,
} from '../DynamicValueInput'

vi.mock('react', async (importOriginal) => ({
	...(await importOriginal<typeof import('react')>()),
	useCallback: vi.fn((callback: () => void) => callback),
	useContext: vi.fn(() => null),
	useEffect: vi.fn(),
	useEffectEvent: vi.fn((fn: () => void) => fn),
	useId: vi.fn(() => 'dynamic-value-dialog'),
	useLayoutEffect: vi.fn(),
	useRef: vi.fn((value: unknown) => ({ current: value })),
	useState: vi.fn((initial: boolean) => [initial, vi.fn()]),
}))

function createObjectInput(value: Record<string, unknown>) {
	const props = {
		value,
		onChange: vi.fn(),
		renderDefault: vi.fn(() => createElement('div')),
		renderInput: vi.fn(() => createElement('input')),
	} as unknown as ObjectInputProps

	const input = DynamicValueInput(props) as ReactElement<{
		value: (value: string) => void
	}>
	return { props, onTypeChange: input.props.value }
}

describe('DynamicValueInput', () => {
	beforeEach(() => vi.mocked(useContext).mockReturnValue(null))

	it.each([
		{ route: undefined, valid: false },
		{ route: '/unknown-route', valid: false },
		{ route: '/pensjon/kalkulator/afp', valid: true },
	])(
		'validates route $route with an actionable error',
		async ({ route, valid }) => {
			const schema = createSchema({
				name: 'link-validation',
				types: [
					{ name: 'testDocument', type: 'document', fields: [innholdField] },
				],
			})
			const document = {
				_id: 'link-validation',
				_type: 'testDocument',
				_createdAt: '2026-10-14T00:00:00Z',
				_updatedAt: '2026-10-14T00:00:00Z',
				_rev: 'test-revision',
				innhold: [
					{
						_type: 'block',
						_key: 'block',
						style: 'normal',
						markDefs: [
							{ _type: 'link', _key: 'link', linkType: 'route', route },
						],
						children: [
							{ _type: 'span', _key: 'text', text: 'Les mer', marks: ['link'] },
						],
					},
				],
			}
			const workspace = {
				schema,
				getClient: vi.fn(),
				i18n: { loadNamespaces: async () => {}, t: (key: string) => key },
			} as unknown as Workspace
			const errors = await validateDocument({
				document,
				workspace,
				getDocumentExists: async () => true,
			})
			if (valid) {
				expect(errors).toEqual([])
			} else {
				expect(errors).toEqual(
					expect.arrayContaining([
						expect.objectContaining({ message: 'Velg et steg fra listen.' }),
					])
				)
			}
		}
	)

	it.each([
		{ valueType: 'string', key: 'fornavn', gMultiplier: '' },
		{ valueType: 'gMultiple', key: '', gMultiplier: '1' },
	])(
		'validates $valueType after removing the hidden empty dropdown value',
		async (value) => {
			const schema = createSchema({
				name: 'dynamic-value-validation',
				types: [
					{ name: 'testDocument', type: 'document', fields: [innholdField] },
				],
			})
			const document = {
				_id: 'dynamic-value-validation',
				_type: 'testDocument',
				_createdAt: '2026-10-14T00:00:00Z',
				_updatedAt: '2026-10-14T00:00:00Z',
				_rev: 'test-revision',
				innhold: [
					{
						_type: 'block',
						_key: 'block',
						style: 'normal',
						markDefs: [],
						children: [{ _type: 'dynamicValue', _key: 'dynamic', ...value }],
					},
				],
			}
			const workspace = {
				schema,
				getClient: vi.fn(),
				i18n: { loadNamespaces: async () => {}, t: (key: string) => key },
			} as unknown as Workspace
			const validate = () =>
				validateDocument({
					document,
					workspace,
					getDocumentExists: async () => true,
				})
			const before = await validate()
			expect(before).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						path: [
							'innhold',
							{ _key: 'block' },
							'children',
							{ _key: 'dynamic' },
							value.valueType === 'gMultiple' ? 'key' : 'gMultiplier',
						],
					}),
				])
			)

			const cleanValue = Object.fromEntries(
				Object.entries(value).filter(([, fieldValue]) => fieldValue !== '')
			)
			document.innhold[0].children = [
				{ _type: 'dynamicValue', _key: 'dynamic', ...cleanValue },
			] as (typeof document.innhold)[0]['children']
			expect(await validate()).toEqual([])
		}
	)

	it('hosts the inline form with padding and closes only through the host', () => {
		const setEditor = vi.fn()
		const editor = {
			key: 'inline-value',
			form: createElement('div'),
			title: 'Dynamisk verdi',
			onClose: vi.fn(),
		}
		vi.mocked(useState).mockReturnValue([editor, setEditor])
		const props = {
			value: [],
			members: [],
			renderDefault: vi.fn(() => createElement('span')),
		} as unknown as ArrayOfObjectsInputProps
		const input = DynamicValuePortableTextInput(props) as ReactElement<{
			children: [
				ReactElement,
				ReactElement<
					DialogProps & {
						children: ReactElement<{ padding: number; children: ReactNode }>
					}
				>,
			]
		}>
		const dialog = input.props.children[1]

		expect(dialog.props.children.props.padding).toBe(4)
		expect(dialog.props.children.props.children).toBe(editor.form)
		expect(setEditor).not.toHaveBeenCalled()
		expect(vi.mocked(props.renderDefault).mock.calls[0][0]).toEqual(props)
		dialog.props.onClose?.()
		expect(setEditor).toHaveBeenCalledWith(null)
		expect(editor.onClose).toHaveBeenCalledOnce()
	})

	it('suppresses only the hosted annotation modal without mutating members', () => {
		const annotation = {
			kind: 'item',
			open: true,
			item: {
				path: ['innhold', { _key: 'block' }, 'markDefs', { _key: 'link' }],
			},
		}
		const props = {
			members: [
				{
					kind: 'item',
					item: {
						members: [
							{
								kind: 'field',
								name: 'markDefs',
								field: { members: [annotation] },
							},
						],
					},
				},
			],
			renderDefault: vi.fn(() => createElement('span')),
		} as unknown as ArrayOfObjectsInputProps
		vi.mocked(useState).mockReturnValue([
			{
				key: 'innhold/block/markDefs/link',
				form: createElement('div'),
				title: 'Lenke',
				onClose: vi.fn(),
			},
			vi.fn(),
		])

		DynamicValuePortableTextInput(props)

		const rendered = vi.mocked(props.renderDefault).mock
			.calls[0][0] as ArrayOfObjectsInputProps
		expect(rendered.members).toEqual([
			{
				kind: 'item',
				item: {
					members: [
						{
							kind: 'field',
							name: 'markDefs',
							field: { members: [{ ...annotation, open: false }] },
						},
					],
				},
			},
		])
		expect(annotation.open).toBe(true)
	})

	it.each([DynamicValueInlineEditor, LinkAnnotationEditor])(
		'refreshes hosted forms after edits and preserves the no-host fallback (%#)',
		(renderEditor) => {
			type HostedForm = {
				key: string
				form: ReactNode
				title: string
				onClose: () => void
			}
			const setEditor =
				vi.fn<
					(
						update:
							| HostedForm
							| null
							| ((editor: HostedForm | null) => HostedForm | null)
					) => void
				>()
			vi.mocked(useContext).mockReturnValue(setEditor)
			const props = {
				path: ['innhold', { _key: 'block' }, 'markDefs', { _key: 'link' }],
				value: { _type: 'link', linkType: 'anchor', anchorId: 'heading' },
				children: createElement('input', { value: 'heading' }),
				schemaType: { title: 'Lenke' },
				open: false,
				onOpen: vi.fn(),
				onClose: vi.fn(),
				renderDefault: vi.fn(() => createElement('span')),
			} as unknown as BlockAnnotationProps & BlockProps

			const latestEditor = {
				current: {
					currentEditor: {
						key: 'innhold/block/markDefs/link',
						form: props.children,
						title: 'Lenke',
						onClose: props.onClose,
					},
					onOpen: props.onOpen,
				},
			}
			vi.mocked(useRef).mockReturnValueOnce(latestEditor)
			renderEditor(props)
			const rendered = vi.mocked(props.renderDefault).mock.calls[0][0]
			rendered.onOpen()
			expect(setEditor).toHaveBeenCalledWith(
				expect.objectContaining({ form: props.children })
			)
			expect(props.onOpen).toHaveBeenCalledOnce()

			const updated = {
				...props,
				value: { ...props.value, anchorId: 'updated' },
				children: createElement('input', { value: 'updated' }),
				onOpen: vi.fn(),
			}
			vi.mocked(useRef).mockReturnValueOnce(latestEditor)
			renderEditor(updated)
			vi.mocked(useLayoutEffect).mock.calls.at(-1)?.[0]()
			expect(useCallback).toHaveBeenLastCalledWith(expect.any(Function), [
				setEditor,
			])
			rendered.onOpen()
			expect(setEditor).toHaveBeenLastCalledWith(
				expect.objectContaining({ form: updated.children })
			)
			expect(updated.onOpen).toHaveBeenCalledOnce()
			vi.mocked(useEffect).mock.calls.at(-1)?.[0]()
			const refresh = setEditor.mock.calls.at(-1)?.[0]
			if (typeof refresh !== 'function') {
				throw new Error('Expected a hosted editor updater')
			}
			expect(
				refresh({
					key: 'innhold/block/markDefs/link',
					form: props.children,
					title: 'Lenke',
					onClose: props.onClose,
				})
			).toEqual(expect.objectContaining({ form: updated.children }))
			expect(props.onClose).not.toHaveBeenCalled()

			vi.mocked(useContext).mockReturnValue(null)
			vi.mocked(props.renderDefault).mockClear()
			renderEditor(updated)
			expect(vi.mocked(props.renderDefault).mock.calls[0][0]).toBe(updated)
		}
	)

	it.each([DynamicValueInlineEditor, LinkAnnotationEditor])(
		'refreshes error styling when validation clears without another value change (%#)',
		(renderEditor) => {
			const setEditor = vi.fn<
				(
					update: (editor: { key: string }) => {
						key: string
						form?: ReactNode
					}
				) => void
			>()
			vi.mocked(useContext).mockReturnValue(setEditor)
			const props = {
				path: ['innhold', { _key: 'block' }, 'children', { _key: 'value' }],
				value: { _type: 'dynamicValue', valueType: 'string', key: 'fornavn' },
				validation: [{ level: 'error', message: 'Required', path: [] }],
				children: createElement('input', { 'aria-invalid': true }),
				schemaType: { title: 'Dynamisk verdi' },
				open: false,
				onOpen: vi.fn(),
				onClose: vi.fn(),
				renderDefault: vi.fn(() => createElement('span')),
			} as unknown as BlockAnnotationProps & BlockProps

			renderEditor(props)
			const previousDependencies = vi.mocked(useEffect).mock.calls.at(-1)?.[1]
			expect(
				vi.mocked(props.renderDefault).mock.calls.at(-1)?.[0].validation
			).toBe(props.validation)

			const validated = {
				...props,
				validation: [],
				children: createElement('input', { 'aria-invalid': false }),
			}
			renderEditor(validated)
			expect(vi.mocked(useEffect).mock.calls.at(-1)?.[1]).not.toEqual(
				previousDependencies
			)
			vi.mocked(useEffect).mock.calls.at(-1)?.[0]()
			const refresh = setEditor.mock.calls.at(-1)?.[0]
			expect(refresh?.({ key: 'innhold/block/children/value' })).toEqual(
				expect.objectContaining({ form: validated.children })
			)
			expect(props.onClose).not.toHaveBeenCalled()
		}
	)

	it('changes the type and clears existing sibling values through context', () => {
		const { props, onTypeChange } = createObjectInput({
			_type: 'dynamicValue',
			_key: 'inline-value',
			valueType: 'string',
			key: 'alder',
			gMultiplier: '2',
		})
		onTypeChange('gMultiple')

		const event = PatchEvent.from(vi.mocked(props.onChange).mock.calls[0][0])
		expect(event.patches).toEqual([
			set('gMultiple', ['valueType']),
			unset(['key']),
			unset(['gMultiplier']),
		])
		expect(props.renderInput).not.toHaveBeenCalled()
	})

	it('clears stale link fields when changing annotation type', () => {
		const props = {
			value: {
				linkType: 'route',
				route: '/pensjon/kalkulator/afp',
				href: 'https://nav.no',
				anchorId: 'old-heading',
				blank: true,
				className: 'nowrap',
			},
			onChange: vi.fn(),
			renderDefault: vi.fn(() => createElement('div')),
		} as unknown as ObjectInputProps
		const input = LinkAnnotationInput(props) as ReactElement<{
			value: (value: string) => void
		}>

		input.props.value('anchor')

		expect(
			PatchEvent.from(vi.mocked(props.onChange).mock.calls[0][0]).patches
		).toEqual([
			set('anchor', ['linkType']),
			unset(['href']),
			unset(['anchorId']),
			unset(['route']),
			set(false, ['blank']),
		])
	})

	it('does not add resets for fields absent from the object', () => {
		const { props, onTypeChange } = createObjectInput({ valueType: 'string' })
		onTypeChange('number')

		expect(
			PatchEvent.from(vi.mocked(props.onChange).mock.calls[0][0]).patches
		).toEqual([set('number', ['valueType'])])
	})

	it('removes legacy empty link fields without clearing the selected anchor', () => {
		const props = {
			value: { linkType: 'anchor', anchorId: 'heading', href: '', route: '' },
			onChange: vi.fn(),
			renderDefault: vi.fn(() => createElement('div')),
		} as unknown as ObjectInputProps
		LinkAnnotationInput(props)
		vi.mocked(useEffect).mock.calls.at(-1)?.[0]()

		expect(
			PatchEvent.from(vi.mocked(props.onChange).mock.calls[0][0]).patches
		).toEqual([unset(['href']), unset(['route'])])
	})

	it('removes legacy empty dropdown fields without clearing the selected key', () => {
		const { props } = createObjectInput({
			valueType: 'string',
			key: 'fornavn',
			gMultiplier: '',
		})
		vi.mocked(useEffect).mock.calls.at(-1)?.[0]()

		expect(
			PatchEvent.from(vi.mocked(props.onChange).mock.calls[0][0]).patches
		).toEqual([unset(['gMultiplier'])])
	})

	it('preserves Sanitys default render props and callbacks', () => {
		const { props } = createObjectInput({
			valueType: 'string',
		})

		expect(vi.mocked(props.renderDefault).mock.calls[0][0]).toBe(props)
		expect(props.renderInput).not.toHaveBeenCalled()
		expect(props.onChange).not.toHaveBeenCalled()
	})

	it('offers only schema choices inside the dialog and preserves the current choice', () => {
		const props = {
			value: 'string',
			elementProps: { id: 'valueType' },
			schemaType: {
				options: {
					list: [
						{ title: 'Tekst', value: 'string' },
						{ title: 'Tall', value: 'number' },
					],
				},
			},
			onChange: vi.fn(),
		} as unknown as StringInputProps
		const input = DynamicValueTypeInput(props) as ReactElement<MenuButtonProps>
		const menu = input.props.menu as ReactElement<{
			children: ReactElement<{ text: string; onClick: () => void }>[]
		}>
		const choices = menu.props.children

		expect(input.props.popover?.portal).toBe(false)
		expect(input.props.popover?.placement).toBe('bottom-start')
		expect(input.props.id).toBe(props.elementProps.id)
		expect(choices.map((choice) => choice.props.text)).toEqual([
			'Tekst',
			'Tall',
		])
		choices[0].props.onClick()
		expect(props.onChange).not.toHaveBeenCalled()
		choices[1].props.onClick()
		expect(props.onChange).toHaveBeenCalledWith(set('number'))

		const onTypeChange = vi.fn()
		vi.mocked(useContext).mockReturnValue(onTypeChange)
		vi.mocked(props.onChange).mockClear()
		const contextualInput = DynamicValueTypeInput(
			props
		) as ReactElement<MenuButtonProps>
		const contextualMenu = contextualInput.props.menu as ReactElement<{
			children: typeof choices
		}>
		const contextualChoices = contextualMenu.props.children
		contextualChoices[1].props.onClick()
		expect(onTypeChange).toHaveBeenCalledWith('number')
		expect(props.onChange).not.toHaveBeenCalled()
	})
})

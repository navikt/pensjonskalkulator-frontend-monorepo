import type { DialogProps, MenuButtonProps } from '@sanity/ui'
import {
	type ReactElement,
	type ReactNode,
	createElement,
	useContext,
	useState,
} from 'react'
import {
	type ArrayOfObjectsInputProps,
	type ObjectInputProps,
	PatchEvent,
	type StringInputProps,
	set,
} from 'sanity'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
	DynamicValueInput,
	DynamicValuePortableTextInput,
	DynamicValueTypeInput,
} from '../DynamicValueInput'

vi.mock('react', async (importOriginal) => ({
	...(await importOriginal<typeof import('react')>()),
	useContext: vi.fn(() => null),
	useEffect: vi.fn(),
	useId: vi.fn(() => 'dynamic-value-dialog'),
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
		expect(vi.mocked(props.renderDefault).mock.calls[0][0]).toBe(props)
		dialog.props.onClose?.()
		expect(setEditor).toHaveBeenCalledWith(null)
		expect(editor.onClose).toHaveBeenCalledOnce()
	})

	it('changes the type and clears existing sibling values through context', () => {
		const { props, onTypeChange } = createObjectInput({
			_type: 'dynamicValue',
			_key: 'inline-value',
			valueType: 'externalLink',
			key: 'alder',
			label: 'Old label',
			anchorId: 'old-anchor',
			url: 'https://nav.no',
			openInNewTab: true,
			gMultiplier: '2',
		})
		onTypeChange('internalLink')

		const event = PatchEvent.from(vi.mocked(props.onChange).mock.calls[0][0])
		expect(event.patches).toEqual([
			set('internalLink', ['valueType']),
			set('', ['key']),
			set('', ['label']),
			set('', ['anchorId']),
			set('', ['url']),
			set(false, ['openInNewTab']),
			set('', ['gMultiplier']),
		])
		expect(props.renderInput).not.toHaveBeenCalled()
	})

	it('does not add resets for fields absent from the object', () => {
		const { props, onTypeChange } = createObjectInput({ valueType: 'string' })
		onTypeChange('number')

		expect(
			PatchEvent.from(vi.mocked(props.onChange).mock.calls[0][0]).patches
		).toEqual([set('number', ['valueType'])])
	})

	it('preserves Sanitys default render props and callbacks', () => {
		const { props } = createObjectInput({
			valueType: 'internalLink',
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
						{ title: 'Intern lenke', value: 'internalLink' },
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
		expect(input.props.id).toBe(props.elementProps.id)
		expect(choices.map((choice) => choice.props.text)).toEqual([
			'Tekst',
			'Intern lenke',
		])
		choices[0].props.onClick()
		expect(props.onChange).not.toHaveBeenCalled()
		choices[1].props.onClick()
		expect(props.onChange).toHaveBeenCalledWith(set('internalLink'))

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
		expect(onTypeChange).toHaveBeenCalledWith('internalLink')
		expect(props.onChange).not.toHaveBeenCalled()
	})
})

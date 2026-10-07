import { type ObjectInputProps, PatchEvent, unset } from 'sanity'

const typeSpecificFields = [
	'key',
	'anchorId',
	'url',
	'openInNewTab',
	'gMultiplier',
] as const

export const DynamicValueInput = (props: ObjectInputProps) => {
	const handleChange: ObjectInputProps['onChange'] = (change) => {
		const patchEvent = PatchEvent.from(change)
		const changesValueType = patchEvent.patches.some(
			(patch) => patch.path[0] === 'valueType'
		)

		props.onChange(
			changesValueType
				? patchEvent.append(
						...typeSpecificFields.map((field) => unset([field]))
					)
				: patchEvent
		)
	}

	return props.renderDefault({ ...props, onChange: handleChange })
}

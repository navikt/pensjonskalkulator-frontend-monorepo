import { defineField } from 'sanity'

import {
	DynamicValueInlineEditor,
	DynamicValueInput,
	DynamicValuePortableTextInput,
	DynamicValueTypeInput,
} from '../../components/DynamicValueInput'

const isLinkValueParent = (parent: unknown) =>
	typeof parent === 'object' &&
	parent !== null &&
	'valueType' in parent &&
	(parent.valueType === 'internalLink' || parent.valueType === 'externalLink')

const isInternalLinkParent = (parent: unknown) =>
	typeof parent === 'object' &&
	parent !== null &&
	'valueType' in parent &&
	parent.valueType === 'internalLink'

const isExternalLinkParent = (parent: unknown) =>
	typeof parent === 'object' &&
	parent !== null &&
	'valueType' in parent &&
	parent.valueType === 'externalLink'

const isGMultipleParent = (parent: unknown) =>
	typeof parent === 'object' &&
	parent !== null &&
	'valueType' in parent &&
	parent.valueType === 'gMultiple'

export const languageField = defineField({
	title: 'Language',
	name: 'language',
	type: 'string',
	readOnly: true,
	hidden: true,
})

export const nameField = defineField({
	name: 'name',
	type: 'string',
	description: 'Denne brukes som ID i koden',
	validation: (rule) => rule.required().error('Påkrevd'),
})

export const overskriftField = defineField({
	name: 'overskrift',
	type: 'string',
	description: 'Overskrift',
})

export const innholdField = defineField({
	name: 'innhold',
	type: 'array',
	components: { input: DynamicValuePortableTextInput },
	of: [
		{
			type: 'block',
			styles: [
				{ title: 'Normal', value: 'normal' },
				{ title: 'Listetittel', value: 'listTitle' },
				{ title: 'Heading 1', value: 'h1' },
				{ title: 'Heading 2', value: 'h2' },
				{ title: 'Heading 3', value: 'h3' },
				{ title: 'Heading 4', value: 'h4' },
				{ title: 'Heading 5', value: 'h5' },
				{ title: 'Heading 6', value: 'h6' },
				{ title: 'Quote', value: 'blockquote' },
			],
			of: [
				{
					type: 'object',
					name: 'dynamicValue',
					title: 'Dynamisk verdi',
					components: {
						input: DynamicValueInput,
						inlineBlock: DynamicValueInlineEditor,
					},
					fields: [
						defineField({
							name: 'valueType',
							type: 'string',
							title: 'Type verdi',
							components: { input: DynamicValueTypeInput },
							options: {
								list: [
									{ title: 'Intern lenke', value: 'internalLink' },
									{ title: 'Ekstern lenke', value: 'externalLink' },
									{ title: 'Tekst', value: 'string' },
									{ title: 'Tall', value: 'number' },
									{ title: 'G-multiplum', value: 'gMultiple' },
								],
								layout: 'dropdown',
							},
							validation: (rule) => rule.required().error('Påkrevd'),
						}),
						defineField({
							name: 'key',
							type: 'string',
							title: 'Dynamisk verdi',
							description: 'Nøkkel i dynamicValues for tekst og tall.',
							hidden: ({ parent }) =>
								isLinkValueParent(parent) || isGMultipleParent(parent),
							options: {
								list: [
									{ title: 'Alder', value: 'alder' },
									{ title: 'Uttaksgrad', value: 'grad' },
									{
										title: 'Uttaksgrad ved gradert uttak',
										value: 'grad_gradert',
									},
									{ title: 'Alder ved gradert uttak', value: 'gradert_alder' },
									{ title: 'Dato for vedtak', value: 'vedtakDato' },
									{
										title: 'Tidligste endringsdato',
										value: 'tidligstEndringDato',
									},
									{
										title: 'Tidligste dato for endring av uttaksgrad',
										value: 'tidligst-endring-uttaksgrad-dato',
									},
									{ title: 'TP-ordning', value: 'tpOrdning' },
									{
										title: 'Minste månedsinntekt for AFP',
										value: 'afpMinsteMaanedsinntekt',
									},
									{ title: 'Fornavn', value: 'fornavn' },
									{ title: 'Fødselsdato', value: 'foedselsdato' },
									{ title: 'Mellomrom', value: 'nbsp' },
								],
								layout: 'dropdown',
							},
							validation: (rule) =>
								rule.custom((value, context) =>
									isLinkValueParent(context.parent) ||
									isGMultipleParent(context.parent) ||
									Boolean(value?.trim())
										? true
										: 'Dynamisk verdi er påkrevd'
								),
						}),
						defineField({
							name: 'gMultiplier',
							type: 'string',
							title: 'Grunnbeløpsfaktor',
							description: 'Velg hvor mange ganger grunnbeløpet skal brukes.',
							options: {
								list: [
									{ title: '1G', value: '1' },
									{ title: '2G', value: '2' },
									{ title: '3G', value: '3' },
								],
								layout: 'dropdown',
							},
							hidden: ({ parent }) => !isGMultipleParent(parent),
							validation: (rule) =>
								rule.custom((value, context) =>
									!isGMultipleParent(context.parent) || Boolean(value)
										? true
										: 'Grunnbeløpsfaktor er påkrevd'
								),
						}),
						defineField({
							name: 'label',
							type: 'string',
							title: 'Lenketekst',
							hidden: ({ parent }) => !isLinkValueParent(parent),
							validation: (rule) =>
								rule.custom((value, context) =>
									!isLinkValueParent(context.parent) || Boolean(value?.trim())
										? true
										: 'Lenketekst er påkrevd'
								),
						}),
						defineField({
							name: 'anchorId',
							type: 'string',
							title: 'ID på mål',
							description: 'ID på avsnittet eller elementet i appen, uten #.',
							hidden: ({ parent }) => !isInternalLinkParent(parent),
							validation: (rule) =>
								rule.custom((value, context) =>
									!isInternalLinkParent(context.parent) ||
									Boolean(value?.trim())
										? true
										: 'ID på anchor er påkrevd'
								),
						}),
						defineField({
							name: 'url',
							type: 'url',
							title: 'URL',
							hidden: ({ parent }) => !isExternalLinkParent(parent),
							validation: (rule) =>
								rule.custom((value, context) =>
									!isExternalLinkParent(context.parent) ||
									Boolean(value?.trim())
										? true
										: 'URL er påkrevd'
								),
						}),
						defineField({
							name: 'openInNewTab',
							type: 'boolean',
							title: 'Åpnes i ny fane',
							description:
								'Åpne lenken i en ny fane i stedet for i samme fane.',
							initialValue: false,
							hidden: ({ parent }) => !isLinkValueParent(parent),
						}),
					],
					preview: {
						prepare() {
							return { title: 'Dynamisk verdi' }
						},
					},
				},
			],
			marks: {
				annotations: [
					{
						name: 'link',
						type: 'object',
						title: 'Lenke',
						fields: [
							{
								name: 'href',
								type: 'url',
								title: 'URL',
								validation: (Rule) =>
									Rule.uri({
										scheme: ['http', 'https', 'mailto', 'tel'],
									}),
							},
							{
								name: 'blank',
								type: 'boolean',
								title: 'Åpnes i ny fane',
								description:
									'Ved å huke av denne boksen vil lenken vises med "external" ikon og åpnes i ny fane',
							},
							{
								name: 'className',
								type: 'string',
								title: 'CSS Class',
								description: 'Velg CSS-klasse for lenken',
								initialValue: '',
								options: {
									list: [
										{ title: 'Ingen', value: '' },
										{
											title: 'No Wrap (for telefonnummer, etc.)',
											value: 'nowrap',
										},
									],
									layout: 'dropdown',
								},
							},
						],
						preview: {
							select: { href: 'href', className: 'className' },
							prepare({
								href,
								className,
							}: {
								href?: string
								className?: string
							}) {
								return { title: href, subtitle: className }
							},
						},
					},
				],
			},
		},
	],
	validation: (rule) => rule.required().error('Påkrevd'),
})

export const tagField = defineField({
	name: 'tags',
	title: 'Tags',
	type: 'array',
	of: [{ type: 'reference', to: [{ type: 'tag' }] }],
	options: { layout: 'tags' },
})

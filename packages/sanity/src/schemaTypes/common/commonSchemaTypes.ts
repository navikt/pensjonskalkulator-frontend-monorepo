import { defineField } from 'sanity'

import {
	DynamicValueInlineEditor,
	DynamicValueInput,
	DynamicValuePortableTextInput,
	DynamicValueTypeInput,
	LinkAnnotationEditor,
	LinkAnnotationInput,
	LinkAnnotationTypeInput,
} from '../../components/DynamicValueInput'

const isGMultipleParent = (parent: unknown) =>
	typeof parent === 'object' &&
	parent !== null &&
	'valueType' in parent &&
	parent.valueType === 'gMultiple'

const getPortableTextLinkType = (parent: unknown) => {
	if (
		typeof parent === 'object' &&
		parent !== null &&
		'linkType' in parent &&
		(parent.linkType === 'anchor' || parent.linkType === 'route')
	) {
		return parent.linkType
	}
	return 'external'
}

const externalStepRoutes = [
	{ title: 'Start', value: '/pensjon/kalkulator/start' },
	{ title: 'Sivilstand', value: '/pensjon/kalkulator/sivilstand' },
	{ title: 'Utenlandsopphold', value: '/pensjon/kalkulator/utenlandsopphold' },
	{ title: 'AFP', value: '/pensjon/kalkulator/afp' },
	{ title: 'Uføretrygd og AFP', value: '/pensjon/kalkulator/ufoeretrygd-afp' },
	{
		title: 'Samtykke til offentlig AFP',
		value: '/pensjon/kalkulator/samtykke-offentlig-afp',
	},
	{
		title: 'Samtykke til pensjonsavtaler',
		value: '/pensjon/kalkulator/samtykke',
	},
	{ title: 'Beregning', value: '/pensjon/kalkulator/beregning' },
	{
		title: 'Detaljert beregning',
		value: '/pensjon/kalkulator/beregning-detaljert',
	},
]

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
							hidden: ({ parent }) => isGMultipleParent(parent),
							options: {
								list: [
									{ title: 'Valgt alder for uttak', value: 'alder' },
									{
										title: 'Normert pensjonsalder',
										value: 'normertPensjoneringsalder',
									},
									{
										title: 'Nedre aldersgrense (normert minus 5 år)',
										value: 'nedreAldersgrense',
									},
									{ title: 'Uttaksgrad fra vedtak', value: 'grad' },
									{
										title: 'Uttaksgrad ved gradert uttak - NAU',
										value: 'grad_gradert',
									},
									{
										title: 'Alder ved gradert uttak - NAU',
										value: 'gradert_alder',
									},
									{
										title: 'Alder ved helt uttak - NAU',
										value: 'helt_alder',
									},
									{ title: 'Dato for vedtak', value: 'vedtakDato' },
									{
										title: 'Tidligste endringsdato',
										value: 'tidligst-endring-ved-fremtidig-vedtak',
									},
									{
										title:
											'Tidligste dato for endring av uttaksgrad - 12 måneders regel',
										value: 'tidligst-endring-uttaksgrad-dato',
									},
									{ title: 'TP-ordning', value: 'tpOrdning' },
									{
										title: 'Minste månedsinntekt for AFP (1G/12)',
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
									isGMultipleParent(context.parent) || Boolean(value?.trim())
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
						components: {
							input: LinkAnnotationInput,
							annotation: LinkAnnotationEditor,
						},
						options: {
							modal: { type: 'dialog', width: 1 },
						},
						fields: [
							{
								name: 'linkType',
								type: 'string',
								title: 'Lenketype',
								components: { input: LinkAnnotationTypeInput },
								initialValue: 'external',
								options: {
									layout: 'dropdown',
									list: [
										{ title: 'Lenke til element på siden', value: 'anchor' },
										{ title: 'Stegvisning', value: 'route' },
										{ title: 'Ekstern lenke', value: 'external' },
									],
								},
							},
							{
								name: 'href',
								type: 'url',
								title: 'URL',
								hidden: ({ parent }) =>
									getPortableTextLinkType(parent) !== 'external',
								validation: (Rule) =>
									Rule.uri({
										scheme: ['http', 'https', 'mailto', 'tel'],
									}),
							},
							{
								name: 'anchorId',
								type: 'string',
								title: 'ID på mål',
								description: 'ID på elementet på siden, uten #.',
								hidden: ({ parent }) =>
									getPortableTextLinkType(parent) !== 'anchor',
								validation: (Rule) =>
									Rule.custom((value, context) =>
										getPortableTextLinkType(context.parent) !== 'anchor' ||
										(typeof value === 'string' && Boolean(value.trim()))
											? true
											: 'ID på mål er påkrevd'
									),
							},
							{
								name: 'route',
								type: 'string',
								title: 'Stegvisningsrute',
								description: 'Velg hvilket steg lenken skal åpne.',
								hidden: ({ parent }) =>
									getPortableTextLinkType(parent) !== 'route',
								options: { layout: 'dropdown', list: externalStepRoutes },
								validation: (Rule) =>
									Rule.custom((value, context) =>
										getPortableTextLinkType(context.parent) !== 'route' ||
										Boolean(value)
											? true
											: 'Velg et steg fra listen.'
									).error('Velg et steg fra listen.'),
							},
							{
								name: 'blank',
								type: 'boolean',
								title: 'Åpnes i ny fane',
								description:
									'Ved å huke av denne boksen vil lenken vises med "external" ikon og åpnes i ny fane',
								hidden: ({ parent }) =>
									getPortableTextLinkType(parent) !== 'external',
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

import { BookIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'

import { supportedLanguages } from '../supportedLanguages'
import {
	innholdField,
	languageField,
	nameField,
	overskriftField,
} from './common/commonSchemaTypes'
import { FORBEHOLD_VILKAAR_TAGS } from './forbeholdVilkaarTags'

export const forbeholdAvsnittType = defineType({
	name: 'forbeholdAvsnitt',
	title: 'ForbeholdAvsnitt',
	icon: BookIcon,
	type: 'document',
	preview: {
		select: {
			title: 'overskrift',
			subtitle: 'name',
			language: 'language',
		},
		prepare(selection) {
			return {
				...selection,
				title: `${selection.title} (${
					supportedLanguages.find((lang) => lang.id === selection.language)
						?.title
				})`,
			}
		},
	},
	fields: [
		languageField,
		nameField,
		defineField({
			...overskriftField,
			description: 'Overskrift til avsnittet',
		}),
		defineField({
			name: 'order',
			type: 'number',
			description: 'Rekkefølge på avsnittet',
		}),
		defineField({
			name: 'alltidSynlig',
			title: 'Alltid synlig (Kun intern)',
			description:
				'Når på, ignoreres vilkår-listen og avsnittet vises alltid i den interne kalkulatoren. Påvirker ikke ekstern (der vises avsnittet alltid hvis "Vis i ekstern kalkulator" er på).',
			type: 'boolean',
			initialValue: false,
		}),
		defineField({
			name: 'vilkaar',
			title: 'Vilkår for visning (Kun intern)',
			description:
				'Brukes kun i den interne kalkulatoren. I ekstern vises avsnittet alltid når "Vis i ekstern kalkulator" er på. Tom liste = avsnittet er alltid synlig. Hver regelgruppe må matche fullt ut (AND mellom betingelsene). Flere grupper kombineres med ELLER (OR). Hver betingelse kan inverteres med "negert" (EXCEPT).',
			type: 'array',
			hidden: ({ document }) => !!document?.alltidSynlig,
			of: [
				defineArrayMember({
					type: 'object',
					name: 'vilkaarGruppe',
					title: 'Regelgruppe (alle betingelser må være oppfylt)',
					fields: [
						defineField({
							name: 'betingelser',
							title: 'Betingelser (AND)',
							type: 'array',
							of: [
								defineArrayMember({
									type: 'object',
									name: 'forbeholdBetingelse',
									fields: [
										defineField({
											name: 'tag',
											title: 'Tag',
											type: 'string',
											options: {
												list: FORBEHOLD_VILKAAR_TAGS.map((t) => ({
													value: t.value,
													title: t.title,
												})),
											},
											validation: (rule) => rule.required(),
										}),
										defineField({
											name: 'negert',
											title: 'Negert (EXCEPT — matcher når tagen IKKE er sann)',
											type: 'boolean',
											initialValue: false,
										}),
									],
									preview: {
										select: { tag: 'tag', negert: 'negert' },
										prepare({
											tag,
											negert,
										}: {
											tag?: string
											negert?: boolean
										}) {
											const label =
												FORBEHOLD_VILKAAR_TAGS.find((t) => t.value === tag)
													?.title ??
												tag ??
												'(velg tag)'
											return {
												title: negert ? `IKKE ${label}` : label,
											}
										},
									},
								}),
							],
							validation: (rule) =>
								rule
									.required()
									.min(1)
									.error('Legg til minst én betingelse, eller fjern gruppen'),
						}),
					],
					preview: {
						select: { betingelser: 'betingelser' },
						prepare({
							betingelser,
						}: {
							betingelser?: { tag?: string; negert?: boolean }[]
						}) {
							const items = betingelser ?? []
							const labels = items.map((b) => {
								const label =
									FORBEHOLD_VILKAAR_TAGS.find((t) => t.value === b.tag)
										?.title ??
									b.tag ??
									'?'
								return b.negert ? `IKKE ${label}` : label
							})
							const title =
								labels.length === 0
									? 'Tom regelgruppe — klikk for å legge til betingelser'
									: `Hvis ${labels.join(' OG ')}`
							const subtitle =
								items.length <= 1
									? 'AND-gruppe — klikk for å legge til flere betingelser'
									: `AND-gruppe (${items.length} betingelser)`
							return { title, subtitle }
						},
					},
				}),
			],
		}),
		defineField({
			name: 'visEkstern',
			title: 'Vis i ekstern kalkulator',
			type: 'boolean',
			description:
				'Slå av/på om avsnittet skal vises i den eksterne kalkulatoren',
			initialValue: true,
		}),
		defineField({
			...innholdField,
			name: 'innholdEkstern',
			title: 'Ekstern innhold',
			description: 'Innhold som vises i den eksterne kalkulatoren.',
			hidden: ({ document }) => !document?.visEkstern,
			validation: (rule) =>
				rule.custom((value, context) => {
					const doc = context.document as { visEkstern?: boolean } | undefined
					if (doc?.visEkstern && (!value || value.length === 0)) {
						return 'Påkrevd når avsnittet vises i ekstern kalkulator'
					}
					return true
				}),
		}),
		defineField({
			name: 'visIntern',
			title: 'Vis i intern kalkulator',
			type: 'boolean',
			description:
				'Slå av/på om avsnittet skal vises i den interne kalkulatoren',
			initialValue: true,
		}),
		defineField({
			...innholdField,
			name: 'innholdIntern',
			title: 'Intern innhold',
			description: 'Innhold som vises i den interne kalkulatoren.',
			hidden: ({ document }) => !document?.visIntern,
			validation: (rule) =>
				rule.custom((value, context) => {
					const doc = context.document as { visIntern?: boolean } | undefined
					if (doc?.visIntern && (!value || value.length === 0)) {
						return 'Påkrevd når avsnittet vises i intern kalkulator'
					}
					return true
				}),
		}),
	],
})

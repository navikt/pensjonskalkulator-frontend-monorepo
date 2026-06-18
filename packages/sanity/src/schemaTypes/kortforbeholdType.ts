import { DocumentTextIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

import { supportedLanguages } from '../supportedLanguages'
import {
	innholdField,
	languageField,
	nameField,
} from './common/commonSchemaTypes'

export const kortforbeholdType = defineType({
	name: 'kortforbehold',
	title: 'Kortforbehold',
	icon: DocumentTextIcon,
	type: 'document',
	preview: {
		select: {
			title: 'name',
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
			...innholdField,
			description:
				'Den korte forbeholdsteksten som vises under beregningen. Vedlikeholdes her slik at den kun oppdateres ett sted.',
		}),
	],
})

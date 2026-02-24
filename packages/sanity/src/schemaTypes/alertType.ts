import { BellIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

import TaggedDocumentPreview from '../components/taggedDocumentPreview/TaggedDocumentPreview'
import { prepareTaggedDocumentPreview } from '../components/taggedDocumentPreview/prepareTaggedDocumentPreview'
import {
	innholdField,
	languageField,
	nameField,
	overskriftField,
	tagField,
} from './common/commonSchemaTypes'

export const alertType = defineType({
	name: 'alert',
	title: 'Alert',
	icon: BellIcon,
	type: 'document',
	preview: {
		select: {
			title: 'overskrift',
			subtitle: 'name',
			language: 'language',
			tags: 'tags',
		},
		prepare: prepareTaggedDocumentPreview,
	},
	components: {
		preview: TaggedDocumentPreview,
	},
	fields: [
		languageField,
		nameField,
		defineField({
			name: 'type',
			type: 'string',
			title: 'Type',
			description:
				'Velg komponenttype: GlobalAlert (hele løsningen), LocalAlert (del av siden), InfoCard (fremhevet info), InlineMessage (kort statusmelding)',
			initialValue: 'local-alert',
			options: {
				list: [
					{ title: 'GlobalAlert', value: 'global-alert' },
					{ title: 'LocalAlert', value: 'local-alert' },
					{ title: 'InfoCard', value: 'info-card' },
					{ title: 'InlineMessage', value: 'inline-message' },
				],
				layout: 'radio',
			},
			validation: (rule) => rule.required().error('Påkrevd'),
		}),
		defineField({
			name: 'status',
			type: 'string',
			title: 'Status',
			description: 'Alvorlighetsgrad. For InfoCard styrer dette fargetemaet.',
			initialValue: 'info',
			options: {
				list: [
					{ title: 'Info', value: 'info' },
					{ title: 'Success', value: 'success' },
					{ title: 'Warning', value: 'warning' },
					{ title: 'Error', value: 'error' },
				],
				layout: 'radio',
			},
			validation: (rule) => rule.required().error('Påkrevd'),
		}),
		defineField({
			...overskriftField,
			description: 'Valgfri overskrift. Brukes ikke for InlineMessage.',
		}),
		defineField({
			...innholdField,
			description: 'Innholdet i varselet/meldingen',
		}),
		tagField,
	],
})

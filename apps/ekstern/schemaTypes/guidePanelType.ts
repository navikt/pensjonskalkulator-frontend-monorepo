import { HelpCircleIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

import {
  innholdField,
  languageField,
  nameField,
  overskriftField,
} from './common/commonSchemaTypes'
import { supportedLanguages } from './supportedLanguages'

export const guidePanelType = defineType({
  name: 'guidepanel',
  title: 'GuidePanel',
  icon: HelpCircleIcon,
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
      description: 'Valgfri overskrift',
    }),
    innholdField,
  ],
})

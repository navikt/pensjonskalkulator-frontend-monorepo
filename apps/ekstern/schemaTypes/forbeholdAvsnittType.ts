import { BookIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

import {
  innholdField,
  languageField,
  nameField,
  overskriftField,
} from './common/commonSchemaTypes'
import { supportedLanguages } from './supportedLanguages'

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
      ...innholdField,
      description: 'Selve avsnittet.',
    }),
  ],
})

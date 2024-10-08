import { DoubleChevronDownIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

import { supportedLanguages } from './supportedLanguages'

export const readmoreType = defineType({
  name: 'readmore',
  title: 'ReadMore',
  icon: DoubleChevronDownIcon,
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
    defineField({
      title: 'Language',
      name: 'language',
      type: 'string',
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: 'name',
      type: 'string',
      description: 'Denne brukes som ID i koden',
      validation: (rule) => rule.required().error(`Påkrevd`),
    }),
    defineField({
      name: 'overskrift',
      type: 'string',
      description: 'Tekst på ReadMore header (knappen som åpner og lukker)',
    }),
    defineField({
      name: 'innhold',
      type: 'array',
      of: [{ type: 'riktekst' }],
      description: 'Avsnitt(ene) i ReadMore. Vises når ReadMore er åpent.',
    }),
  ],
})

// https://www.sanity.io/learn/course/day-one-with-sanity-studio/custom-form-components

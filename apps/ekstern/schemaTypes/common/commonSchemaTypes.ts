import { defineField } from 'sanity'

import { NameFieldWithWarning } from '../components/NameFieldWithWarning'

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
  readOnly: ({ document }) => {
    if (!document?._createdAt) return false

    const createdAt = new Date(document._createdAt)
    const now = new Date()
    const fiveMinutesInMs = 5 * 60 * 1000

    return now.getTime() - createdAt.getTime() > fiveMinutesInMs
  },
  components: {
    field: NameFieldWithWarning,
  },
})

export const overskriftField = defineField({
  name: 'overskrift',
  type: 'string',
  description: 'Overskrift',
})

export const innholdField = defineField({
  name: 'innhold',
  type: 'array',
  of: [
    {
      type: 'block',
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
              },
              {
                name: 'blank',
                type: 'boolean',
                title: 'Åpnes i ny fane',
                description:
                  'Ved å huke av denne boksen vil lenken vises med "external" ikon og åpnes i ny fane',
              },
            ],
          },
        ],
      },
    },
  ],
  validation: (rule) => rule.required().error('Påkrevd'),
})

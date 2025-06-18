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
              select: {
                href: 'href',
                className: 'className',
              },
              prepare({
                href,
                className,
              }: {
                href?: string
                className?: string
              }) {
                return {
                  title: href,
                  subtitle: className,
                }
              },
            },
          },
        ],
      },
    },
  ],
  validation: (rule) => rule.required().error('Påkrevd'),
})

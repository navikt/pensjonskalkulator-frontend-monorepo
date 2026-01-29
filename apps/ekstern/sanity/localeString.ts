import { defineField, defineType } from 'sanity'

import { supportedLanguages } from './supportedLanguages'

export const LocaleString = defineType({
  title: 'Localized string',
  name: 'localeString',
  type: 'object',
  fieldsets: [
    {
      title: 'Translations',
      name: 'translations',
      options: {
        collapsible: true,
      },
    },
  ],
  fields: supportedLanguages.map((lang) =>
    defineField({
      title: lang.title,
      name: lang.id,
      type: 'string',
      fieldset: lang.isDefault ? undefined : 'translations',
    })
  ),
})

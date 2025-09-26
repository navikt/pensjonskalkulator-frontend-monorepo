import { InfoOutlineIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

import {
  innholdField,
  languageField,
  nameField,
  overskriftField,
  tagField,
} from './common/commonSchemaTypes'
import TaggedDocumentPreview from './components/TaggedDocumentPreview'
import { prepareTaggedDocumentPreview } from './components/prepareTaggedDocumentPreview'

export const readmoreType = defineType({
  name: 'readmore',
  title: 'ReadMore',
  icon: InfoOutlineIcon,
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
      ...overskriftField,
      description: 'Tekst på ReadMore header (knappen som åpner og lukker)',
    }),
    defineField({
      ...innholdField,
      description: 'Avsnitt(ene) i ReadMore. Vises når ReadMore er åpent.',
    }),
    tagField,
  ],
})

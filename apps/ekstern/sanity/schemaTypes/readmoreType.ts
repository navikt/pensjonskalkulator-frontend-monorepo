import { InfoOutlineIcon } from '@sanity/icons'
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

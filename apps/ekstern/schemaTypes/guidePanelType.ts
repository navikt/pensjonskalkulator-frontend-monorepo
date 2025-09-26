import { HelpCircleIcon } from '@sanity/icons'
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
      description: 'Valgfri overskrift',
    }),
    innholdField,
    tagField,
  ],
})

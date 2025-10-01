import { TagsIcon } from '@sanity/icons'
import { createElement } from 'react'
import { defineField, defineType } from 'sanity'

import {
  languageField,
  nameField,
  overskriftField,
} from './common/commonSchemaTypes'

interface ColorValue {
  _type: 'color'
  hex: string
}

export const tagType = defineType({
  name: 'tag',
  title: 'Tag',
  icon: TagsIcon,
  type: 'document',
  preview: {
    select: {
      title: 'overskrift',
      subtitle: 'name',
      language: 'language',
      color: 'color',
    },
    prepare(selection: {
      title?: string
      subtitle?: string
      language?: string
      color?: ColorValue
    }) {
      const colorHex = selection.color?.hex ? selection.color.hex : undefined

      return {
        title: selection.title || selection.subtitle || 'Tag',
        subtitle: selection.language,
        media: colorHex
          ? () =>
              createElement('span', {
                style: {
                  display: 'inline-block',
                  width: '1.5rem',
                  height: '1.5rem',
                  borderRadius: '999px',
                  background: colorHex,
                  border: '1px solid rgba(0, 0, 0, 0.15)',
                },
              })
          : TagsIcon,
      }
    },
  },
  fields: [
    languageField,
    {
      ...nameField,
      initialValue: 'ny-tag',
    },
    defineField({
      ...overskriftField,
      description: 'Valgfri overskrift',
      initialValue: 'Ny tag',
    }),
    defineField({
      name: 'color',
      title: 'Farge',
      type: 'color',
    }),
  ],
})

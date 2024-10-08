import { defineField, defineType } from 'sanity'

export const forbeholdAvsnittType = defineType({
  name: 'forbeholdAvsnitt',
  title: 'ForbeholdAvsnitt',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      type: 'string',
    }),
    // TODO vurdere å ha "personopplysninger" og "forbehold" som lenker til type "avsnitt" (header/riktekst)
    // defineField({
    //   name: 'headline',
    //   type: 'reference',
    //   to: [{ type: 'readmore' }],
    // }),
  ],
})

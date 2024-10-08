import { defineField, defineType } from 'sanity'

export const RikTekst = defineType({
  type: 'block',
  name: 'riktekst',
  styles: [{ title: 'Normal', value: 'normal' }],
  lists: [{ title: 'Punktliste', value: 'bullet' }],
  marks: {
    decorators: [
      { title: 'Fet', value: 'strong' },
      { title: 'Kursiv', value: 'em' },
      { title: 'Understrek', value: 'underline' },
    ],
    annotations: [],
  },
  // TODO denne må tåle custom lenker
  //   of: [
  //     defineField({
  //       type: 'reference',
  //       title: 'Referanse til variabel',
  //       name: 'faktagrunnlag',
  //       to: [{ type: 'faktagrunnlag' }],
  //     }),
  //   ],
})

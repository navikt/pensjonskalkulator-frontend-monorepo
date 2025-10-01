import { TagsIcon } from '@sanity/icons'
import {
  type ListItemBuilder,
  type StructureResolver,
  type StructureResolverContext,
} from 'sanity/structure'

const TAGGED_DOCUMENT_TYPES = ['guidepanel', 'readmore'] as const

type TaggedDocumentType = (typeof TAGGED_DOCUMENT_TYPES)[number]

type DocumentListParams = {
  type: TaggedDocumentType
  tagId: string
}

const stripDraftPrefix = (documentId: string): string =>
  documentId.startsWith('drafts.')
    ? documentId.slice('drafts.'.length)
    : documentId

const buildTaggedDocumentListItem = (
  S: Parameters<StructureResolver>[0],
  title: string,
  typeName: TaggedDocumentType,
  tagId: string
) =>
  S.listItem()
    .title(title)
    .schemaType(typeName)
    .child(
      S.documentList()
        .title(title)
        .schemaType(typeName)
        .filter('_type == $type && references($tagId)')
        .params({ type: typeName, tagId } satisfies DocumentListParams)
    )

const createTaggedDocumentListItems = (
  S: Parameters<StructureResolver>[0],
  schema: StructureResolverContext['schema'],
  tagId: string
): ListItemBuilder[] =>
  TAGGED_DOCUMENT_TYPES.flatMap((typeName) => {
    const schemaType = schema.get(typeName) as
      | { name?: string; title?: string }
      | undefined
    if (!schemaType) return []

    const title = schemaType.title ?? schemaType.name ?? typeName
    return [buildTaggedDocumentListItem(S, title, typeName, tagId)]
  })

export const deskStructure: StructureResolver = (S, context) => {
  const { schema } = context
  const documentTypeItems = S.documentTypeListItems()
  type DividerType = ReturnType<typeof S.divider>

  const tagDocumentChild = (documentId?: string | null) => {
    if (!documentId) {
      return S.document().schemaType('tag')
    }

    if (documentId.startsWith('__i18n_')) {
      return S.document().schemaType('tag').documentId(documentId)
    }

    const tagId = stripDraftPrefix(documentId)

    const tagEditor = S.document().schemaType('tag').documentId(documentId)
    const taggedDocumentItems = createTaggedDocumentListItems(S, schema, tagId)

    const items: Array<ListItemBuilder | DividerType> = [
      S.listItem().title('Rediger tag').icon(TagsIcon).child(tagEditor),
    ]

    if (taggedDocumentItems.length > 0) {
      items.push(S.divider(), ...taggedDocumentItems)
    }

    return S.list().title('Taggoversikt').items(items)
  }

  const tagsListItem = S.listItem()
    .title('Tags')
    .icon(TagsIcon)
    .schemaType('tag')
    .child(S.documentTypeList('tag').title('Tags').child(tagDocumentChild))

  const filteredDocumentTypeItems = documentTypeItems.filter((listItem) => {
    return listItem.getId() !== 'tag'
  })

  const rootItems: Array<ListItemBuilder | DividerType> = [
    tagsListItem,
    S.divider(),
    ...filteredDocumentTypeItems,
  ]

  return S.list().title('Content').items(rootItems)
}

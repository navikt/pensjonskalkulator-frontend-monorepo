import { supportedLanguages } from '../supportedLanguages'

type TaggedPreviewSelection = {
  title?: string
  subtitle?: string
  language?: string
  tags?: unknown
}

export const prepareTaggedDocumentPreview = (
  selection: TaggedPreviewSelection
) => {
  const languageTitle = supportedLanguages.find(
    (lang) => lang.id === selection.language
  )?.title

  const displayLanguage = languageTitle ?? selection.language ?? 'Ukjent språk'
  const displayTitle = selection.title
    ? `${selection.title} (${displayLanguage})`
    : displayLanguage

  return {
    subtitle: selection.subtitle,
    language: selection.language,
    title: displayTitle,
    tags: selection.tags,
  }
}

export type { TaggedPreviewSelection }

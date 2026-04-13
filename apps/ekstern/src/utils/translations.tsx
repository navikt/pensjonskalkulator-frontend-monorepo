import React from 'react'

import { ExternalLink } from '@/components/common/ExternalLink'
import { externalUrls } from '@/router/constants'

export const externalLinks = [
  'detaljertKalkulator',
  'dinPensjonBeholdning',
  'dinPensjonEndreSoeknad',
  'alderspensjonsregler',
  'garantiPensjon',
  'afp',
  'afpPrivat',
  'norskPensjon',
  'navPersonvernerklaering',
  'navPersonvernerklaeringKontaktOss',
  'kontaktOss',
  'planleggePensjon',
  'trygdetid',
  'kortBotid',
  'ufoeretrygdOgAfp',
  'personopplysninger',
  'spk',
  'klp',
] satisfies (keyof typeof externalUrls)[]

const keyedChildren = (chunks: React.ReactNode): React.ReactNode =>
  Array.isArray(chunks)
    ? chunks.map((chunk, i) => <React.Fragment key={i}>{chunk}</React.Fragment>)
    : chunks

const externalLinkComponents = Object.fromEntries(
  externalLinks.map((key) => [
    `${key}Link`,
    (chunks: React.ReactNode) => (
      <ExternalLink href={externalUrls[key]}>
        {keyedChildren(chunks)}
      </ExternalLink>
    ),
  ])
)

export const getFormatMessageValues = (): Record<
  string,
  React.ReactNode | ((chunks: React.ReactNode) => React.ReactNode)
> => {
  return {
    ...externalLinkComponents,
    br: <br />,
    strong: (chunks: React.ReactNode) => (
      <strong>{keyedChildren(chunks)}</strong>
    ),
    nowrap: (chunks: React.ReactNode) => (
      <span className="nowrap">{keyedChildren(chunks)}</span>
    ),
    span: (chunks: React.ReactNode) => (
      <span style={{ marginTop: 16, display: 'block' }}>
        {keyedChildren(chunks)}
      </span>
    ),
  }
}

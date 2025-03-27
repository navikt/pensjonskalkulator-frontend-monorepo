import React from 'react'
import { useIntl } from 'react-intl'

import { GuidePanel, Heading } from '@navikt/ds-react'
import { PortableText } from '@portabletext/react'

import { SanityContext } from '@/context/SanityContext'
import { getSanityPortableTextComponents } from '@/utils/sanity'

interface Props {
  id: string
  className?: string
  children?: React.ReactNode
}

export const SanityGuidePanel = ({ id, className, children }: Props) => {
  const intl = useIntl()
  const { guidePanelData } = React.useContext(SanityContext)
  const sanityContent = guidePanelData[id]

  if (!sanityContent) {
    return null
  }

  return (
    <GuidePanel poster className={className} data-testid={sanityContent.name}>
      {sanityContent.overskrift && (
        <Heading level="2" size="medium">
          {sanityContent.overskrift}
        </Heading>
      )}

      <PortableText
        value={sanityContent.innhold}
        components={getSanityPortableTextComponents(intl)}
      />

      {children}
    </GuidePanel>
  )
}

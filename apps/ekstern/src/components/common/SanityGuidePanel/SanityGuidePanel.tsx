import { PortableText } from '@portabletext/react'
import { ReactNode, useContext } from 'react'
import { useIntl } from 'react-intl'

import { GuidePanel, Heading } from '@navikt/ds-react'

import { SanityContext } from '@/context/SanityContext'
import { getSanityPortableTextComponents } from '@/utils/sanity'

import styles from './SanityGuidePanel.module.scss'

interface Props {
  id: string
  className?: string
  children?: ReactNode
  hasSection?: boolean
}

export const SanityGuidePanel = ({
  id,
  className,
  children,
  hasSection = false,
}: Props) => {
  const intl = useIntl()
  const { guidePanelData } = useContext(SanityContext)
  const sanityContent = guidePanelData[id]

  if (!sanityContent) {
    return null
  }

  const guidePanel = (
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

  if (hasSection) {
    return <section className={styles.section}>{guidePanel}</section>
  }

  return guidePanel
}

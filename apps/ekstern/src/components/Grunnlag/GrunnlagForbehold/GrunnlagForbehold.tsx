import { FormattedMessage } from 'react-intl'
import { Link as ReactRouterLink } from 'react-router-dom'

import { ExternalLinkIcon } from '@navikt/aksel-icons'
import { BodyLong, Heading, Link } from '@navikt/ds-react'

import { paths } from '@/router'

import styles from './GrunnlagForbehold.module.scss'

export function GrunnlagForbehold() {
  return (
    <section className={styles.section}>
      <Heading level="2" size="medium" className={styles.heading}>
        <FormattedMessage id="grunnlag.forbehold.title" />
      </Heading>
      <BodyLong className={styles.text}>
        <FormattedMessage id="grunnlag.forbehold.ingress" />
      </BodyLong>
      <Link
        as={ReactRouterLink}
        to={paths.forbehold}
        target="_blank"
        inlineText
      >
        <FormattedMessage id="grunnlag.forbehold.link" />
        <ExternalLinkIcon width="1.25rem" height="1.25rem" aria-hidden />
      </Link>
    </section>
  )
}

import { FormattedMessage } from 'react-intl'
import { Link as ReactRouterLink } from 'react-router-dom'

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
      <Link as={ReactRouterLink} to={paths.forbehold}>
        Alle forbehold
      </Link>
    </section>
  )
}

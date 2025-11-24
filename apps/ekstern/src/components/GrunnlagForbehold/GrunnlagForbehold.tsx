import { FormattedMessage, useIntl } from 'react-intl'

import { ExternalLinkIcon } from '@navikt/aksel-icons'
import { BodyLong, Heading, HeadingProps, Link } from '@navikt/ds-react'

import { paths } from '@/router/constants'
import { LINK_AAPNET, LINK_AAPNET_OLD } from '@/utils/loggerConstants'
import { logger } from '@/utils/logging'

import styles from './GrunnlagForbehold.module.scss'

interface Props {
  headingLevel: HeadingProps['level']
}

export const GrunnlagForbehold = ({ headingLevel }: Props) => {
  const intl = useIntl()
  const isVeileder = location.pathname.startsWith(
    '/pensjon/kalkulator/veileder'
  )
  const basePath = isVeileder
    ? '/pensjon/kalkulator/veileder'
    : '/pensjon/kalkulator'

  const href = isVeileder
    ? `${basePath}${paths.forbehold}?redirect=${encodeURIComponent(`${basePath}${paths.forbehold}`)}`
    : `${basePath}${paths.forbehold}`

  return (
    <section className={styles.section}>
      <Heading
        level={headingLevel}
        size="medium"
        className={styles.heading}
        data-testid="forbehold-heading"
      >
        <FormattedMessage id="grunnlag.forbehold.title" />
      </Heading>

      <BodyLong className={styles.text}>
        <FormattedMessage id="grunnlag.forbehold.ingress_1" />
        <Link
          href={href}
          rel="noopener noreferrer"
          target="_blank"
          inlineText
          onClick={() => {
            logger(LINK_AAPNET, {
              href,
              target: '_blank',
            })
            logger(LINK_AAPNET_OLD, {
              href,
              target: '_blank',
            })
          }}
        >
          <FormattedMessage id="grunnlag.forbehold.link" />
          <ExternalLinkIcon
            title={intl.formatMessage({
              id: 'application.global.external_link',
            })}
            width="1.25rem"
            height="1.25rem"
          />
        </Link>
      </BodyLong>
    </section>
  )
}

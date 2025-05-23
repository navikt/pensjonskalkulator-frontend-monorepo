import { FormattedMessage, useIntl } from 'react-intl'
import { Link as ReactRouterLink } from 'react-router'

import { ExternalLinkIcon } from '@navikt/aksel-icons'
import { BodyLong, Heading, HeadingProps, Link } from '@navikt/ds-react'

import { paths } from '@/router/constants'

import styles from './GrunnlagForbehold.module.scss'

interface Props {
  headingLevel: HeadingProps['level']
}

export const GrunnlagForbehold = ({ headingLevel }: Props) => {
  const intl = useIntl()

  return (
    <section className={styles.section}>
      <Heading level={headingLevel} size="medium" className={styles.heading}>
        <FormattedMessage id="grunnlag.forbehold.title" />
      </Heading>

      <BodyLong className={styles.text}>
        <FormattedMessage id="grunnlag.forbehold.ingress_1" />
        <Link
          as={ReactRouterLink}
          to={paths.forbehold}
          target="_blank"
          inlineText
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

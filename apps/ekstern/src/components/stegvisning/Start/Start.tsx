import React from 'react'
import { useIntl, FormattedMessage } from 'react-intl'
import { Link as ReactRouterLink, useNavigate } from 'react-router-dom'

import { ExternalLinkIcon } from '@navikt/aksel-icons'
import { BodyLong, Button, Heading, Link } from '@navikt/ds-react'

import FridaPortrett from '../../../assets/frida.svg'
import { Card } from '@/components/common/Card'
import { paths } from '@/router/constants'
import { logOpenLink, wrapLogger } from '@/utils/logging'

import styles from './Start.module.scss'

interface Props {
  shouldRedirectTo?: string
  navn: string
  onCancel?: () => void
  onNext: () => void
}

export function Start({ shouldRedirectTo, navn, onCancel, onNext }: Props) {
  const intl = useIntl()
  const navigate = useNavigate()
  const navnString = navn !== '' ? ` ${navn}!` : '!'

  React.useEffect(() => {
    if (shouldRedirectTo) {
      navigate(shouldRedirectTo)
    }
  }, [shouldRedirectTo])

  if (shouldRedirectTo) {
    return null
  }

  return (
    <Card hasLargePadding hasMargin>
      <div className={styles.wrapper}>
        <img className={styles.image} src={FridaPortrett} alt="" />
        <div className={styles.wrapperText}>
          <Heading level="2" size="medium" spacing>
            {`${intl.formatMessage({
              id: 'stegvisning.start.title',
            })}${navnString}`}
          </Heading>
          <BodyLong size="large">
            <FormattedMessage id="stegvisning.start.ingress" />
          </BodyLong>
          <ul className={styles.list}>
            <li>
              <BodyLong size="large">
                <span
                  className={`${styles.ellipse} ${styles.ellipse__blue}`}
                ></span>
                <FormattedMessage id="stegvisning.start.list_item1" />
              </BodyLong>
            </li>
            <li>
              <BodyLong size="large">
                <span
                  className={`${styles.ellipse} ${styles.ellipse__purple}`}
                ></span>
                <FormattedMessage id="stegvisning.start.list_item2" />{' '}
              </BodyLong>
            </li>
            <li>
              <BodyLong size="large">
                <span
                  className={`${styles.ellipse} ${styles.ellipse__green}`}
                ></span>
                <FormattedMessage id="stegvisning.start.list_item3" />{' '}
              </BodyLong>
            </li>
          </ul>
          <BodyLong size="large">
            <FormattedMessage id="stegvisning.start.ingress_2" />
          </BodyLong>
          <Button
            type="submit"
            className={styles.button}
            onClick={wrapLogger('button klikk', { tekst: 'Kom i gang' })(
              onNext
            )}
          >
            <FormattedMessage id="stegvisning.start.button" />
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="tertiary"
              onClick={wrapLogger('button klikk', { tekst: 'Avbryt' })(
                onCancel
              )}
            >
              <FormattedMessage id="stegvisning.avbryt" />
            </Button>
          )}
        </div>
      </div>
      <Link
        onClick={logOpenLink}
        className={styles.link}
        as={ReactRouterLink}
        to={paths.personopplysninger}
        target="_blank"
        inlineText
      >
        <FormattedMessage id="stegvisning.start.link" />
        <ExternalLinkIcon
          title={intl.formatMessage({
            id: 'application.global.external_link',
          })}
          width="1.25rem"
          height="1.25rem"
        />
      </Link>
    </Card>
  )
}

import React from 'react'
import { useIntl, FormattedMessage } from 'react-intl'
import { useNavigate } from 'react-router'

import { ExternalLinkIcon } from '@navikt/aksel-icons'
import { BodyLong, Button, Heading, Link } from '@navikt/ds-react'

import FridaPortrett from '../../../assets/frida.svg'
import { Card } from '@/components/common/Card'
import { InfoOmFremtidigVedtak } from '@/components/InfoOmFremtidigVedtak'
import { externalUrls } from '@/router/constants'
import { isLoependeVedtakEndring } from '@/utils/loependeVedtak'
import { logOpenLink, wrapLogger } from '@/utils/logging'
import { getFormatMessageValues } from '@/utils/translations'

import styles from './Start.module.scss'

interface Props {
  shouldRedirectTo?: string
  navn: string
  loependeVedtak?: LoependeVedtak
  onCancel?: () => void
  onNext?: () => void
}

export function Start({
  shouldRedirectTo,
  navn,
  loependeVedtak,
  onCancel,
  onNext,
}: Props) {
  const intl = useIntl()
  const navigate = useNavigate()

  React.useEffect(() => {
    if (shouldRedirectTo) {
      navigate(shouldRedirectTo)
    }
  }, [shouldRedirectTo])

  if (shouldRedirectTo) {
    return null
  }

  return (
    <>
      <InfoOmFremtidigVedtak loependeVedtak={loependeVedtak} isCentered />

      <Card hasLargePadding hasMargin>
        <div className={styles.wrapper}>
          <img className={styles.image} src={FridaPortrett} alt="" />
          <div className={styles.wrapperText}>
            <Heading level="2" size="medium" spacing>
              {`${intl.formatMessage({
                id: 'stegvisning.start.title',
              })} ${navn}!`}
            </Heading>

            {loependeVedtak && isLoependeVedtakEndring(loependeVedtak) ? (
              <>
                <BodyLong size="large">
                  <FormattedMessage
                    id="stegvisning.start.endring.ingress"
                    values={{
                      ...getFormatMessageValues(),
                      grad: loependeVedtak.alderspensjon?.grad,
                      ufoeretrygd: loependeVedtak.ufoeretrygd.grad
                        ? intl.formatMessage(
                            {
                              id: 'stegvisning.start.endring.ufoeretrygd',
                            },
                            {
                              ...getFormatMessageValues(),
                              grad: loependeVedtak.ufoeretrygd.grad,
                            }
                          )
                        : undefined,
                      afpPrivat: loependeVedtak.afpPrivat
                        ? intl.formatMessage(
                            {
                              id: 'stegvisning.start.endring.afp.privat',
                            },
                            { ...getFormatMessageValues() }
                          )
                        : undefined,
                      afpOffentlig: loependeVedtak.afpOffentlig
                        ? intl.formatMessage(
                            {
                              id: 'stegvisning.start.endring.afp.offentlig',
                            },
                            { ...getFormatMessageValues() }
                          )
                        : undefined,
                    }}
                  />
                </BodyLong>
                <BodyLong size="medium">
                  <FormattedMessage id="stegvisning.start.endring.ingress_2" />
                </BodyLong>
              </>
            ) : (
              <>
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
              </>
            )}

            {onNext && (
              <Button
                type="submit"
                className={styles.button}
                onClick={wrapLogger('button klikk', {
                  tekst: 'Kom i gang',
                })(onNext)}
              >
                <FormattedMessage id="stegvisning.start.button" />
              </Button>
            )}
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
          href={externalUrls.personopplysninger}
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
    </>
  )
}

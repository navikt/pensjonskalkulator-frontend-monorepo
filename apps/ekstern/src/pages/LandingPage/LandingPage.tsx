import clsx from 'clsx'
import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useNavigate } from 'react-router'

import { ExternalLinkIcon } from '@navikt/aksel-icons'
import {
  BodyLong,
  Button,
  HStack,
  Heading,
  Link,
  VStack,
} from '@navikt/ds-react'

import { externalUrls, paths } from '@/router/constants'
import { useAppSelector } from '@/state/hooks'
import { selectIsLoggedIn } from '@/state/session/selectors'
import { BUTTON_KLIKK } from '@/utils/loggerConstants'
import { logOpenLink, wrapLogger } from '@/utils/logging'

import styles from './LandingPage.module.scss'

export const LandingPage = () => {
  const intl = useIntl()
  const isLoggedIn = useAppSelector(selectIsLoggedIn)
  const navigate = useNavigate()

  React.useEffect(() => {
    document.title = intl.formatMessage({
      id: 'application.title',
    })
  }, [])

  const gaaTilEnkelKalkulator = () => {
    navigate(paths.start)
  }

  const gaaTilUinnloggetKalkulator = () => {
    window.open(externalUrls.uinnloggetKalkulator, '_self')
  }

  const enkelKalkulatorButtonText = isLoggedIn
    ? intl.formatMessage({
        id: 'landingsside.button.enkel_kalkulator',
      })
    : intl.formatMessage({
        id: 'landingsside.button.enkel_kalkulator_utlogget',
      })

  // eslint-disable-next-line react/no-unstable-nested-components
  const TopSection: React.FC<{ navigateTo?: string }> = ({ navigateTo }) => {
    React.useEffect(() => {
      if (navigateTo) {
        navigate(navigateTo)
      }
    }, [navigateTo])

    if (navigateTo) {
      return null
    }

    return (
      <section>
        <VStack gap="4">
          {!isLoggedIn && (
            <Heading size="medium" level="2">
              {intl.formatMessage({
                id: 'landingsside.for.deg.som.kan.logge.inn',
              })}
            </Heading>
          )}

          <div>
            <BodyLong>
              {intl.formatMessage({
                id: 'landingsside.velge_mellom_detaljert_og_enkel',
              })}
            </BodyLong>

            <ul className={styles.list}>
              <li>
                <BodyLong>
                  <span
                    className={clsx(styles.ellipse, styles.ellipse__blue)}
                  />
                  <FormattedMessage id="stegvisning.start.list_item1" />
                </BodyLong>
              </li>
              <li>
                <BodyLong>
                  <span
                    className={clsx(styles.ellipse, styles.ellipse__purple)}
                  />
                  <FormattedMessage id="stegvisning.start.list_item2" />{' '}
                </BodyLong>
              </li>
              <li>
                <BodyLong>
                  <span
                    className={clsx(styles.ellipse, styles.ellipse__green)}
                  />
                  <FormattedMessage id="stegvisning.start.list_item3" />{' '}
                </BodyLong>
              </li>
            </ul>
          </div>

          <HStack gap="4">
            <Button
              data-testid="landingside-enkel-kalkulator-button"
              variant="primary"
              onClick={wrapLogger(BUTTON_KLIKK, {
                tekst: 'Enkel kalkulator',
              })(gaaTilEnkelKalkulator)}
            >
              {enkelKalkulatorButtonText}
            </Button>
          </HStack>

          <Link
            onClick={logOpenLink}
            className={styles.link}
            href={externalUrls.personopplysninger}
            target="_blank"
            inlineText
          >
            <FormattedMessage id="landingsside.link.personopplysninger" />
            <ExternalLinkIcon
              title={intl.formatMessage({
                id: 'application.global.external_link',
              })}
              width="1.25rem"
              height="1.25rem"
            />
          </Link>
        </VStack>
      </section>
    )
  }

  return isLoggedIn ? (
    <div className={styles.landingPage}>
      <VStack gap="10">
        <TopSection />
      </VStack>
    </div>
  ) : (
    <div className={styles.landingPage}>
      <VStack gap="10">
        <TopSection />

        <section>
          <VStack gap="2">
            <Heading size="medium" level="2">
              {intl.formatMessage({
                id: 'landingsside.text.uinnlogget_kalkulator',
              })}
            </Heading>
            <BodyLong>
              {intl.formatMessage({
                id: 'landingsside.body.uinnlogget_kalkulator',
              })}
            </BodyLong>

            <div>
              <Button
                className={styles.button}
                data-testid="landingside-uinnlogget-kalkulator-button"
                variant="secondary"
                onClick={wrapLogger(BUTTON_KLIKK, {
                  tekst: 'Uinnlogget kalkulator',
                })(gaaTilUinnloggetKalkulator)}
              >
                {intl.formatMessage({
                  id: 'landingsside.button.uinnlogget_kalkulator',
                })}
              </Button>
            </div>
          </VStack>
        </section>
      </VStack>
    </div>
  )
}

import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { Link as ReactRouterLink } from 'react-router-dom'
import { useOutletContext } from 'react-router-dom'

import { ExternalLinkIcon } from '@navikt/aksel-icons'
import {
  BodyLong,
  Button,
  Heading,
  HStack,
  Link,
  VStack,
} from '@navikt/ds-react'

import { BASE_PATH, externalUrls, paths } from '@/router/constants'
import { LoginContext } from '@/router/loaders'
import { logOpenLink, wrapLogger } from '@/utils/logging'

import styles from './LandingPage.module.scss'

export const LandingPage = () => {
  const intl = useIntl()
  const { isLoggedIn } = useOutletContext<LoginContext>()

  React.useEffect(() => {
    document.title = intl.formatMessage({
      id: 'application.title',
    })
  }, [])

  const gaaTilDetaljertKalkulator = () => {
    window.open(externalUrls.detaljertKalkulator, '_self')
  }

  const gaaTilEnkelKalkulator = () => {
    window.open(`${BASE_PATH}${paths.start}`, '_self')
  }

  const gaaTilUinnloggetKalkulator = () => {
    window.open(externalUrls.uinnloggetKalkulator, '_self')
  }

  const detaljertKalkulatorButtonText = isLoggedIn
    ? intl.formatMessage({
        id: 'landingsside.button.detaljert_kalkulator',
      })
    : intl.formatMessage({
        id: 'landingsside.button.detaljert_kalkulator_utlogget',
      })

  const enkelKalkulatorButtonText = isLoggedIn
    ? intl.formatMessage({
        id: 'landingsside.button.enkel_kalkulator',
      })
    : intl.formatMessage({
        id: 'landingsside.button.enkel_kalkulator_utlogget',
      })

  return (
    <div className={styles.landingPage}>
      <VStack gap="10">
        <section>
          <VStack gap="4">
            <Heading size="medium" level="2">
              {intl.formatMessage({
                id: 'landingsside.for.deg.foedt.etter.1963',
              })}
            </Heading>
            <BodyLong>
              {intl.formatMessage({
                id: 'landingsside.velge_mellom_detaljert_og_enkel',
              })}
            </BodyLong>
            <div>
              <BodyLong>
                {intl.formatMessage({
                  id: 'landingsside.velge_mellom_detaljert_og_enkel_2',
                })}
              </BodyLong>
              <ul>
                <li>
                  {intl.formatMessage({
                    id: 'landingsside.liste.1',
                  })}
                </li>
                <li>
                  {intl.formatMessage({
                    id: 'landingsside.liste.2',
                  })}
                </li>
                <li>
                  {intl.formatMessage({
                    id: 'landingsside.liste.3',
                  })}
                </li>
              </ul>

              <HStack gap="4">
                <Button
                  data-testid="landingside-detaljert-kalkulator-button"
                  variant="secondary"
                  onClick={wrapLogger('button klikk', {
                    tekst: 'Detaljert kalkulator',
                  })(gaaTilDetaljertKalkulator)}
                >
                  {detaljertKalkulatorButtonText}
                </Button>
                <Button
                  data-testid="landingside-enkel-kalkulator-button"
                  variant="secondary"
                  onClick={wrapLogger('button klikk', {
                    tekst: 'Enkel kalkulator',
                  })(gaaTilEnkelKalkulator)}
                >
                  {enkelKalkulatorButtonText}
                </Button>
              </HStack>
            </div>
          </VStack>
        </section>
        <section>
          <VStack gap="2">
            <Heading size="medium" level="2">
              {intl.formatMessage({
                id: 'landingsside.for.deg.foedt.foer.1963',
              })}
            </Heading>
            <BodyLong>
              {intl.formatMessage({
                id: 'landingsside.du.maa.bruke.detaljert',
              })}
            </BodyLong>
            <div>
              <Button
                className={styles.button}
                data-testid="landingside-detaljert-kalkulator-second-button"
                variant="secondary"
                onClick={gaaTilDetaljertKalkulator}
              >
                {detaljertKalkulatorButtonText}
              </Button>
            </div>
          </VStack>
        </section>

        {!isLoggedIn && (
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
                  onClick={wrapLogger('button klikk', {
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
        )}
      </VStack>
      <Link
        onClick={logOpenLink}
        className={styles.link}
        as={ReactRouterLink}
        to={paths.personopplysninger}
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
    </div>
  )
}

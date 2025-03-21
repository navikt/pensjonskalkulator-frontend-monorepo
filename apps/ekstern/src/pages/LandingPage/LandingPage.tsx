import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import {
  Await,
  useLoaderData,
  useNavigate,
  useOutletContext,
} from 'react-router'

import { ExternalLinkIcon } from '@navikt/aksel-icons'
import {
  BodyLong,
  Button,
  Heading,
  HStack,
  Link,
  VStack,
} from '@navikt/ds-react'

import { Loader } from '@/components/common/Loader'
import { externalUrls, paths } from '@/router/constants'
import { LoginContext, LandingPageAccessGuardLoader } from '@/router/loaders'
import { logOpenLink, wrapLogger } from '@/utils/logging'

import styles from './LandingPage.module.scss'

export const LandingPage = () => {
  const intl = useIntl()
  const { isLoggedIn } = useOutletContext<LoginContext>()

  const { shouldRedirectTo } = useLoaderData() as LandingPageAccessGuardLoader
  const navigate = useNavigate()

  React.useEffect(() => {
    document.title = intl.formatMessage({
      id: 'application.title',
    })
  }, [])

  const gaaTilDetaljertKalkulator = () => {
    window.open(externalUrls.detaljertKalkulator, '_self')
  }

  const gaaTilEnkelKalkulator = () => {
    navigate(paths.start)
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
          <Heading size="medium" level="2">
            {intl.formatMessage({
              id: 'landingsside.for.deg.foedt.etter.1963',
            })}
          </Heading>
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
                    className={`${styles.ellipse} ${styles.ellipse__blue}`}
                  />
                  <FormattedMessage id="stegvisning.start.list_item1" />
                </BodyLong>
              </li>
              <li>
                <BodyLong>
                  <span
                    className={`${styles.ellipse} ${styles.ellipse__purple}`}
                  />
                  <FormattedMessage id="stegvisning.start.list_item2" />{' '}
                </BodyLong>
              </li>
              <li>
                <BodyLong>
                  <span
                    className={`${styles.ellipse} ${styles.ellipse__green}`}
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
              onClick={wrapLogger('button klikk', {
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

          <div>
            <BodyLong>
              {intl.formatMessage({
                id: 'landingsside.velge_mellom_detaljert_og_enkel_2',
              })}
            </BodyLong>
          </div>
          <div>
            <HStack gap="4">
              <Button
                data-testid="landingside-detaljert-kalkulator-button"
                variant="secondary"
                onClick={wrapLogger('button klikk', {
                  tekst: 'Detaljert pensjonskalkulator',
                })(gaaTilDetaljertKalkulator)}
              >
                {detaljertKalkulatorButtonText}
              </Button>
            </HStack>
          </div>
        </VStack>
      </section>
    )
  }

  return isLoggedIn ? (
    <React.Suspense
      fallback={
        <Loader
          data-testid="loader"
          size="3xlarge"
          title={intl.formatMessage({ id: 'pageframework.loading' })}
        />
      }
    >
      <Await resolve={shouldRedirectTo}>
        {(resp: string) => {
          return (
            <div className={styles.landingPage}>
              <VStack gap="10">
                <TopSection navigateTo={resp} />
              </VStack>
            </div>
          )
        }}
      </Await>
    </React.Suspense>
  ) : (
    <div className={styles.landingPage}>
      <VStack gap="10">
        <TopSection />
        <section>
          <VStack gap="2">
            <Heading size="medium" level="2">
              {intl.formatMessage({
                id: 'landingsside.for.deg.foedt.foer.1963',
              })}
            </Heading>
            <div>
              <BodyLong>
                {intl.formatMessage({
                  id: 'landingsside.du.maa.bruke.detaljert',
                })}
              </BodyLong>
              <ul className={styles.list}>
                <li>
                  <BodyLong>
                    <span
                      className={`${styles.ellipse} ${styles.ellipse__blue}`}
                    />
                    <FormattedMessage id="stegvisning.start.list_item1" />
                  </BodyLong>
                </li>
                <li>
                  <BodyLong>
                    <span
                      className={`${styles.ellipse} ${styles.ellipse__purple}`}
                    />
                    <FormattedMessage id="stegvisning.start.list_item2" />{' '}
                  </BodyLong>
                </li>
                <li>
                  <BodyLong>
                    <span
                      className={`${styles.ellipse} ${styles.ellipse__green}`}
                    />
                    <FormattedMessage id="stegvisning.start.list_item3" />{' '}
                  </BodyLong>
                </li>
              </ul>
            </div>
            <div>
              <Button
                className={styles.button}
                data-testid="landingside-detaljert-kalkulator-second-button"
                variant="secondary"
                onClick={gaaTilDetaljertKalkulator}
              >
                {intl.formatMessage({
                  id: 'landingsside.button.detaljert_kalkulator_utlogget',
                })}
              </Button>
            </div>
          </VStack>
        </section>
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
      </VStack>
    </div>
  )
}

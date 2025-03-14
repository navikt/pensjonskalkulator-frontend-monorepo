import { ReactNode, useEffect, useState } from 'react'
import { IntlProvider } from 'react-intl'

import { Provider as AkselProvider } from '@navikt/ds-react'
import { nb, nn, en } from '@navikt/ds-react/locales'
import {
  setAvailableLanguages,
  onLanguageSelect,
} from '@navikt/nav-dekoratoren-moduler'

import { SanityContext } from '@/context/SanityContext'
import {
  SanityForbeholdAvsnitt,
  SanityReadMore,
} from '@/context/SanityContext/SanityTypes'
import { useGetSpraakvelgerFeatureToggleQuery } from '@/state/api/apiSlice'
import { logger } from '@/utils/logging'
import { sanityClient } from '@/utils/sanity'
import '@formatjs/intl-numberformat/polyfill-force'
import '@formatjs/intl-numberformat/locale-data/en'
import '@formatjs/intl-numberformat/locale-data/nb'
import '@formatjs/intl-numberformat/locale-data/nn'
import '@formatjs/intl-datetimeformat/polyfill-force'
import '@formatjs/intl-datetimeformat/locale-data/en'
import '@formatjs/intl-datetimeformat/locale-data/nb'
import '@formatjs/intl-datetimeformat/locale-data/nn'

import { getCookie, getTranslations, updateLanguage, setCookie } from './utils'

const akselLocales: Record<Locales, typeof nb> = { nb, nn, en }

interface Props {
  children: ReactNode
}

export function LanguageProvider({ children }: Props) {
  const [languageCookie, setLanguageCookie] = useState<Locales>('nb')
  const [sanityReadMoreData, setSanityReadMoreData] = useState<
    Record<string, SanityReadMore>
  >({})
  const [sanityForbeholdAvsnittData, setSanityForbeholdAvsnittData] = useState<
    SanityForbeholdAvsnitt[]
  >([])

  const { data: disableSpraakvelgerFeatureToggle, isSuccess } =
    useGetSpraakvelgerFeatureToggleQuery()

  const fetchSanityData = (locale: Locales) => {
    const logTekst = 'Feil ved henting av innhold fra Sanity'
    const logData = `readmore ${locale}`
    sanityClient
      .fetch(
        `*[_type == "readmore" && language == "${locale}"] | {name,overskrift,innhold}`
      )
      .then((sanityReadMoreResponse) => {
        setSanityReadMoreData(
          Object.fromEntries(
            (sanityReadMoreResponse || []).map((readmore: SanityReadMore) => [
              readmore.name,
              readmore,
            ])
          )
        )
      })
      .catch(() => {
        logger('info', {
          tekst: logTekst,
          data: logData,
        })
      })
    sanityClient
      .fetch(
        `*[_type == "forbeholdAvsnitt" && language == "${locale}"] | order(order asc) | {overskrift,innhold}`
      )
      .then((sanityForbeholdAvsnittResponse) => {
        setSanityForbeholdAvsnittData(sanityForbeholdAvsnittResponse || [])
      })
      .catch(() => {
        logger('info', {
          tekst: logTekst,
          data: logData,
        })
      })
  }

  /* c8 ignore next 4 */
  onLanguageSelect((language) => {
    setCookie('decorator-language', language.locale)
    updateLanguage(language.locale as Locales, setLanguageCookie)
  })

  useEffect(() => {
    fetchSanityData(languageCookie)
  }, [languageCookie])

  useEffect(() => {
    if (isSuccess && !disableSpraakvelgerFeatureToggle.enabled) {
      setAvailableLanguages([
        {
          locale: 'nb',
          handleInApp: true,
        },
        {
          locale: 'nn',
          handleInApp: true,
        },
        {
          locale: 'en',
          handleInApp: true,
        },
      ])

      const previousLanguage = getCookie('decorator-language')

      if (previousLanguage) {
        updateLanguage(previousLanguage as Locales, setLanguageCookie)
      }
    }
  }, [isSuccess])

  return (
    <IntlProvider
      locale={languageCookie}
      messages={getTranslations(languageCookie)}
    >
      <AkselProvider locale={akselLocales[languageCookie]}>
        <SanityContext.Provider
          value={{
            readMoreData: sanityReadMoreData,
            forbeholdAvsnittData: sanityForbeholdAvsnittData,
          }}
        >
          {children}
        </SanityContext.Provider>
      </AkselProvider>
    </IntlProvider>
  )
}

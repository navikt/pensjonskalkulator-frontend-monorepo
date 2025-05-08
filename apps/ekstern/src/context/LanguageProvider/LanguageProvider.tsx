import { defineQuery } from 'groq'
import { ReactNode, useEffect, useState } from 'react'
import { IntlProvider } from 'react-intl'

import { Provider as AkselProvider } from '@navikt/ds-react'
import { en, nb, nn } from '@navikt/ds-react/locales'
import {
  onLanguageSelect,
  setAvailableLanguages,
} from '@navikt/nav-dekoratoren-moduler'

import { SanityContext } from '@/context/SanityContext'
import { useGetSpraakvelgerFeatureToggleQuery } from '@/state/api/apiSlice'
import { logger } from '@/utils/logging'
import { sanityClient } from '@/utils/sanity'

import '@formatjs/intl-numberformat/polyfill-force'
import '@formatjs/intl-numberformat/locale-data/en'
import '@formatjs/intl-numberformat/locale-data/nb'
import '@formatjs/intl-numberformat/locale-data/nn'

import {
  ForbeholdAvsnittQueryResult,
  GuidePanelQueryResult,
  ReadMoreQueryResult,
} from '@/types/sanity.types'

import { getCookie, getTranslations, setCookie, updateLanguage } from './utils'

const akselLocales: Record<Locales, typeof nb> = { nb, nn, en }

// Kjør `npm run sanity-typegen` for å generere typer for Sanity-data
const forbeholdAvsnittQuery = defineQuery(
  `*[_type == "forbeholdAvsnitt" && language == $locale] | order(order asc) | {overskrift,innhold}`
)
const guidePanelQuery = defineQuery(
  `*[_type == "guidepanel" && language == $locale] | {name,overskrift,innhold}`
)
const readMoreQuery = defineQuery(
  `*[_type == "readmore" && language == $locale] | {name,overskrift,innhold}`
)

interface Props {
  children: ReactNode
}

export function LanguageProvider({ children }: Props) {
  const [languageCookie, setLanguageCookie] = useState<Locales>('nb')

  const [sanityForbeholdAvsnittData, setSanityForbeholdAvsnittData] =
    useState<ForbeholdAvsnittQueryResult>([])
  const [sanityGuidePanelData, setSanityGuidePanelData] = useState<
    Record<string, GuidePanelQueryResult[number]>
  >({})
  const [sanityReadMoreData, setSanityReadMoreData] = useState<
    Record<string, ReadMoreQueryResult[number]>
  >({})

  const { data: disableSpraakvelgerFeatureToggle, isSuccess } =
    useGetSpraakvelgerFeatureToggleQuery()

  const fetchSanityData = (locale: Locales) => {
    const logTekst = 'Feil ved henting av innhold fra Sanity'
    const logData = `Språk: ${locale}`

    sanityClient
      .fetch(forbeholdAvsnittQuery, { locale })
      .then((sanityForbeholdAvsnittResponse) => {
        setSanityForbeholdAvsnittData(sanityForbeholdAvsnittResponse || [])
      })
      .catch(() => {
        logger('info', {
          tekst: logTekst,
          data: logData,
        })
      })
    sanityClient
      .fetch(guidePanelQuery, { locale })
      .then((sanityGuidePanelResponse) => {
        setSanityGuidePanelData(
          Object.fromEntries(
            (sanityGuidePanelResponse || []).map((guidepanel) => [
              guidepanel.name,
              guidepanel,
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
      .fetch(readMoreQuery, { locale })
      .then((sanityReadMoreResponse) => {
        setSanityReadMoreData(
          Object.fromEntries(
            (sanityReadMoreResponse || []).map((readmore) => [
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
            forbeholdAvsnittData: sanityForbeholdAvsnittData,
            guidePanelData: sanityGuidePanelData,
            readMoreData: sanityReadMoreData,
          }}
        >
          {children}
        </SanityContext.Provider>
      </AkselProvider>
    </IntlProvider>
  )
}

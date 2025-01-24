import { ReactNode, useEffect, useState } from 'react'
import { IntlProvider } from 'react-intl'

import { Provider as AkselProvider } from '@navikt/ds-react'
import { nb, nn, en } from '@navikt/ds-react/locales'
import {
  setAvailableLanguages,
  onLanguageSelect,
} from '@navikt/nav-dekoratoren-moduler'

import { sanityClient } from '../../../sanity.config'
import { SanityContext } from '@/context/SanityContext'
import {
  SanityForbeholdAvsnitt,
  SanityReadMore,
} from '@/context/SanityContext/SanityTypes'
import { useGetSpraakvelgerFeatureToggleQuery } from '@/state/api/apiSlice'
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
    SanityReadMore[]
  >([])
  const [sanityForbeholdAvsnittData, setSanityForbeholdAvsnittData] = useState<
    SanityForbeholdAvsnitt[]
  >([])

  const { data: disableSpraakvelgerFeatureToggle, isSuccess } =
    useGetSpraakvelgerFeatureToggleQuery()

  const fetchSanityData = async (locale: Locales) => {
    if (sanityClient) {
      const readMorePromise = sanityClient
        .fetch(`*[_type == "readmore" && language == "${locale}"]`)
        .then((sanityReadMoreResponse) => {
          setSanityReadMoreData(sanityReadMoreResponse)
        })
      const forbeholdAvsnittPromise = sanityClient
        .fetch(`*[_type == "forbeholdAvsnitt" && language == "${locale}"]`)
        .then((sanityForbeholdAvsnittResponse) => {
          setSanityForbeholdAvsnittData(sanityForbeholdAvsnittResponse)
        })

      await Promise.all([readMorePromise, forbeholdAvsnittPromise])
    }
  }

  // TODO dekke kobling mellom intl-provider'en og dekoratøren i E2E test
  /* c8 ignore next 3 */
  onLanguageSelect((language) => {
    fetchSanityData(language.locale as Locales)
    setCookie('decorator-language', language.locale)
    updateLanguage(language.locale as Locales, setLanguageCookie)
  })

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
        fetchSanityData(previousLanguage as Locales)
        updateLanguage(previousLanguage as Locales, setLanguageCookie)
      }
    } else {
      fetchSanityData('nb' as Locales)
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

import { ReactNode, useEffect, useState } from 'react'
import { IntlProvider } from 'react-intl'

import {
  DecoratorLocale,
  setAvailableLanguages,
  onLanguageSelect,
} from '@navikt/nav-dekoratoren-moduler'

import { useGetSpraakvelgerFeatureToggleQuery } from '@/state/api/apiSlice'

import '@formatjs/intl-numberformat/polyfill-force'
import '@formatjs/intl-numberformat/locale-data/en'
import '@formatjs/intl-numberformat/locale-data/nb'
import '@formatjs/intl-numberformat/locale-data/nn'
import '@formatjs/intl-datetimeformat/polyfill-force'
import '@formatjs/intl-datetimeformat/locale-data/en'
import '@formatjs/intl-datetimeformat/locale-data/nb'
import '@formatjs/intl-datetimeformat/locale-data/nn'

import { getCookie, setCookie, getTranslations } from './utils'

interface Props {
  children: ReactNode
}

export function LanguageProvider({ children }: Props) {
  const [languageCookie, setLanguageCookie] = useState<DecoratorLocale>('nb')

  const { data: disableSpraakvelgerFeatureToggle, isSuccess } =
    useGetSpraakvelgerFeatureToggleQuery()

  // TODO dekke kobling mellom intl-provider'en og dekoratøren i E2E test
  /* c8 ignore next 3 */
  onLanguageSelect((language) => {
    setCookie('decorator-language', language.locale)
    setLanguageCookie(language.locale)
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
        setLanguageCookie(previousLanguage as DecoratorLocale)
      }
    }
  }, [isSuccess])

  return (
    <IntlProvider
      locale={languageCookie}
      messages={getTranslations(languageCookie)}
    >
      {children}
    </IntlProvider>
  )
}

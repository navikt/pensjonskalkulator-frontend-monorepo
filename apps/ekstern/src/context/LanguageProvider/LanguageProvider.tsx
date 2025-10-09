import { defineQuery } from 'groq'
import { ReactNode, useEffect, useRef, useState } from 'react'
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

import {
  getCookie,
  getTranslations,
  isOnSanityTimeoutRoute,
  redirectToSanityTimeout,
  setCookie,
  updateLanguage,
} from './utils'

const akselLocales: Record<Locales, typeof nb> = { nb, nn, en }
const SANITY_FETCH_TIMEOUT_MS = 10_000

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

  const [isSanityLoading, setIsSanityLoading] = useState(true)
  const [sanityTimeoutTriggered, setSanityTimeoutTriggered] = useState(false)
  const [sanityForbeholdAvsnittData, setSanityForbeholdAvsnittData] =
    useState<ForbeholdAvsnittQueryResult>([])
  const [sanityGuidePanelData, setSanityGuidePanelData] = useState<
    Record<string, GuidePanelQueryResult[number]>
  >({})
  const [sanityReadMoreData, setSanityReadMoreData] = useState<
    Record<string, ReadMoreQueryResult[number]>
  >({})

  const hasInitializedSanityRef = useRef(false)

  const { data: disableSpraakvelgerFeatureToggle, isSuccess } =
    useGetSpraakvelgerFeatureToggleQuery()

  const fetchSanityData = async (
    locale: Locales,
    shouldBlockInitialLoad: boolean
  ) => {
    if (sanityTimeoutTriggered) {
      return
    }

    const logTekst = 'Feil ved henting av innhold fra Sanity'
    const logData = `Språk: ${locale}`

    const handleForbeholdAvsnittFetch = sanityClient
      .fetch(forbeholdAvsnittQuery, { locale })
      .then((sanityForbeholdAvsnittResponse) => {
        const data = sanityForbeholdAvsnittResponse || []
        setSanityForbeholdAvsnittData(data)
        return data
      })
      .catch(() => {
        logger('info', {
          tekst: logTekst,
          data: logData,
        })
        setSanityForbeholdAvsnittData([])
        return []
      })

    const handleGuidePanelFetch = sanityClient
      .fetch(guidePanelQuery, { locale })
      .then((sanityGuidePanelResponse) => {
        const data = Object.fromEntries(
          (sanityGuidePanelResponse || []).map((guidepanel) => [
            guidepanel.name,
            guidepanel,
          ])
        )
        setSanityGuidePanelData(data)
        return data
      })
      .catch(() => {
        logger('info', {
          tekst: logTekst,
          data: logData,
        })
        setSanityGuidePanelData({})
        return {}
      })

    const handleReadMoreFetch = sanityClient
      .fetch(readMoreQuery, { locale })
      .then((sanityReadMoreResponse) => {
        const data = Object.fromEntries(
          (sanityReadMoreResponse || []).map((readmore) => [
            readmore.name,
            readmore,
          ])
        )
        setSanityReadMoreData(data)
        return data
      })
      .catch(() => {
        logger('info', {
          tekst: logTekst,
          data: logData,
        })
        setSanityReadMoreData({})
        return {}
      })

    const fetchPromise = Promise.all([
      handleForbeholdAvsnittFetch,
      handleGuidePanelFetch,
      handleReadMoreFetch,
    ])

    if (shouldBlockInitialLoad) {
      let timeoutId: number | undefined

      try {
        setIsSanityLoading(true)
        const raceResult = await Promise.race([
          fetchPromise.then(() => 'fetched' as const),
          new Promise<'timeout'>((resolve) => {
            timeoutId = window.setTimeout(() => {
              logger('info', {
                tekst: 'Timeout ved henting av innhold fra Sanity',
                data: logData,
              })
              resolve('timeout')
            }, SANITY_FETCH_TIMEOUT_MS)
          }),
        ])

        if (raceResult === 'timeout') {
          setSanityTimeoutTriggered(true)
          return
        }

        const [forbeholdData, guidePanelData, readMoreData] = await fetchPromise
        const anyEmpty =
          forbeholdData.length === 0 ||
          Object.keys(guidePanelData).length === 0 ||
          Object.keys(readMoreData).length === 0

        if (anyEmpty) {
          setSanityTimeoutTriggered(true)
          return
        }
      } finally {
        if (timeoutId !== undefined) {
          window.clearTimeout(timeoutId)
        }
        setIsSanityLoading(false)
      }
    } else {
      await fetchPromise
    }
  }

  /* c8 ignore next 4 */
  onLanguageSelect((language) => {
    setCookie('decorator-language', language.locale)
    updateLanguage(language.locale as Locales, setLanguageCookie)
  })

  useEffect(() => {
    if (isOnSanityTimeoutRoute()) {
      setIsSanityLoading(false)
      return
    }

    if (sanityTimeoutTriggered) {
      redirectToSanityTimeout()
      return
    }

    const shouldBlockInitialLoad = !hasInitializedSanityRef.current

    if (shouldBlockInitialLoad) {
      hasInitializedSanityRef.current = true
    }

    void fetchSanityData(languageCookie, shouldBlockInitialLoad)
  }, [languageCookie, sanityTimeoutTriggered])

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
            isSanityLoading,
          }}
        >
          {children}
        </SanityContext.Provider>
      </AkselProvider>
    </IntlProvider>
  )
}

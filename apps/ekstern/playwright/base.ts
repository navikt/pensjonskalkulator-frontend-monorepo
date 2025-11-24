import { Browser, Page, test as baseTest } from '@playwright/test'
import { authenticate } from 'utils/auth'

import { loadHTMLMock, loadJSONMock } from './utils/mock'

export { expect } from '@playwright/test'

type TestOptions = {
  autoAuth: boolean
}

let sharedBrowser: Browser

export const test = baseTest.extend<TestOptions>({
  autoAuth: [true, { option: true }],

  browser: [
    async ({ playwright }, use, workerInfo) => {
      if (!sharedBrowser) {
        sharedBrowser = await playwright.chromium.launch(
          workerInfo.project.use.launchOptions
        )
      }
      await use(sharedBrowser)
    },
    { scope: 'worker' },
  ],

  context: async ({ browser }, use, workerInfo) => {
    const context = await browser.newContext(workerInfo.project.use)
    await use(context)
    await context.close()
  },

  page: async ({ context, autoAuth }, use) => {
    const page = await context.newPage()
    if (autoAuth) {
      await authenticate(page)
    }
    await use(page)
  },
})

export type RouteDefinition = {
  url: RegExp | string
  method?: 'GET' | 'POST'
  mockFileName?: string
  overrideJsonResponse?: Record<string, unknown> | unknown[]
  status?: number
}

export async function setupInterceptions(
  page: Page,
  overwrites: RouteDefinition[] = []
) {
  await page.addInitScript(() => {
    Object.defineProperty(window, '__DISABLE_MSW__', {
      value: true,
      writable: false,
    })

    const w = window as unknown as { Playwright: boolean }
    w.Playwright = true
  })

  await page.context().addCookies([
    {
      name: 'navno-consent',
      value: JSON.stringify({
        consent: { analytics: false, surveys: false },
        userActionTaken: true,
        meta: {
          createdAt: '2025-02-17T09:17:38.688Z',
          updatedAt: '2025-02-17T09:17:38.688Z',
          version: 1,
        },
      }),
      domain: 'localhost',
      path: '/',
    },
  ])

  const routes: RouteDefinition[] = [
    {
      url: /^https?:\/\/cdn\.nav\.no\/personbruker\/decorator-next\/public\/assets\/.*\.(js|css|svg)/,
      status: 200,
    },
    {
      url: /^https?:\/\/cdn\.nav\.no\/aksel\/fonts\/SourceSans3-normal\.woff2/,
      status: 200,
    },
    {
      url: /^https?:\/\/dekoratoren\.ekstern\.dev\.nav\.no\/css\/client\.css/,
      status: 200,
    },
    {
      url: /^https?:\/\/representasjon-banner-frontend-borger-q2\.ekstern\.dev\.nav\.no\/pensjon\/selvbetjening\/representasjon\/banner\.js/,
      status: 200,
    },
    {
      url: /^https?:\/\/in2\.taskanalytics\.com\/tm\.js/,
      status: 200,
    },
    { url: /\/auth\?/, mockFileName: 'decorator-auth.json' },
    { url: 'https://login.ekstern.dev.nav.no/oauth2/session', status: 200 },
    { url: 'https://login.nav.no/oauth2/session', status: 200 },
    {
      url: /representasjon\/harRepresentasjonsforhold/,
      mockFileName: 'representasjon-banner.json',
    },
    { url: /\/collect$/, status: 200 },
    { url: /\/api\/ta/, mockFileName: 'decorator-ta.json' },
    {
      url: /main-menu\?/,
      mockFileName: 'decorator-main-menu.html',
    },
    {
      url: /user-menu\?/,
      mockFileName: 'decorator-user-menu.html',
    },
    { url: /ops-messages/, overrideJsonResponse: [] },
    {
      url: /\/env\?chatbot=false&logoutWarning=true&redirectToUrl=/,
      mockFileName: 'decorator-env-features.json',
    },
    {
      url: 'https://amplitude.nav.no/collect-auto',
      method: 'POST',
      status: 200,
    },
    { url: /pensjon\/kalkulator\/oauth2\/session/, status: 200 },
    {
      url: /\/pensjon\/kalkulator\/api\/feature\//,
      mockFileName: 'toggle-config.json',
    },
    {
      url: /\/pensjon\/kalkulator\/api\/v1\/er-apoteker/,
      mockFileName: 'er-apoteker.json',
    },
    {
      url: /\/pensjon\/kalkulator\/api\/v2\/ekskludert/,
      mockFileName: 'ekskludert-status.json',
    },
    {
      url: /\/pensjon\/kalkulator\/api\/v1\/ansatt-id/,
      overrideJsonResponse: { id: 'mock-ansatt-id' },
    },
    {
      url: /\/pensjon\/kalkulator\/api\/v1\/loepende-omstillingsstoenad-eller-gjenlevendeytelse/,
      mockFileName: 'omstillingsstoenad-og-gjenlevende.json',
    },
    {
      url: /\/pensjon\/kalkulator\/api\/v4\/vedtak\/loepende-vedtak/,
      mockFileName: 'loepende-vedtak.json',
    },
    {
      url: /\/pensjon\/kalkulator\/api\/v5\/person/,
      mockFileName: 'person.json',
    },
    {
      url: /\/pensjon\/kalkulator\/api\/inntekt/,
      mockFileName: 'inntekt.json',
    },
    {
      url: /\/pensjon\/kalkulator\/api\/v2\/simuler-oftp/,
      method: 'POST',
      mockFileName: 'offentlig-tp.json',
    },
    {
      url: /\/pensjon\/kalkulator\/api\/v2\/tidligste-hel-uttaksalder/,
      method: 'POST',
      mockFileName: 'tidligste-uttaksalder.json',
    },
    {
      url: /\/pensjon\/kalkulator\/api\/v3\/pensjonsavtaler/,
      method: 'POST',
      mockFileName: 'pensjonsavtaler.json',
    },
    {
      url: /\/pensjon\/kalkulator\/api\/v8\/alderspensjon\/simulering/,
      method: 'POST',
      mockFileName: 'alderspensjon.json',
    },
    {
      url: 'https://g.nav.no/api/v1/grunnbel%C3%B8p',
      overrideJsonResponse: {
        dato: '2024-05-01',
        grunnbeløp: 100000,
        grunnbeløpPerMåned: 10000,
        gjennomsnittPerÅr: 120000,
        omregningsfaktor: 1,
        virkningstidspunktForMinsteinntekt: '2024-06-03',
      },
    },
    {
      url: /^https?:\/\/api\.uxsignals\.com\/v2\/study\/id\/.*\/active/,
      overrideJsonResponse: { active: false },
    },
    {
      url: /^https?:\/\/g2by7q6m\.apicdn\.sanity\.io.*readmore/,
      mockFileName: 'sanity-readmore-data.json',
    },
    {
      url: /^https?:\/\/g2by7q6m\.apicdn\.sanity\.io.*guidepanel/,
      mockFileName: 'sanity-guidepanel-data.json',
    },
    {
      url: /^https?:\/\/g2by7q6m\.apicdn\.sanity\.io.*forbeholdAvsnitt/,
      mockFileName: 'sanity-forbehold-avsnitt-data.json',
    },
    {
      url: 'https://www.nav.no/pensjon/selvbetjening/dinpensjon',
      mockFileName: 'dinpensjon.html',
    },
  ]

  const routesMatch = (
    route1: RouteDefinition,
    route2: RouteDefinition
  ): boolean => {
    const url1 = route1.url
    const url2 = route2.url
    const method1 = route1.method || 'GET'
    const method2 = route2.method || 'GET'

    let urlMatch = false
    if (typeof url1 === 'string' && typeof url2 === 'string') {
      urlMatch = url1 === url2
    } else if (url1 instanceof RegExp && url2 instanceof RegExp) {
      urlMatch = url1.source === url2.source
    } else if (typeof url1 === 'string' && url2 instanceof RegExp) {
      urlMatch = url2.test(url1)
    } else if (url1 instanceof RegExp && typeof url2 === 'string') {
      urlMatch = url1.test(url2)
    }

    return urlMatch && method1 === method2
  }

  const finalRoutes = routes.map((route) => {
    const overwrite = overwrites.find((overwriteRoute) =>
      routesMatch(route, overwriteRoute)
    )
    return overwrite || route
  })

  const newRoutes = overwrites.filter(
    (overwriteRoute) =>
      !routes.some((route) => routesMatch(route, overwriteRoute))
  )
  finalRoutes.push(...newRoutes)

  page.on('pageerror', (error: Error) => {
    if (
      error.message.includes('Amplitude') ||
      error.stack?.includes(
        'representasjon-banner-frontend-borger-q2.ekstern.dev.nav.no'
      )
    )
      return
    console.error(error)
  })

  for (const {
    url,
    method,
    mockFileName: mockName,
    overrideJsonResponse: jsonResponse,
    status = 200,
  } of finalRoutes) {
    const JSON_CONTENT_TYPE = 'application/json; charset=utf-8'

    await page.route(url, async (route) => {
      const reqMethod = route.request().method()
      const expectedMethod = method || 'GET'

      if (reqMethod !== expectedMethod) {
        return route.fallback()
      }

      if (mockName) {
        if (mockName.includes('.html')) {
          const body = await loadHTMLMock(mockName)
          return route.fulfill({
            status,
            body,
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          })
        }

        const data = await loadJSONMock(mockName)

        if (
          mockName === 'toggle-config.json' &&
          route.request().url().includes('/api/feature/')
        ) {
          const requestUrl = route.request().url()
          const featureNameRegex = /\/api\/feature\/(.+?)(?:\?|$)/
          const featureNameMatch = featureNameRegex.exec(requestUrl)

          if (featureNameMatch) {
            const featureName = featureNameMatch[1]
            const toggleConfig = data as Record<string, { enabled: boolean }>

            const featureMap: Record<string, string> = {
              'pensjonskalkulator.disable-spraakvelger': 'spraakvelger',
              'pensjonskalkulator.vedlikeholdsmodus': 'vedlikeholdsmodus',
              'utvidet-simuleringsresultat': 'utvidetSimuleringsresultat',
              'pensjonskalkulator.enable-redirect-1963': 'enableRedirect1963',
            }

            const configKey = featureMap[featureName] || featureName
            const featureToggle = toggleConfig[configKey] || {
              enabled: false,
            }

            return route.fulfill({
              status,
              body: JSON.stringify(featureToggle),
              headers: { 'Content-Type': JSON_CONTENT_TYPE },
            })
          }
        }

        return route.fulfill({
          status,
          body: JSON.stringify(data),
          headers: { 'Content-Type': JSON_CONTENT_TYPE },
        })
      }

      if (jsonResponse) {
        return route.fulfill({
          status,
          body: JSON.stringify(jsonResponse),
          headers: { 'Content-Type': JSON_CONTENT_TYPE },
        })
      }

      return route.fulfill({ status, headers: {} })
    })
  }
}

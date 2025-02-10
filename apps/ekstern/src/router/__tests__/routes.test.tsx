import { createMemoryRouter, RouterProvider } from 'react-router'

import { describe, vi } from 'vitest'

import {
  BASE_PATH,
  externalUrls,
  henvisningUrlParams,
  paths,
} from '../constants'
import { routes } from '../routes'
import {
  fulfilledGetPerson,
  fulfilledGetInntekt,
  fulfilledGetEkskludertStatus,
  fulfilledGetLoependeVedtak0Ufoeregrad,
  fulfilledGetLoependeVedtak75Ufoeregrad,
  fulfilledGetOmstillingsstoenadOgGjenlevendeUtenSak,
  fulfilledGetGrunnbelop,
} from '@/mocks/mockedRTKQueryApiCalls'
import { mockErrorResponse, mockResponse } from '@/mocks/server'
import { HOST_BASEURL } from '@/paths'
import { apiSlice } from '@/state/api/apiSlice'
import { store } from '@/state/store'
import { userInputInitialState } from '@/state/userInput/userInputReducer'
import { render, screen, waitFor } from '@/test-utils'

const initialGetState = store.getState

const fakeApiCalls = {
  queries: {
    ['tulleQuery(undefined)']: {
      status: 'fulfilled',
      endpointName: 'tulleQuery',
      requestId: 'xTaE6mOydr5ZI75UXq4Wi',
      startedTimeStamp: 1688046411971,
      data: {
        tull: 'og tøys',
      },
      fulfilledTimeStamp: 1688046412103,
    },
  },
}

describe('routes', () => {
  afterEach(() => {
    store.dispatch(apiSlice.util.resetApiState())
    vi.clearAllMocks()
    vi.resetAllMocks()
    vi.resetModules()
    store.getState = initialGetState
  })

  describe(`Gitt at siden er åpen uten pålogging`, () => {
    describe(`${BASE_PATH}${paths.root}`, () => {
      it('redirigerer til /login og viser upålogget landingssiden', async () => {
        mockErrorResponse('/oauth2/session', {
          baseUrl: `${HOST_BASEURL}`,
        })
        const router = createMemoryRouter(routes, {
          basename: BASE_PATH,
          initialEntries: [`${BASE_PATH}${paths.root}`],
        })
        render(<RouterProvider router={router} />, { hasRouter: false })
        expect(
          await screen.findByText('landingsside.for.deg.foedt.foer.1963')
        ).toBeVisible()
      })
    })

    describe(`${BASE_PATH}${paths.login}`, () => {
      it('Når brukeren ikke er pålogget, viser upålogget landingssiden med login lenke', async () => {
        mockErrorResponse('/oauth2/session', {
          baseUrl: `${HOST_BASEURL}`,
        })
        const router = createMemoryRouter(routes, {
          basename: BASE_PATH,
          initialEntries: [`${BASE_PATH}${paths.login}`],
        })
        render(<RouterProvider router={router} />, {
          hasRouter: false,
        })
        expect(
          await screen.findByText('landingsside.for.deg.foedt.foer.1963')
        ).toBeVisible()
      })

      it('Når brukeren er pålogget og født etter 1963, viser pålogget landingssiden', async () => {
        const router = createMemoryRouter(routes, {
          basename: BASE_PATH,
          initialEntries: [`${BASE_PATH}${paths.login}`],
        })
        render(<RouterProvider router={router} />, {
          hasRouter: false,
        })
        expect(
          await screen.findByText('landingsside.for.deg.foedt.etter.1963')
        ).toBeVisible()
        expect(
          screen.queryByText('landingsside.for.deg.foedt.foer.1963')
        ).not.toBeInTheDocument()
      })

      it('Når brukeren er pålogget og kall til /person feiler, viser pålogget landingssiden', async () => {
        mockErrorResponse('/v4/person')
        const router = createMemoryRouter(routes, {
          basename: BASE_PATH,
          initialEntries: [`${BASE_PATH}${paths.login}`],
        })
        render(<RouterProvider router={router} />, {
          hasRouter: false,
        })
        expect(
          await screen.findByText('landingsside.for.deg.foedt.etter.1963')
        ).toBeVisible()
        expect(
          screen.queryByText('landingsside.for.deg.foedt.foer.1963')
        ).not.toBeInTheDocument()
      })

      it('Når brukeren er pålogget og født før 1963, redirigerer brukeren til detaljert kalkulator', async () => {
        const open = vi.fn()
        vi.stubGlobal('open', open)
        mockResponse('/v4/person', {
          status: 200,
          json: {
            navn: 'Ola',
            sivilstand: 'GIFT',
            foedselsdato: '1961-04-30',
            pensjoneringAldre: {
              normertPensjoneringsalder: {
                aar: 67,
                maaneder: 0,
              },
              nedreAldersgrense: {
                aar: 62,
                maaneder: 0,
              },
            },
          },
        })
        const router = createMemoryRouter(routes, {
          basename: BASE_PATH,
          initialEntries: [`${BASE_PATH}${paths.login}`],
        })
        render(<RouterProvider router={router} />, {
          hasRouter: false,
        })
        await waitFor(() => {
          expect(open).toHaveBeenCalledWith(
            externalUrls.detaljertKalkulator,
            '_self'
          )
        })
      })
    })
  })

  describe(`Gitt at siden er en del av stegvisningen`, () => {
    describe(`${BASE_PATH}${paths.start}`, () => {
      it('sjekker påloggingstatus og redirigerer til ID-porten hvis brukeren ikke er pålogget', async () => {
        const open = vi.fn()
        vi.stubGlobal('open', open)
        mockErrorResponse('/oauth2/session', {
          baseUrl: `${HOST_BASEURL}`,
        })
        const router = createMemoryRouter(routes, {
          basename: BASE_PATH,
          initialEntries: [`${BASE_PATH}${paths.start}`],
        })
        render(<RouterProvider router={router} />, {
          hasRouter: false,
        })
        await waitFor(() => {
          expect(open).toHaveBeenCalledWith(
            'http://localhost:8088/pensjon/kalkulator/oauth2/login?redirect=%2F',
            '_self'
          )
        })
      })

      it('redirigerer brukeren til detaljert kalkulator, hvis brukeren er pålogget og født før 1963', async () => {
        const open = vi.fn()
        vi.stubGlobal('open', open)
        mockResponse('/v4/person', {
          status: 200,
          json: {
            navn: 'Ola',
            sivilstand: 'GIFT',
            foedselsdato: '1961-04-30',
            pensjoneringAldre: {
              normertPensjoneringsalder: {
                aar: 67,
                maaneder: 0,
              },
              nedreAldersgrense: {
                aar: 62,
                maaneder: 0,
              },
            },
          },
        })
        const router = createMemoryRouter(routes, {
          basename: BASE_PATH,
          initialEntries: [`${BASE_PATH}${paths.start}`],
        })
        render(<RouterProvider router={router} />, {
          hasRouter: false,
        })
        await waitFor(() => {
          expect(open).toHaveBeenCalledWith(
            externalUrls.detaljertKalkulator,
            '_self'
          )
        })
      })

      it('viser start steget', async () => {
        mockResponse('/oauth2/session', {
          baseUrl: `${HOST_BASEURL}`,
        })
        const router = createMemoryRouter(routes, {
          basename: BASE_PATH,
          initialEntries: [`${BASE_PATH}${paths.start}`],
        })
        render(<RouterProvider router={router} />, { hasRouter: false })
        await waitFor(async () => {
          expect(
            await screen.findByText('stegvisning.start.title Aprikos!')
          ).toBeVisible()
        })
      })
    })

    describe(`${BASE_PATH}${paths.henvisning}/${henvisningUrlParams.apotekerne}`, () => {
      it('sjekker påloggingstatus og redirigerer til ID-porten hvis brukeren ikke er pålogget', async () => {
        const open = vi.fn()
        vi.stubGlobal('open', open)
        mockErrorResponse('/oauth2/session', {
          baseUrl: `${HOST_BASEURL}`,
        })
        const router = createMemoryRouter(routes, {
          basename: BASE_PATH,
          initialEntries: [
            `${BASE_PATH}${paths.henvisning}/${henvisningUrlParams.apotekerne}`,
          ],
        })
        render(<RouterProvider router={router} />, {
          hasRouter: false,
        })
        await waitFor(() => {
          expect(open).toHaveBeenCalledWith(
            'http://localhost:8088/pensjon/kalkulator/oauth2/login?redirect=%2F',
            '_self'
          )
        })
      })
      it('viser henvisning apotekerne', async () => {
        mockResponse('/oauth2/session', {
          baseUrl: `${HOST_BASEURL}`,
        })
        const router = createMemoryRouter(routes, {
          basename: BASE_PATH,
          initialEntries: [
            `${BASE_PATH}${paths.henvisning}/${henvisningUrlParams.apotekerne}`,
          ],
        })
        render(<RouterProvider router={router} />, { hasRouter: false })

        expect(
          await screen.findByText('henvisning.apotekerne.body')
        ).toBeVisible()
      })
    })

    describe(`${BASE_PATH}${paths.forbehold}`, () => {
      it('sjekker påloggingstatus og redirigerer til ID-porten hvis brukeren ikke er pålogget', async () => {
        const open = vi.fn()
        vi.stubGlobal('open', open)
        mockErrorResponse('/oauth2/session', {
          baseUrl: `${HOST_BASEURL}`,
        })
        const router = createMemoryRouter(routes, {
          basename: BASE_PATH,
          initialEntries: [`${BASE_PATH}${paths.forbehold}`],
        })
        render(<RouterProvider router={router} />, {
          hasRouter: false,
        })
        await waitFor(() => {
          expect(open).toHaveBeenCalledWith(
            'http://localhost:8088/pensjon/kalkulator/oauth2/login?redirect=%2F',
            '_self'
          )
        })
      })
      it('viser forbehold siden', async () => {
        const router = createMemoryRouter(routes, {
          basename: BASE_PATH,
          initialEntries: [`${BASE_PATH}${paths.forbehold}`],
        })
        render(<RouterProvider router={router} />, {
          preloadedState: {
            api: {
              //@ts-ignore
              queries: {
                ...fulfilledGetPerson,
              },
            },
            userInput: {
              ...userInputInitialState,
            },
          },
          hasRouter: false,
        })
        expect(await screen.findByText('forbehold.title')).toBeInTheDocument()
      })
    })

    describe(`${BASE_PATH}${paths.sivilstand}`, () => {
      it('sjekker påloggingstatus og redirigerer til ID-porten hvis brukeren ikke er pålogget', async () => {
        const open = vi.fn()
        vi.stubGlobal('open', open)
        mockErrorResponse('/oauth2/session', {
          baseUrl: `${HOST_BASEURL}`,
        })
        const router = createMemoryRouter(routes, {
          basename: BASE_PATH,
          initialEntries: [`${BASE_PATH}${paths.sivilstand}`],
        })
        render(<RouterProvider router={router} />, {
          hasRouter: false,
        })
        await waitFor(() => {
          expect(open).toHaveBeenCalledWith(
            'http://localhost:8088/pensjon/kalkulator/oauth2/login?redirect=%2F',
            '_self'
          )
        })
      })
      it('redirigerer til /start når brukeren prøver å aksessere steget med direkte url', async () => {
        store.getState = vi.fn().mockImplementation(() => ({
          api: {},
          userInput: { ...userInputInitialState },
        }))
        const router = createMemoryRouter(routes, {
          basename: BASE_PATH,
          initialEntries: [`${BASE_PATH}${paths.sivilstand}`],
        })
        render(<RouterProvider router={router} />, {
          hasRouter: false,
        })
        expect(
          await screen.findByText('stegvisning.start.ingress')
        ).toBeInTheDocument()
      })
      it('Gitt at brukeren ikke har noe samboer, når hen kommer fra stegvisningen, viser sivilstand steg', async () => {
        store.getState = vi.fn().mockImplementation(() => ({
          api: {
            queries: {
              ...fulfilledGetPerson,
            },
          },
          userInput: { ...userInputInitialState },
        }))
        const router = createMemoryRouter(routes, {
          basename: BASE_PATH,
          initialEntries: [`${BASE_PATH}${paths.sivilstand}`],
        })
        render(<RouterProvider router={router} />, {
          preloadedState: {
            api: {
              // @ts-ignore
              queries: {
                ...fulfilledGetPerson,
                ...fulfilledGetGrunnbelop,
              },
            },
            userInput: { ...userInputInitialState },
          },
          hasRouter: false,
        })
        expect(
          await screen.findByText('stegvisning.sivilstand.title')
        ).toBeInTheDocument()
      })
    })

    describe(`${BASE_PATH}${paths.utenlandsopphold}`, () => {
      it('sjekker påloggingstatus og redirigerer til ID-porten hvis brukeren ikke er pålogget', async () => {
        const open = vi.fn()
        vi.stubGlobal('open', open)
        mockErrorResponse('/oauth2/session', {
          baseUrl: `${HOST_BASEURL}`,
        })
        const router = createMemoryRouter(routes, {
          basename: BASE_PATH,
          initialEntries: [`${BASE_PATH}${paths.utenlandsopphold}`],
        })
        render(<RouterProvider router={router} />, {
          hasRouter: false,
        })
        await waitFor(() => {
          expect(open).toHaveBeenCalledWith(
            'http://localhost:8088/pensjon/kalkulator/oauth2/login?redirect=%2F',
            '_self'
          )
        })
      })
      it('redirigerer til /start når brukeren prøver å aksessere steget med direkte url', async () => {
        store.getState = vi.fn().mockImplementation(() => ({
          api: {},
          userInput: { ...userInputInitialState },
        }))
        const router = createMemoryRouter(routes, {
          basename: BASE_PATH,
          initialEntries: [`${BASE_PATH}${paths.utenlandsopphold}`],
        })
        render(<RouterProvider router={router} />, {
          hasRouter: false,
        })
        expect(
          await screen.findByText('stegvisning.start.ingress')
        ).toBeInTheDocument()
      })
      it('viser utenlandsopphold når brukeren kommer til steget gjennom stegvisningen', async () => {
        store.getState = vi.fn().mockImplementation(() => ({
          api: {
            queries: {
              ...fakeApiCalls,
            },
          },
          userInput: { ...userInputInitialState },
        }))
        const router = createMemoryRouter(routes, {
          basename: BASE_PATH,
          initialEntries: [`${BASE_PATH}${paths.utenlandsopphold}`],
        })
        render(<RouterProvider router={router} />, {
          hasRouter: false,
        })
        expect(
          await screen.findByText('stegvisning.utenlandsopphold.title')
        ).toBeInTheDocument()
      })
    })

    describe(`${BASE_PATH}${paths.afp}`, () => {
      it('sjekker påloggingstatus og redirigerer til ID-porten hvis brukeren ikke er pålogget', async () => {
        const open = vi.fn()
        vi.stubGlobal('open', open)
        mockErrorResponse('/oauth2/session', {
          baseUrl: `${HOST_BASEURL}`,
        })
        const router = createMemoryRouter(routes, {
          basename: BASE_PATH,
          initialEntries: [`${BASE_PATH}${paths.afp}`],
        })
        render(<RouterProvider router={router} />, {
          hasRouter: false,
        })
        await waitFor(() => {
          expect(open).toHaveBeenCalledWith(
            'http://localhost:8088/pensjon/kalkulator/oauth2/login?redirect=%2F',
            '_self'
          )
        })
      })
      it('redirigerer til /start når brukeren prøver å aksessere steget med direkte url', async () => {
        store.getState = vi.fn().mockImplementation(() => ({
          api: {},
          userInput: { ...userInputInitialState },
        }))
        const router = createMemoryRouter(routes, {
          basename: BASE_PATH,
          initialEntries: [`${BASE_PATH}${paths.afp}`],
        })
        render(<RouterProvider router={router} />, {
          hasRouter: false,
        })
        expect(
          await screen.findByText('stegvisning.start.ingress')
        ).toBeInTheDocument()
      })
      it('viser afp steget når brukeren kommer til steget gjennom stegvisningen og at /person, /loepende-vedtak, /inntekt og /ekskludert ikke har feilet', async () => {
        const mockedState = {
          api: {
            queries: {
              ...fulfilledGetPerson,
              ...fulfilledGetInntekt,
              ...fulfilledGetEkskludertStatus,
              ...fulfilledGetLoependeVedtak0Ufoeregrad,
              ...fulfilledGetOmstillingsstoenadOgGjenlevendeUtenSak,
            },
          },
          userInput: { ...userInputInitialState, samtykke: null },
        }
        store.getState = vi.fn().mockImplementation(() => {
          return mockedState
        })
        const router = createMemoryRouter(routes, {
          basename: BASE_PATH,
          initialEntries: [`${BASE_PATH}${paths.afp}`],
        })
        render(<RouterProvider router={router} />, {
          hasRouter: false,
        })
        expect(
          await screen.findByText('stegvisning.afp.title')
        ).toBeInTheDocument()
      })
    })

    describe(`${BASE_PATH}${paths.ufoeretrygdAFP}`, () => {
      it('sjekker påloggingstatus og redirigerer til ID-porten hvis brukeren ikke er pålogget', async () => {
        const open = vi.fn()
        vi.stubGlobal('open', open)
        mockErrorResponse('/oauth2/session', {
          baseUrl: `${HOST_BASEURL}`,
        })
        const router = createMemoryRouter(routes, {
          basename: BASE_PATH,
          initialEntries: [`${BASE_PATH}${paths.ufoeretrygdAFP}`],
        })
        render(<RouterProvider router={router} />, {
          hasRouter: false,
        })
        await waitFor(() => {
          expect(open).toHaveBeenCalledWith(
            'http://localhost:8088/pensjon/kalkulator/oauth2/login?redirect=%2F',
            '_self'
          )
        })
      })
      it('redirigerer til /start når brukeren prøver å aksessere steget med direkte url', async () => {
        store.getState = vi.fn().mockImplementation(() => ({
          api: {},
          userInput: { ...userInputInitialState },
        }))
        const router = createMemoryRouter(routes, {
          basename: BASE_PATH,
          initialEntries: [`${BASE_PATH}${paths.ufoeretrygdAFP}`],
        })
        render(<RouterProvider router={router} />, {
          hasRouter: false,
        })
        expect(
          await screen.findByText('stegvisning.start.ingress')
        ).toBeInTheDocument()
      })
      it('Gitt at brukeren mottar uføretrygd og har valgt afp, når hen kommer fra stegvisningen, vises steget', async () => {
        store.getState = vi.fn().mockImplementation(() => ({
          api: {
            queries: {
              ...fulfilledGetPerson,
              ...fulfilledGetLoependeVedtak75Ufoeregrad,
            },
          },
          userInput: { ...userInputInitialState },
        }))
        const router = createMemoryRouter(routes, {
          basename: BASE_PATH,
          initialEntries: [`${BASE_PATH}${paths.ufoeretrygdAFP}`],
        })
        render(<RouterProvider router={router} />, {
          preloadedState: {
            userInput: { ...userInputInitialState, afp: 'ja_offentlig' },
          },
          hasRouter: false,
        })
        expect(
          await screen.findByText('stegvisning.ufoere.title')
        ).toBeInTheDocument()
      })
    })

    describe(`${BASE_PATH}${paths.samtykkeOffentligAFP}`, () => {
      it('sjekker påloggingstatus og redirigerer til ID-porten hvis brukeren ikke er pålogget', async () => {
        const open = vi.fn()
        vi.stubGlobal('open', open)
        mockErrorResponse('/oauth2/session', {
          baseUrl: `${HOST_BASEURL}`,
        })
        const router = createMemoryRouter(routes, {
          basename: BASE_PATH,
          initialEntries: [`${BASE_PATH}${paths.samtykkeOffentligAFP}`],
        })
        render(<RouterProvider router={router} />, {
          hasRouter: false,
        })
        await waitFor(() => {
          expect(open).toHaveBeenCalledWith(
            'http://localhost:8088/pensjon/kalkulator/oauth2/login?redirect=%2F',
            '_self'
          )
        })
      })

      it('redirigerer til /start når brukeren prøver å aksessere steget med direkte url', async () => {
        store.getState = vi.fn().mockImplementation(() => ({
          api: {},
          userInput: { ...userInputInitialState },
        }))
        const router = createMemoryRouter(routes, {
          basename: BASE_PATH,
          initialEntries: [`${BASE_PATH}${paths.samtykkeOffentligAFP}`],
        })
        render(<RouterProvider router={router} />, {
          hasRouter: false,
        })
        expect(
          await screen.findByText('stegvisning.start.ingress')
        ).toBeInTheDocument()
      })

      it('Gitt at brukeren ikke mottar uføretrygd og har valgt AFP offentlig, når hen kommer fra stegvisningen, vises steget', async () => {
        store.getState = vi.fn().mockImplementation(() => ({
          api: {
            queries: {
              ['getLoependeVedtak(undefined)']: {
                status: 'fulfilled',
                endpointName: 'getLoependeVedtak',
                requestId: 't1wLPiRKrfe_vchftk8s8',
                data: {
                  ufoeretrygd: {
                    grad: 0,
                  },
                  harFremtidigLoependeVedtak: false,
                },
                startedTimeStamp: 1714725797072,
                fulfilledTimeStamp: 1714725797669,
              },
            },
          },
          userInput: { ...userInputInitialState, afp: 'ja_offentlig' },
        }))
        const router = createMemoryRouter(routes, {
          basename: BASE_PATH,
          initialEntries: [`${BASE_PATH}${paths.samtykkeOffentligAFP}`],
        })
        render(<RouterProvider router={router} />, {
          hasRouter: false,
        })
        expect(
          await screen.findByText('stegvisning.samtykke_offentlig_afp.title')
        ).toBeInTheDocument()
      })
    })

    describe(`${BASE_PATH}${paths.samtykke}`, () => {
      it('sjekker påloggingstatus og redirigerer til ID-porten hvis brukeren ikke er pålogget', async () => {
        const open = vi.fn()
        vi.stubGlobal('open', open)
        mockErrorResponse('/oauth2/session', {
          baseUrl: `${HOST_BASEURL}`,
        })
        const router = createMemoryRouter(routes, {
          basename: BASE_PATH,
          initialEntries: [`${BASE_PATH}${paths.samtykke}`],
        })
        render(<RouterProvider router={router} />, {
          hasRouter: false,
        })
        await waitFor(() => {
          expect(open).toHaveBeenCalledWith(
            'http://localhost:8088/pensjon/kalkulator/oauth2/login?redirect=%2F',
            '_self'
          )
        })
      })
      it('redirigerer til /start når brukeren prøver å aksessere steget med direkte url', async () => {
        const router = createMemoryRouter(routes, {
          basename: BASE_PATH,
          initialEntries: [`${BASE_PATH}${paths.samtykke}`],
        })
        render(<RouterProvider router={router} />, {
          hasRouter: false,
        })
        expect(
          await screen.findByText('stegvisning.start.ingress')
        ).toBeInTheDocument()
      })

      it('viser steget når brukeren kommer til steget gjennom stegvisningen', async () => {
        store.getState = vi.fn().mockImplementation(() => ({
          api: {
            ...fakeApiCalls,
          },
          userInput: { ...userInputInitialState },
        }))
        const router = createMemoryRouter(routes, {
          basename: BASE_PATH,
          initialEntries: [`${BASE_PATH}${paths.samtykke}`],
        })
        render(<RouterProvider router={router} />, {
          hasRouter: false,
        })
        expect(
          await screen.findByText('stegvisning.samtykke_pensjonsavtaler.title')
        ).toBeInTheDocument()
      })
    })

    describe(`${BASE_PATH}${paths.uventetFeil}`, () => {
      it('sjekker påloggingstatus og redirigerer til ID-porten hvis brukeren ikke er pålogget', async () => {
        const open = vi.fn()
        vi.stubGlobal('open', open)
        mockErrorResponse('/oauth2/session', {
          baseUrl: `${HOST_BASEURL}`,
        })
        const router = createMemoryRouter(routes, {
          basename: BASE_PATH,
          initialEntries: [`${BASE_PATH}${paths.uventetFeil}`],
        })
        render(<RouterProvider router={router} />, {
          hasRouter: false,
        })
        await waitFor(() => {
          expect(open).toHaveBeenCalledWith(
            'http://localhost:8088/pensjon/kalkulator/oauth2/login?redirect=%2F',
            '_self'
          )
        })
      })
      it('redirigerer til /start når brukeren prøver å aksessere steget med direkte url', async () => {
        store.getState = vi.fn().mockImplementation(() => ({
          api: {},
          userInput: { ...userInputInitialState },
        }))
        const router = createMemoryRouter(routes, {
          basename: BASE_PATH,
          initialEntries: [`${BASE_PATH}${paths.uventetFeil}`],
        })
        render(<RouterProvider router={router} />, {
          hasRouter: false,
        })
        expect(
          await screen.findByText('stegvisning.start.ingress')
        ).toBeInTheDocument()
      })
      it('viser uventet feil når brukeren kommer til steget gjennom stegvisningen', async () => {
        store.getState = vi.fn().mockImplementation(() => ({
          api: {
            queries: {
              ...fakeApiCalls,
            },
          },
          userInput: { ...userInputInitialState },
        }))
        const router = createMemoryRouter(routes, {
          basename: BASE_PATH,
          initialEntries: [`${BASE_PATH}${paths.uventetFeil}`],
        })
        render(<RouterProvider router={router} />, {
          hasRouter: false,
        })
        expect(
          await screen.findByTestId('error-step-unexpected')
        ).toBeInTheDocument()
      })
    })

    describe(`${BASE_PATH}${paths.beregningEnkel}`, () => {
      it('sjekker påloggingstatus og redirigerer til ID-porten hvis brukeren ikke er pålogget', async () => {
        const open = vi.fn()
        vi.stubGlobal('open', open)
        mockErrorResponse('/oauth2/session', {
          baseUrl: `${HOST_BASEURL}`,
        })
        const router = createMemoryRouter(routes, {
          basename: BASE_PATH,
          initialEntries: [`${BASE_PATH}${paths.beregningEnkel}`],
        })
        render(<RouterProvider router={router} />, {
          hasRouter: false,
        })
        await waitFor(() => {
          expect(open).toHaveBeenCalledWith(
            'http://localhost:8088/pensjon/kalkulator/oauth2/login?redirect=%2F',
            '_self'
          )
        })
      })
      it('redirigerer til /start når brukeren prøver å aksessere steget med direkte url', async () => {
        store.getState = vi.fn().mockImplementation(() => ({
          api: {},
          userInput: { ...userInputInitialState },
        }))
        const router = createMemoryRouter(routes, {
          basename: BASE_PATH,
          initialEntries: [`${BASE_PATH}${paths.beregningEnkel}`],
        })
        render(<RouterProvider router={router} />, {
          hasRouter: false,
        })
        expect(
          await screen.findByText('stegvisning.start.ingress')
        ).toBeInTheDocument()
      })

      it('viser beregningen når brukeren kommer til steget gjennom stegvisningen', async () => {
        store.getState = vi.fn().mockImplementation(() => ({
          api: {
            queries: {
              ...fakeApiCalls,
              ...fulfilledGetPerson,
              ...fulfilledGetLoependeVedtak0Ufoeregrad,
            },
          },
          userInput: { ...userInputInitialState },
        }))
        const router = createMemoryRouter(routes, {
          basename: BASE_PATH,
          initialEntries: [`${BASE_PATH}${paths.beregningEnkel}`],
        })
        render(<RouterProvider router={router} />, {
          hasRouter: false,
          preloadedState: {
            api: {
              // @ts-ignore
              queries: {
                ...fakeApiCalls,
                ...fulfilledGetPerson,
                ...fulfilledGetLoependeVedtak0Ufoeregrad,
              },
            },
            userInput: {
              ...userInputInitialState,
              currentSimulation: {
                ...userInputInitialState.currentSimulation,
              },
            },
          },
        })

        await waitFor(async () => {
          expect(
            screen.queryByTestId('uttaksalder-loader')
          ).not.toBeInTheDocument()
          expect(
            await screen.findByText('velguttaksalder.title')
          ).toBeInTheDocument()
        })
      })
    })

    describe(`${BASE_PATH}${paths.beregningAvansert}`, () => {
      it('sjekker påloggingstatus og redirigerer til ID-porten hvis brukeren ikke er pålogget', async () => {
        const open = vi.fn()
        vi.stubGlobal('open', open)
        mockErrorResponse('/oauth2/session', {
          baseUrl: `${HOST_BASEURL}`,
        })
        const router = createMemoryRouter(routes, {
          basename: BASE_PATH,
          initialEntries: [`${BASE_PATH}${paths.beregningAvansert}`],
        })
        render(<RouterProvider router={router} />, {
          hasRouter: false,
        })
        await waitFor(() => {
          expect(open).toHaveBeenCalledWith(
            'http://localhost:8088/pensjon/kalkulator/oauth2/login?redirect=%2F',
            '_self'
          )
        })
      })
      it('redirigerer til /start når brukeren prøver å aksessere steget med direkte url', async () => {
        store.getState = vi.fn().mockImplementation(() => ({
          api: {},
          userInput: { ...userInputInitialState },
        }))
        const router = createMemoryRouter(routes, {
          basename: BASE_PATH,
          initialEntries: [`${BASE_PATH}${paths.beregningAvansert}`],
        })
        render(<RouterProvider router={router} />, {
          hasRouter: false,
        })
        expect(
          await screen.findByText('stegvisning.start.ingress')
        ).toBeInTheDocument()
      })

      it('viser beregningen når brukeren kommer til steget gjennom stegvisningen', async () => {
        store.getState = vi.fn().mockImplementation(() => ({
          api: {
            queries: {
              ...fakeApiCalls,
              ...fulfilledGetPerson,
              ...fulfilledGetLoependeVedtak0Ufoeregrad,
            },
          },
          userInput: { ...userInputInitialState },
        }))
        const router = createMemoryRouter(routes, {
          basename: BASE_PATH,
          initialEntries: [`${BASE_PATH}${paths.beregningAvansert}`],
        })
        render(<RouterProvider router={router} />, {
          hasRouter: false,
          preloadedState: {
            api: {
              // @ts-ignore
              queries: {
                ...fakeApiCalls,
                ...fulfilledGetPerson,
                ...fulfilledGetLoependeVedtak0Ufoeregrad,
              },
            },
            userInput: {
              ...userInputInitialState,
              samtykke: true,
              afp: 'ja_privat',
              currentSimulation: {
                ...userInputInitialState.currentSimulation,
              },
            },
          },
        })

        await waitFor(async () => {
          expect(
            await screen.findByText(
              'beregning.avansert.rediger.inntekt_frem_til_uttak.label'
            )
          ).toBeInTheDocument()
        })
      })
    })
  })

  it('Uregistrerte url med path /pensjon/kalkulator/* sender til 404 siden', async () => {
    const router = createMemoryRouter(routes, {
      basename: BASE_PATH,
      initialEntries: ['/pensjon/kalkulator/abc'],
    })

    render(<RouterProvider router={router} />, {
      hasRouter: false,
    })
    expect(screen.getByTestId('error-page-404')).toBeInTheDocument()
  })
})

import { add, endOfDay, format } from 'date-fns'
import { LoaderFunctionArgs } from 'react-router'
import { describe, it, vi } from 'vitest'

import {
  fulfilledGetGrunnbeloep,
  fulfilledGetLoependeVedtak0Ufoeregrad,
  fulfilledGetPerson,
  fulfilledPre1963GetPerson,
} from '@/mocks/mockedRTKQueryApiCalls'
import { mockErrorResponse, mockResponse } from '@/mocks/server'
import { paths } from '@/router/constants'
import type { Reason } from '@/router/loaders'
import * as apiSliceUtils from '@/state/api/apiSlice'
import { store } from '@/state/store'
import {
  UserInputState,
  userInputInitialState,
} from '@/state/userInput/userInputSlice'
import { DATE_BACKEND_FORMAT } from '@/utils/dates'

import {
  authenticationGuard,
  beregningEnkelAccessGuard,
  directAccessGuard,
  landingPageAccessGuard,
  stepAFPAccessGuard,
  stepSamtykkeOffentligAFPAccessGuard,
  stepSamtykkePensjonsavtaler,
  stepSivilstandAccessGuard,
  stepStartAccessGuard,
  stepUfoeretrygdAFPAccessGuard,
  stepUtenlandsoppholdAccessGuard,
} from '../loaders'

function expectRedirectResponse(
  returnedFromLoader: Response | object | undefined,
  expectedLocation?: string
) {
  expect(returnedFromLoader).toBeDefined()
  if (!returnedFromLoader) {
    throw new Error('Response is falsy')
  }

  expect(returnedFromLoader).toHaveProperty('status')
  if (!('status' in returnedFromLoader)) {
    throw new Error('Response does not have a status property')
  }

  expect(returnedFromLoader.status).toBe(302)
  if (expectedLocation) {
    expect(returnedFromLoader.headers.get('location')).toBe(expectedLocation)
  }
}

export function createMockRequest(
  url = 'https://example.com'
): LoaderFunctionArgs {
  return {
    request: new Request(url),
    params: {},
    context: {},
  }
}

describe('Loaders', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  afterEach(() => {
    store.dispatch(apiSliceUtils.apiSlice.util.resetApiState())
  })

  describe('landingPageAccesGuard', () => {
    it('kaller redirect til /start når brukeren er veileder', async () => {
      const mockedState = {
        userInput: { ...userInputInitialState, veilederBorgerFnr: '81549300' },
      }
      store.getState = vi.fn().mockImplementation(() => mockedState)

      const returnedFromLoader = landingPageAccessGuard()
      expectRedirectResponse(returnedFromLoader, paths.start)
    })
  })

  describe('directAccessGuard', () => {
    it('returnerer redirect til /start location når ingen api kall er registrert', async () => {
      const mockedState = {
        api: { queries: {} },
        userInput: { ...userInputInitialState, samtykke: null },
      }
      store.getState = vi.fn().mockImplementation(() => mockedState)
      const returnedFromLoader = directAccessGuard()
      expectRedirectResponse(returnedFromLoader, paths.start)
    })

    it('returnerer ingenting når minst ett api kall er registrert', async () => {
      const mockedState = {
        api: { queries: { ...fulfilledGetPerson } },
        userInput: { ...userInputInitialState, samtykke: null },
      }
      store.getState = vi.fn().mockImplementation(() => mockedState)
      const returnedFromLoader = directAccessGuard()
      expect(returnedFromLoader).toBeUndefined()
    })

    it('returnerer ingenting når sanity-timeout query parameter er satt', async () => {
      const originalLocation = window.location
      const mockLocation = new URL('https://example.com?sanity-timeout=1')
      Object.defineProperty(window, 'location', {
        writable: true,
        value: mockLocation,
      })

      const mockedState = {
        api: { queries: {} },
        userInput: { ...userInputInitialState, samtykke: null },
      }
      store.getState = vi.fn().mockImplementation(() => mockedState)

      const returnedFromLoader = directAccessGuard()

      expect(returnedFromLoader).toBeUndefined()

      Object.defineProperty(window, 'location', {
        writable: true,
        value: originalLocation,
      })
    })
  })

  describe('authenticationGuard', () => {
    it('kaller /oauth2/session', async () => {
      const initiateMock = vi.spyOn(global, 'fetch')
      await authenticationGuard()
      expect(initiateMock).toHaveBeenCalledWith(
        'http://localhost:8088/pensjon/kalkulator/oauth2/session'
      )
    })
  })

  describe('stepStartAccessGuard', () => {
    it('returnerer person og loependeVedtak', async () => {
      store.getState = vi.fn().mockImplementation(() => ({
        userInput: { ...userInputInitialState },
        session: { isLoggedIn: false, hasErApotekerError: false },
      }))

      const returnedFromLoader = await stepStartAccessGuard()
      expect(returnedFromLoader).toHaveProperty('person')
      if (!returnedFromLoader || !('person' in returnedFromLoader)) {
        throw new Error('person not in returnedFromLoader')
      }

      expect(returnedFromLoader?.person?.foedselsdato).toBe('1964-04-30')
      expect(returnedFromLoader?.loependeVedtak?.ufoeretrygd.grad).toBe(0)
    })

    it('Når /vedtak/loepende-vedtak kall feiler redirigeres bruker til uventet-feil side', async () => {
      mockErrorResponse('/v4/vedtak/loepende-vedtak')

      store.getState = vi.fn().mockImplementation(() => ({
        session: { isLoggedIn: true, hasErApotekerError: false },
        userInput: { ...userInputInitialState },
      }))

      expectRedirectResponse(await stepStartAccessGuard(), paths.uventetFeil)
    })

    it('Når /person kall feiler med 403 status og reason er INVALID_REPRESENTASJON, redirigeres bruker til ingen-tilgang', async () => {
      mockErrorResponse('/v6/person', {
        status: 403,
        json: {
          reason: 'INVALID_REPRESENTASJON' as Reason,
        },
      })

      store.getState = vi.fn().mockImplementation(() => ({
        session: { isLoggedIn: true, hasErApotekerError: false },
        userInput: { ...userInputInitialState },
      }))

      expectRedirectResponse(await stepStartAccessGuard(), paths.ingenTilgang)
    })

    it('Når /person kall feiler med 403 status og reason er INSUFFICIENT_LEVEL_OF_ASSURANCE, redirigeres bruker til uventet-feil', async () => {
      mockErrorResponse('/v6/person', {
        status: 403,
        json: {
          reason: 'INSUFFICIENT_LEVEL_OF_ASSURANCE' as Reason,
        },
      })

      store.getState = vi.fn().mockImplementation(() => ({
        session: { isLoggedIn: true, hasErApotekerError: false },
        userInput: { ...userInputInitialState },
      }))

      expectRedirectResponse(
        await stepStartAccessGuard(),
        paths.lavtSikkerhetsnivaa
      )
    })

    it('Når /person kall feiler med annen status redirigeres bruker til uventet-feil side', async () => {
      mockErrorResponse('/v6/person', {
        status: 503,
      })

      store.getState = vi.fn().mockImplementation(() => ({
        session: { isLoggedIn: true, hasErApotekerError: false },
        userInput: { ...userInputInitialState },
      }))

      expectRedirectResponse(await stepStartAccessGuard(), paths.uventetFeil)
    })

    it('Når vedlikeholdsmodus er aktivert blir man redirigert', async () => {
      mockResponse('/feature/pensjonskalkulator.vedlikeholdsmodus', {
        json: { enabled: true },
      })

      store.getState = vi.fn().mockImplementation(() => ({
        session: { isLoggedIn: true, hasErApotekerError: false },
        userInput: { ...userInputInitialState },
      }))

      expectRedirectResponse(
        await stepStartAccessGuard(),
        '/kalkulatoren-virker-ikke'
      )
    })
  })

  describe('stepSivilstandAccessGuard', async () => {
    it('kaller redirect til /start når ingen API-kall er registrert', async () => {
      store.getState = vi.fn().mockImplementation(() => ({
        api: { queries: {} },
        userInput: { ...userInputInitialState, samtykke: null },
      }))

      expectRedirectResponse(
        await stepSivilstandAccessGuard(createMockRequest()),
        '/start'
      )
    })

    it('returnerer person og grunnbeloep', async () => {
      store.getState = vi.fn().mockImplementation(() => ({
        api: {
          queries: {
            ...fulfilledGetPerson,
            ...fulfilledGetGrunnbeloep,
          },
        },
        userInput: { ...userInputInitialState },
      }))

      const returnedFromLoader =
        await stepSivilstandAccessGuard(createMockRequest())
      expect(returnedFromLoader).toHaveProperty('person')
      if (!returnedFromLoader || !('person' in returnedFromLoader)) {
        throw new Error('person not in returnedFromLoader')
      }

      expect(returnedFromLoader.person.sivilstand).toBe('UGIFT')
      expect(returnedFromLoader.grunnbeloep).toBe(100000)
    })

    it('returner undefined som grunnbeloep dersom g.nav.no feiler', async () => {
      mockErrorResponse('/api/v1/grunnbel%C3%B8p', {
        baseUrl: 'https://g.nav.no',
      })
      store.getState = vi.fn().mockImplementation(() => ({
        api: { queries: { mock: 'mock' } },
        userInput: { ...userInputInitialState },
      }))

      const returnedFromLoader =
        await stepSivilstandAccessGuard(createMockRequest())
      expect(returnedFromLoader).toHaveProperty('grunnbeloep')
      if (!returnedFromLoader || !('grunnbeloep' in returnedFromLoader)) {
        throw new Error('grunnbeloep not in returnedFromLoader')
      }
      expect(returnedFromLoader.grunnbeloep).toBeUndefined()
    })

    it('redirigerer brukere født før 1963 med vedtak om alderspensjon', async () => {
      mockResponse('/v6/person', {
        json: {
          fornavn: 'Test Person',
          sivilstand: 'UGIFT',
          foedselsdato: '1960-04-30',
          pensjoneringAldre: {
            normertPensjoneringsalder: { aar: 67, maaneder: 0 },
            nedreAldersgrense: { aar: 62, maaneder: 0 },
            oevreAldersgrense: { aar: 75, maaneder: 0 },
          },
        },
      })
      mockResponse('/v4/vedtak/loepende-vedtak', {
        json: {
          harLoependeVedtak: true,
          ufoeretrygd: { grad: 0 },
          alderspensjon: {
            grad: 100,
            fom: '2020-10-02',
            sivilstand: 'UGIFT',
          },
        },
      })
      const mockedState = {
        api: {
          queries: {
            ...fulfilledPre1963GetPerson,
          },
        },
        userInput: { ...userInputInitialState, samtykke: null },
      }

      store.getState = vi.fn().mockImplementation(() => mockedState)

      expectRedirectResponse(
        await stepSivilstandAccessGuard(createMockRequest()),
        '/utenlandsopphold'
      )
    })
  })

  describe('stepUtenlandsoppholdAccessGuard', () => {
    it('kaller redirect til /start når ingen API-kall er registrert', async () => {
      store.getState = vi.fn().mockImplementation(() => ({
        api: { queries: {} },
        userInput: { ...userInputInitialState, samtykke: null },
      }))

      expectRedirectResponse(
        await stepUtenlandsoppholdAccessGuard(createMockRequest()),
        '/start'
      )
    })
    it('redirigerer brukere født før 1963 med vedtak om alderspensjon', async () => {
      mockResponse('/v6/person', {
        json: {
          fornavn: 'Test Person',
          sivilstand: 'UGIFT',
          foedselsdato: '1960-04-30',
          pensjoneringAldre: {
            normertPensjoneringsalder: { aar: 67, maaneder: 0 },
            nedreAldersgrense: { aar: 62, maaneder: 0 },
            oevreAldersgrense: { aar: 75, maaneder: 0 },
          },
        },
      })
      mockResponse('/v4/vedtak/loepende-vedtak', {
        json: {
          harLoependeVedtak: true,
          ufoeretrygd: { grad: 0 },
          alderspensjon: {
            grad: 100,
            fom: '2020-10-02',
            sivilstand: 'UGIFT',
          },
        },
      })
      const mockedState = {
        api: {
          queries: {
            ...fulfilledPre1963GetPerson,
          },
        },
        userInput: { ...userInputInitialState, samtykke: null },
      }

      store.getState = vi.fn().mockImplementation(() => mockedState)

      expectRedirectResponse(
        await stepUtenlandsoppholdAccessGuard(createMockRequest()),
        '/afp'
      )
    })
  })

  describe('stepAFPAccessGuard', async () => {
    const mockedVellykketQueries = {
      ['getInntekt(undefined)']: {
        status: 'fulfilled',
        endpointName: 'getInntekt',
        requestId: 't1wLPiRKrfe_vchftk8s8',
        data: { beloep: 521338, aar: 2021 },
        startedTimeStamp: 1714725797072,
        fulfilledTimeStamp: 1714725797669,
      },
      ['getOmstillingsstoenadOgGjenlevende(undefined)']: {
        status: 'fulfilled',
        endpointName: 'getOmstillingsstoenadOgGjenlevende',
        requestId: 't1wLPiRKrfe_vchftk8s8',
        data: { harLoependeSak: false },
        startedTimeStamp: 1714725797072,
        fulfilledTimeStamp: 1714725797669,
      },
      ['getApotekerStatus(undefined)']: {
        status: 'fulfilled',
        endpointName: 'getApotekerStatus',
        requestId: 't1wLPiRKrfe_vchftk8s8',
        data: { apoteker: false, aarsak: 'NONE' },
        startedTimeStamp: 1714725797072,
        fulfilledTimeStamp: 1714725797669,
      },
    }

    it('kaller redirect til /start når ingen API-kall er registrert', async () => {
      store.getState = vi.fn().mockImplementation(() => ({
        api: { queries: {} },
        userInput: { ...userInputInitialState, samtykke: null },
      }))

      expectRedirectResponse(
        await stepAFPAccessGuard(createMockRequest()),
        '/start'
      )
    })

    describe('Gitt at alle kallene er vellykket, ', () => {
      it('brukere uten uføretrygd og uten vedtak om AFP er ikke redirigert', async () => {
        const mockedState = {
          api: { queries: { mock: 'mock' } },
          userInput: { ...userInputInitialState, samtykke: null },
        }
        store.getState = vi.fn().mockImplementation(() => mockedState)

        const returnedFromLoader = stepAFPAccessGuard(createMockRequest())
        await expect(returnedFromLoader).resolves.toMatchObject({
          loependeVedtak: { ufoeretrygd: { grad: 0 } },
        })
      })

      it('brukere med gradert uføretrygd som er yngre enn AFP-Uføre oppsigelsesalder, er ikke redirigert', async () => {
        const minAlderYearsBeforeNow = add(endOfDay(new Date()), {
          years: -61,
          months: -11,
        })
        const foedselsdato = format(minAlderYearsBeforeNow, DATE_BACKEND_FORMAT)

        mockResponse('/v4/vedtak/loepende-vedtak', {
          json: {
            ufoeretrygd: { grad: 75 },
            harLoependeVedtak: true,
          } satisfies LoependeVedtak,
        })
        mockResponse('/v6/person', {
          json: {
            fornavn: 'Aprikos',
            navn: 'Aprikos Normann',
            sivilstand: 'UGIFT',
            foedselsdato,
            pensjoneringAldre: {
              normertPensjoneringsalder: {
                aar: 67,
                maaneder: 0,
              },
              nedreAldersgrense: {
                aar: 62,
                maaneder: 0,
              },
              oevreAldersgrense: {
                aar: 75,
                maaneder: 0,
              },
            },
          } satisfies Person,
        })

        const mockedState = {
          api: { queries: { mock: 'mock' } },
          userInput: { ...userInputInitialState, samtykke: null },
        }
        store.getState = vi.fn().mockImplementation(() => mockedState)

        const returnedFromLoader = stepAFPAccessGuard(createMockRequest())
        await expect(returnedFromLoader).resolves.toMatchObject({
          person: { foedselsdato },
          loependeVedtak: { ufoeretrygd: { grad: 75 } },
        })
      })

      it('brukere med gradert uføretrygd som er eldre enn AFP-Uføre oppsigelsesalder, er redirigert', async () => {
        const minAlderYearsBeforeNow = add(endOfDay(new Date()), {
          years: -62,
          months: -1,
        })
        const foedselsdato = format(minAlderYearsBeforeNow, DATE_BACKEND_FORMAT)

        mockResponse('/v4/vedtak/loepende-vedtak', {
          json: {
            ufoeretrygd: { grad: 75 },
            harLoependeVedtak: true,
          } satisfies LoependeVedtak,
        })
        mockResponse('/v6/person', {
          json: {
            fornavn: 'Aprikos',
            navn: 'Aprikos Normann',
            sivilstand: 'UGIFT',
            foedselsdato,
            pensjoneringAldre: {
              normertPensjoneringsalder: {
                aar: 67,
                maaneder: 0,
              },
              nedreAldersgrense: {
                aar: 62,
                maaneder: 0,
              },
              oevreAldersgrense: {
                aar: 75,
                maaneder: 0,
              },
            },
          } satisfies Person,
        })

        const mockedState = {
          api: { queries: { mock: 'mock' } },
          userInput: { ...userInputInitialState, samtykke: null },
        }
        store.getState = vi.fn().mockImplementation(() => mockedState)

        expectRedirectResponse(
          await stepAFPAccessGuard(createMockRequest()),
          paths.ufoeretrygdAFP
        )
      })

      it('brukere med vedtak om afp-offentlig, er redirigert', async () => {
        mockResponse('/v4/vedtak/loepende-vedtak', {
          json: {
            harLoependeVedtak: true,
            ufoeretrygd: {
              grad: 0,
            },
            afpOffentlig: {
              fom: '2020-10-02',
            },
          } satisfies LoependeVedtak,
        })
        const mockedState = {
          api: { queries: { mock: 'mock' } },
          userInput: { ...userInputInitialState, samtykke: null },
        }
        store.getState = vi.fn().mockImplementation(() => mockedState)

        expectRedirectResponse(
          await stepAFPAccessGuard(createMockRequest()),
          paths.ufoeretrygdAFP
        )
      })

      it('brukere med vedtak om afp-privat, er redirigert', async () => {
        mockResponse('/v4/vedtak/loepende-vedtak', {
          json: {
            harLoependeVedtak: true,
            alderspensjon: {
              grad: 0,
              uttaksgradFom: '2020-10-02',
              fom: '2020-10-02',
              sivilstand: 'UGIFT',
            },
            ufoeretrygd: {
              grad: 0,
            },
            afpPrivat: {
              fom: '2020-10-02',
            },
          } satisfies LoependeVedtak,
        })
        const mockedState = {
          api: { queries: { mock: 'mock' } },
          userInput: { ...userInputInitialState, samtykke: null },
        }
        store.getState = vi.fn().mockImplementation(() => mockedState)

        expectRedirectResponse(
          await stepAFPAccessGuard(createMockRequest()),
          paths.ufoeretrygdAFP
        )
      })

      it('brukere med 100 % uføretrygd er redirigert', async () => {
        mockResponse('/v4/vedtak/loepende-vedtak', {
          json: {
            harLoependeVedtak: true,
            alderspensjon: {
              grad: 0,
              uttaksgradFom: '2020-10-02',
              fom: '2020-10-02',
              sivilstand: 'UGIFT',
            },
            ufoeretrygd: {
              grad: 100,
            },
            afpPrivat: {
              fom: '2020-10-02',
            },
          } satisfies LoependeVedtak,
        })
        const mockedState = {
          api: { queries: { mock: 'mock' } },
          userInput: { ...userInputInitialState },
        }
        store.getState = vi.fn().mockImplementation(() => mockedState)

        expectRedirectResponse(
          await stepAFPAccessGuard(createMockRequest()),
          paths.ufoeretrygdAFP
        )
      })
    })

    it('Gitt at getInntekt har tidligere feilet kalles den på nytt. Når den er vellykket i tillegg til de to andre kallene, er brukeren ikke redirigert', async () => {
      mockResponse('/inntekt', {
        status: 200,
        json: {
          beloep: 521338,
          aar: 2021,
        },
      })

      const mockedState = {
        api: {
          queries: {
            ...mockedVellykketQueries,
            ...fulfilledGetLoependeVedtak0Ufoeregrad,
            ['getInntekt(undefined)']: {
              status: 'rejected',
              endpointName: 'getInntekt',
              requestId: 't1wLPiRKrfe_vchftk8s8',
              error: {
                status: 'FETCH_ERROR',
                error: 'TypeError: Failed to fetch',
              },
              startedTimeStamp: 1714725797072,
              fulfilledTimeStamp: 1714725797669,
            },
          },
        },
        userInput: { ...userInputInitialState },
      }
      store.getState = vi.fn().mockImplementation(() => mockedState)

      const returnedFromLoader = stepAFPAccessGuard(createMockRequest())
      await expect(returnedFromLoader).resolves.not.toThrow()
      await expect(returnedFromLoader).resolves.toMatchObject({
        person: {
          foedselsdato: '1964-04-30',
        },
      })
    })

    it('Gitt at getInntekt har tidligere feilet og at den feiler igjen ved nytt kall, loader kaster feil', async () => {
      mockErrorResponse('/inntekt')

      const mockedState = {
        api: {
          queries: {
            ...fulfilledGetLoependeVedtak0Ufoeregrad,
            ['getInntekt(undefined)']: {
              status: 'rejected',
              endpointName: 'getInntekt',
              requestId: 't1wLPiRKrfe_vchftk8s8',
              error: {
                status: 'FETCH_ERROR',
                error: 'TypeError: Failed to fetch',
              },
              startedTimeStamp: 1714725797072,
              fulfilledTimeStamp: 1714725797669,
            },
          },
        },
        userInput: { ...userInputInitialState },
      }
      store.getState = vi.fn().mockImplementation(() => mockedState)

      const returnedFromLoader = stepAFPAccessGuard(createMockRequest())
      // Når denne kaster så blir den fanget opp av ErrorBoundary som viser uventet feil
      await expect(returnedFromLoader).rejects.toThrow()
    })

    it('Gitt at getOmstillingsstoenadOgGjenlevende har tidligere feilet kalles den på nytt. Når den er vellykket i tillegg til de to andre kallene, er brukeren ikke redirigert', async () => {
      mockResponse('/v1/loepende-omstillingsstoenad-eller-gjenlevendeytelse', {
        status: 200,
        json: {
          harLoependeSak: true,
        },
      })

      const mockedState = {
        api: {
          queries: {
            ...mockedVellykketQueries,
            ...fulfilledGetLoependeVedtak0Ufoeregrad,
            ['getOmstillingsstoenadOgGjenlevende(undefined)']: {
              status: 'rejected',
              endpointName: 'getOmstillingsstoenadOgGjenlevende',
              requestId: 't1wLPiRKrfe_vchftk8s8',
              error: {
                status: 'FETCH_ERROR',
                error: 'TypeError: Failed to fetch',
              },
              startedTimeStamp: 1714725797072,
              fulfilledTimeStamp: 1714725797669,
            },
          },
        },
        userInput: { ...userInputInitialState },
      }
      store.getState = vi.fn().mockImplementation(() => mockedState)

      const returnedFromLoader = stepAFPAccessGuard(createMockRequest())
      await expect(returnedFromLoader).resolves.not.toThrow()
    })

    it('Gitt at getOmstillingsstoenadOgGjenlevende har tidligere feilet og at den feiler igjen ved nytt kall, loader kaster feil', async () => {
      mockErrorResponse(
        '/v1/loepende-omstillingsstoenad-eller-gjenlevendeytelse'
      )

      const mockedState = {
        api: {
          queries: {
            ...fulfilledGetLoependeVedtak0Ufoeregrad,
            ['getOmstillingsstoenadOgGjenlevende(undefined)']: {
              status: 'rejected',
              endpointName: 'getOmstillingsstoenadOgGjenlevende',
              requestId: 't1wLPiRKrfe_vchftk8s8',
              error: {
                status: 'FETCH_ERROR',
                error: 'TypeError: Failed to fetch',
              },
              startedTimeStamp: 1714725797072,
              fulfilledTimeStamp: 1714725797669,
            },
          },
        },
        userInput: { ...userInputInitialState },
      }
      store.getState = vi.fn().mockImplementation(() => mockedState)

      const returnedFromLoader = stepAFPAccessGuard(createMockRequest())
      await expect(returnedFromLoader).rejects.toThrow()
    })

    it('Gitt at bruker er apoteker settes `erApoteker`', async () => {
      mockResponse('/v1/er-apoteker', {
        status: 200,
        json: {
          apoteker: true,
          aarsak: 'ER_APOTEKER',
        },
      })

      const mockedState = {
        api: {
          queries: {
            ...mockedVellykketQueries,
            ...fulfilledGetLoependeVedtak0Ufoeregrad,
          },
        },
        userInput: { ...userInputInitialState },
      }
      store.getState = vi.fn().mockImplementation(() => mockedState)

      const returnedFromLoader = await stepAFPAccessGuard(createMockRequest())
      expect(returnedFromLoader).toHaveProperty('erApoteker')
      if (!returnedFromLoader || !('erApoteker' in returnedFromLoader)) {
        throw new Error('erApoteker not in returnedFromLoader')
      }

      expect(returnedFromLoader.erApoteker).toBe(true)
    })

    it('Gitt at getApotekerStatus har tidligere feilet kalles den på nytt. Når den er vellykket i tillegg til de to andre kallene kastes ikke feil', async () => {
      mockResponse('/v1/er-apoteker', {
        status: 200,
        json: {
          apoteker: false,
          aarsak: 'NONE',
        },
      })

      const mockedState = {
        api: {
          queries: {
            ...mockedVellykketQueries,
            ...fulfilledGetLoependeVedtak0Ufoeregrad,
            ['getApotekerStatus(undefined)']: {
              status: 'rejected',
              endpointName: 'getApotekerStatus',
              requestId: 't1wLPiRKrfe_vchftk8s8',
              error: {
                status: 'FETCH_ERROR',
                error: 'TypeError: Failed to fetch',
              },
              startedTimeStamp: 1714725797072,
              fulfilledTimeStamp: 1714725797669,
            },
          },
        },
        userInput: { ...userInputInitialState },
      }
      store.getState = vi.fn().mockImplementation(() => mockedState)

      const returnedFromLoader = stepAFPAccessGuard(createMockRequest())
      await expect(returnedFromLoader).resolves.not.toThrow()
    })
  })

  it('Apotekere med uføretrygd skal ikke få AFP steg', async () => {
    mockResponse('/v1/er-apoteker', {
      status: 200,
      json: {
        apoteker: true,
        aarsak: 'ER_APOTEKER',
      },
    })
    mockResponse('/v4/vedtak/loepende-vedtak', {
      json: {
        harLoependeVedtak: true,
        ufoeretrygd: { grad: 75 },
      } satisfies LoependeVedtak,
    })
    const mockedState = {
      api: { queries: { mock: 'mock' } },
    }
    store.getState = vi.fn().mockImplementation(() => mockedState)

    const returnedFromLoader = await stepAFPAccessGuard(createMockRequest())

    expectRedirectResponse(returnedFromLoader)
  })

  describe('Brukere med fremtidig vedtak uten gjeldene vedtak og AP', () => {
    beforeEach(() => {
      mockResponse('/v4/vedtak/loepende-vedtak', {
        json: {
          harLoependeVedtak: true,
          fremtidigAlderspensjon: {
            grad: 75,
            fom: '2025-01-01',
          },
          ufoeretrygd: { grad: 0 },
        } satisfies LoependeVedtak,
      })
    })
    const mockedState = {
      api: { queries: { mock: 'mock' } },
    }
    it('Apotekere skal hoppe over AFP steg', async () => {
      mockResponse('/v1/er-apoteker', {
        status: 200,
        json: {
          apoteker: true,
          aarsak: 'ER_APOTEKER',
        },
      })
      store.getState = vi.fn().mockImplementation(() => mockedState)

      const returnedFromLoader = await stepAFPAccessGuard(createMockRequest())

      expectRedirectResponse(returnedFromLoader)
    })

    it('Født før 1963 skal hoppe over AFP steg', async () => {
      mockResponse('/v1/er-apoteker', {
        status: 200,
        json: {
          apoteker: true,
          aarsak: 'ER_APOTEKER',
        },
      })
      store.getState = vi.fn().mockImplementation(() => mockedState)

      const returnedFromLoader = await stepAFPAccessGuard(createMockRequest())

      expectRedirectResponse(returnedFromLoader)
    })

    it('Født etter 1963 skal vise AFP steg', async () => {
      mockResponse('/v6/person', {
        status: 200,
        json: {
          foedselsdato: '1965-01-01',
          fornavn: 'Test Person',
          navn: 'Test Person etternavn',
          sivilstand: 'GIFT',
          pensjoneringAldre: {
            normertPensjoneringsalder: { aar: 67, maaneder: 0 },
            nedreAldersgrense: { aar: 62, maaneder: 0 },
            oevreAldersgrense: { aar: 75, maaneder: 0 },
          },
        } satisfies Person,
      })
      mockResponse('/v1/er-apoteker', {
        status: 200,
        json: {
          apoteker: false,
          aarsak: 'NONE',
        },
      })
      store.getState = vi.fn().mockImplementation(() => mockedState)

      const returnedFromLoader = await stepAFPAccessGuard(createMockRequest())

      expect(returnedFromLoader instanceof Response).toBe(false)
      if (!(returnedFromLoader instanceof Response) && returnedFromLoader) {
        expect(returnedFromLoader.erApoteker).toBe(false)
      }
    })
  })

  it('Apotekere med vedtak om alderspensjon skal ikke få AFP steg', async () => {
    mockResponse('/v1/er-apoteker', {
      status: 200,
      json: {
        apoteker: true,
        aarsak: 'ER_APOTEKER',
      },
    })
    mockResponse('/v4/vedtak/loepende-vedtak', {
      json: {
        harLoependeVedtak: true,
        alderspensjon: {
          grad: 75,
          uttaksgradFom: '2020-01-01',
          fom: '2020-01-01',
          sivilstand: 'UGIFT',
        },
        ufoeretrygd: {
          grad: 0,
        },
      } satisfies LoependeVedtak,
    })
    const mockedState = {
      api: { queries: { mock: 'mock' } },
    }
    store.getState = vi.fn().mockImplementation(() => mockedState)

    const returnedFromLoader = await stepAFPAccessGuard(createMockRequest())

    expectRedirectResponse(returnedFromLoader)
  })

  describe('stepUfoeretrygdAFPAccessGuard', () => {
    it('returnerer redirect til /start location når ingen API-kall er registrert', async () => {
      const mockedState = {
        api: { queries: {} },
        userInput: { ...userInputInitialState, samtykke: null },
      }
      store.getState = vi.fn().mockImplementation(() => mockedState)

      expectRedirectResponse(
        await stepUfoeretrygdAFPAccessGuard(createMockRequest()),
        paths.start
      )
    })

    it('Når brukeren ikke har uføretrygd, er hen redirigert', async () => {
      const mockedState = {
        api: { queries: { mock: 'mock' } },
        userInput: { ...userInputInitialState },
      }
      store.getState = vi.fn().mockImplementation(() => mockedState)

      expectRedirectResponse(
        await stepUfoeretrygdAFPAccessGuard(createMockRequest()),
        paths.samtykkeOffentligAFP
      )
    })

    describe('Gitt at brukeren har uføretrygd, ', () => {
      it('Når hen har svart ja til spørsmål om afp, er hen ikke redirigert', async () => {
        mockResponse('/v4/vedtak/loepende-vedtak', {
          json: {
            harLoependeVedtak: true,
            ufoeretrygd: { grad: 75 },
          } satisfies LoependeVedtak,
        })

        const mockedState = {
          api: { queries: { mock: 'mock' } },
          userInput: { ...userInputInitialState, afp: 'ja_privat' },
        }
        store.getState = vi.fn().mockImplementation(() => mockedState)

        const returnedFromLoader =
          await stepUfoeretrygdAFPAccessGuard(createMockRequest())
        expect(returnedFromLoader).toBeUndefined()
      })

      it('Når hen har svart nei til spørsmål om afp, er hen redirigert', async () => {
        mockResponse('/v4/vedtak/loepende-vedtak', {
          json: {
            harLoependeVedtak: true,
            ufoeretrygd: { grad: 75 },
          } satisfies LoependeVedtak,
        })

        const mockedState = {
          api: { queries: { mock: 'mock' } },
          userInput: { ...userInputInitialState, afp: 'nei' },
        }
        store.getState = vi.fn().mockImplementation(() => {
          return mockedState
        })

        expectRedirectResponse(
          await stepUfoeretrygdAFPAccessGuard(createMockRequest()),
          paths.samtykkeOffentligAFP
        )
      })

      it('Når hen ikke har fått afp-steget (og dermed ikke har svart på spørsmål om afp), er hen redirigert', async () => {
        mockResponse('/v4/vedtak/loepende-vedtak', {
          json: {
            harLoependeVedtak: true,
            ufoeretrygd: { grad: 75 },
          } satisfies LoependeVedtak,
        })

        const mockedState = {
          api: { queries: { mock: 'mock' } },
          userInput: { ...userInputInitialState, afp: null },
        }
        store.getState = vi.fn().mockImplementation(() => mockedState)

        expectRedirectResponse(
          await stepUfoeretrygdAFPAccessGuard(createMockRequest()),
          paths.samtykkeOffentligAFP
        )
      })
    })
  })

  describe('stepSamtykkeOffentligAFPAccessGuard', () => {
    it('returnerer redirect til /start når ingen API-kall er registrert', async () => {
      const mockedState = {
        api: { queries: {} },
        userInput: { ...userInputInitialState, samtykke: null },
      }
      store.getState = vi.fn().mockImplementation(() => mockedState)

      expectRedirectResponse(
        await stepSamtykkeOffentligAFPAccessGuard(createMockRequest()),
        paths.start
      )
    })

    it('Når brukeren ikke har uføretrygd og har valgt AFP offentlig, er hen ikke redirigert', async () => {
      const mockedState = {
        api: { queries: { mock: 'mock' } },
        userInput: {
          ...userInputInitialState,
          afp: 'ja_offentlig',
        } satisfies UserInputState,
      }
      store.getState = vi.fn().mockImplementation(() => mockedState)

      const returnedFromLoader =
        await stepSamtykkeOffentligAFPAccessGuard(createMockRequest())
      expect(returnedFromLoader).toBeUndefined()
    })

    it('Når brukeren har uføretrygd og har valgt ja_offentlig til spørsmål om afp, er hen ikke redirigert', async () => {
      mockResponse('/v4/vedtak/loepende-vedtak', {
        status: 200,
        json: {
          harLoependeVedtak: true,
          ufoeretrygd: { grad: 50 },
        } satisfies LoependeVedtak,
      })
      const mockedState = {
        api: { queries: { mock: 'mock' } },
        userInput: {
          ...userInputInitialState,
          afp: 'ja_offentlig',
        } satisfies UserInputState,
      }
      store.getState = vi.fn().mockImplementation(() => mockedState)

      const returnedFromLoader =
        await stepSamtykkeOffentligAFPAccessGuard(createMockRequest())
      expect(returnedFromLoader).toBeUndefined()
    })

    it('Når brukeren ikke har uføretrygd og har valgt afp nei, er hen redirigert', async () => {
      const mockedState = {
        api: { queries: { mock: 'mock' } },
        userInput: {
          ...userInputInitialState,
          afp: 'nei',
        } satisfies UserInputState,
      }
      store.getState = vi.fn().mockImplementation(() => mockedState)

      expectRedirectResponse(
        await stepSamtykkeOffentligAFPAccessGuard(createMockRequest()),
        paths.samtykke
      )
    })
  })
  describe('stepSamtykkePensjonsavtaler', () => {
    it('Når bruker som ikke er kap19 er i endringsløp blir bruker ikke redirigert', async () => {
      mockResponse('/v6/person', {
        status: 200,
        json: {
          foedselsdato: '1965-01-01',
          fornavn: 'Test Person',
          navn: 'Test Person etternavn',
          sivilstand: 'GIFT',
          pensjoneringAldre: {
            normertPensjoneringsalder: { aar: 67, maaneder: 0 },
            nedreAldersgrense: { aar: 62, maaneder: 0 },
            oevreAldersgrense: { aar: 75, maaneder: 0 },
          },
        } satisfies Person,
      })

      mockResponse('/v4/vedtak/loepende-vedtak', {
        status: 200,
        json: {
          harLoependeVedtak: true,
          ufoeretrygd: { grad: 0 },
          alderspensjon: {
            grad: 100,
            uttaksgradFom: '2023-01-01',
            fom: '2023-01-01',
            sivilstand: 'GIFT',
          },
        } satisfies LoependeVedtak,
      })
      const returnedFromLoader =
        await stepSamtykkePensjonsavtaler(createMockRequest())
      expect(returnedFromLoader).toEqual({ erApoteker: false, isKap19: false })
    })

    it('Hopper over steg dersom bruker er kap19 og har alderspensjon vedtak', async () => {
      mockResponse('/v6/person', {
        status: 200,
        json: {
          foedselsdato: '1962-01-01',
          fornavn: 'Test Person',
          navn: 'Test Person etternavn',
          sivilstand: 'GIFT',
          pensjoneringAldre: {
            normertPensjoneringsalder: { aar: 67, maaneder: 0 },
            nedreAldersgrense: { aar: 62, maaneder: 0 },
            oevreAldersgrense: { aar: 75, maaneder: 0 },
          },
        } satisfies Person,
      })

      mockResponse('/v4/vedtak/loepende-vedtak', {
        status: 200,
        json: {
          harLoependeVedtak: true,
          ufoeretrygd: { grad: 0 },
          alderspensjon: {
            grad: 100,
            uttaksgradFom: '2023-01-01',
            fom: '2023-01-01',
            sivilstand: 'GIFT',
          },
        } satisfies LoependeVedtak,
      })
      const returnedFromLoader =
        await stepSamtykkePensjonsavtaler(createMockRequest())

      expectRedirectResponse(returnedFromLoader)
    })

    it('Hopper over steg dersom bruker er apoteker og har alderspensjon vedtak', async () => {
      mockResponse('/v1/er-apoteker', {
        status: 200,
        json: {
          apoteker: true,
          aarsak: 'ER_APOTEKER',
        },
      })
      mockResponse('/v6/person', {
        status: 200,
        json: {
          foedselsdato: '1967-01-01',
          fornavn: 'Test Person',
          navn: 'Test Person etternavn',
          sivilstand: 'GIFT',
          pensjoneringAldre: {
            normertPensjoneringsalder: { aar: 67, maaneder: 0 },
            nedreAldersgrense: { aar: 62, maaneder: 0 },
            oevreAldersgrense: { aar: 75, maaneder: 0 },
          },
        } satisfies Person,
      })

      mockResponse('/v4/vedtak/loepende-vedtak', {
        status: 200,
        json: {
          harLoependeVedtak: true,
          ufoeretrygd: { grad: 0 },
          alderspensjon: {
            grad: 100,
            uttaksgradFom: '2023-01-01',
            fom: '2023-01-01',
            sivilstand: 'GIFT',
          },
        } satisfies LoependeVedtak,
      })
      const returnedFromLoader =
        await stepSamtykkePensjonsavtaler(createMockRequest())

      expectRedirectResponse(returnedFromLoader)
    })
  })

  describe('beregningEnkelAccessGuard', () => {
    it('should redirect hvis bruker har løpende vedtak', async () => {
      mockResponse('/v4/vedtak/loepende-vedtak', {
        status: 200,
        json: {
          harLoependeVedtak: true,
          ufoeretrygd: { grad: 0 },
          alderspensjon: {
            grad: 100,
            uttaksgradFom: '2023-01-01',
            fom: '2023-01-01',
            sivilstand: 'GIFT',
          },
        } satisfies LoependeVedtak,
      })
      const returnedFromLoader = await beregningEnkelAccessGuard()
      expectRedirectResponse(returnedFromLoader, paths.beregningAvansert)
    })
  })
  it('should redirect hvis bruker har er kap. 19', async () => {
    const mockedState = {
      api: { queries: { mock: 'mock' } },
      userInput: {
        ...userInputInitialState,
        afpUtregningValg: 'AFP_ETTERFULGT_AV_ALDERSPENSJON',
      },
    }
    store.getState = vi.fn().mockImplementation(() => mockedState)
    const returnedFromLoader = await beregningEnkelAccessGuard()
    expectRedirectResponse(returnedFromLoader, paths.beregningAvansert)
  })

  it('burde kalle getAfpOffentligLivsvarig når bruker har samtykket til AFP offentlig', async () => {
    const initiateMock = vi.spyOn(
      apiSliceUtils.apiSlice.endpoints.getAfpOffentligLivsvarig,
      'initiate'
    )
    const mockedState = {
      api: { queries: { mock: 'mock' } },
      userInput: {
        ...userInputInitialState,
        samtykkeOffentligAFP: true,
      },
    }
    store.getState = vi.fn().mockImplementation(() => mockedState)

    mockResponse('/v6/person', {
      status: 200,
      json: {
        navn: 'Test Person',
        sivilstand: 'UGIFT',
        foedselsdato: '1960-04-30',
        pensjoneringAldre: {
          normertPensjoneringsalder: { aar: 67, maaneder: 0 },
          nedreAldersgrense: { aar: 62, maaneder: 0 },
          oevreAldersgrense: { aar: 75, maaneder: 0 },
        },
      },
    })

    mockResponse('/v4/vedtak/loepende-vedtak', {
      status: 200,
      json: {
        harLoependeVedtak: false,
        ufoeretrygd: { grad: 0 },
      } satisfies LoependeVedtak,
    })

    mockResponse('/v2/tpo-livsvarig-offentlig-afp', {
      status: 200,
      json: {
        afpStatus: false,
        maanedligBeloep: 0,
        virkningFom: '2023-01-01',
        sistBenyttetGrunnbeloep: 118620,
      } satisfies AfpOffentligLivsvarig,
    })

    await beregningEnkelAccessGuard()
    expect(initiateMock).toHaveBeenCalled()
  })

  it('burde ikke kalle getAfpOffentligLivsvarig når bruker ikke har samtykket til AFP offentlig', async () => {
    const initiateMock = vi.spyOn(
      apiSliceUtils.apiSlice.endpoints.getAfpOffentligLivsvarig,
      'initiate'
    )
    const mockedState = {
      api: { queries: { mock: 'mock' } },
      userInput: {
        ...userInputInitialState,
        samtykkeOffentligAFP: false,
      },
    }
    store.getState = vi.fn().mockImplementation(() => mockedState)

    mockResponse('/v6/person', {
      status: 200,
      json: {
        navn: 'Test Person',
        fornavn: 'Test',
        sivilstand: 'UGIFT',
        foedselsdato: '1960-04-30',
        pensjoneringAldre: {
          normertPensjoneringsalder: { aar: 67, maaneder: 0 },
          nedreAldersgrense: { aar: 62, maaneder: 0 },
          oevreAldersgrense: { aar: 75, maaneder: 0 },
        },
      },
    })

    mockResponse('/v4/vedtak/loepende-vedtak', {
      status: 200,
      json: {
        harLoependeVedtak: false,
        ufoeretrygd: { grad: 0 },
      } satisfies LoependeVedtak,
    })

    await beregningEnkelAccessGuard()
    expect(initiateMock).not.toHaveBeenCalled()
  })
})

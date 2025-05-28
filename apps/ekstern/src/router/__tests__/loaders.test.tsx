import { add, endOfDay, format } from 'date-fns'
import { describe, it, vi } from 'vitest'

import {
  fulfilledGetLoependeVedtak0Ufoeregrad,
  fulfilledGetPerson,
} from '@/mocks/mockedRTKQueryApiCalls'
import { mockErrorResponse, mockResponse } from '@/mocks/server'
import { henvisningUrlParams, paths } from '@/router/constants'
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
  directAccessGuard,
  landingPageAccessGuard,
  stepAFPAccessGuard,
  stepSamtykkeOffentligAFPAccessGuard,
  stepSivilstandAccessGuard,
  stepStartAccessGuard,
  stepUfoeretrygdAFPAccessGuard,
} from '../loaders'

function expectRedirectResponse(
  returnedFromLoader: Response | object | undefined,
  expectedLocation: string
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
  expect(returnedFromLoader.headers.get('location')).toBe(expectedLocation)
}

describe('Loaders', () => {
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
      }))

      const returnedFromLoader = await stepStartAccessGuard()
      expect(returnedFromLoader).toHaveProperty('person')
      if (!('person' in returnedFromLoader)) {
        throw new Error('person not in returnedFromLoader')
      }

      expect(returnedFromLoader.person.foedselsdato).toBe('1964-04-30')
      expect(returnedFromLoader.loependeVedtak.ufoeretrygd.grad).toBe(0)
    })

    it('Når /vedtak/loepende-vedtak kall feiler redirigeres bruker til uventet-feil side', async () => {
      mockErrorResponse('/v4/vedtak/loepende-vedtak')

      store.getState = vi.fn().mockImplementation(() => ({
        userInput: { ...userInputInitialState },
      }))

      expectRedirectResponse(await stepStartAccessGuard(), paths.uventetFeil)
    })

    it('Når /person kall feiler med 403 status og reason er INVALID_REPRESENTASJON, redirigeres bruker til ingen-tilgang', async () => {
      mockErrorResponse('/v4/person', {
        status: 403,
        json: {
          reason: 'INVALID_REPRESENTASJON' as Reason,
        },
      })

      store.getState = vi.fn().mockImplementation(() => ({
        userInput: { ...userInputInitialState },
      }))

      expectRedirectResponse(await stepStartAccessGuard(), paths.ingenTilgang)
    })

    it('Når /person kall feiler med 403 status og reason er INSUFFICIENT_LEVEL_OF_ASSURANCE, redirigeres bruker til uventet-feil', async () => {
      mockErrorResponse('/v4/person', {
        status: 403,
        json: {
          reason: 'INSUFFICIENT_LEVEL_OF_ASSURANCE' as Reason,
        },
      })

      store.getState = vi.fn().mockImplementation(() => ({
        userInput: { ...userInputInitialState },
      }))

      expectRedirectResponse(
        await stepStartAccessGuard(),
        paths.lavtSikkerhetsnivaa
      )
    })

    it('Når /person kall feiler med annen status redirigeres bruker til uventet-feil side', async () => {
      mockErrorResponse('/v4/person', {
        status: 503,
      })

      store.getState = vi.fn().mockImplementation(() => ({
        userInput: { ...userInputInitialState },
      }))

      expectRedirectResponse(await stepStartAccessGuard(), paths.uventetFeil)
    })

    it('Når brukeren har medlemskap til Apoterkerne, redirigeres brukeren til riktig URL', async () => {
      mockResponse('/v2/ekskludert', {
        json: {
          ekskludert: true,
          aarsak: 'ER_APOTEKER',
        },
      })

      store.getState = vi.fn().mockImplementation(() => ({
        userInput: { ...userInputInitialState },
      }))

      expectRedirectResponse(
        await stepStartAccessGuard(),
        `${paths.henvisning}/${henvisningUrlParams.apotekerne}`
      )
    })

    it('Når vedlikeholdsmodus er aktivert blir man redirigert', async () => {
      mockResponse('/feature/pensjonskalkulator.vedlikeholdsmodus', {
        json: { enabled: true },
      })

      store.getState = vi.fn().mockImplementation(() => ({
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

      expectRedirectResponse(await stepSivilstandAccessGuard(), '/start')
    })

    it('returnerer person og grunnbelop', async () => {
      store.getState = vi.fn().mockImplementation(() => ({
        api: { queries: { mock: 'mock' } },
        userInput: { ...userInputInitialState },
      }))

      const returnedFromLoader = await stepSivilstandAccessGuard()
      expect(returnedFromLoader).toHaveProperty('person')
      if (!('person' in returnedFromLoader)) {
        throw new Error('person not in returnedFromLoader')
      }

      expect(returnedFromLoader.person.sivilstand).toBe('UGIFT')
      expect(returnedFromLoader.grunnbelop).toBe(100000)
    })

    it('returner undefined som grunnbelop dersom g.nav.no feiler', async () => {
      mockErrorResponse('/api/v1/grunnbel%C3%B8p', {
        baseUrl: 'https://g.nav.no',
      })
      store.getState = vi.fn().mockImplementation(() => ({
        api: { queries: { mock: 'mock' } },
        userInput: { ...userInputInitialState },
      }))

      const returnedFromLoader = await stepSivilstandAccessGuard()
      expect(returnedFromLoader).toHaveProperty('grunnbelop')
      if (!('grunnbelop' in returnedFromLoader)) {
        throw new Error('grunnbelop not in returnedFromLoader')
      }
      expect(returnedFromLoader.grunnbelop).toBeUndefined()
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
      ['getEkskludertStatus(undefined)']: {
        status: 'fulfilled',
        endpointName: 'getEkskludertStatus',
        requestId: 't1wLPiRKrfe_vchftk8s8',
        data: { ekskludert: false, aarsak: 'NONE' },
        startedTimeStamp: 1714725797072,
        fulfilledTimeStamp: 1714725797669,
      },
    }

    it('kaller redirect til /start når ingen API-kall er registrert', async () => {
      store.getState = vi.fn().mockImplementation(() => ({
        api: { queries: {} },
        userInput: { ...userInputInitialState, samtykke: null },
      }))

      expectRedirectResponse(await stepAFPAccessGuard(), '/start')
    })

    describe('Gitt at alle kallene er vellykket, ', () => {
      it('brukere uten uføretrygd og uten vedtak om AFP er ikke redirigert', async () => {
        const mockedState = {
          api: { queries: { mock: 'mock' } },
          userInput: { ...userInputInitialState, samtykke: null },
        }
        store.getState = vi.fn().mockImplementation(() => mockedState)

        const returnedFromLoader = stepAFPAccessGuard()
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
            harLoependeVedtak: true,
            ufoeretrygd: { grad: 75 },
          } satisfies LoependeVedtak,
        })
        mockResponse('/v4/person', {
          json: {
            navn: 'Aprikos',
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
            },
          } satisfies Person,
        })

        const mockedState = {
          api: { queries: { mock: 'mock' } },
          userInput: { ...userInputInitialState, samtykke: null },
        }
        store.getState = vi.fn().mockImplementation(() => mockedState)

        const returnedFromLoader = stepAFPAccessGuard()
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
            harLoependeVedtak: true,
            ufoeretrygd: { grad: 75 },
          } satisfies LoependeVedtak,
        })
        mockResponse('/v4/person', {
          json: {
            navn: 'Aprikos',
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
            },
          } satisfies Person,
        })

        const mockedState = {
          api: { queries: { mock: 'mock' } },
          userInput: { ...userInputInitialState, samtykke: null },
        }
        store.getState = vi.fn().mockImplementation(() => mockedState)

        expectRedirectResponse(await stepAFPAccessGuard(), paths.ufoeretrygdAFP)
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

        expectRedirectResponse(await stepAFPAccessGuard(), paths.ufoeretrygdAFP)
      })

      it('brukere med vedtak om afp-privat, er redirigert', async () => {
        mockResponse('/v4/vedtak/loepende-vedtak', {
          json: {
            harLoependeVedtak: true,
            alderspensjon: {
              grad: 0,
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

        expectRedirectResponse(await stepAFPAccessGuard(), paths.ufoeretrygdAFP)
      })

      it('brukere med 100 % uføretrygd er redirigert', async () => {
        mockResponse('/v4/vedtak/loepende-vedtak', {
          json: {
            harLoependeVedtak: true,
            alderspensjon: {
              grad: 0,
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

        expectRedirectResponse(await stepAFPAccessGuard(), paths.ufoeretrygdAFP)
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

      const returnedFromLoader = stepAFPAccessGuard()
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

      const returnedFromLoader = stepAFPAccessGuard()
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

      const returnedFromLoader = stepAFPAccessGuard()
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

      const returnedFromLoader = stepAFPAccessGuard()
      await expect(returnedFromLoader).rejects.toThrow()
    })

    it('Gitt at getEkskludertStatus har tidligere feilet kalles den på nytt. Når den er vellykket og viser at brukeren er apoteker, er brukeren redirigert', async () => {
      mockResponse('/v2/ekskludert', {
        status: 200,
        json: {
          ekskludert: true,
          aarsak: 'ER_APOTEKER',
        },
      })

      const mockedState = {
        api: {
          queries: {
            ...mockedVellykketQueries,
            ...fulfilledGetLoependeVedtak0Ufoeregrad,
            ['getEkskludertStatus(undefined)']: {
              status: 'rejected',
              endpointName: 'getEkskludertStatus',
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

      expectRedirectResponse(
        await stepAFPAccessGuard(),
        `${paths.henvisning}/${henvisningUrlParams.apotekerne}`
      )
    })

    it('Gitt at getEkskludertStatus har tidligere feilet kalles den på nytt. Når den er vellykket i tillegg til de to andre kallene kastes ikke feil', async () => {
      mockResponse('/v2/ekskludert', {
        status: 200,
        json: {
          ekskludert: false,
          aarsak: 'NONE',
        },
      })

      const mockedState = {
        api: {
          queries: {
            ...mockedVellykketQueries,
            ...fulfilledGetLoependeVedtak0Ufoeregrad,
            ['getEkskludertStatus(undefined)']: {
              status: 'rejected',
              endpointName: 'getEkskludertStatus',
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

      const returnedFromLoader = stepAFPAccessGuard()
      await expect(returnedFromLoader).resolves.not.toThrow()
    })

    it('Gitt at getEkskludertStatus har tidligere feilet og at den feiler igjen ved nytt kall, loader kaster feil', async () => {
      mockErrorResponse('/v2/ekskludert')

      const mockedState = {
        api: {
          queries: {
            ...fulfilledGetLoependeVedtak0Ufoeregrad,
            ['getEkskludertStatus(undefined)']: {
              status: 'rejected',
              endpointName: 'getEkskludertStatus',
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

      const returnedFromLoader = stepAFPAccessGuard()
      await expect(returnedFromLoader).rejects.toThrow()
    })
  })

  describe('stepUfoeretrygdAFPAccessGuard', () => {
    it('returnerer redirect til /start location når ingen API-kall er registrert', async () => {
      const mockedState = {
        api: { queries: {} },
        userInput: { ...userInputInitialState, samtykke: null },
      }
      store.getState = vi.fn().mockImplementation(() => mockedState)

      expectRedirectResponse(await stepUfoeretrygdAFPAccessGuard(), paths.start)
    })

    it('Når brukeren ikke har uføretrygd, er hen redirigert', async () => {
      const mockedState = {
        api: { queries: { mock: 'mock' } },
        userInput: { ...userInputInitialState },
      }
      store.getState = vi.fn().mockImplementation(() => mockedState)

      expectRedirectResponse(
        await stepUfoeretrygdAFPAccessGuard(),
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

        const returnedFromLoader = await stepUfoeretrygdAFPAccessGuard()
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
          await stepUfoeretrygdAFPAccessGuard(),
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
          await stepUfoeretrygdAFPAccessGuard(),
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
        await stepSamtykkeOffentligAFPAccessGuard(),
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

      const returnedFromLoader = await stepSamtykkeOffentligAFPAccessGuard()
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

      const returnedFromLoader = await stepSamtykkeOffentligAFPAccessGuard()
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
        await stepSamtykkeOffentligAFPAccessGuard(),
        paths.samtykke
      )
    })
  })
})

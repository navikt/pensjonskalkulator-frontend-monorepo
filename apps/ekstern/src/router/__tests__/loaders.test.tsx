import { add, endOfDay, format } from 'date-fns'
import { describe, it, vi } from 'vitest'

import {
  fulfilledGetLoependeVedtak0Ufoeregrad,
  fulfilledGetLoependeVedtak75Ufoeregrad,
  fulfilledGetLoependeVedtak100Ufoeregrad,
  fulfilledGetLoependeVedtakLoependeAFPprivat,
  fulfilledGetPerson,
} from '@/mocks/mockedRTKQueryApiCalls'
import { mockErrorResponse, mockResponse } from '@/mocks/server'
import { henvisningUrlParams, paths } from '@/router/constants'
import * as apiSliceUtils from '@/state/api/apiSlice'
import { store } from '@/state/store'
import {
  UserInputState,
  userInputInitialState,
} from '@/state/userInput/userInputSlice'
import { waitFor } from '@/test-utils'
import { DATE_BACKEND_FORMAT } from '@/utils/dates'

import {
  StepSivilstandAccessGuardLoader,
  StepStartAccessGuardLoader,
  authenticationGuard,
  directAccessGuard,
  landingPageAccessGuard,
  stepAFPAccessGuard,
  stepSamtykkeOffentligAFPAccessGuard,
  stepSivilstandAccessGuard,
  stepStartAccessGuard,
  stepUfoeretrygdAFPAccessGuard,
} from '../loaders'

describe('Loaders', () => {
  afterEach(() => {
    store.dispatch(apiSliceUtils.apiSlice.util.resetApiState())
  })

  describe('landingPageAccesGuard', () => {
    it('kaller redirect til /start location når brukeren er veilder', async () => {
      const mockedState = {
        api: {
          queries: {
            ...fulfilledGetPerson,
          },
        },
        userInput: { ...userInputInitialState, veilederBorgerFnr: '81549300' },
      }
      store.getState = vi.fn().mockImplementation(() => {
        return mockedState
      })

      const returnedFromLoader = await landingPageAccessGuard()

      // TODO: Check if redreict

      expect(returnedFromLoader?.status).toBe(302)
      expect(returnedFromLoader?.headers.get('location')).toBe('/start')
    })
  })

  describe('directAccessGuard', () => {
    it('returnerer redirect til /start location når ingen api kall er registrert', async () => {
      const mockedState = {
        api: {
          queries: {},
        },
        userInput: { ...userInputInitialState, samtykke: null },
      }
      store.getState = vi.fn().mockImplementation(() => {
        return mockedState
      })
      const returnedFromLoader = await directAccessGuard()
      expect(returnedFromLoader?.status).toBe(302)
      expect(returnedFromLoader?.headers.get('location')).toBe('/start')
    })
    it('returnerer null når minst ett api kall er registrert', async () => {
      const mockedState = {
        api: {
          queries: {
            ...fulfilledGetPerson,
          },
        },
        userInput: { ...userInputInitialState, samtykke: null },
      }
      store.getState = vi.fn().mockImplementation(() => {
        return mockedState
      })
      const returnedFromLoader = await directAccessGuard()
      expect(returnedFromLoader).toBeNull()
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
    it('kaller getPersonQuery, getLoependeVedtakQuery, getInntekt, getOmstillingsstoenadOgGjenlevende og getEkskludertStatus og returnerer en defered response med getPerson og en redirect url', async () => {
      const initiateGetPersonMock = vi.spyOn(
        apiSliceUtils.apiSlice.endpoints.getPerson,
        'initiate'
      )
      const initiateGetLoependeVedtakQueryMock = vi.spyOn(
        apiSliceUtils.apiSlice.endpoints.getLoependeVedtak,
        'initiate'
      )
      const initiateGetInntektMock = vi.spyOn(
        apiSliceUtils.apiSlice.endpoints.getInntekt,
        'initiate'
      )
      const initiateGetOmstillingsstoenadOgGjenlevendeMock = vi.spyOn(
        apiSliceUtils.apiSlice.endpoints.getOmstillingsstoenadOgGjenlevende,
        'initiate'
      )
      const initiateGetEkskludertStatusMock = vi.spyOn(
        apiSliceUtils.apiSlice.endpoints.getEkskludertStatus,
        'initiate'
      )
      const mockedState = {
        userInput: { ...userInputInitialState },
      }
      store.getState = vi.fn().mockImplementation(() => {
        return mockedState
      })
      const returnedFromLoader =
        (await stepStartAccessGuard()) as StepStartAccessGuardLoader
      const getPersonQueryResponse = await returnedFromLoader.getPersonQuery
      const getLoependeVedtakQueryResponse =
        await returnedFromLoader.getLoependeVedtakQuery
      const shouldRedirectToResponse = await returnedFromLoader.shouldRedirectTo

      await waitFor(async () => {
        expect(
          (getPersonQueryResponse as GetPersonQuery).data.foedselsdato
        ).toBe('1963-04-30')
        expect(
          (getLoependeVedtakQueryResponse as GetLoependeVedtakQuery).data
            .alderspensjon
        ).toBe(undefined)

        expect(shouldRedirectToResponse).toEqual('')
      })

      expect(returnedFromLoader).toEqual(
        expect.objectContaining({
          getLoependeVedtakQuery: expect.any(Promise),
          getPersonQuery: expect.any(Promise),
          shouldRedirectTo: expect.any(Promise),
        })
      )
      expect(initiateGetPersonMock).toHaveBeenCalled()
      expect(initiateGetLoependeVedtakQueryMock).toHaveBeenCalled()
      expect(initiateGetInntektMock).toHaveBeenCalled()
      expect(initiateGetOmstillingsstoenadOgGjenlevendeMock).toHaveBeenCalled()
      expect(initiateGetEkskludertStatusMock).toHaveBeenCalled()
    })

    it('Når /vedtak/loepende-vedtak kall feiler redirigeres brukes til uventet-feil side', async () => {
      mockErrorResponse('/v4/vedtak/loepende-vedtak')

      const mockedState = {
        userInput: { ...userInputInitialState },
      }
      store.getState = vi.fn().mockImplementation(() => {
        return mockedState
      })
      const returnedFromLoader =
        (await stepStartAccessGuard()) as StepStartAccessGuardLoader

      const shouldRedirectToResponse = await returnedFromLoader.shouldRedirectTo

      await waitFor(async () => {
        expect(shouldRedirectToResponse).toEqual(paths.uventetFeil)
      })
    })

    it('Når /person kall feiler med 403 status redirigeres brukes til ingen-tilgang', async () => {
      mockErrorResponse('/v4/person', {
        status: 403,
      })

      const mockedState = {
        userInput: { ...userInputInitialState },
      }
      store.getState = vi.fn().mockImplementation(() => {
        return mockedState
      })
      const returnedFromLoader =
        (await stepStartAccessGuard()) as StepStartAccessGuardLoader

      const shouldRedirectToResponse = await returnedFromLoader.shouldRedirectTo

      await waitFor(async () => {
        expect(shouldRedirectToResponse).toEqual(paths.ingenTilgang)
      })
    })

    it('Når /person kall feiler med andre status redirigeres brukes til uventet-feil side', async () => {
      mockErrorResponse('/v4/person', {
        status: 503,
      })

      const mockedState = {
        userInput: { ...userInputInitialState },
      }
      store.getState = vi.fn().mockImplementation(() => {
        return mockedState
      })
      const returnedFromLoader =
        (await stepStartAccessGuard()) as StepStartAccessGuardLoader

      const shouldRedirectToResponse = await returnedFromLoader.shouldRedirectTo

      await waitFor(async () => {
        expect(shouldRedirectToResponse).toEqual(paths.uventetFeil)
      })
    })

    it('Når brukeren har bruker har medlemskap til apoterkerne, returneres det riktig redirect url', async () => {
      mockResponse('/v2/ekskludert', {
        json: {
          ekskludert: true,
          aarsak: 'ER_APOTEKER',
        },
      })

      const mockedState = {
        userInput: { ...userInputInitialState },
      }
      store.getState = vi.fn().mockImplementation(() => {
        return mockedState
      })
      const returnedFromLoader =
        (await stepStartAccessGuard()) as StepStartAccessGuardLoader
      await returnedFromLoader.getPersonQuery
      const shouldRedirectToResponse = await returnedFromLoader.shouldRedirectTo

      await waitFor(async () => {
        expect(shouldRedirectToResponse).toEqual(
          `${paths.henvisning}/${henvisningUrlParams.apotekerne}`
        )
      })
    })

    it('Når vedlikeholdsmodus er aktivert blir man redirigert', async () => {
      mockResponse('/feature/pensjonskalkulator.vedlikeholdsmodus', {
        json: {
          enabled: true,
        },
      })

      const mockedState = {
        userInput: { ...userInputInitialState },
      }
      store.getState = vi.fn().mockImplementation(() => {
        return mockedState
      })
      const returnedFromLoader = (await stepStartAccessGuard()) as Response

      expect(returnedFromLoader).not.toBeNull()
      expect(returnedFromLoader.headers.get('location')).toBe(
        '/kalkulatoren-virker-ikke'
      )
      expect(returnedFromLoader.status).toBe(302)
    })
  })

  describe('stepSivilstandAccessGuard', async () => {
    it('returnerer redirect til /start location når ingen api kall er registrert', async () => {
      const mockedState = {
        api: {
          queries: {},
        },
        userInput: { ...userInputInitialState, samtykke: null },
      }
      store.getState = vi.fn().mockImplementation(() => {
        return mockedState
      })
      const returnedFromLoader = await stepSivilstandAccessGuard()
      expect(returnedFromLoader).not.toBeNull()
      expect(returnedFromLoader).toMatchInlineSnapshot(`
        Response {
          Symbol(state): {
            "aborted": false,
            "cacheState": "",
            "headersList": HeadersList {
              "cookies": null,
              Symbol(headers map): Map {
                "location" => {
                  "name": "location",
                  "value": "/start",
                },
              },
              Symbol(headers map sorted): null,
            },
            "rangeRequested": false,
            "requestIncludesCredentials": false,
            "status": 302,
            "statusText": "",
            "timingAllowPassed": false,
            "timingInfo": null,
            "type": "default",
            "urlList": [],
          },
          Symbol(headers): Headers {},
        }
      `)
    })

    it('får data fra /person fra loader', async () => {
      const initiateGetPersonMock = vi.spyOn(
        apiSliceUtils.apiSlice.endpoints.getPerson,
        'initiate'
      )

      mockResponse('/v4/person', {
        status: 200,
        json: {
          navn: 'Ola',
          sivilstand: 'GIFT',
          foedselsdato: '1960-04-30',
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

      const mockedState = {
        api: {
          queries: {
            mock: 'mock',
          },
        },
        userInput: { ...userInputInitialState },
      }
      store.getState = vi.fn().mockImplementation(() => {
        return { ...mockedState }
      })

      const returnedFromLoader = await stepSivilstandAccessGuard()
      const person = await (
        returnedFromLoader as StepSivilstandAccessGuardLoader
      ).getPersonQuery

      expect(initiateGetPersonMock).toHaveBeenCalled()
      expect(person.sivilstand).toBe('GIFT')
    })

    it('får data fra g.nav fra loader', async () => {
      mockResponse('/api/v1/grunnbel%C3%B8p', {
        baseUrl: 'https://g.nav.no',
        json: {
          grunnbeløp: 1234,
        },
      })
      const mockedState = {
        api: {
          queries: {
            mock: 'mock',
          },
        },
        userInput: { ...userInputInitialState },
      }
      store.getState = vi.fn().mockImplementation(() => {
        return { ...mockedState }
      })

      const returnedFromLoader = await stepSivilstandAccessGuard()
      const g = await (returnedFromLoader as StepSivilstandAccessGuardLoader)
        .getGrunnbelopQuery
      expect(g).toBe(1234)
    })

    it('returner undefined dersom g.nav.no feiler', async () => {
      mockErrorResponse('/api/v1/grunnbel%C3%B8p', {
        baseUrl: 'https://g.nav.no',
      })
      const mockedState = {
        api: {
          queries: {
            mock: 'mock',
          },
        },
        userInput: { ...userInputInitialState },
      }
      store.getState = vi.fn().mockImplementation(() => {
        return { ...mockedState }
      })

      const returnedFromLoader = await stepSivilstandAccessGuard()
      const g = await (returnedFromLoader as StepSivilstandAccessGuardLoader)
        .getGrunnbelopQuery
      expect(g).toBeUndefined()
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

    it('returnerer redirect til /start location når ingen api kall er registrert', async () => {
      const mockedState = {
        api: {
          queries: {},
        },
        userInput: { ...userInputInitialState, samtykke: null },
      }
      store.getState = vi.fn().mockImplementation(() => {
        return mockedState
      })
      const returnedFromLoader = (await stepAFPAccessGuard()) as Response
      expect(returnedFromLoader).not.toBeNull()
      expect(returnedFromLoader.status).toBe(302)
      expect(returnedFromLoader.headers.get('location')).toBe('/start')
    })

    describe('Gitt at alle kallene er vellykket, ', () => {
      it('brukere uten uføretrygd og uten vedtak om afp er ikke redirigert', async () => {
        const mockedState = {
          api: {
            queries: {
              ...mockedVellykketQueries,
              ...fulfilledGetLoependeVedtak0Ufoeregrad,
              ...fulfilledGetPerson,
            },
          },
          userInput: { ...userInputInitialState, samtykke: null },
        }
        store.getState = vi.fn().mockImplementation(() => {
          return mockedState
        })

        const returnedFromLoader = stepAFPAccessGuard()
        await expect(returnedFromLoader).resolves.toMatchObject({
          loependeVedtak: {
            ufoeretrygd: {
              grad: 0,
            },
          },
        })
      })

      it('brukere med gradert uføretrygd som er yngre enn AFP-Uføre oppsigelsesalder, er ikke redirigert', async () => {
        const minAlderYearsBeforeNow = add(endOfDay(new Date()), {
          years: -61,
          months: -11,
        })
        const foedselsdato = format(minAlderYearsBeforeNow, DATE_BACKEND_FORMAT)

        const mockedState = {
          api: {
            queries: {
              ...mockedVellykketQueries,
              ...fulfilledGetLoependeVedtak75Ufoeregrad,
              ['getPerson(undefined)']: {
                status: 'fulfilled',
                endpointName: 'getPerson',
                requestId: 'xTaE6mOydr5ZI75UXq4Wi',
                startedTimeStamp: 1688046411971,
                data: {
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
                },
                fulfilledTimeStamp: 1688046412103,
              },
            },
          },
          userInput: { ...userInputInitialState, samtykke: null },
        }
        store.getState = vi.fn().mockImplementation(() => {
          return mockedState
        })

        const returnedFromLoader = stepAFPAccessGuard()
        await expect(returnedFromLoader).resolves.toMatchObject({
          person: {
            foedselsdato: '1963-04-30',
          },
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
          },
        })

        const mockedState = {
          api: {
            queries: {
              ...mockedVellykketQueries,
              ...fulfilledGetLoependeVedtak75Ufoeregrad,
              ['getPerson(undefined)']: {
                status: 'fulfilled',
                endpointName: 'getPerson',
                requestId: 'xTaE6mOydr5ZI75UXq4Wi',
                startedTimeStamp: 1688046411971,
                data: {
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
                },
                fulfilledTimeStamp: 1688046412103,
              },
            },
          },
          userInput: { ...userInputInitialState, samtykke: null },
        }
        store.getState = vi.fn().mockImplementation(() => {
          return mockedState
        })

        const returnedFromLoader = (await stepAFPAccessGuard()) as Response
        expect(returnedFromLoader.status).toBe(302)
        expect(returnedFromLoader.headers.get('location')).toBe(
          paths.ufoeretrygdAFP
        )
      })

      it('brukere med vedtak om afp-offentlig, er redirigert', async () => {
        mockResponse('/v4/vedtak/loepende-vedtak', {
          json: {
            ufoeretrygd: {
              grad: 0,
            },
            afpOffentlig: {
              fom: '2020-10-02',
            },
          } satisfies LoependeVedtak,
        })
        const mockedState = {
          api: {
            queries: {
              ...mockedVellykketQueries,
              ...fulfilledGetPerson,
            },
          },
          userInput: { ...userInputInitialState, samtykke: null },
        }
        store.getState = vi.fn().mockImplementation(() => {
          return mockedState
        })
        const returnedFromLoader = (await stepAFPAccessGuard()) as Response
        expect(returnedFromLoader.status).toBe(302)
        expect(returnedFromLoader.headers.get('location')).toBe(
          paths.ufoeretrygdAFP
        )
      })

      it('brukere med vedtak om afp-privat, er redirigert', async () => {
        mockResponse('/v4/vedtak/loepende-vedtak', {
          json: {
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
          api: {
            queries: {
              ...mockedVellykketQueries,
              ...fulfilledGetLoependeVedtakLoependeAFPprivat,
              ...fulfilledGetPerson,
            },
          },
          userInput: { ...userInputInitialState, samtykke: null },
        }
        store.getState = vi.fn().mockImplementation(() => {
          return mockedState
        })

        const returnedFromLoader = (await stepAFPAccessGuard()) as Response
        expect(returnedFromLoader.status).toBe(302)
        expect(returnedFromLoader.headers.get('location')).toBe(
          paths.ufoeretrygdAFP
        )
      })

      it('brukere med 100% uføretrygd er redirigert', async () => {
        mockResponse('/v4/vedtak/loepende-vedtak', {
          json: {
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
          api: {
            queries: {
              ...mockedVellykketQueries,
              ...fulfilledGetLoependeVedtak100Ufoeregrad,
              ...fulfilledGetPerson,
            },
          },
          userInput: { ...userInputInitialState },
        }
        store.getState = vi.fn().mockImplementation(() => mockedState)
        const returnedFromLoader = (await stepAFPAccessGuard()) as Response
        expect(returnedFromLoader.status).toBe(302)
        expect(returnedFromLoader.headers.get('location')).toBe(
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
      store.getState = vi.fn().mockImplementation(() => {
        return mockedState
      })

      const returnedFromLoader = stepAFPAccessGuard()
      await expect(returnedFromLoader).resolves.not.toThrow()
      await expect(returnedFromLoader).resolves.toMatchObject({
        person: {
          foedselsdato: '1963-04-30',
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
      store.getState = vi.fn().mockImplementation(() => {
        return mockedState
      })

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
      store.getState = vi.fn().mockImplementation(() => {
        return mockedState
      })

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
      store.getState = vi.fn().mockImplementation(() => {
        return mockedState
      })

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
      store.getState = vi.fn().mockImplementation(() => {
        return mockedState
      })

      const returnedFromLoader = (await stepAFPAccessGuard()) as Response

      expect(returnedFromLoader?.status).toBe(302)
      expect(returnedFromLoader?.headers.get('location')).toBe(
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
      store.getState = vi.fn().mockImplementation(() => {
        return mockedState
      })

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
      store.getState = vi.fn().mockImplementation(() => {
        return mockedState
      })

      const returnedFromLoader = stepAFPAccessGuard()
      await expect(returnedFromLoader).rejects.toThrow()
    })
  })

  describe('stepUfoeretrygdAFPAccessGuard', () => {
    it('returnerer redirect til /start location når ingen api kall er registrert', async () => {
      const mockedState = {
        api: {
          queries: {},
        },
        userInput: { ...userInputInitialState, samtykke: null },
      }
      store.getState = vi.fn().mockImplementation(() => {
        return mockedState
      })
      const returnedFromLoader = await stepUfoeretrygdAFPAccessGuard()
      expect(returnedFromLoader).not.toBeNull()
      expect(returnedFromLoader).toMatchInlineSnapshot(`
        Response {
          Symbol(state): {
            "aborted": false,
            "cacheState": "",
            "headersList": HeadersList {
              "cookies": null,
              Symbol(headers map): Map {
                "location" => {
                  "name": "location",
                  "value": "/start",
                },
              },
              Symbol(headers map sorted): null,
            },
            "rangeRequested": false,
            "requestIncludesCredentials": false,
            "status": 302,
            "statusText": "",
            "timingAllowPassed": false,
            "timingInfo": null,
            "type": "default",
            "urlList": [],
          },
          Symbol(headers): Headers {},
        }
      `)
    })

    it('Når brukeren ikke har uføretrygd, er hen redirigert', async () => {
      const mockedState = {
        api: {
          queries: {
            ...fulfilledGetPerson,
            ...fulfilledGetLoependeVedtak0Ufoeregrad,
          },
        },
        userInput: { ...userInputInitialState },
      }
      store.getState = vi.fn().mockImplementation(() => {
        return mockedState
      })

      const returnedFromLoader = await stepUfoeretrygdAFPAccessGuard()
      expect(returnedFromLoader).not.toBeNull()
      expect(returnedFromLoader).toMatchInlineSnapshot(`
        Response {
          Symbol(state): {
            "aborted": false,
            "cacheState": "",
            "headersList": HeadersList {
              "cookies": null,
              Symbol(headers map): Map {
                "location" => {
                  "name": "location",
                  "value": "/samtykke-offentlig-afp",
                },
              },
              Symbol(headers map sorted): null,
            },
            "rangeRequested": false,
            "requestIncludesCredentials": false,
            "status": 302,
            "statusText": "",
            "timingAllowPassed": false,
            "timingInfo": null,
            "type": "default",
            "urlList": [],
          },
          Symbol(headers): Headers {},
        }
      `)
    })

    describe('Gitt at brukeren har uføretrygd, ', () => {
      it('Når hen har svart ja til spørsmål om afp, er hen ikke redirigert', async () => {
        const mockedState = {
          api: {
            queries: {
              ...fulfilledGetPerson,
              ...fulfilledGetLoependeVedtak75Ufoeregrad,
            },
          },
          userInput: { ...userInputInitialState, afp: 'ja_privat' },
        }
        store.getState = vi.fn().mockImplementation(() => mockedState)

        const returnedFromLoader = await stepUfoeretrygdAFPAccessGuard()
        expect(returnedFromLoader).toBeNull()
      })

      it('Når hen har svart nei til spørsmål om afp, er hen redirigert', async () => {
        const mockedState = {
          api: {
            queries: {
              ...fulfilledGetPerson,
              ...fulfilledGetLoependeVedtak75Ufoeregrad,
            },
          },
          userInput: { ...userInputInitialState, afp: 'nei' },
        }
        store.getState = vi.fn().mockImplementation(() => {
          return mockedState
        })

        const returnedFromLoader = await stepUfoeretrygdAFPAccessGuard()
        expect(returnedFromLoader?.headers.get('location')).toBe(
          '/samtykke-offentlig-afp'
        )
      })

      it('Når hen ikke har fått afp-steget (og dermed ikke har svart på spørsmål om afp), er hen redirigert', async () => {
        const mockedState = {
          api: {
            queries: {
              ...fulfilledGetPerson,
              ...fulfilledGetLoependeVedtak75Ufoeregrad,
            },
          },
          userInput: { ...userInputInitialState, afp: null },
        }
        store.getState = vi.fn().mockImplementation(() => mockedState)

        const returnedFromLoader = await stepUfoeretrygdAFPAccessGuard()
        expect(returnedFromLoader?.headers.get('location')).toBe(
          '/samtykke-offentlig-afp'
        )
      })
    })
  })

  describe('stepSamtykkeOffentligAFPAccessGuard', () => {
    it('returnerer redirect til /start location når ingen api kall er registrert', async () => {
      const mockedState = {
        api: {
          queries: {},
        },
        userInput: { ...userInputInitialState, samtykke: null },
      }
      store.getState = vi.fn().mockImplementation(() => {
        return mockedState
      })
      const returnedFromLoader = await stepSamtykkeOffentligAFPAccessGuard()
      expect(returnedFromLoader).not.toBeNull()
      expect(returnedFromLoader).toMatchInlineSnapshot(`
        Response {
          Symbol(state): {
            "aborted": false,
            "cacheState": "",
            "headersList": HeadersList {
              "cookies": null,
              Symbol(headers map): Map {
                "location" => {
                  "name": "location",
                  "value": "/start",
                },
              },
              Symbol(headers map sorted): null,
            },
            "rangeRequested": false,
            "requestIncludesCredentials": false,
            "status": 302,
            "statusText": "",
            "timingAllowPassed": false,
            "timingInfo": null,
            "type": "default",
            "urlList": [],
          },
          Symbol(headers): Headers {},
        }
      `)
    })

    it('Når brukeren ikke har uføretrygd og har valgt AFP offentlig, er hen ikke redirigert', async () => {
      const mockedState = {
        api: {
          queries: {
            ['getLoependeVedtak(undefined)']: {
              status: 'fulfilled',
              endpointName: 'getLoependeVedtak',
              requestId: 't1wLPiRKrfe_vchftk8s8',
              data: {
                ufoeretrygd: { grad: 0 },
              } satisfies LoependeVedtak,
              startedTimeStamp: 1714725797072,
              fulfilledTimeStamp: 1714725797669,
            },
          },
        },
        userInput: {
          ...userInputInitialState,
          afp: 'ja_offentlig',
        } satisfies UserInputState,
      }
      store.getState = vi.fn().mockImplementation(() => {
        return mockedState
      })

      const returnedFromLoader = await stepSamtykkeOffentligAFPAccessGuard()
      expect(returnedFromLoader).toBeNull()
    })

    it('Når brukeren har uføretrygd og har valgt ja_offentlig til spørsmål om afp, er hen redirigert', async () => {
      const mockedState = {
        api: {
          queries: {
            ['getLoependeVedtak(undefined)']: {
              status: 'fulfilled',
              endpointName: 'getLoependeVedtak',
              requestId: 't1wLPiRKrfe_vchftk8s8',
              data: {
                ufoeretrygd: { grad: 50 },
              } satisfies LoependeVedtak,
              startedTimeStamp: 1714725797072,
              fulfilledTimeStamp: 1714725797669,
            },
          },
        },
        userInput: {
          ...userInputInitialState,
          afp: 'ja_offentlig',
        } satisfies UserInputState,
      }
      store.getState = vi.fn().mockImplementation(() => {
        return mockedState
      })

      const returnedFromLoader = await stepSamtykkeOffentligAFPAccessGuard()
      expect(returnedFromLoader).not.toBeNull()
      expect(returnedFromLoader).toMatchInlineSnapshot(`
        Response {
          Symbol(state): {
            "aborted": false,
            "cacheState": "",
            "headersList": HeadersList {
              "cookies": null,
              Symbol(headers map): Map {
                "location" => {
                  "name": "location",
                  "value": "/samtykke",
                },
              },
              Symbol(headers map sorted): null,
            },
            "rangeRequested": false,
            "requestIncludesCredentials": false,
            "status": 302,
            "statusText": "",
            "timingAllowPassed": false,
            "timingInfo": null,
            "type": "default",
            "urlList": [],
          },
          Symbol(headers): Headers {},
        }
      `)
    })

    it('Når brukeren ikke har uføretrygd og har valgt afp nei, er hen redirigert', async () => {
      const mockedState = {
        api: {
          queries: {
            ['getLoependeVedtak(undefined)']: {
              status: 'fulfilled',
              endpointName: 'getLoependeVedtak',
              requestId: 't1wLPiRKrfe_vchftk8s8',
              data: {
                ufoeretrygd: { grad: 0 },
              } satisfies LoependeVedtak,
              startedTimeStamp: 1714725797072,
              fulfilledTimeStamp: 1714725797669,
            },
          },
        },
        userInput: {
          ...userInputInitialState,
          afp: 'nei',
        } satisfies UserInputState,
      }
      store.getState = vi.fn().mockImplementation(() => {
        return mockedState
      })

      const returnedFromLoader = await stepSamtykkeOffentligAFPAccessGuard()
      expect(returnedFromLoader).not.toBeNull()
      expect(returnedFromLoader).toMatchInlineSnapshot(`
        Response {
          Symbol(state): {
            "aborted": false,
            "cacheState": "",
            "headersList": HeadersList {
              "cookies": null,
              Symbol(headers map): Map {
                "location" => {
                  "name": "location",
                  "value": "/samtykke",
                },
              },
              Symbol(headers map sorted): null,
            },
            "rangeRequested": false,
            "requestIncludesCredentials": false,
            "status": 302,
            "statusText": "",
            "timingAllowPassed": false,
            "timingInfo": null,
            "type": "default",
            "urlList": [],
          },
          Symbol(headers): Headers {},
        }
      `)
    })
  })
})

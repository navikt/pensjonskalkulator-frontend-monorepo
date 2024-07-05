import * as ReactRouterUtils from 'react-router'

import { describe, it, vi } from 'vitest'

import { Pensjonsavtaler } from '../Pensjonsavtaler'
import { fulfilledGetInntekt } from '@/mocks/mockedRTKQueryApiCalls'
import { mockErrorResponse, mockResponse } from '@/mocks/server'
import { paths } from '@/router/constants'
import * as apiSliceUtils from '@/state/api/apiSlice'
import {
  userInputInitialState,
  Simulation,
} from '@/state/userInput/userInputReducer'
import { render, screen, userEvent } from '@/test-utils'

describe('Pensjonsavtaler', () => {
  const currentSimulation: Simulation = {
    utenlandsperioder: [],
    formatertUttaksalderReadOnly: '67 år string.og 1 alder.maaned',
    uttaksalder: { aar: 70, maaneder: 0 },
    aarligInntektVsaHelPensjon: {
      beloep: '500 000',
      sluttAlder: { aar: 75, maaneder: 0 },
    },
    aarligInntektFoerUttakBeloep: '0',
    gradertUttaksperiode: {
      grad: 50,
      uttaksalder: { aar: 67, maaneder: 1 },
      aarligInntektVsaPensjonBeloep: '300 000',
    },
  }
  describe('Gitt at brukeren ikke har samtykket', () => {
    it('viser riktig header og melding med lenke tilbake til start, og skjuler ingress, tabell og info om offentlig tjenestepensjon', async () => {
      const user = userEvent.setup()
      const navigateMock = vi.fn()
      vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
        () => navigateMock
      )

      const { store } = render(<Pensjonsavtaler headingLevel="3" />, {
        preloadedState: {
          api: {
            /* eslint-disable @typescript-eslint/ban-ts-comment */
            // @ts-ignore
            queries: {
              ...fulfilledGetInntekt,
            },
          },
          userInput: { ...userInputInitialState, samtykke: false },
        },
      })
      expect(
        await screen.findByRole('heading', { level: 3 })
      ).toHaveTextContent('pensjonsavtaler.title')
      expect(
        await screen.findByText(
          'pensjonsavtaler.ingress.error.samtykke_ingress',
          { exact: false }
        )
      ).toBeVisible()
      expect(
        await screen.findAllByText(
          'pensjonsavtaler.ingress.error.samtykke_link',
          { exact: false }
        )
      ).toHaveLength(2)

      expect(
        screen.queryByTestId('pensjonsavtaler-table')
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText('Alle avtaler i privat sektor hentes fra ', {
          exact: false,
        })
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText('pensjonsavtaler.tpo.title')
      ).not.toBeInTheDocument()

      await user.click(
        await screen.findByText('pensjonsavtaler.ingress.error.samtykke_link_1')
      )

      expect(navigateMock).toHaveBeenCalledWith(paths.start)
      expect(store.getState().userInput.samtykke).toBe(null)
    })
  })

  describe('Gitt at brukeren har samtykket', () => {
    it('Når pensjonsavtaler laster, viser riktig header og melding og info om offentlig tjenestepensjon', async () => {
      render(<Pensjonsavtaler headingLevel="3" />, {
        preloadedState: {
          api: {
            /* eslint-disable @typescript-eslint/ban-ts-comment */
            // @ts-ignore
            queries: {
              ...fulfilledGetInntekt,
            },
          },
          userInput: {
            ...userInputInitialState,
            samtykke: true,
            currentSimulation: currentSimulation,
          },
        },
      })
      expect(
        await screen.findByRole('heading', { level: 3 })
      ).toHaveTextContent('pensjonsavtaler.title')
      expect(
        await screen.findByText('pensjonsavtaler.tpo.title')
      ).toBeInTheDocument()
    })

    it('Når brukeren har valgt AFP privat, gradert periode og inntekt, kalles endepunktet for pensjonsavtaler med riktig payload', async () => {
      const initiateMock = vi.spyOn(
        apiSliceUtils.apiSlice.endpoints.pensjonsavtaler,
        'initiate'
      )
      render(<Pensjonsavtaler headingLevel="3" />, {
        preloadedState: {
          api: {
            /* eslint-disable @typescript-eslint/ban-ts-comment */
            // @ts-ignore
            queries: {
              ...fulfilledGetInntekt,
            },
          },
          userInput: {
            ...userInputInitialState,
            samtykke: true,
            afp: 'ja_privat',
            currentSimulation: currentSimulation,
          },
        },
      })
      expect(initiateMock).toHaveBeenCalledWith(
        {
          aarligInntektFoerUttakBeloep: 0,
          harAfp: true,
          sivilstand: undefined,
          uttaksperioder: [
            {
              aarligInntektVsaPensjon: {
                beloep: 300000,
                sluttAlder: { aar: 70, maaneder: 0 },
              },
              grad: 50,
              startAlder: {
                aar: 67,
                maaneder: 1,
              },
            },
            {
              aarligInntektVsaPensjon: {
                beloep: 500000,
                sluttAlder: { aar: 75, maaneder: 0 },
              },
              grad: 100,
              startAlder: {
                aar: 70,
                maaneder: 0,
              },
            },
          ],
        },
        {
          forceRefetch: undefined,
          subscriptionOptions: {
            pollingInterval: 0,
            refetchOnFocus: undefined,
            refetchOnReconnect: undefined,
            skipPollingIfUnfocused: false,
          },
        }
      )
    })

    it('Når brukeren har valgt AFP privat men har uføretrygd, kalles endepunktet for pensjonsavtaler med riktig payload', async () => {
      const initiateMock = vi.spyOn(
        apiSliceUtils.apiSlice.endpoints.pensjonsavtaler,
        'initiate'
      )
      render(<Pensjonsavtaler headingLevel="3" />, {
        preloadedState: {
          /* eslint-disable @typescript-eslint/ban-ts-comment */
          // @ts-ignore
          api: {
            queries: {
              ...fulfilledGetInntekt,
              ['getUfoeregrad(undefined)']: {
                /* eslint-disable @typescript-eslint/ban-ts-comment */
                // @ts-ignore
                status: 'fulfilled',
                endpointName: 'getUfoeregrad',
                requestId: 'xTaE6mOydr5ZI75UXq4Wi',
                startedTimeStamp: 1688046411971,
                data: {
                  ufoeregrad: 75,
                },
                fulfilledTimeStamp: 1688046412103,
              },
            },
          },
          userInput: {
            ...userInputInitialState,
            samtykke: true,
            afp: 'ja_privat',
            currentSimulation: currentSimulation,
          },
        },
      })
      expect(initiateMock.mock.calls[0][0].harAfp).toStrictEqual(false)
    })

    it('Når brukeren har valgt noe annet enn afp privat kalles endepunktet for pensjonsavtaler med riktig payload', async () => {
      const initiateMock = vi.spyOn(
        apiSliceUtils.apiSlice.endpoints.pensjonsavtaler,
        'initiate'
      )
      render(<Pensjonsavtaler headingLevel="3" />, {
        preloadedState: {
          api: {
            /* eslint-disable @typescript-eslint/ban-ts-comment */
            // @ts-ignore
            queries: {
              ...fulfilledGetInntekt,
            },
          },
          userInput: {
            ...userInputInitialState,
            samtykke: true,
            afp: 'ja_offentlig',
            currentSimulation: currentSimulation,
          },
        },
      })
      expect(initiateMock.mock.calls[0][0].harAfp).toStrictEqual(false)
    })

    it('Når pensjonsavtaler er hentet, viser riktig header og melding, og viser ingress og tabell og info om offentlig tjenestepensjon', async () => {
      render(<Pensjonsavtaler headingLevel="3" />, {
        preloadedState: {
          api: {
            /* eslint-disable @typescript-eslint/ban-ts-comment */
            // @ts-ignore
            queries: {
              ...fulfilledGetInntekt,
            },
          },
          userInput: {
            ...userInputInitialState,
            samtykke: true,
            currentSimulation: currentSimulation,
          },
        },
      })
      expect(await screen.findByTestId('pensjonsavtaler-list')).toBeVisible()
      expect(
        await screen.findByText('pensjonsavtaler.fra_og_med_forklaring')
      ).toBeVisible()
      expect(
        await screen.findByText('Alle avtaler i privat sektor hentes fra ', {
          exact: false,
        })
      ).toBeVisible()
      expect(await screen.findByText('pensjonsavtaler.tpo.title')).toBeVisible()
    })
    it('Når pensjonsavtaler har feilet, viser riktig header og melding, og skjuler ingress og tabell og info om offentlig tjenestepensjon', async () => {
      mockErrorResponse('/v2/pensjonsavtaler', {
        method: 'post',
      })
      render(<Pensjonsavtaler headingLevel="3" />, {
        preloadedState: {
          api: {
            /* eslint-disable @typescript-eslint/ban-ts-comment */
            // @ts-ignore
            queries: {
              ...fulfilledGetInntekt,
            },
          },
          userInput: {
            ...userInputInitialState,
            samtykke: true,
            currentSimulation: currentSimulation,
          },
        },
      })
      expect(
        await screen.findByText('pensjonsavtaler.ingress.error.pensjonsavtaler')
      ).toBeVisible()
      expect(
        screen.queryByTestId('pensjonsavtaler-list')
      ).not.toBeInTheDocument()
      expect(
        await screen.findByText('pensjonsavtaler.tpo.title')
      ).toBeInTheDocument()
    })

    it('Når pensjonsavtaler har delvis svar, viser riktig header og melding, og viser ingress, tabell og info om offentlig tjenestepensjon', async () => {
      mockResponse('/v2/pensjonsavtaler', {
        status: 200,
        json: {
          avtaler: [
            {
              produktbetegnelse: 'IPS',
              kategori: 'INDIVIDUELL_ORDNING',
              startAar: 70,
              sluttAar: 75,
              utbetalingsperioder: [
                {
                  startAlder: { aar: 70, maaneder: 6 },
                  sluttAlder: { aar: 75, maaneder: 6 },
                  aarligUtbetaling: 41802,
                  grad: 100,
                },
              ],
            },
          ],
          utilgjengeligeSelskap: ['Something'],
        },
        method: 'post',
      })
      render(<Pensjonsavtaler headingLevel="3" />, {
        preloadedState: {
          api: {
            /* eslint-disable @typescript-eslint/ban-ts-comment */
            // @ts-ignore
            queries: {
              ...fulfilledGetInntekt,
            },
          },
          userInput: {
            ...userInputInitialState,
            samtykke: true,
            currentSimulation: currentSimulation,
          },
        },
      })

      expect(
        await screen.findByText(
          'pensjonsavtaler.ingress.error.pensjonsavtaler.partial'
        )
      ).toBeVisible()
      expect(screen.queryByTestId('pensjonsavtaler-list')).toBeInTheDocument()
      expect(
        await screen.findByText('Alle avtaler i privat sektor hentes fra ', {
          exact: false,
        })
      ).toBeVisible()
      expect(
        await screen.findByRole('heading', { level: 3 })
      ).toHaveTextContent('pensjonsavtaler.title')
      expect(await screen.findAllByRole('heading', { level: 4 })).toHaveLength(
        1
      )
      expect(
        await screen.findByText('pensjonsavtaler.tpo.title')
      ).toBeInTheDocument()
    })

    it('Når pensjonsavtaler har delvis svar og ingen avtaler, viser riktig header og melding, og viser ingress, tabell og info om offentlig tjenestepensjon', async () => {
      mockResponse('/v2/pensjonsavtaler', {
        status: 200,
        json: {
          avtaler: [],
          utilgjengeligeSelskap: ['Something'],
        },
        method: 'post',
      })
      render(<Pensjonsavtaler headingLevel="3" />, {
        preloadedState: {
          api: {
            /* eslint-disable @typescript-eslint/ban-ts-comment */
            // @ts-ignore
            queries: {
              ...fulfilledGetInntekt,
            },
          },
          userInput: {
            ...userInputInitialState,
            samtykke: true,
            currentSimulation: currentSimulation,
          },
        },
      })
      expect(
        screen.queryByText(
          'pensjonsavtaler.title.error.pensjonsavtaler.partial',
          { exact: false }
        )
      ).not.toBeInTheDocument()
      expect(
        await screen.findByText('pensjonsavtaler.ingress.error.pensjonsavtaler')
      ).toBeVisible()
      expect(
        screen.queryByText(
          'pensjonsavtaler.ingress.error.pensjonsavtaler.partial'
        )
      ).not.toBeInTheDocument()
      expect(
        screen.queryByTestId('pensjonsavtaler-table')
      ).not.toBeInTheDocument()
      expect(
        await screen.findByText('Alle avtaler i privat sektor hentes fra ', {
          exact: false,
        })
      ).toBeVisible()
      expect(
        await screen.findByRole('heading', { level: 3 })
      ).toHaveTextContent('pensjonsavtaler.title')
      expect(
        await screen.findByText('pensjonsavtaler.tpo.title')
      ).toBeInTheDocument()
    })

    it('Når brukeren har 0 pensjonsavtaler, viser riktig infomelding, og skjuler ingress og tabell. Info om offentlig tjenestepensjon vises.', async () => {
      mockResponse('/v2/pensjonsavtaler', {
        status: 200,
        json: {
          avtaler: [],
          utilgjengeligeSelskap: [],
        },
        method: 'post',
      })
      render(<Pensjonsavtaler headingLevel="3" />, {
        preloadedState: {
          api: {
            /* eslint-disable @typescript-eslint/ban-ts-comment */
            // @ts-ignore
            queries: {
              ...fulfilledGetInntekt,
            },
          },
          userInput: {
            ...userInputInitialState,
            samtykke: true,
            currentSimulation: currentSimulation,
          },
        },
      })
      expect(screen.getByText('pensjonsavtaler.title')).toBeVisible()
      expect(
        await screen.findByText('pensjonsavtaler.ingress.ingen')
      ).toBeVisible()
      expect(
        screen.queryByTestId('pensjonsavtaler-table')
      ).not.toBeInTheDocument()

      expect(
        await screen.findByText('Alle avtaler i privat sektor hentes fra ', {
          exact: false,
        })
      ).toBeVisible()
      expect(
        await screen.findByText('pensjonsavtaler.tpo.title')
      ).toBeInTheDocument()
    })
  })
})

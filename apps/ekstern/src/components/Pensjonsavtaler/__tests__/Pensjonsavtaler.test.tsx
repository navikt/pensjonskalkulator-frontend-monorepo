import { describe, it, vi } from 'vitest'

import { Pensjonsavtaler } from '../Pensjonsavtaler'
import { fulfilledGetInntekt } from '@/mocks/mockedRTKQueryApiCalls'
import { paths } from '@/router/constants'
import * as apiSliceUtils from '@/state/api/apiSlice'
import {
  userInputInitialState,
  Simulation,
} from '@/state/userInput/userInputSlice'
import { render, screen, userEvent } from '@/test-utils'

const navigateMock = vi.fn()
vi.mock(import('react-router'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

describe('Pensjonsavtaler', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  const currentSimulation: Simulation = {
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
  describe('Gitt at brukeren ikke har samtykket,', () => {
    it('viser riktig header og melding med lenke tilbake til start, og skjuler ingress, tabell og info om offentlig tjenestepensjon.', async () => {
      const user = userEvent.setup()

      const { store } = render(<Pensjonsavtaler headingLevel="3" />, {
        preloadedState: {
          api: {
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
        screen.queryByTestId('private-pensjonsavtaler-desktop')
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText('Avtaler fra privat sektor hentes fra ', {
          exact: false,
        })
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText('pensjonsavtaler.offentligtp.title')
      ).not.toBeInTheDocument()

      await user.click(
        await screen.findByText('pensjonsavtaler.ingress.error.samtykke_link_1')
      )

      expect(navigateMock).toHaveBeenCalledWith(paths.start)
      expect(store.getState().userInput.samtykke).toBe(null)
    })
  })

  describe('Gitt at brukeren har samtykket,', () => {
    it('Når pensjonsavtaler laster, viser riktig header og melding og info om offentlig tjenestepensjon.', async () => {
      render(<Pensjonsavtaler headingLevel="3" />, {
        preloadedState: {
          api: {
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
        await screen.findByText('pensjonsavtaler.offentligtp.title')
      ).toBeInTheDocument()
    })

    it('Når brukeren har valgt AFP privat, gradert periode og inntekt, kalles endepunktet for pensjonsavtaler med riktig payload.', async () => {
      const initiateMock = vi.spyOn(
        apiSliceUtils.apiSlice.endpoints.pensjonsavtaler,
        'initiate'
      )
      render(<Pensjonsavtaler headingLevel="3" />, {
        preloadedState: {
          api: {
            // @ts-ignore
            queries: {
              ...fulfilledGetInntekt,
            },
          },
          userInput: {
            ...userInputInitialState,
            samtykke: true,
            afp: 'ja_privat',
            sivilstand: 'UGIFT',
            currentSimulation: currentSimulation,
          },
        },
      })
      expect(initiateMock).toHaveBeenCalledWith(
        {
          aarligInntektFoerUttakBeloep: 0,
          harAfp: true,
          epsHarPensjon: false,
          epsHarInntektOver2G: false,
          sivilstand: 'UGIFT',
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

    it('Når brukeren har valgt AFP privat men har uføretrygd, kalles endepunktet for pensjonsavtaler med riktig payload.', async () => {
      const initiateMock = vi.spyOn(
        apiSliceUtils.apiSlice.endpoints.pensjonsavtaler,
        'initiate'
      )
      render(<Pensjonsavtaler headingLevel="3" />, {
        preloadedState: {
          // @ts-ignore
          api: {
            queries: {
              ...fulfilledGetInntekt,
              ['getLoependeVedtak(undefined)']: {
                // @ts-ignore
                status: 'fulfilled',
                endpointName: 'getLoependeVedtak',
                requestId: 'xTaE6mOydr5ZI75UXq4Wi',
                startedTimeStamp: 1688046411971,
                data: {
                  ufoeretrygd: {
                    grad: 75,
                  },
                  harFremtidigLoependeVedtak: false,
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

    it('Når brukeren har valgt noe annet enn afp privat kalles endepunktet for pensjonsavtaler med riktig payload.', async () => {
      const initiateMock = vi.spyOn(
        apiSliceUtils.apiSlice.endpoints.pensjonsavtaler,
        'initiate'
      )
      render(<Pensjonsavtaler headingLevel="3" />, {
        preloadedState: {
          api: {
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

    it('Når private pensjonsavtaler og offentlig-tp er hentet, viser både liste over private pensjonsavtaler og info om offentlig tjenestepensjon.', async () => {
      render(<Pensjonsavtaler headingLevel="3" />, {
        preloadedState: {
          api: {
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
      expect(await screen.findByTestId('private-pensjonsavtaler')).toBeVisible()

      expect(
        await screen.findByText('pensjonsavtaler.offentligtp.title')
      ).toBeVisible()
      expect(
        await screen.findByText('pensjonsavtaler.fra_og_med_forklaring')
      ).toBeVisible()
    })
  })
})

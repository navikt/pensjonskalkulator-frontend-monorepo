import { createMemoryRouter, RouterProvider } from 'react-router'

import { describe, expect, it, vi } from 'vitest'

import alderspensjonResponse from '../../../mocks/data/alderspensjon/68.json' with { type: 'json' }
import { BeregningEnkel } from '../BeregningEnkel'
import {
  fulfilledGetInntekt,
  fulfilledGetPerson,
  fulfilledGetLoependeVedtak75Ufoeregrad,
  fulfilledGetLoependeVedtak0Ufoeregrad,
  fulfilledGetLoependeVedtak100Ufoeregrad,
  fulfilledGetLoependeVedtakLoependeAlderspensjon,
  fulfilledGetLoependeVedtakLoependeAFPprivat,
} from '@/mocks/mockedRTKQueryApiCalls'
import { mockResponse, mockErrorResponse } from '@/mocks/server'
import { paths } from '@/router/constants'
import { RouteErrorBoundary } from '@/router/RouteErrorBoundary'
import * as apiSliceUtils from '@/state/api/apiSlice'
import { userInputInitialState } from '@/state/userInput/userInputReducer'
import { render, screen, userEvent, waitFor } from '@/test-utils'

const navigateMock = vi.fn()
vi.mock(import('react-router'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

describe('BeregningEnkel', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Gitt at en bruker ikke mottar uføretrygd', () => {
    it('kalles endepunktet for tidligst mulig uttaksalder med riktig request body', async () => {
      const initiateMock = vi.spyOn(
        apiSliceUtils.apiSlice.endpoints.tidligstMuligHeltUttak,
        'initiate'
      )
      render(<BeregningEnkel />, {
        preloadedState: {
          api: {
            // @ts-ignore
            queries: {
              ...fulfilledGetPerson,
              ...fulfilledGetInntekt,
              ...fulfilledGetLoependeVedtak0Ufoeregrad,
            },
          },
          userInput: {
            ...userInputInitialState,
            samtykke: true,
            afp: 'ja_privat',
          },
        },
      })

      expect(initiateMock).toHaveBeenCalledWith(
        {
          aarligInntektFoerUttakBeloep: 521338,
          aarligInntektVsaPensjon: undefined,
          epsHarInntektOver2G: false,
          epsHarPensjon: false,
          simuleringstype: 'ALDERSPENSJON_MED_AFP_PRIVAT',
          sivilstand: 'UGIFT',
          utenlandsperiodeListe: [],
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

    it('Når brukeren har valgt AFP-offentlig og har ikke samtykket til beregning av AFP, kalles endepunktet for tidligst mulig uttaksalder med riktig request body', async () => {
      const initiateMock = vi.spyOn(
        apiSliceUtils.apiSlice.endpoints.tidligstMuligHeltUttak,
        'initiate'
      )
      render(<BeregningEnkel />, {
        preloadedState: {
          api: {
            // @ts-ignore
            queries: {
              ...fulfilledGetPerson,
              ...fulfilledGetInntekt,
              ...fulfilledGetLoependeVedtak0Ufoeregrad,
            },
          },
          userInput: {
            ...userInputInitialState,
            samtykke: true,
            samtykkeOffentligAFP: false,
            afp: 'ja_offentlig',
          },
        },
      })

      expect(initiateMock).toHaveBeenCalledWith(
        {
          aarligInntektFoerUttakBeloep: 521338,
          aarligInntektVsaPensjon: undefined,
          epsHarInntektOver2G: false,
          epsHarPensjon: false,
          simuleringstype: 'ALDERSPENSJON',
          sivilstand: 'UGIFT',
          utenlandsperiodeListe: [],
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

    it('viser loading og deretter riktig header, TMU og Velg uttaksalder områder', async () => {
      render(<BeregningEnkel />, {
        preloadedState: {
          api: {
            // @ts-ignore
            queries: {
              ...fulfilledGetPerson,
              ...fulfilledGetInntekt,
              ...fulfilledGetLoependeVedtak0Ufoeregrad,
            },
          },
          userInput: {
            ...userInputInitialState,
          },
        },
      })
      expect(screen.getByTestId('uttaksalder-loader')).toBeVisible()
      await waitFor(async () => {
        expect(
          screen.queryByTestId('uttaksalder-loader')
        ).not.toBeInTheDocument()
      })
      expect(await screen.findByTestId('tidligst-mulig-uttak')).toBeVisible()
      expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(1)
      expect(await screen.findByText('velguttaksalder.title')).toBeVisible()
      expect(screen.queryByTestId('om-ufoeretrygd')).not.toBeInTheDocument()
    })

    describe('Når kallet til TMU feiler,', () => {
      beforeEach(() => {
        mockErrorResponse('/v2/tidligste-hel-uttaksalder', {
          method: 'post',
        })
        mockResponse('/v8/alderspensjon/simulering', {
          status: 200,
          method: 'post',
          json: {
            ...alderspensjonResponse,
          },
        })
      })
      it('hvis brukeren er yngre enn 62 ved uttak, viser det feilmelding og alle knappene fra 62 år. Resten av siden er som vanlig', async () => {
        render(<BeregningEnkel />, {
          preloadedState: {
            api: {
              // @ts-ignore
              queries: {
                ...fulfilledGetPerson,
                ...fulfilledGetInntekt,
                ...fulfilledGetLoependeVedtak0Ufoeregrad,
              },
            },
            userInput: {
              ...userInputInitialState,
              samtykke: true,
            },
          },
        })

        expect(
          await screen.findByText('tidligstmuliguttak.error')
        ).toBeInTheDocument()

        expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(1)
        const buttons = screen.getAllByRole('button')
        expect(buttons).toHaveLength(15)
        expect(buttons[1]).toHaveTextContent('62 alder.aar')
      })

      it('hvis brukeren er 62 år eller mer ved uttak viser det feilmelding og alle knappene fra brukerens alder + 1 år. Resten av siden er som vanlig', async () => {
        vi.setSystemTime(new Date('2027-09-16'))

        render(<BeregningEnkel />, {
          preloadedState: {
            api: {
              // @ts-ignore
              queries: {
                ...fulfilledGetPerson,
                ...fulfilledGetInntekt,
                ...fulfilledGetLoependeVedtak0Ufoeregrad,
              },
            },
            userInput: {
              ...userInputInitialState,
              samtykke: true,
            },
          },
        })

        expect(
          await screen.findByText('tidligstmuliguttak.error')
        ).toBeInTheDocument()

        expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(1)
        const buttons = screen.getAllByRole('button')
        expect(buttons).toHaveLength(13)
        expect(buttons[1]).toHaveTextContent(
          '64 alder.aar string.og 6 alder.md'
        )
        vi.setSystemTime(new Date())
        vi.useRealTimers()
      })
    })
  })

  describe('Gitt at en bruker mottar uføretrygd', () => {
    beforeEach(() => {
      vi.setSystemTime(new Date())
      vi.useRealTimers()
    })
    it('hentes det ikke tidligst mulig uttaksalder', async () => {
      const initiateMock = vi.spyOn(
        apiSliceUtils.apiSlice.endpoints.tidligstMuligHeltUttak,
        'initiate'
      )

      render(<BeregningEnkel />, {
        preloadedState: {
          api: {
            // @ts-ignore
            queries: {
              ...fulfilledGetPerson,
              ...fulfilledGetInntekt,
              ...fulfilledGetLoependeVedtak75Ufoeregrad,
            },
          },
          userInput: {
            ...userInputInitialState,
            samtykke: true,
            afp: 'ja_privat',
          },
        },
      })

      expect(initiateMock).not.toHaveBeenCalled()
      expect(screen.getAllByRole('button')).toHaveLength(10)
    })

    it('vises det riktig antall knapper fra default ubetinget uttaksalder', async () => {
      render(<BeregningEnkel />, {
        preloadedState: {
          api: {
            // @ts-ignore
            queries: {
              ...fulfilledGetPerson,
              ...fulfilledGetInntekt,
              ...fulfilledGetLoependeVedtak75Ufoeregrad,
            },
          },
          userInput: {
            ...userInputInitialState,
            samtykke: true,
            afp: 'ja_privat',
          },
        },
      })

      expect(await screen.findByTestId('tidligst-mulig-uttak')).toBeVisible()
    })
  })

  describe('Når brukeren velger uttaksalder', () => {
    it('viser en loader mens beregning av alderspensjon pågår, oppdaterer valgt knapp og tegner graph og viser tabell, Pensjonsavtaler, Grunnlag og Forbehold, gitt at beregning av alderspensjon var vellykket', async () => {
      const user = userEvent.setup()
      const { container } = render(<BeregningEnkel />, {
        preloadedState: {
          api: {
            // @ts-ignore
            queries: {
              ...fulfilledGetPerson,
              ...fulfilledGetInntekt,
              ...fulfilledGetLoependeVedtak0Ufoeregrad,
            },
          },
          userInput: {
            ...userInputInitialState,
            samtykke: true,
          },
        },
      })
      await user.click(await screen.findByText('68 alder.aar'))
      const buttons = await screen.findAllByRole('button', { pressed: true })
      expect(buttons[0]).toHaveTextContent('68 alder.aar')
      expect(
        container.getElementsByClassName('highcharts-loading')
      ).toHaveLength(1)
      await waitFor(() => {
        expect(
          screen.queryByTestId('uttaksalder-loader')
        ).not.toBeInTheDocument()
      })
      expect(await screen.findByTestId('highcharts-done-drawing')).toBeVisible()
      expect(screen.getByText('pensjonsavtaler.title')).toBeVisible()
      expect(
        await screen.findByText('beregning.tabell.vis')
      ).toBeInTheDocument()
      expect(await screen.findByText('grunnlag.title')).toBeInTheDocument()
      expect(
        await screen.findByText('grunnlag.forbehold.title')
      ).toBeInTheDocument()
      expect(await screen.findByText('savnerdunoe.title')).toBeInTheDocument()
      expect(await screen.findByText('savnerdunoe.ingress')).toBeInTheDocument()
    })

    it('beregnes med AFP offentlig, når brukeren har samtykket til det', async () => {
      const simuleringsMock = vi.spyOn(
        apiSliceUtils.apiSlice.endpoints.alderspensjon,
        'initiate'
      )
      const user = userEvent.setup()
      const { store } = render(<BeregningEnkel />, {
        preloadedState: {
          api: {
            // @ts-ignore
            queries: {
              ...fulfilledGetPerson,
              ...fulfilledGetInntekt,
              ...fulfilledGetLoependeVedtak0Ufoeregrad,
            },
          },
          userInput: {
            ...userInputInitialState,
            samtykke: false,
            samtykkeOffentligAFP: true,
            afp: 'ja_offentlig',
            currentSimulation: {
              utenlandsperioder: [],
              formatertUttaksalderReadOnly: '68 år string.og 0 alder.maaned',
              uttaksalder: { aar: 68, maaneder: 0 },
              aarligInntektFoerUttakBeloep: '100 000',
              gradertUttaksperiode: null,
            },
          },
        },
      })
      store.dispatch(
        apiSliceUtils.apiSlice.endpoints.getLoependeVedtak.initiate()
      )
      await user.click(await screen.findByText('68 alder.aar'))
      const buttons = await screen.findAllByRole('button', { pressed: true })
      expect(buttons[0]).toHaveTextContent('68 alder.aar')

      await waitFor(async () => {
        expect(
          screen.queryByTestId('uttaksalder-loader')
        ).not.toBeInTheDocument()
        expect(
          await screen.findByText('beregning.tabell.vis')
        ).toBeInTheDocument()
      })

      expect(simuleringsMock).toHaveBeenCalledWith(
        {
          aarligInntektFoerUttakBeloep: 100000,
          epsHarInntektOver2G: false,
          epsHarPensjon: false,
          foedselsdato: '1963-04-30',
          heltUttak: {
            uttaksalder: {
              aar: 68,
              maaneder: 0,
            },
          },
          simuleringstype: 'ALDERSPENSJON_MED_AFP_OFFENTLIG_LIVSVARIG',
          sivilstand: 'UGIFT',
          utenlandsperiodeListe: [],
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

      await user.click(await screen.findByText('beregning.tabell.vis'))

      expect(
        screen.getByRole('columnheader', {
          name: 'beregning.highcharts.serie.inntekt.name',
        })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('columnheader', {
          name: 'beregning.highcharts.serie.alderspensjon.name',
        })
      ).toBeInTheDocument()
      expect(
        screen.queryByRole('columnheader', {
          name: 'beregning.highcharts.serie.afp.name',
        })
      ).toBeInTheDocument()
    })

    it('beregnes ikke med AFP offentlig, når brukeren ikke har samtykket til det', async () => {
      const simuleringsMock = vi.spyOn(
        apiSliceUtils.apiSlice.endpoints.alderspensjon,
        'initiate'
      )
      const user = userEvent.setup()
      const { store } = render(<BeregningEnkel />, {
        preloadedState: {
          api: {
            // @ts-ignore
            queries: {
              ...fulfilledGetPerson,
              ...fulfilledGetInntekt,
              ...fulfilledGetLoependeVedtak0Ufoeregrad,
            },
          },
          userInput: {
            ...userInputInitialState,
            samtykke: false,
            samtykkeOffentligAFP: false,
            afp: 'ja_offentlig',
            currentSimulation: {
              utenlandsperioder: [],
              formatertUttaksalderReadOnly: '68 år string.og 0 alder.maaned',
              uttaksalder: { aar: 68, maaneder: 0 },
              aarligInntektFoerUttakBeloep: '100 000',
              gradertUttaksperiode: null,
            },
          },
        },
      })
      store.dispatch(
        apiSliceUtils.apiSlice.endpoints.getLoependeVedtak.initiate()
      )
      await user.click(await screen.findByText('68 alder.aar'))
      const buttons = await screen.findAllByRole('button', { pressed: true })
      expect(buttons[0]).toHaveTextContent('68 alder.aar')

      await waitFor(async () => {
        expect(
          screen.queryByTestId('uttaksalder-loader')
        ).not.toBeInTheDocument()
        expect(
          await screen.findByText('beregning.tabell.vis')
        ).toBeInTheDocument()
      })

      expect(simuleringsMock).toHaveBeenCalledWith(
        {
          aarligInntektFoerUttakBeloep: 100000,
          epsHarInntektOver2G: false,
          epsHarPensjon: false,
          foedselsdato: '1963-04-30',
          heltUttak: {
            uttaksalder: {
              aar: 68,
              maaneder: 0,
            },
          },
          simuleringstype: 'ALDERSPENSJON',
          sivilstand: 'UGIFT',
          utenlandsperiodeListe: [],
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

      await user.click(await screen.findByText('beregning.tabell.vis'))

      expect(
        screen.getByRole('columnheader', {
          name: 'beregning.highcharts.serie.inntekt.name',
        })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('columnheader', {
          name: 'beregning.highcharts.serie.alderspensjon.name',
        })
      ).toBeInTheDocument()
      expect(
        screen.queryByRole('columnheader', {
          name: 'beregning.highcharts.serie.afp.name',
        })
      ).not.toBeInTheDocument()
    })

    it('beregnes ikke med AFP privat, når brukeren mottar uføretrygd', async () => {
      const simuleringsMock = vi.spyOn(
        apiSliceUtils.apiSlice.endpoints.alderspensjon,
        'initiate'
      )

      const user = userEvent.setup()
      const { store } = render(<BeregningEnkel />, {
        preloadedState: {
          api: {
            // @ts-ignore
            queries: {
              ...fulfilledGetPerson,
              ...fulfilledGetInntekt,
              ...fulfilledGetLoependeVedtak100Ufoeregrad,
            },
          },
          userInput: {
            ...userInputInitialState,
            samtykke: false,
            afp: 'ja_privat',
            currentSimulation: {
              utenlandsperioder: [],
              formatertUttaksalderReadOnly: '68 år string.og 0 alder.maaned',
              uttaksalder: { aar: 68, maaneder: 0 },
              aarligInntektFoerUttakBeloep: '100 000',
              gradertUttaksperiode: null,
            },
          },
        },
      })
      store.dispatch(
        apiSliceUtils.apiSlice.endpoints.getLoependeVedtak.initiate()
      )
      await user.click(await screen.findByText('68 alder.aar'))
      const buttons = await screen.findAllByRole('button', { pressed: true })
      expect(buttons[0]).toHaveTextContent('68 alder.aar')

      await waitFor(async () => {
        expect(
          screen.queryByTestId('uttaksalder-loader')
        ).not.toBeInTheDocument()
        expect(
          await screen.findByText('beregning.tabell.vis')
        ).toBeInTheDocument()
      })

      expect(simuleringsMock).toHaveBeenCalledWith(
        {
          aarligInntektFoerUttakBeloep: 100000,
          epsHarInntektOver2G: false,
          epsHarPensjon: false,
          foedselsdato: '1963-04-30',
          heltUttak: {
            uttaksalder: {
              aar: 68,
              maaneder: 0,
            },
          },
          simuleringstype: 'ALDERSPENSJON',
          sivilstand: 'UGIFT',
          utenlandsperiodeListe: [],
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

      await user.click(await screen.findByText('beregning.tabell.vis'))

      expect(
        screen.getByRole('columnheader', {
          name: 'beregning.highcharts.serie.inntekt.name',
        })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('columnheader', {
          name: 'beregning.highcharts.serie.alderspensjon.name',
        })
      ).toBeInTheDocument()
      expect(
        screen.queryByRole('columnheader', {
          name: 'beregning.highcharts.serie.afp.name',
        })
      ).not.toBeInTheDocument()
    })

    it('beregnes med AFP privat, når brukeren har valgt det og ikke mottar uføretrygd', async () => {
      const simuleringsMock = vi.spyOn(
        apiSliceUtils.apiSlice.endpoints.alderspensjon,
        'initiate'
      )

      const user = userEvent.setup()
      const { store } = render(<BeregningEnkel />, {
        preloadedState: {
          api: {
            // @ts-ignore
            queries: {
              ...fulfilledGetPerson,
              ...fulfilledGetInntekt,
              ...fulfilledGetLoependeVedtak0Ufoeregrad,
            },
          },
          userInput: {
            ...userInputInitialState,
            samtykke: false,
            afp: 'ja_privat',
            currentSimulation: {
              utenlandsperioder: [],
              formatertUttaksalderReadOnly: '68 år string.og 0 alder.maaned',
              uttaksalder: { aar: 68, maaneder: 0 },
              aarligInntektFoerUttakBeloep: '100 000',
              gradertUttaksperiode: null,
            },
          },
        },
      })
      store.dispatch(
        apiSliceUtils.apiSlice.endpoints.getLoependeVedtak.initiate()
      )
      await user.click(await screen.findByText('68 alder.aar'))
      const buttons = await screen.findAllByRole('button', { pressed: true })
      expect(buttons[0]).toHaveTextContent('68 alder.aar')

      await waitFor(async () => {
        expect(
          screen.queryByTestId('uttaksalder-loader')
        ).not.toBeInTheDocument()
        expect(
          await screen.findByText('beregning.tabell.vis')
        ).toBeInTheDocument()
      })

      expect(simuleringsMock).toHaveBeenCalledWith(
        {
          aarligInntektFoerUttakBeloep: 100000,
          epsHarInntektOver2G: false,
          epsHarPensjon: false,
          foedselsdato: '1963-04-30',
          heltUttak: {
            uttaksalder: {
              aar: 68,
              maaneder: 0,
            },
          },
          simuleringstype: 'ALDERSPENSJON_MED_AFP_PRIVAT',
          sivilstand: 'UGIFT',
          utenlandsperiodeListe: [],
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

      await user.click(await screen.findByText('beregning.tabell.vis'))

      expect(
        screen.getByRole('columnheader', {
          name: 'beregning.highcharts.serie.inntekt.name',
        })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('columnheader', {
          name: 'beregning.highcharts.serie.alderspensjon.name',
        })
      ).toBeInTheDocument()
      expect(
        screen.queryByRole('columnheader', {
          name: 'beregning.highcharts.serie.afp.name',
        })
      ).toBeInTheDocument()
    })

    it('viser feilmelding og skjuler Grunnlag og tabell og gir mulighet til å prøve på nytt, gitt at beregning av alderspensjon har feilet', async () => {
      const initiateMock = vi.spyOn(
        apiSliceUtils.apiSlice.endpoints.alderspensjon,
        'initiate'
      )
      mockErrorResponse('/v8/alderspensjon/simulering', {
        method: 'post',
      })
      const user = userEvent.setup()
      render(<BeregningEnkel />, {
        preloadedState: {
          api: {
            // @ts-ignore
            queries: {
              ...fulfilledGetPerson,
              ...fulfilledGetInntekt,
              ...fulfilledGetLoependeVedtak0Ufoeregrad,
            },
          },
          userInput: {
            ...userInputInitialState,
          },
        },
      })

      await user.click(await screen.findByText('70 alder.aar'))

      await waitFor(() => {
        expect(
          screen.queryByTestId('uttaksalder-loader')
        ).not.toBeInTheDocument()
      })
      waitFor(() => {
        expect(initiateMock).toHaveBeenCalledTimes(1)
      })
      expect(await screen.findByText('beregning.error')).toBeInTheDocument()
      await waitFor(async () => {
        expect(screen.queryByText('grunnlag.title')).not.toBeInTheDocument()
      })
      await user.click(await screen.findByText('application.global.retry'))
      expect(initiateMock).toHaveBeenCalledTimes(3)
      expect(screen.queryByText('beregning.tabell.vis')).not.toBeInTheDocument()
    })

    it('viser ErrorPageUnexpected når simulering svarer med errorcode 503', async () => {
      const user = userEvent.setup()
      // Må bruke mockResponse for å få riktig status (mockErrorResponse returnerer "originalStatus")
      mockResponse('/v8/alderspensjon/simulering', {
        status: 503,
        method: 'post',
      })
      const router = createMemoryRouter([
        {
          path: '/',
          element: <BeregningEnkel />,
          ErrorBoundary: RouteErrorBoundary,
        },
      ])
      render(<RouterProvider router={router} />, {
        hasRouter: false,
        preloadedState: {
          api: {
            // @ts-ignore
            queries: {
              ...fulfilledGetPerson,
              ...fulfilledGetInntekt,
              ...fulfilledGetLoependeVedtak0Ufoeregrad,
            },
          },
          userInput: {
            ...userInputInitialState,
          },
        },
      })

      await user.click(await screen.findByText('68 alder.aar'))
      await waitFor(() => {
        expect(navigateMock).toHaveBeenCalledWith(paths.uventetFeil)
      })
    })

    it('Når brukeren velger en alder som de ikke har nok opptjening til, viser infomelding om at opptjeningen er for lav og skjuler Grunnlag', async () => {
      const user = userEvent.setup()
      mockResponse('/v8/alderspensjon/simulering', {
        status: 200,
        method: 'post',
        json: {
          alderspensjon: [],
          vilkaarsproeving: {
            vilkaarErOppfylt: false,
            alternativ: {
              heltUttaksalder: { aar: 67, maaneder: 0 },
              uttaksgrad: 100,
            },
          },
          harForLiteTrygdetid: false,
        },
      })
      mockErrorResponse('/v2/tidligste-hel-uttaksalder', {
        method: 'post',
      })
      render(<BeregningEnkel />, {
        preloadedState: {
          api: {
            // @ts-ignore
            queries: {
              ...fulfilledGetPerson,
              ...fulfilledGetInntekt,
              ...fulfilledGetLoependeVedtak0Ufoeregrad,
            },
          },
          userInput: {
            ...userInputInitialState,
            samtykke: true,
            currentSimulation: {
              utenlandsperioder: [],
              formatertUttaksalderReadOnly: '63 alder.aar',
              uttaksalder: { aar: 63, maaneder: 0 },
              aarligInntektFoerUttakBeloep: '100 000',
              gradertUttaksperiode: null,
            },
          },
        },
      })

      await waitFor(async () => {
        expect(
          screen.queryByTestId('uttaksalder-loader')
        ).not.toBeInTheDocument()
      })

      await user.click(await screen.findByText('63 alder.aar'))

      expect(
        await screen.findByText(
          'Du har ikke høy nok opptjening til å kunne starte uttak ved 63 år. Prøv en høyere alder.',
          { exact: false }
        )
      ).toBeVisible()
      expect(screen.queryByText('grunnlag.title')).not.toBeInTheDocument()
      expect(screen.queryByText('beregning.tabell.vis')).not.toBeInTheDocument()
    })
  })

  describe('Når brukeren har oppdatert inntekten sin og at uttaksalder er nullstilt', () => {
    it('viser det en info-alertboks som forsvinner ved å velge en ny alder', async () => {
      const user = userEvent.setup()
      render(<BeregningEnkel />, {
        preloadedState: {
          api: {
            // @ts-ignore
            queries: {
              ...fulfilledGetPerson,
              ...fulfilledGetInntekt,
              ...fulfilledGetLoependeVedtak0Ufoeregrad,
            },
          },
          userInput: {
            ...userInputInitialState,
            currentSimulation: {
              ...userInputInitialState.currentSimulation,
              aarligInntektFoerUttakBeloep: '100 000',
            },
          },
        },
      })
      await waitFor(async () => {
        expect(
          screen.queryByTestId('uttaksalder-loader')
        ).not.toBeInTheDocument()
      })

      const alertBoks = await screen.findByTestId('alert-inntekt')
      expect(alertBoks).toBeVisible()

      await user.click(await screen.findByText('70 alder.aar'))
      expect(alertBoks).not.toBeVisible()
    })

    it('viser det en info-alertboks som forsvinner ved å klikke på lukke knappen', async () => {
      const user = userEvent.setup()
      render(<BeregningEnkel />, {
        preloadedState: {
          api: {
            // @ts-ignore
            queries: {
              ...fulfilledGetPerson,
              ...fulfilledGetInntekt,
              ...fulfilledGetLoependeVedtak0Ufoeregrad,
            },
          },
          userInput: {
            ...userInputInitialState,
            currentSimulation: {
              ...userInputInitialState.currentSimulation,
              aarligInntektFoerUttakBeloep: '100 000',
            },
          },
        },
      })
      const alertBoks = await screen.findByTestId('alert-inntekt')
      const alertButtonBoks = alertBoks.querySelector('button')
      expect(alertBoks).toBeVisible()
      expect(alertButtonBoks).toBeInTheDocument()
      await user.click(alertButtonBoks as HTMLButtonElement)
      expect(alertBoks).not.toBeVisible()
    })
  })

  // Enkel simulering er egentlig ikke tilgjengelig for brukere som har vedtak om alderspensjon. Dette er bare tester som dokumenterer logikken slik den er.
  describe('Gitt at brukeren har vedtak om alderspensjon,', () => {
    it('viser en loader mens beregning av alderspensjon pågår, oppdaterer valgt knapp og tegner graph og viser tabell, Pensjonsavtaler, Grunnlag og Forbehold, gitt at beregning av alderspensjon var vellykket', async () => {
      const user = userEvent.setup()
      const { container } = render(<BeregningEnkel />, {
        preloadedState: {
          api: {
            // @ts-ignore
            queries: {
              ...fulfilledGetPerson,
              ...fulfilledGetInntekt,
              ...fulfilledGetLoependeVedtakLoependeAlderspensjon,
            },
          },
          userInput: {
            ...userInputInitialState,
            samtykke: true,
          },
        },
      })
      await user.click(await screen.findByText('68 alder.aar'))
      const buttons = await screen.findAllByRole('button', { pressed: true })
      expect(buttons[0]).toHaveTextContent('68 alder.aar')
      expect(
        container.getElementsByClassName('highcharts-loading')
      ).toHaveLength(1)
      await waitFor(() => {
        expect(
          screen.queryByTestId('uttaksalder-loader')
        ).not.toBeInTheDocument()
      })
      expect(await screen.findByTestId('highcharts-done-drawing')).toBeVisible()
      expect(
        screen.queryByText('pensjonsavtaler.title')
      ).not.toBeInTheDocument()
      expect(
        await screen.findByText('beregning.tabell.vis')
      ).toBeInTheDocument()
      expect(await screen.findByText('grunnlag.title')).toBeInTheDocument()
      expect(
        await screen.findByText('grunnlag.forbehold.title')
      ).toBeInTheDocument()
      expect(
        await screen.findByText('savnerdunoe.title.endring')
      ).toBeInTheDocument()
      expect(screen.queryByText('savnerdunoe.ingress')).not.toBeInTheDocument()
    })

    it('beregnes med AFP privat, når brukeren har vedtak om AFP-privat', async () => {
      const simuleringsMock = vi.spyOn(
        apiSliceUtils.apiSlice.endpoints.alderspensjon,
        'initiate'
      )

      const user = userEvent.setup()
      const { store } = render(<BeregningEnkel />, {
        preloadedState: {
          api: {
            // @ts-ignore
            queries: {
              ...fulfilledGetPerson,
              ...fulfilledGetInntekt,
              ...fulfilledGetLoependeVedtakLoependeAFPprivat,
            },
          },
          userInput: {
            ...userInputInitialState,
            samtykke: false,
            currentSimulation: {
              utenlandsperioder: [],
              formatertUttaksalderReadOnly: '68 år string.og 0 alder.maaned',
              uttaksalder: { aar: 68, maaneder: 0 },
              aarligInntektFoerUttakBeloep: '100 000',
              gradertUttaksperiode: null,
            },
          },
        },
      })
      store.dispatch(
        apiSliceUtils.apiSlice.endpoints.getLoependeVedtak.initiate()
      )
      await user.click(await screen.findByText('68 alder.aar'))
      const buttons = await screen.findAllByRole('button', { pressed: true })
      expect(buttons[0]).toHaveTextContent('68 alder.aar')

      await waitFor(async () => {
        expect(
          screen.queryByTestId('uttaksalder-loader')
        ).not.toBeInTheDocument()
        expect(
          await screen.findByText('beregning.tabell.vis')
        ).toBeInTheDocument()
      })

      expect(simuleringsMock).toHaveBeenCalledWith(
        {
          aarligInntektFoerUttakBeloep: 100000,
          epsHarInntektOver2G: false,
          epsHarPensjon: false,
          foedselsdato: '1963-04-30',
          heltUttak: {
            uttaksalder: {
              aar: 68,
              maaneder: 0,
            },
          },
          simuleringstype: 'ENDRING_ALDERSPENSJON_MED_AFP_PRIVAT',
          sivilstand: 'UGIFT',
          utenlandsperiodeListe: [],
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

      await user.click(await screen.findByText('beregning.tabell.vis'))

      expect(
        screen.getByRole('columnheader', {
          name: 'beregning.highcharts.serie.inntekt.name',
        })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('columnheader', {
          name: 'beregning.highcharts.serie.alderspensjon.name',
        })
      ).toBeInTheDocument()
      expect(
        screen.queryByRole('columnheader', {
          name: 'beregning.highcharts.serie.afp.name',
        })
      ).toBeInTheDocument()
    })
  })
})

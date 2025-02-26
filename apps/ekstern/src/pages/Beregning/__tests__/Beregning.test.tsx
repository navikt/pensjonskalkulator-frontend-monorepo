import { describe, expect, it, vi } from 'vitest'

import { Beregning } from '../Beregning'
import { AVANSERT_FORM_NAMES } from '@/components/AvansertSkjema/utils'
import {
  fulfilledGetInntekt,
  fulfilledGetPerson,
  fulfilledGetLoependeVedtak0Ufoeregrad,
  fulfilledGetLoependeVedtakLoependeAlderspensjon,
  fulfilledGetLoependeVedtakFremtidig,
  fulfilledGetLoependeVedtakFremtidigMedAlderspensjon,
} from '@/mocks/mockedRTKQueryApiCalls'
import { paths } from '@/router/constants'
import { userInputInitialState } from '@/state/userInput/userInputSlice'
import * as userInputReducerUtils from '@/state/userInput/userInputSlice'
import { fireEvent, render, screen, userEvent, waitFor } from '@/test-utils'
const previousWindow = window

const navigateMock = vi.fn()
vi.mock(import('react-router'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

describe('Beregning', () => {
  const preloadedQueries = {
    api: {
      queries: {
        ...fulfilledGetPerson,
        ...fulfilledGetInntekt,
        ...fulfilledGetLoependeVedtak0Ufoeregrad,
      },
    },
  }

  it('har riktig sidetittel', () => {
    render(<Beregning visning="enkel" />, {
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
          samtykke: false,
          currentSimulation: {
            ...userInputInitialState.currentSimulation,
            formatertUttaksalderReadOnly:
              '70 alder.aar string.og 4 alder.maaned',
            uttaksalder: { aar: 70, maaneder: 4 },
          },
        },
      },
    })
    expect(document.title).toBe('application.title.beregning')
  })

  describe('Gitt at brukeren har vedtak om alderspensjon', () => {
    it('viser ikke toggle på toppen av siden', async () => {
      render(<Beregning visning="enkel" />, {
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
            samtykke: false,
            currentSimulation: {
              formatertUttaksalderReadOnly:
                '70 alder.aar string.og 4 alder.maaned',
              uttaksalder: { aar: 70, maaneder: 4 },
              aarligInntektFoerUttakBeloep: '300 000',
              gradertUttaksperiode: null,
            },
          },
        },
      })

      expect(screen.queryByTestId('toggle-avansert')).not.toBeInTheDocument()
    })

    it('når vedtaket gjelder frem i tid vises info om det på toppen av siden', async () => {
      render(<Beregning visning="enkel" />, {
        preloadedState: {
          api: {
            // @ts-ignore
            queries: {
              ...fulfilledGetPerson,
              ...fulfilledGetInntekt,
              ...fulfilledGetLoependeVedtakFremtidig,
            },
          },
          userInput: {
            ...userInputInitialState,
            samtykke: false,
            currentSimulation: {
              formatertUttaksalderReadOnly:
                '70 alder.aar string.og 4 alder.maaned',
              uttaksalder: { aar: 70, maaneder: 4 },
              aarligInntektFoerUttakBeloep: '300 000',
              gradertUttaksperiode: null,
            },
          },
        },
      })

      expect(
        screen.getByText('stegvisning.fremtidigvedtak.alert')
      ).toBeVisible()
    })

    it('når vedtaket gjelder både nå og frem i tid vises info om det på toppen av siden', async () => {
      render(<Beregning visning="enkel" />, {
        preloadedState: {
          api: {
            // @ts-ignore
            queries: {
              ...fulfilledGetPerson,
              ...fulfilledGetInntekt,
              ...fulfilledGetLoependeVedtakFremtidigMedAlderspensjon,
            },
          },
          userInput: {
            ...userInputInitialState,
            samtykke: false,
            currentSimulation: {
              formatertUttaksalderReadOnly:
                '70 alder.aar string.og 4 alder.maaned',
              uttaksalder: { aar: 70, maaneder: 4 },
              aarligInntektFoerUttakBeloep: '300 000',
              gradertUttaksperiode: null,
            },
          },
        },
      })

      expect(
        screen.getByText('stegvisning.fremtidigvedtak.endring.alert')
      ).toBeVisible()
    })
  })

  describe('Gitt at brukeren navigerer mellom fanene', () => {
    it('når brukeren har gjort en Enkel simulering og bytter fane, nullstiller det pågående simulering', async () => {
      const user = userEvent.setup()
      const flushCurrentSimulationMock = vi.spyOn(
        userInputReducerUtils.userInputActions,
        'flushCurrentSimulation'
      )
      render(<Beregning visning="enkel" />, {
        preloadedState: {
          // @ts-ignore
          api: {
            ...preloadedQueries.api,
          },
          userInput: {
            ...userInputInitialState,
            samtykke: true,
            currentSimulation: {
              formatertUttaksalderReadOnly:
                '70 alder.aar string.og 4 alder.maaned',
              uttaksalder: { aar: 70, maaneder: 4 },
              aarligInntektFoerUttakBeloep: '300 000',
              gradertUttaksperiode: null,
            },
          },
        },
      })

      expect(await screen.findByTestId('toggle-avansert')).toBeVisible()
      await user.click(await screen.findByText('beregning.toggle.avansert'))
      expect(flushCurrentSimulationMock).toHaveBeenCalled()
    })

    it('når brukeren begynner å fylle ut skjema på Avansert og bytter fane, gir Modalen muligheten til å avbryte eller avslutte beregningen', async () => {
      const user = userEvent.setup()
      const flushCurrentSimulationMock = vi.spyOn(
        userInputReducerUtils.userInputActions,
        'flushCurrentSimulation'
      )
      render(<Beregning visning="avansert" />, {
        preloadedState: {
          // @ts-ignore
          api: {
            ...preloadedQueries.api,
          },
          userInput: {
            ...userInputInitialState,
          },
        },
      })

      fireEvent.change(
        await screen.findByTestId(
          `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-aar`
        ),
        {
          target: { value: '67' },
        }
      )

      expect(await screen.findByTestId('toggle-avansert')).toBeVisible()
      await user.click(await screen.findByText('beregning.toggle.enkel'))
      expect(
        await screen.findByText('beregning.avansert.avbryt_modal.title')
      ).toBeVisible()
      await user.click(
        await screen.findByText('beregning.avansert.avbryt_modal.button.avbryt')
      )
      await user.click(await screen.findByText('beregning.toggle.enkel'))
      await user.click(
        await screen.findByText(
          'beregning.avansert.avbryt_modal.button.avslutt'
        )
      )
      expect(navigateMock).toHaveBeenCalledWith(paths.beregningEnkel)
      expect(flushCurrentSimulationMock).toHaveBeenCalled()
    })

    it('når brukeren er på resultatside etter en Avansert simulering og bytter fane, gir Modalen muligheten til å avbryte eller avslutte beregningen', async () => {
      const user = userEvent.setup()
      render(<Beregning visning="avansert" />, {
        preloadedState: {
          // @ts-ignore
          api: {
            ...preloadedQueries.api,
          },
          userInput: {
            ...userInputInitialState,
          },
        },
      })

      fireEvent.change(
        await screen.findByTestId(
          `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-aar`
        ),
        {
          target: { value: '67' },
        }
      )
      fireEvent.change(
        await screen.findByTestId(
          `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-maaneder`
        ),
        {
          target: { value: '0' },
        }
      )

      await user.click(
        await screen.findByText('beregning.avansert.button.beregn')
      )
      expect(await screen.findByTestId('toggle-avansert')).toBeVisible()
      await user.click(await screen.findByText('beregning.toggle.enkel'))
      expect(
        await screen.findByText('beregning.avansert.avbryt_modal.title')
      ).toBeVisible()
      expect(
        await screen.findByText('beregning.avansert.avbryt_modal.button.avbryt')
      ).toBeVisible()
      expect(
        await screen.findByText(
          'beregning.avansert.avbryt_modal.button.avslutt'
        )
      ).toBeVisible()
    })

    it('når brukeren har gjort en Avansert simulering som hen redigerer og bytter fane, gir Modalen muligheten til å avbryte eller avslutte beregningen', async () => {
      const user = userEvent.setup()
      render(<Beregning visning="avansert" />, {
        preloadedState: {
          // @ts-ignore
          api: {
            ...preloadedQueries.api,
          },
          userInput: {
            ...userInputInitialState,
            samtykke: false,
            currentSimulation: {
              ...userInputInitialState.currentSimulation,
              formatertUttaksalderReadOnly:
                '70 alder.aar string.og 4 alder.maaned',
              uttaksalder: { aar: 70, maaneder: 4 },
            },
          },
        },
      })

      expect(await screen.findByTestId('toggle-avansert')).toBeVisible()
      await user.click(await screen.findByText('beregning.toggle.enkel'))
      expect(
        await screen.findByText('beregning.avansert.avbryt_modal.title')
      ).toBeVisible()
      expect(
        await screen.findByText('beregning.avansert.avbryt_modal.button.avbryt')
      ).toBeVisible()
      expect(
        await screen.findByText(
          'beregning.avansert.avbryt_modal.button.avslutt'
        )
      ).toBeVisible()
    })
  })

  describe('Gitt at brukeren navigerer tilbake', () => {
    beforeEach(() => {
      global.window = Object.create(window)
      Object.defineProperty(window, 'location', {
        value: {
          href: paths.beregningAvansert,
        },
        writable: true,
      })
    })

    afterEach(() => {
      global.window = previousWindow
    })

    function NavigateWrapper({ children }: { children: React.ReactNode }) {
      function handleClick() {
        fireEvent(
          window,
          new window.PopStateEvent('popstate', {
            state: { page: 1 },
          })
        )
      }

      return (
        <div>
          <button onClick={handleClick} data-testid="navigate-btn">
            Navigate
          </button>
          {children}
        </div>
      )
    }

    it('når brukeren har gjort en Enkel simulering og trykker på tilbakeknappen, vises ikke Avbryt-Modalen', async () => {
      global.window = Object.create(window)
      Object.defineProperty(window, 'location', {
        value: {
          href: paths.beregningEnkel,
        },
        writable: true,
      })
      const user = userEvent.setup()
      render(
        <NavigateWrapper>
          <Beregning visning="enkel" />
        </NavigateWrapper>,
        {
          preloadedState: {
            // @ts-ignore
            api: {
              ...preloadedQueries.api,
            },
            userInput: {
              ...userInputInitialState,
              samtykke: true,
              currentSimulation: {
                formatertUttaksalderReadOnly:
                  '70 alder.aar string.og 4 alder.maaned',
                uttaksalder: { aar: 70, maaneder: 4 },
                aarligInntektFoerUttakBeloep: '300 000',
                gradertUttaksperiode: null,
              },
            },
          },
        }
      )

      expect(await screen.findByTestId('toggle-avansert')).toBeInTheDocument()
      await user.click(await screen.findByTestId('navigate-btn'))
      expect(
        await screen.findByText('beregning.avansert.avbryt_modal.title')
      ).not.toBeVisible()
    })

    it('når brukeren begynner å fylle ut skjema på Avansert og trykker på tilbakeknappen, vises Avbryt-Modalen', async () => {
      const user = userEvent.setup()

      render(
        <NavigateWrapper>
          <Beregning visning="avansert" />
        </NavigateWrapper>,
        {
          preloadedState: {
            // @ts-ignore
            api: {
              ...preloadedQueries.api,
            },
            userInput: {
              ...userInputInitialState,
            },
          },
        }
      )

      fireEvent.change(
        await screen.findByTestId(
          `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-aar`
        ),
        {
          target: { value: '67' },
        }
      )

      expect(await screen.findByTestId('toggle-avansert')).toBeInTheDocument()
      await user.click(await screen.findByTestId('navigate-btn'))
      expect(
        await screen.findByText('beregning.avansert.avbryt_modal.title')
      ).toBeVisible()
    })

    it('når brukeren er på resultatside etter en Avansert simulering og trykker på tilbakeknappen, vises Avbryt-Modalen', async () => {
      const user = userEvent.setup()
      render(
        <NavigateWrapper>
          <Beregning visning="avansert" />
        </NavigateWrapper>,
        {
          preloadedState: {
            // @ts-ignore
            api: {
              ...preloadedQueries.api,
            },
            userInput: {
              ...userInputInitialState,
            },
          },
        }
      )

      fireEvent.change(
        await screen.findByTestId(
          `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-aar`
        ),
        {
          target: { value: '67' },
        }
      )
      fireEvent.change(
        await screen.findByTestId(
          `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-maaneder`
        ),
        {
          target: { value: '0' },
        }
      )

      await user.click(
        await screen.findByText('beregning.avansert.button.beregn')
      )
      expect(await screen.findByTestId('toggle-avansert')).toBeInTheDocument()
      await user.click(await screen.findByTestId('navigate-btn'))
      expect(
        await screen.findByText('beregning.avansert.avbryt_modal.title')
      ).toBeVisible()
    })

    it('når brukeren har gjort en Avansert simulering og trykker på tilbakeknappen, vises Avbryt-Modalen', async () => {
      const user = userEvent.setup()
      render(
        <NavigateWrapper>
          <Beregning visning="avansert" />
        </NavigateWrapper>,
        {
          preloadedState: {
            // @ts-ignore
            api: {
              ...preloadedQueries.api,
            },
            userInput: {
              ...userInputInitialState,
              samtykke: false,
              currentSimulation: {
                ...userInputInitialState.currentSimulation,
                formatertUttaksalderReadOnly:
                  '70 alder.aar string.og 4 alder.maaned',
                uttaksalder: { aar: 70, maaneder: 4 },
              },
            },
          },
        }
      )

      expect(await screen.findByTestId('toggle-avansert')).toBeInTheDocument()
      await user.click(await screen.findByTestId('navigate-btn'))
      expect(
        await screen.findByText('beregning.avansert.avbryt_modal.title')
      ).toBeVisible()
    })

    it('når brukeren med vedtak om alderspensjon er på resultatside etter en Avansert simulering og trykker på tilbakeknappen, vises Avbryt-Modalen og brukeren sendes til /start ved bekreftelse', async () => {
      const user = userEvent.setup()
      const flushCurrentSimulationMock = vi.spyOn(
        userInputReducerUtils.userInputActions,
        'flushCurrentSimulation'
      )
      render(
        <NavigateWrapper>
          <Beregning visning="avansert" />
        </NavigateWrapper>,
        {
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
            },
          },
        }
      )

      fireEvent.change(
        await screen.findByTestId(
          `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-aar`
        ),
        {
          target: { value: '67' },
        }
      )
      fireEvent.change(
        await screen.findByTestId(
          `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-maaneder`
        ),
        {
          target: { value: '0' },
        }
      )
      fireEvent.change(
        await screen.findByTestId(AVANSERT_FORM_NAMES.uttaksgrad),
        {
          target: { value: '100 %' },
        }
      )
      const heltRadioGroup = screen.getByTestId(
        AVANSERT_FORM_NAMES.inntektVsaHeltUttakRadio
      )
      expect(heltRadioGroup).toBeVisible()
      await user.click(
        screen.getByTestId(
          `${AVANSERT_FORM_NAMES.inntektVsaHeltUttakRadio}-nei`
        )
      )

      await user.click(
        screen.getByText(`beregning.avansert.button.beregn.endring`)
      )

      await user.click(await screen.findByTestId('navigate-btn'))

      expect(
        await screen.findByText('beregning.avansert.avbryt_modal.endring.title')
      ).toBeVisible()
      expect(
        screen.queryByText('beregning.avansert.avbryt_modal.title')
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText('beregning.avansert.avbryt_modal.button.avslutt')
      ).not.toBeInTheDocument()
      await user.click(
        await screen.findByText('beregning.avansert.avbryt_modal.button.avbryt')
      )
      await user.click(await screen.findByTestId('navigate-btn'))
      await user.click(
        await screen.findByText(
          'beregning.avansert.avbryt_modal.endring.button.avslutt'
        )
      )
      expect(navigateMock).toHaveBeenCalledWith(paths.start)
      expect(flushCurrentSimulationMock).toHaveBeenCalled()
    })
  })

  describe('Gitt at pensjonskalkulator er i "enkel" visning', () => {
    it('vises det riktig innhold', async () => {
      render(<Beregning visning="enkel" />, {
        preloadedState: {
          // @ts-ignore
          api: {
            ...preloadedQueries.api,
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
    })
  })

  describe('Gitt at pensjonskalkulator er i "avansert" visning', () => {
    it('vises det riktig innhold', async () => {
      render(<Beregning visning="avansert" />, {
        preloadedState: {
          // @ts-ignore
          api: {
            ...preloadedQueries.api,
          },
          userInput: {
            ...userInputInitialState,
          },
        },
      })
      expect(
        await screen.findByText(
          'beregning.avansert.rediger.inntekt_frem_til_uttak.label'
        )
      ).toBeInTheDocument()
    })
  })

  it('gir mulighet til å avbryte og starte ny beregning ', async () => {
    render(<Beregning visning="enkel" />, {
      preloadedState: {
        // @ts-ignore
        api: {
          ...preloadedQueries.api,
        },
        userInput: {
          ...userInputInitialState,
        },
      },
    })
    expect(await screen.findByText('stegvisning.tilbake_start')).toBeVisible()
  })
})

import * as ReactRouterUtils from 'react-router'

import { describe, expect, it, vi } from 'vitest'

import { Beregning } from '../Beregning'
import { FORM_NAMES } from '@/components/RedigerAvansertBeregning/utils'
import { mockResponse } from '@/mocks/server'
import { paths } from '@/router/constants'
import { userInputInitialState } from '@/state/userInput/userInputReducer'
import * as userInputReducerUtils from '@/state/userInput/userInputReducer'
import { fireEvent, render, screen, userEvent, waitFor } from '@/test-utils'

const previousWindow = window

describe('Beregning', () => {
  it('har riktig sidetittel', () => {
    render(<Beregning visning="enkel" />)
    expect(document.title).toBe('application.title.beregning')
  })

  describe('Gitt at feature-toggle for detaljert fane skrues av og på', () => {
    it('vises det toggle mellom "enkel" og "detaljert" visning', () => {
      mockResponse('/feature/pensjonskalkulator.enable-detaljert-fane', {
        status: 200,
        json: { enabled: false },
      })
      render(<Beregning visning="enkel" />)
      expect(screen.queryByTestId('toggle-avansert')).not.toBeInTheDocument()
    })

    it('vises det toggle mellom "enkel" og "detaljert" visning', async () => {
      mockResponse('/feature/pensjonskalkulator.enable-detaljert-fane', {
        status: 200,
        json: { enabled: true },
      })
      render(<Beregning visning="enkel" />)
      expect(await screen.findByTestId('toggle-avansert')).toBeInTheDocument()
    })
  })

  describe('Gitt at brukeren navigerer mellom fanene', () => {
    it('når brukeren har gjort en Enkel simulering og bytter fane, nullstiller det pågående simulering', async () => {
      const user = userEvent.setup()
      const flushCurrentSimulationMock = vi.spyOn(
        userInputReducerUtils.userInputActions,
        'flushCurrentSimulation'
      )
      mockResponse('/feature/pensjonskalkulator.enable-detaljert-fane', {
        status: 200,
        json: { enabled: true },
      })
      render(<Beregning visning="enkel" />, {
        preloadedState: {
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
      const navigateMock = vi.fn()
      vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
        () => navigateMock
      )
      const user = userEvent.setup()
      const flushCurrentSimulationMock = vi.spyOn(
        userInputReducerUtils.userInputActions,
        'flushCurrentSimulation'
      )
      mockResponse('/feature/pensjonskalkulator.enable-detaljert-fane', {
        status: 200,
        json: { enabled: true },
      })
      render(<Beregning visning="avansert" />)

      fireEvent.change(
        await screen.findByTestId(
          `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-aar`
        ),
        {
          target: { value: '67' },
        }
      )

      expect(await screen.findByTestId('toggle-avansert')).toBeVisible()
      await user.click(await screen.findByText('beregning.toggle.enkel'))
      expect(
        await screen.findByText('beregning.avansert.avbryt_modal.body')
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
      mockResponse('/feature/pensjonskalkulator.enable-detaljert-fane', {
        status: 200,
        json: { enabled: true },
      })
      render(<Beregning visning="avansert" />)

      fireEvent.change(
        await screen.findByTestId(
          `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-aar`
        ),
        {
          target: { value: '67' },
        }
      )
      fireEvent.change(
        await screen.findByTestId(
          `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-maaneder`
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
        await screen.findByText('beregning.avansert.avbryt_modal.body')
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
      mockResponse('/feature/pensjonskalkulator.enable-detaljert-fane', {
        status: 200,
        json: { enabled: true },
      })
      render(<Beregning visning="avansert" />, {
        preloadedState: {
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
        await screen.findByText('beregning.avansert.avbryt_modal.body')
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
          href: paths.beregningDetaljert,
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
      mockResponse('/feature/pensjonskalkulator.enable-detaljert-fane', {
        status: 200,
        json: { enabled: true },
      })
      render(
        <NavigateWrapper>
          <Beregning visning="enkel" />
        </NavigateWrapper>,
        {
          preloadedState: {
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
        await screen.findByText('beregning.avansert.avbryt_modal.body')
      ).not.toBeVisible()
    })

    it('når brukeren begynner å fylle ut skjema på Avansert og trykker på tilbakeknappen, vises Avbryt-Modalen', async () => {
      const user = userEvent.setup()

      mockResponse('/feature/pensjonskalkulator.enable-detaljert-fane', {
        status: 200,
        json: { enabled: true },
      })
      render(
        <NavigateWrapper>
          <Beregning visning="avansert" />
        </NavigateWrapper>
      )

      fireEvent.change(
        await screen.findByTestId(
          `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-aar`
        ),
        {
          target: { value: '67' },
        }
      )

      expect(await screen.findByTestId('toggle-avansert')).toBeInTheDocument()
      await user.click(await screen.findByTestId('navigate-btn'))
      expect(
        await screen.findByText('beregning.avansert.avbryt_modal.body')
      ).toBeVisible()
    })

    it('når brukeren er på resultatside etter en Avansert simulering  og trykker på tilbakeknappen, vises Avbryt-Modalen', async () => {
      const user = userEvent.setup()
      mockResponse('/feature/pensjonskalkulator.enable-detaljert-fane', {
        status: 200,
        json: { enabled: true },
      })
      render(
        <NavigateWrapper>
          <Beregning visning="avansert" />
        </NavigateWrapper>
      )

      fireEvent.change(
        await screen.findByTestId(
          `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-aar`
        ),
        {
          target: { value: '67' },
        }
      )
      fireEvent.change(
        await screen.findByTestId(
          `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-maaneder`
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
        await screen.findByText('beregning.avansert.avbryt_modal.body')
      ).toBeVisible()
    })

    it('når brukeren har gjort en Avansert simulering som hen redigerer  og trykker på tilbakeknappen,', async () => {
      const user = userEvent.setup()
      mockResponse('/feature/pensjonskalkulator.enable-detaljert-fane', {
        status: 200,
        json: { enabled: true },
      })
      render(
        <NavigateWrapper>
          <Beregning visning="avansert" />
        </NavigateWrapper>,
        {
          preloadedState: {
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
        await screen.findByText('beregning.avansert.avbryt_modal.body')
      ).toBeVisible()
    })
  })

  describe('Gitt at pensjonskalkulator er i "enkel" visning', () => {
    it('vises det riktig innhold', async () => {
      render(<Beregning visning="enkel" />)
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
      render(<Beregning visning="avansert" />)
      expect(
        await screen.findByText(
          'beregning.avansert.rediger.inntekt_frem_til_uttak.label'
        )
      ).toBeInTheDocument()
    })
  })

  it('gir mulighet til å avbryte og starte ny beregning ', async () => {
    render(<Beregning visning="enkel" />)
    expect(await screen.findByText('stegvisning.tilbake_start')).toBeVisible()
  })
})

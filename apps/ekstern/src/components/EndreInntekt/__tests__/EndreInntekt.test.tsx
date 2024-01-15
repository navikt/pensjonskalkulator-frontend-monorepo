import { EndreInntekt } from '..'
import {
  selectAarligInntektFoerUttak,
  selectAarligInntektFoerUttakFraSkatt,
  selectAarligInntektFoerUttakFraBrukerInput,
  selectFormatertUttaksalderReadOnly,
} from '@/state/userInput/selectors'
import { userInputInitialState } from '@/state/userInput/userInputReducer'
import { render, screen, userEvent } from '@/test-utils'

describe('EndreInntekt', () => {
  describe('Gitt at brukeren har inntekt hentet fra Skatteetaten', () => {
    it('brukeren kan overskrive den', async () => {
      const scrollToMock = vi.fn()
      Object.defineProperty(global.window, 'scrollTo', {
        value: scrollToMock,
        writable: true,
      })

      const user = userEvent.setup()

      const fakeInntektApiCall = {
        queries: {
          ['getInntekt(undefined)']: {
            status: 'fulfilled',
            endpointName: 'getInntekt',
            requestId: 'xTaE6mOydr5ZI75UXq4Wi',
            startedTimeStamp: 1688046411971,
            data: {
              beloep: 521338,
              aar: 2021,
            },
            fulfilledTimeStamp: 1688046412103,
          },
        },
      }
      const { store } = render(<EndreInntekt />, {
        preloadedState: {
          /* eslint-disable @typescript-eslint/ban-ts-comment */
          // @ts-ignore
          api: { ...fakeInntektApiCall },
          userInput: { ...userInputInitialState, samtykke: false },
        },
      })
      expect(selectAarligInntektFoerUttak(store.getState())).toBe(521338)
      expect(selectAarligInntektFoerUttakFraBrukerInput(store.getState())).toBe(
        null
      )

      await user.click(
        screen.getByText('inntekt.endre_inntekt_modal.open.button')
      )
      await user.type(screen.getByTestId('inntekt-textfield'), '123000')
      expect(
        screen.queryByText(
          'inntekt.endre_inntekt_modal.textfield.validation_error'
        )
      ).not.toBeInTheDocument()
      await user.click(screen.getByText('inntekt.endre_inntekt_modal.button'))
      expect(
        selectAarligInntektFoerUttakFraSkatt(store.getState())?.beloep
      ).toBe(521338)
      expect(selectAarligInntektFoerUttak(store.getState())).toBe(123000)
      expect(selectAarligInntektFoerUttakFraBrukerInput(store.getState())).toBe(
        123000
      )
      expect(selectFormatertUttaksalderReadOnly(store.getState())).toBe(null)
      expect(scrollToMock).toHaveBeenCalledWith(0, 0)
    })

    it('brukeren kan ikke skrive ugyldig inntekt', async () => {
      const user = userEvent.setup()

      const fakeInntektApiCall = {
        queries: {
          ['getInntekt(undefined)']: {
            status: 'fulfilled',
            endpointName: 'getInntekt',
            requestId: 'xTaE6mOydr5ZI75UXq4Wi',
            startedTimeStamp: 1688046411971,
            data: {
              beloep: 521338,
              aar: 2021,
            },
            fulfilledTimeStamp: 1688046412103,
          },
        },
      }
      const { store } = render(<EndreInntekt />, {
        preloadedState: {
          /* eslint-disable @typescript-eslint/ban-ts-comment */
          // @ts-ignore
          api: { ...fakeInntektApiCall },
          userInput: { ...userInputInitialState, samtykke: false },
        },
      })
      expect(selectAarligInntektFoerUttak(store.getState())).toBe(521338)
      expect(selectAarligInntektFoerUttakFraBrukerInput(store.getState())).toBe(
        null
      )

      await user.click(
        screen.getByText('inntekt.endre_inntekt_modal.open.button')
      )
      await user.click(screen.getByText('inntekt.endre_inntekt_modal.button'))
      expect(
        await screen.findByText(
          'inntekt.endre_inntekt_modal.textfield.validation_error.required'
        )
      ).toBeInTheDocument()
      await user.type(screen.getByTestId('inntekt-textfield'), '123000')
      expect(
        screen.queryByText(
          'inntekt.endre_inntekt_modal.textfield.validation_error'
        )
      ).not.toBeInTheDocument()
    })

    it('brukeren kan gå ut av modulen og la inntekt uendret', async () => {
      const user = userEvent.setup()

      const fakeInntektApiCall = {
        queries: {
          ['getInntekt(undefined)']: {
            status: 'fulfilled',
            endpointName: 'getInntekt',
            requestId: 'xTaE6mOydr5ZI75UXq4Wi',
            startedTimeStamp: 1688046411971,
            data: {
              beloep: 521338,
              aar: 2021,
            },
            fulfilledTimeStamp: 1688046412103,
          },
        },
      }
      const { store } = render(<EndreInntekt />, {
        preloadedState: {
          /* eslint-disable @typescript-eslint/ban-ts-comment */
          // @ts-ignore
          api: { ...fakeInntektApiCall },
          userInput: { ...userInputInitialState, samtykke: false },
        },
      })
      expect(selectAarligInntektFoerUttak(store.getState())).toBe(521338)
      expect(selectAarligInntektFoerUttakFraBrukerInput(store.getState())).toBe(
        null
      )

      await user.click(
        screen.getByText('inntekt.endre_inntekt_modal.open.button')
      )
      await user.click(screen.getByText('stegvisning.avbryt'))
      expect(selectAarligInntektFoerUttak(store.getState())).toBe(521338)
      expect(selectAarligInntektFoerUttakFraBrukerInput(store.getState())).toBe(
        null
      )
    })
  })

  describe('Gitt at brukeren ikke har noe inntekt', () => {
    it('viser riktig tittel og tekst med 0 inntekt, og brukeren kan overskrive den', async () => {
      const fakeInntektApiCall = {
        queries: {
          ['getInntekt(undefined)']: {
            status: 'fulfilled',
            endpointName: 'getInntekt',
            requestId: 'xTaE6mOydr5ZI75UXq4Wi',
            startedTimeStamp: 1688046411971,
            data: {
              beloep: 0,
              aar: 2021,
            },
            fulfilledTimeStamp: 1688046412103,
          },
        },
      }
      const user = userEvent.setup()
      const { store } = render(<EndreInntekt />, {
        preloadedState: {
          /* eslint-disable @typescript-eslint/ban-ts-comment */
          // @ts-ignore
          api: { ...fakeInntektApiCall },
          userInput: { ...userInputInitialState, samtykke: false },
        },
      })

      expect(selectAarligInntektFoerUttak(store.getState())).toBe(0)
      expect(selectAarligInntektFoerUttakFraBrukerInput(store.getState())).toBe(
        null
      )

      await user.click(
        screen.getByText('inntekt.endre_inntekt_modal.open.button')
      )
      await user.type(screen.getByTestId('inntekt-textfield'), '123000')

      await user.click(screen.getByText('inntekt.endre_inntekt_modal.button'))
      expect(
        selectAarligInntektFoerUttakFraSkatt(store.getState())?.beloep
      ).toBe(0)
      expect(selectAarligInntektFoerUttak(store.getState())).toBe(123000)
      expect(selectAarligInntektFoerUttakFraBrukerInput(store.getState())).toBe(
        123000
      )
      expect(selectFormatertUttaksalderReadOnly(store.getState())).toBe(null)
    })
  })
})

import { EndreInntekt } from '..'
import {
  selectAarligInntektFoerUttakBeloep,
  selectAarligInntektFoerUttakBeloepFraSkatt,
  selectAarligInntektFoerUttakBeloepFraBrukerInput,
  selectFormatertUttaksalderReadOnly,
} from '@/state/userInput/selectors'
import { userInputInitialState } from '@/state/userInput/userInputReducer'
import { render, screen, userEvent } from '@/test-utils'

describe('EndreInntekt', () => {
  describe('Gitt at brukeren har inntekt hentet fra Skatteetaten', () => {
    it('brukeren kan overskrive den', async () => {
      const scrollToMock = vi.fn()
      const oppdatereInntektMock = vi.fn()
      Object.defineProperty(global.window, 'scrollTo', {
        value: scrollToMock,
        writable: true,
      })

      const user = userEvent.setup()

      render(
        <EndreInntekt
          visning="enkel"
          value={521338}
          onSubmit={oppdatereInntektMock}
        />
      )

      await user.click(
        screen.getByText('inntekt.endre_inntekt_modal.open.button')
      )
      const input = screen.getByTestId('inntekt-textfield')
      await user.clear(input)
      await user.type(input, '123000')
      expect(
        screen.queryByText(
          'inntekt.endre_inntekt_modal.textfield.validation_error'
        )
      ).not.toBeInTheDocument()
      await user.click(screen.getByText('inntekt.endre_inntekt_modal.button'))
      expect(oppdatereInntektMock).toHaveBeenCalledWith(123000)

      expect(scrollToMock).toHaveBeenCalledWith(0, 0)
    })

    it('brukeren kan ikke skrive ugyldig inntekt', async () => {
      const oppdatereInntektMock = vi.fn()
      const user = userEvent.setup()

      render(
        <EndreInntekt
          visning="enkel"
          value={521338}
          onSubmit={oppdatereInntektMock}
        />
      )

      await user.click(
        screen.getByText('inntekt.endre_inntekt_modal.open.button')
      )

      const input = screen.getByTestId('inntekt-textfield')
      await user.clear(input)
      await user.click(screen.getByText('inntekt.endre_inntekt_modal.button'))
      expect(
        await screen.findByText(
          'inntekt.endre_inntekt_modal.textfield.validation_error.required'
        )
      ).toBeInTheDocument()
      const oppdatertInput = screen.getByTestId('inntekt-textfield')
      await user.clear(oppdatertInput)
      await user.type(oppdatertInput, '123000')

      expect(
        screen.queryByText(
          'inntekt.endre_inntekt_modal.textfield.validation_error'
        )
      ).not.toBeInTheDocument()
    })

    it('brukeren kan gå ut av modulen og la inntekt uendret', async () => {
      const oppdatereInntektMock = vi.fn()
      const user = userEvent.setup()

      render(
        <EndreInntekt
          visning="enkel"
          value={521338}
          onSubmit={oppdatereInntektMock}
        />
      )

      await user.click(
        screen.getByText('inntekt.endre_inntekt_modal.open.button')
      )
      await user.click(screen.getByText('stegvisning.avbryt'))
      expect(oppdatereInntektMock).not.toHaveBeenCalled()
    })
  })

  describe('Gitt at brukeren ikke har noe inntekt', () => {
    it('viser riktig tittel og tekst med 0 inntekt, og brukeren kan overskrive den', async () => {
      const oppdatereInntektMock = vi.fn()

      const user = userEvent.setup()
      render(
        <EndreInntekt
          visning="enkel"
          value={0}
          onSubmit={oppdatereInntektMock}
        />
      )

      await user.click(
        screen.getByText('inntekt.endre_inntekt_modal.open.button')
      )
      const input = screen.getByTestId('inntekt-textfield')
      await user.clear(input)
      await user.type(input, '123000')

      await user.click(screen.getByText('inntekt.endre_inntekt_modal.button'))
      expect(oppdatereInntektMock).toHaveBeenCalledWith(123000)
    })
  })

  it('Når EndreInntekt er i enkel visning vises det ikke topptekst, men bunntekst', async () => {
    const oppdatereInntektMock = vi.fn()

    const user = userEvent.setup()
    render(
      <EndreInntekt
        visning="enkel"
        value={500000}
        onSubmit={oppdatereInntektMock}
      />
    )
    await user.click(
      screen.getByText('inntekt.endre_inntekt_modal.open.button')
    )
    expect(
      screen.queryByText(
        /Din siste pensjonsgivende inntekt fra Skatteetaten er/
      )
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText('inntekt.endre_inntekt_modal.paragraph')
    ).toBeInTheDocument()
  })

  it('Når EndreInntekt er i avansert visning vises det topptekst, men ikke bunntekst', async () => {
    const oppdatereInntektMock = vi.fn()
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
    render(
      <EndreInntekt
        visning="avansert"
        value={500000}
        onSubmit={oppdatereInntektMock}
      />,
      {
        preloadedState: {
          /* eslint-disable @typescript-eslint/ban-ts-comment */
          // @ts-ignore
          api: { ...fakeInntektApiCall },
          userInput: { ...userInputInitialState, samtykke: false },
        },
      }
    )
    await user.click(
      screen.getByText('inntekt.endre_inntekt_modal.open.button')
    )
    expect(
      screen.queryByText(
        /Din siste pensjonsgivende inntekt fra Skatteetaten er/
      )
    ).toBeInTheDocument()
    expect(
      screen.queryByText('inntekt.endre_inntekt_modal.paragraph')
    ).not.toBeInTheDocument()
  })
})

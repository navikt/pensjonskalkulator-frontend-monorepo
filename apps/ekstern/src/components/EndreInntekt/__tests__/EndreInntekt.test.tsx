import { fulfilledGetInntekt } from '@/mocks/mockedRTKQueryApiCalls'
import { mockResponse } from '@/mocks/server'
import { apiSlice } from '@/state/api/apiSlice'
import { userInputInitialState } from '@/state/userInput/userInputSlice'
import { render, screen, userEvent, waitFor } from '@/test-utils'

import { EndreInntekt } from '..'

describe('EndreInntekt', () => {
  describe('Gitt at brukeren har inntekt hentet fra Skatteetaten', () => {
    it('viser riktig tekst', async () => {
      render(<EndreInntekt visning="enkel" value="123" onSubmit={vi.fn()} />)

      expect(
        screen.getByText('inntekt.endre_inntekt_modal.textfield.description')
      ).toBeInTheDocument()
    })

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
          value="521 338"
          onSubmit={oppdatereInntektMock}
        />
      )

      await user.click(
        screen.getByText('inntekt.endre_inntekt_modal.open.button')
      )
      const input = screen.getByTestId('inntekt-textfield')
      await user.clear(input)
      await user.type(input, '1')
      await user.type(input, '2')
      await user.type(input, '3')
      await user.type(input, '0')
      await user.type(input, '0')
      await user.type(input, '0')
      expect(
        screen.queryByText(
          'inntekt.endre_inntekt_modal.textfield.validation_error'
        )
      ).not.toBeInTheDocument()
      await user.click(screen.getByText('inntekt.endre_inntekt_modal.button'))
      expect(oppdatereInntektMock).toHaveBeenCalledWith('123 000')

      expect(scrollToMock).toHaveBeenCalledWith(0, 0)
    })

    it('brukeren kan ikke skrive ugyldig inntekt', async () => {
      const oppdatereInntektMock = vi.fn()
      const user = userEvent.setup()

      render(
        <EndreInntekt
          visning="enkel"
          value="521 338"
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
      await user.type(input, '1')
      await user.type(input, '2')
      await user.type(input, '3')
      await user.type(input, '0')
      await user.type(input, '0')
      await user.type(input, '0')

      expect(
        screen.queryByText(
          'inntekt.endre_inntekt_modal.textfield.validation_error'
        )
      ).not.toBeInTheDocument()
    })

    it('brukeren kan gå ut av modalen og la inntekt uendret', async () => {
      const oppdatereInntektMock = vi.fn()
      const user = userEvent.setup()

      render(
        <EndreInntekt
          visning="enkel"
          value="521 338"
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
          value="0"
          onSubmit={oppdatereInntektMock}
        />
      )

      await user.click(
        screen.getByText('inntekt.endre_inntekt_modal.open.button')
      )
      const input = screen.getByTestId('inntekt-textfield')
      await user.clear(input)
      await user.type(input, '1')
      await user.type(input, '2')
      await user.type(input, '3')
      await user.type(input, '0')
      await user.type(input, '0')
      await user.type(input, '0')

      await user.click(screen.getByText('inntekt.endre_inntekt_modal.button'))
      expect(oppdatereInntektMock).toHaveBeenCalledWith('123 000')
    })
  })

  describe('Gitt at brukeren har uføretrygd', () => {
    it('viser riktig tekst', async () => {
      mockResponse('/v4/vedtak/loepende-vedtak', {
        status: 200,
        json: {
          ufoeretrygd: { grad: 100 },
        } satisfies LoependeVedtak,
      })
      const { store } = await render(
        <EndreInntekt visning="enkel" value="123" onSubmit={vi.fn()} />
      )
      await store.dispatch(apiSlice.endpoints.getLoependeVedtak.initiate())

      await waitFor(async () => {
        expect(
          await screen.findByText(
            'inntekt.endre_inntekt_modal.textfield.description.ufoere'
          )
        ).toBeInTheDocument()
      })
    })
  })

  it('Når EndreInntekt er i enkel visning vises det ikke topptekst, men bunntekst', async () => {
    const oppdatereInntektMock = vi.fn()

    const user = userEvent.setup()
    render(
      <EndreInntekt
        visning="enkel"
        value="500 000"
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

    const user = userEvent.setup()
    render(
      <EndreInntekt
        visning="avansert"
        value="500 000"
        onSubmit={oppdatereInntektMock}
      />,
      {
        preloadedState: {
          api: {
            // @ts-ignore
            queries: {
              ...fulfilledGetInntekt,
            },
          },
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

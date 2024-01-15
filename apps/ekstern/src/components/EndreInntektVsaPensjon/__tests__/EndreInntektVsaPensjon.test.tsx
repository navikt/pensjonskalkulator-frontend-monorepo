import { EndreInntektVsaPensjon } from '..'
import { selectCurrentSimulation } from '@/state/userInput/selectors'
import { userInputInitialState } from '@/state/userInput/userInputReducer'
import { render, screen, userEvent } from '@/test-utils'

describe('EndreInntektVsaPensjon', async () => {
  it('Når brukeren ikke har lagt inn inntekt vsa pensjon, viser riktig ingress og knapp, og brukeren kan legge til inntekt', async () => {
    const user = userEvent.setup()
    const { store } = render(<EndreInntektVsaPensjon />)

    expect(
      selectCurrentSimulation(store.getState()).aarligInntektVsaPensjon
    ).toBe(undefined)
    expect(
      screen.getByText('inntekt.endre_inntekt_vsa_pensjon_modal.ingress_2')
    ).toBeInTheDocument()

    await user.click(
      screen.getByText(
        'inntekt.endre_inntekt_vsa_pensjon_modal.open.button.legg_til'
      )
    )
    await user.type(
      screen.getByTestId('inntekt-vsa-pensjon-textfield'),
      '123000'
    )

    await user.click(
      screen.getByText('inntekt.endre_inntekt_vsa_pensjon_modal.button')
    )
    expect(
      selectCurrentSimulation(store.getState()).aarligInntektVsaPensjon
    ).toBe(123000)

    expect(
      screen.getByText('inntekt.endre_inntekt_vsa_pensjon_modal.label')
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        '123 000 kr beregning.avansert.resultatkort.fra PLACEHOLDER beregning.avansert.resultatkort.til beregning.avansert.resultatkort.livsvarig.',
        { exact: false }
      )
    ).toBeInTheDocument()

    expect(
      screen.getByText(
        'inntekt.endre_inntekt_vsa_pensjon_modal.open.button.endre'
      )
    ).toBeInTheDocument()

    expect(
      screen.getByText(
        'inntekt.endre_inntekt_vsa_pensjon_modal.open.button.slette'
      )
    ).toBeInTheDocument()
  })

  it('Når brukeren har lagt inn inntekt vsa pensjon, kan man endre den eller slette den', async () => {
    const user = userEvent.setup()
    const { store } = render(
      <EndreInntektVsaPensjon temporaryStartAlder="67 år og 3 md." />,
      {
        preloadedState: {
          /* eslint-disable @typescript-eslint/ban-ts-comment */
          // @ts-ignore
          api: {},
          userInput: {
            ...userInputInitialState,
            currentSimulation: {
              ...userInputInitialState.currentSimulation,
              aarligInntektVsaPensjon: 123000,
              startAlder: { aar: 67, maaneder: 3 },
              formatertUttaksalderReadOnly: '67 år og 3 md.',
            },
          },
        },
      }
    )

    expect(
      screen.getByText('inntekt.endre_inntekt_vsa_pensjon_modal.label')
    ).toBeInTheDocument()

    expect(
      screen.getByText(
        '123 000 kr beregning.avansert.resultatkort.fra 67 år og 3 md. beregning.avansert.resultatkort.til beregning.avansert.resultatkort.livsvarig.',
        { exact: false }
      )
    ).toBeInTheDocument()

    await user.click(
      screen.getByText(
        'inntekt.endre_inntekt_vsa_pensjon_modal.open.button.endre'
      )
    )
    const input = screen.getByTestId('inntekt-vsa-pensjon-textfield')
    await user.clear(input)
    await user.type(input, '99000')

    await user.click(
      screen.getByText('inntekt.endre_inntekt_vsa_pensjon_modal.button')
    )

    expect(
      selectCurrentSimulation(store.getState()).aarligInntektVsaPensjon
    ).toBe(99000)
    expect(
      screen.getByText(
        '99 000 kr beregning.avansert.resultatkort.fra 67 år og 3 md. beregning.avansert.resultatkort.til beregning.avansert.resultatkort.livsvarig.',
        { exact: false }
      )
    ).toBeInTheDocument()

    await user.click(
      screen.getByText(
        'inntekt.endre_inntekt_vsa_pensjon_modal.open.button.slette'
      )
    )
    expect(
      screen.getByText(
        'inntekt.endre_inntekt_vsa_pensjon_modal.open.button.legg_til'
      )
    ).toBeInTheDocument()
    expect(
      screen.getByText('inntekt.endre_inntekt_vsa_pensjon_modal.ingress_2')
    ).toBeInTheDocument()
  })
})

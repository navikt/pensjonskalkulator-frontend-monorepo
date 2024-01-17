import { EndreInntektVsaPensjon } from '..'
import { selectCurrentSimulation } from '@/state/userInput/selectors'
import { userInputInitialState } from '@/state/userInput/userInputReducer'
import { render, screen, userEvent, fireEvent } from '@/test-utils'

// TODO mangler test for validering
describe('EndreInntektVsaPensjon', async () => {
  describe('Gitt at brukeren ikke har lagt inn inntekt vsa pensjon', async () => {
    it('viser riktig ingress og knapp, og brukeren kan legge til inntekt', async () => {
      const user = userEvent.setup()
      const { store } = render(<EndreInntektVsaPensjon />)

      expect(
        selectCurrentSimulation(store.getState()).aarligInntektVsaHelPensjon
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
      fireEvent.change(
        screen.getByTestId(
          'temporaryAlderVelger-sluttalder-inntekt-vsa-pensjon'
        ),
        { target: { value: '70 alder.aar' } }
      )

      await user.click(
        screen.getByText(
          'inntekt.endre_inntekt_vsa_pensjon_modal.button.legg_til'
        )
      )
      expect(
        selectCurrentSimulation(store.getState()).aarligInntektVsaHelPensjon
          ?.beloep
      ).toBe(123000)

      expect(
        screen.getByText('inntekt.endre_inntekt_vsa_pensjon_modal.label')
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          '123 000 kr beregning.avansert.resultatkort.fra PLACEHOLDER beregning.avansert.resultatkort.til 70 alder.aar.',
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
          'inntekt.endre_inntekt_vsa_pensjon_modal.button.slette'
        )
      ).toBeInTheDocument()
    })
    it('kan hen avbryte og inntekt nullstilles', async () => {
      const user = userEvent.setup()
      const { store } = render(<EndreInntektVsaPensjon />)

      expect(
        selectCurrentSimulation(store.getState()).aarligInntektVsaHelPensjon
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
      fireEvent.change(
        screen.getByTestId(
          'temporaryAlderVelger-sluttalder-inntekt-vsa-pensjon'
        ),
        { target: { value: '70 alder.aar' } }
      )

      await user.click(screen.getByText('stegvisning.avbryt'))
      expect(
        selectCurrentSimulation(store.getState()).aarligInntektVsaHelPensjon
      ).toBe(undefined)

      expect(
        screen.queryByText('inntekt.endre_inntekt_vsa_pensjon_modal.label')
      ).not.toBeInTheDocument()

      expect(
        screen.queryByText(
          'inntekt.endre_inntekt_vsa_pensjon_modal.button.slette'
        )
      ).not.toBeInTheDocument()

      await user.click(
        screen.getByText(
          'inntekt.endre_inntekt_vsa_pensjon_modal.open.button.legg_til'
        )
      )

      expect(screen.getByTestId('inntekt-vsa-pensjon-textfield')).toHaveValue(
        ''
      )
      expect(
        screen.getByTestId(
          'temporaryAlderVelger-sluttalder-inntekt-vsa-pensjon'
        )
      ).toHaveValue('Velg alder')
    })
  })
  describe('Gitt at brukeren har lagt inn inntekt vsa pensjon', async () => {
    it('kan hen endre den eller slette den', async () => {
      const user = userEvent.setup()
      const { store } = render(
        <EndreInntektVsaPensjon
          temporaryUttaksalder={{ aar: 67, maaneder: 3 }}
        />,
        {
          preloadedState: {
            /* eslint-disable @typescript-eslint/ban-ts-comment */
            // @ts-ignore
            api: {},
            userInput: {
              ...userInputInitialState,
              currentSimulation: {
                ...userInputInitialState.currentSimulation,
                aarligInntektVsaHelPensjon: {
                  beloep: 123000,
                  sluttAlder: { aar: 70, maaneder: 0 },
                },
                uttaksalder: { aar: 67, maaneder: 3 },
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
          '123 000 kr beregning.avansert.resultatkort.fra 67 alder.aar string.og 3 alder.maaneder beregning.avansert.resultatkort.til 70 alder.aar.',
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
      fireEvent.change(
        screen.getByTestId(
          'temporaryAlderVelger-sluttalder-inntekt-vsa-pensjon'
        ),
        { target: { value: '75 alder.aar' } }
      )

      await user.click(
        screen.getByText('inntekt.endre_inntekt_vsa_pensjon_modal.button.endre')
      )

      expect(
        selectCurrentSimulation(store.getState()).aarligInntektVsaHelPensjon
          ?.beloep
      ).toBe(99000)
      expect(
        screen.getByText(
          '99 000 kr beregning.avansert.resultatkort.fra 67 alder.aar string.og 3 alder.maaneder beregning.avansert.resultatkort.til 75 alder.aar.',
          { exact: false }
        )
      ).toBeInTheDocument()

      await user.click(
        screen.getByText(
          'inntekt.endre_inntekt_vsa_pensjon_modal.button.slette'
        )
      )

      expect(
        selectCurrentSimulation(store.getState()).aarligInntektVsaHelPensjon
      ).toBe(undefined)

      expect(
        screen.getByText('inntekt.endre_inntekt_vsa_pensjon_modal.ingress_2')
      ).toBeInTheDocument()

      await user.click(
        screen.getByText(
          'inntekt.endre_inntekt_vsa_pensjon_modal.button.legg_til'
        )
      )
      expect(screen.getByTestId('inntekt-vsa-pensjon-textfield')).toHaveValue(
        ''
      )
      expect(
        screen.getByTestId(
          'temporaryAlderVelger-sluttalder-inntekt-vsa-pensjon'
        )
      ).toHaveValue('Velg alder')
    })
    it('kan hen avbryte og inntekten settes tilbake', async () => {
      const user = userEvent.setup()
      const { store } = render(
        <EndreInntektVsaPensjon
          temporaryUttaksalder={{ aar: 67, maaneder: 3 }}
        />,
        {
          preloadedState: {
            /* eslint-disable @typescript-eslint/ban-ts-comment */
            // @ts-ignore
            api: {},
            userInput: {
              ...userInputInitialState,
              currentSimulation: {
                ...userInputInitialState.currentSimulation,
                aarligInntektVsaHelPensjon: {
                  beloep: 123000,
                  sluttAlder: { aar: 70, maaneder: 0 },
                },
                uttaksalder: { aar: 67, maaneder: 3 },
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
          '123 000 kr beregning.avansert.resultatkort.fra 67 alder.aar string.og 3 alder.maaneder beregning.avansert.resultatkort.til 70 alder.aar.',
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
      fireEvent.change(
        screen.getByTestId(
          'temporaryAlderVelger-sluttalder-inntekt-vsa-pensjon'
        ),
        { target: { value: '75 alder.aar' } }
      )

      await user.click(screen.getByText('stegvisning.avbryt'))

      expect(
        selectCurrentSimulation(store.getState()).aarligInntektVsaHelPensjon
          ?.beloep
      ).toBe(123000)
      expect(
        screen.getByText(
          '123 000 kr beregning.avansert.resultatkort.fra 67 alder.aar string.og 3 alder.maaneder beregning.avansert.resultatkort.til 70 alder.aar.',
          { exact: false }
        )
      ).toBeInTheDocument()
      expect(
        screen.getByTestId(
          'temporaryAlderVelger-sluttalder-inntekt-vsa-pensjon'
        )
      ).toHaveValue('70 alder.aar')
    })
  })
})

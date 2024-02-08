import { EndreInntektVsaPensjon } from '..'
import { selectCurrentSimulation } from '@/state/userInput/selectors'
import { render, screen, userEvent, fireEvent } from '@/test-utils'

// TODO mangler test for validering
describe('EndreInntektVsaPensjon', async () => {
  describe('Gitt at brukeren ikke har lagt inn inntekt vsa pensjon', async () => {
    it('viser riktig ingress og knapp, og brukeren kan legge til inntekt', async () => {
      const oppdatereInntektMock = vi.fn()
      const user = userEvent.setup()
      render(
        <EndreInntektVsaPensjon
          uttaksperiode={undefined}
          oppdatereInntekt={oppdatereInntektMock}
        />
      )

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
        screen.getByTestId('age-picker-sluttalder-inntekt-vsa-pensjon-aar'),
        { target: { value: '70' } }
      )
      fireEvent.change(
        screen.getByTestId(
          'age-picker-sluttalder-inntekt-vsa-pensjon-maaneder'
        ),
        { target: { value: '0' } }
      )
      await user.click(
        screen.getByText(
          'inntekt.endre_inntekt_vsa_pensjon_modal.button.legg_til'
        )
      )
      expect(oppdatereInntektMock).toHaveBeenCalledWith({
        beloep: '123000',
        sluttAlder: { aar: 70, maaneder: 0 },
      })
    })

    it('kan hen avbryte og inntekt nullstilles', async () => {
      const oppdatereInntektMock = vi.fn()
      const user = userEvent.setup()
      const { store } = render(
        <EndreInntektVsaPensjon
          uttaksperiode={undefined}
          oppdatereInntekt={oppdatereInntektMock}
        />
      )

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
        screen.getByTestId('age-picker-sluttalder-inntekt-vsa-pensjon-aar'),
        { target: { value: '70' } }
      )
      fireEvent.change(
        screen.getByTestId(
          'age-picker-sluttalder-inntekt-vsa-pensjon-maaneder'
        ),
        { target: { value: '0' } }
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
        screen.getByTestId('age-picker-sluttalder-inntekt-vsa-pensjon-aar')
      ).toHaveValue('')
      expect(
        screen.getByTestId('age-picker-sluttalder-inntekt-vsa-pensjon-maaneder')
      ).toHaveValue('')
    })
  })
  describe('Gitt at brukeren har lagt inn inntekt vsa pensjon', async () => {
    it('viser riktig ingress og knapp, og brukeren kan endre inntekt', async () => {
      const oppdatereInntektMock = vi.fn()
      const user = userEvent.setup()
      render(
        <EndreInntektVsaPensjon
          uttaksperiode={{
            uttaksalder: { aar: 67, maaneder: 3 },
            aarligInntektVsaPensjon: {
              beloep: '123000',
              sluttAlder: { aar: 70, maaneder: 0 },
            },
          }}
          oppdatereInntekt={oppdatereInntektMock}
        />
      )

      expect(
        screen.getByText('inntekt.endre_inntekt_vsa_pensjon_modal.label')
      ).toBeInTheDocument()

      expect(
        screen.getByText(
          '123 000 kr beregning.fra 67 alder.aar string.og 3 alder.md beregning.til 70 alder.aar',
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
        screen.getByTestId('age-picker-sluttalder-inntekt-vsa-pensjon-aar'),
        { target: { value: '75' } }
      )
      fireEvent.change(
        screen.getByTestId(
          'age-picker-sluttalder-inntekt-vsa-pensjon-maaneder'
        ),
        { target: { value: '0' } }
      )

      await user.click(
        screen.getByText('inntekt.endre_inntekt_vsa_pensjon_modal.button.endre')
      )

      expect(oppdatereInntektMock).toHaveBeenCalledWith({
        beloep: '99000',
        sluttAlder: { aar: 75, maaneder: 0 },
      })
    })

    it('viser riktig ingress og knapp, og brukeren kan slette inntekt', async () => {
      const oppdatereInntektMock = vi.fn()
      const user = userEvent.setup()
      render(
        <EndreInntektVsaPensjon
          uttaksperiode={{
            uttaksalder: { aar: 67, maaneder: 3 },
            aarligInntektVsaPensjon: {
              beloep: '123000',
              sluttAlder: { aar: 70, maaneder: 0 },
            },
          }}
          oppdatereInntekt={oppdatereInntektMock}
        />
      )

      expect(
        screen.getByText('inntekt.endre_inntekt_vsa_pensjon_modal.label')
      ).toBeInTheDocument()

      expect(
        screen.getByText(
          '123 000 kr beregning.fra 67 alder.aar string.og 3 alder.md beregning.til 70 alder.aar',
          { exact: false }
        )
      ).toBeInTheDocument()

      await user.click(
        screen.getByText(
          'inntekt.endre_inntekt_vsa_pensjon_modal.open.button.endre'
        )
      )

      await user.click(
        screen.getByText(
          'inntekt.endre_inntekt_vsa_pensjon_modal.button.slette'
        )
      )
      expect(oppdatereInntektMock).toHaveBeenCalledWith(undefined)
    })
    it('kan hen avbryte og inntekten settes tilbake', async () => {
      const oppdatereInntektMock = vi.fn()
      const user = userEvent.setup()
      render(
        <EndreInntektVsaPensjon
          uttaksperiode={{
            uttaksalder: { aar: 67, maaneder: 3 },
            aarligInntektVsaPensjon: {
              beloep: '123000',
              sluttAlder: { aar: 70, maaneder: 0 },
            },
          }}
          oppdatereInntekt={oppdatereInntektMock}
        />
      )

      expect(
        screen.getByText('inntekt.endre_inntekt_vsa_pensjon_modal.label')
      ).toBeInTheDocument()

      expect(
        screen.getByText(
          '123 000 kr beregning.fra 67 alder.aar string.og 3 alder.md beregning.til 70 alder.aar',
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
        screen.getByTestId('age-picker-sluttalder-inntekt-vsa-pensjon-aar'),
        { target: { value: '75' } }
      )
      fireEvent.change(
        screen.getByTestId(
          'age-picker-sluttalder-inntekt-vsa-pensjon-maaneder'
        ),
        { target: { value: '0' } }
      )

      await user.click(screen.getByText('stegvisning.avbryt'))

      expect(oppdatereInntektMock).not.toHaveBeenCalledWith()

      expect(
        screen.getByText(
          '123 000 kr beregning.fra 67 alder.aar string.og 3 alder.md beregning.til 70 alder.aar',
          { exact: false }
        )
      ).toBeInTheDocument()
      expect(
        screen.getByTestId('age-picker-sluttalder-inntekt-vsa-pensjon-aar')
      ).toHaveValue('70')
    })
  })
})

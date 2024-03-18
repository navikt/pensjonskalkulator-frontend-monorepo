import { describe, expect, it } from 'vitest'

import { RedigerAvansertBeregning } from '../RedigerAvansertBeregning'
import { FORM_NAMES } from '../utils'
import { mockResponse } from '@/mocks/server'
import {
  BeregningContext,
  AvansertBeregningModus,
} from '@/pages/Beregning/context'
import {
  userInputInitialState,
  Simulation,
} from '@/state/userInput/userInputReducer'
import { render, screen, fireEvent, userEvent } from '@/test-utils'

describe('RedigerAvansertBeregning', () => {
  const contextMockedValues = {
    avansertSkjemaModus: 'redigering' as AvansertBeregningModus,
    setAvansertSkjemaModus: vi.fn(),
    harAvansertSkjemaUnsavedChanges: false,
    setHarAvansertSkjemaUnsavedChanges: () => {},
  }

  it('feltene rendres riktig som default, og når brukeren legger til en gradert periode', async () => {
    render(
      <BeregningContext.Provider
        value={{
          ...contextMockedValues,
        }}
      >
        <RedigerAvansertBeregning
          gaaTilResultat={vi.fn()}
          hasVilkaarIkkeOppfylt={false}
        />
      </BeregningContext.Provider>
    )
    expect(
      screen.getByText(
        'beregning.avansert.rediger.inntekt_frem_til_uttak.label'
      )
    ).toBeVisible()
    expect(
      screen.getByText('beregning.avansert.rediger.inntekt.button')
    ).toBeVisible()
    expect(
      screen.getByText('beregning.avansert.rediger.uttaksgrad.label')
    ).toBeVisible()
    expect(
      screen.getByTestId(`age-picker-${FORM_NAMES.uttaksalderHeltUttak}-aar`)
    ).toBeVisible()

    expect(
      screen.getByText(
        'beregning.avansert.rediger.read_more.pensjonsalder.label'
      )
    ).toBeVisible()

    fireEvent.change(await screen.findByTestId('uttaksgrad-select'), {
      target: { value: '80 %' },
    })

    expect(
      screen.getByTestId(`age-picker-${FORM_NAMES.uttaksalderGradertUttak}-aar`)
    ).toBeVisible()
    expect(
      screen.getByTestId('inntekt-vsa-gradert-pensjon-textfield')
    ).toBeVisible()
  })

  it('readmore med tilleggsinformasjon til bruker vises riktig', async () => {
    const user = userEvent.setup()
    render(
      <BeregningContext.Provider
        value={{
          ...contextMockedValues,
        }}
      >
        <RedigerAvansertBeregning
          gaaTilResultat={vi.fn()}
          hasVilkaarIkkeOppfylt={false}
        />
      </BeregningContext.Provider>
    )

    expect(screen.getByText('inntekt.info_om_inntekt.read_more')).toBeVisible()
    user.click(
      screen.getByText('beregning.avansert.rediger.read_more.uttaksgrad.label')
    )
    expect(
      screen.getByText(
        'Uttaksgrad angir hvor stor del av månedlig alderspensjon du ønsker å ta ut',
        { exact: false }
      )
    ).toBeVisible()
    user.click(
      screen.getByText(
        'beregning.avansert.rediger.read_more.pensjonsalder.label'
      )
    )
    expect(
      screen.getByText(
        'beregning.avansert.rediger.read_more.pensjonsalder.subtitle'
      )
    ).toBeVisible()

    fireEvent.change(await screen.findByTestId('uttaksgrad-select'), {
      target: { value: '80 %' },
    })

    user.click(
      screen.getByText(
        'beregning.avansert.rediger.read_more.pensjonsalder.label'
      )
    )
    expect(
      screen.getByText(
        'beregning.avansert.rediger.read_more.pensjonsalder.subtitle'
      )
    ).toBeVisible()
  })

  // TODO PEK-357 tilpasse til ny logikk i handleUttaksgradChange
  describe('Når uttaksgrad endres', () => {
    it.skip('overfører uttaksalder til gradert uttak når en grad lavere enn 100 % oppgis', async () => {
      const user = userEvent.setup()
      render(
        <BeregningContext.Provider
          value={{
            ...contextMockedValues,
          }}
        >
          <RedigerAvansertBeregning
            gaaTilResultat={vi.fn()}
            hasVilkaarIkkeOppfylt={false}
          />
        </BeregningContext.Provider>
      )

      fireEvent.change(
        screen.getByTestId(
          `age-picker-${FORM_NAMES.uttaksalderGradertUttak}-aar`
        ),
        {
          target: { value: '75' },
        }
      )
      fireEvent.change(
        screen.getByTestId(
          `age-picker-${FORM_NAMES.uttaksalderGradertUttak}-maaneder`
        ),
        {
          target: { value: '5' },
        }
      )
    })
    it.skip('nullstiller feltene for gradert når uttakgsgrad settes tilbake til 100 %', async () => {
      const user = userEvent.setup()
      render(
        <BeregningContext.Provider
          value={{
            ...contextMockedValues,
          }}
        >
          <RedigerAvansertBeregning
            gaaTilResultat={vi.fn()}
            hasVilkaarIkkeOppfylt={false}
          />
        </BeregningContext.Provider>
      )

      // Endrer uttaksgrad
      fireEvent.change(await screen.findByTestId('uttaksgrad-select'), {
        target: { value: '60 %' },
      })

      // Fyller ut feltene for 100 % uttak + inntekt vsa 100 % uttak
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
          target: { value: '6' },
        }
      )
      user.click(
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
      expect(
        screen.getByText('Forventet årsinntekt mens du tar ut', {
          exact: false,
        })
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          'inntekt.endre_inntekt_vsa_pensjon_modal.open.button.endre'
        )
      ).toBeVisible()

      // Fyller ut feltene for gradert uttak + inntekt vsa gradert uttak
      fireEvent.change(
        await screen.findByTestId(
          `age-picker-${FORM_NAMES.uttaksalderGradertUttak}-aar`
        ),
        {
          target: { value: '63' },
        }
      )
      fireEvent.change(
        await screen.findByTestId(
          `age-picker-${FORM_NAMES.uttaksalderGradertUttak}-maaneder`
        ),
        {
          target: { value: '2' },
        }
      )
      await user.type(
        screen.getByTestId('inntekt-vsa-gradert-pensjon-textfield'),
        '100000'
      )

      // Endrer uttaksgrad
      fireEvent.change(await screen.findByTestId('uttaksgrad-select'), {
        target: { value: '80 %' },
      })

      // Sjekker at feltene for 100 % uttak er urørt
      expect(
        (
          screen.getByTestId(
            `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-aar`
          ) as HTMLSelectElement
        ).value
      ).toBe('67')
      expect(
        (
          screen.getByTestId(
            `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-maaneder`
          ) as HTMLSelectElement
        ).value
      ).toBe('6')
      expect(
        screen.queryByText('Forventet årsinntekt mens du tar ut', {
          exact: false,
        })
      ).toBeInTheDocument()

      // Sjekker at feltene for gradert uttak er nullstilt
      expect(
        (
          screen.getByTestId(
            `age-picker-${FORM_NAMES.uttaksalderGradertUttak}-aar`
          ) as HTMLSelectElement
        ).value
      ).toBe('')
      expect(
        (
          screen.getByTestId(
            `age-picker-${FORM_NAMES.uttaksalderGradertUttak}-maaneder`
          ) as HTMLSelectElement
        ).value
      ).toBe('')
      expect(
        screen.getByTestId('inntekt-vsa-gradert-pensjon-textfield').textContent
      ).toBe('')
    })
  })

  // TODO PEK-357 tilpasse til infomelding med forslag til aldere og grad
  describe('Når simuleringen svarer med vilkaarIkkeOppfylt', () => {
    it.skip('viser alert med informasjon om at vilkår ikke er oppfylt med og uten måned for 100 % uttak', async () => {
      const user = userEvent.setup()
      mockResponse('/v2/alderspensjon/simulering', {
        status: 200,
        method: 'post',
        json: {
          alderspensjon: [],
          afpPrivat: [],
          vilkaarErOppfylt: false,
        },
      })

      const currentSimulation: Simulation = {
        formatertUttaksalderReadOnly: '65 år string.og 0 alder.maaned',
        uttaksalder: { aar: 65, maaneder: 0 },
        aarligInntektFoerUttakBeloep: null,
        gradertUttaksperiode: null,
      }

      render(
        <BeregningContext.Provider
          value={{
            ...contextMockedValues,
          }}
        >
          <RedigerAvansertBeregning
            gaaTilResultat={vi.fn()}
            hasVilkaarIkkeOppfylt={true}
          />
        </BeregningContext.Provider>,
        {
          preloadedState: {
            userInput: {
              ...userInputInitialState,
              samtykke: false,
              currentSimulation: { ...currentSimulation },
            },
          },
        }
      )

      expect(screen.getByText('beregning.lav_opptjening')).toBeVisible()

      fireEvent.change(
        screen.getByTestId(
          `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-maaneder`
        ),

        {
          target: { value: '6' },
        }
      )
      user.click(screen.getByText('beregning.avansert.button.beregn'))

      expect(await screen.findByText('beregning.lav_opptjening')).toBeVisible()
    })

    it.skip('viser alert med informasjon om at vilkår ikke er oppfylt med og uten måned for gradert uttak', async () => {
      const user = userEvent.setup()
      mockResponse('/v2/alderspensjon/simulering', {
        status: 200,
        method: 'post',
        json: {
          alderspensjon: [],
          afpPrivat: [],
          vilkaarErOppfylt: false,
        },
      })

      const currentSimulation: Simulation = {
        formatertUttaksalderReadOnly: '65 år string.og 0 alder.maaned',
        uttaksalder: { aar: 65, maaneder: 0 },
        aarligInntektFoerUttakBeloep: null,
        gradertUttaksperiode: {
          grad: 80,
          uttaksalder: { aar: 62, maaneder: 0 },
        },
      }

      render(
        <BeregningContext.Provider
          value={{
            ...contextMockedValues,
          }}
        >
          <RedigerAvansertBeregning
            gaaTilResultat={vi.fn()}
            hasVilkaarIkkeOppfylt={true}
          />
        </BeregningContext.Provider>,
        {
          preloadedState: {
            userInput: {
              ...userInputInitialState,
              samtykke: false,
              currentSimulation: { ...currentSimulation },
            },
          },
        }
      )

      expect(screen.getByText('beregning.lav_opptjening')).toBeVisible()

      fireEvent.change(
        screen.getByTestId(
          `age-picker-${FORM_NAMES.uttaksalderGradertUttak}-maaneder`
        ),

        {
          target: { value: '4' },
        }
      )

      user.click(await screen.findByText('beregning.avansert.button.beregn'))

      expect(await screen.findByText('beregning.lav_opptjening')).toBeVisible()
    })
  })

  // TODO PEK-357 test for inntekt vsa 100 % pensjon og håndtering av default verdier
  // TODO PEK-357 test for ulike edge cases for handlers
})

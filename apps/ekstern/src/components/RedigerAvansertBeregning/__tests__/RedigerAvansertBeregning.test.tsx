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
    expect(
      screen.getByText(
        'Den oppgitte alderen er et estimat etter dagens regler.',
        { exact: false }
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
    expect(
      screen.getByText(
        'Den oppgitte alderen er et estimat etter dagens regler.',
        { exact: false }
      )
    ).toBeVisible()
  })

  describe('Når simuleringen svarer med vilkaarIkkeOppfylt', () => {
    it('viser alert med informasjon om at vilkår ikke er oppfylt med og uten måned for 100 % uttak', async () => {
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

      expect(
        screen.getByText(
          'Du har ikke høy nok opptjening til å kunne starte uttak ved 65 år. Prøv en høyere alder.'
        )
      ).toBeVisible()

      fireEvent.change(
        screen.getByTestId(
          `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-maaneder`
        ),

        {
          target: { value: '6' },
        }
      )
      user.click(screen.getByText('beregning.avansert.button.beregn'))

      expect(
        await screen.findByText(
          'Du har ikke høy nok opptjening til å kunne starte uttak ved 65 år og 6 md. Prøv en høyere alder.'
        )
      ).toBeVisible()
    })

    it('viser alert med informasjon om at vilkår ikke er oppfylt med og uten måned for gradert uttak', async () => {
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

      expect(
        screen.getByText(
          'Du har ikke høy nok opptjening til å kunne starte uttak ved 62 år. Prøv en høyere alder.'
        )
      ).toBeVisible()

      fireEvent.change(
        screen.getByTestId(
          `age-picker-${FORM_NAMES.uttaksalderGradertUttak}-maaneder`
        ),

        {
          target: { value: '4' },
        }
      )
      user.click(screen.getByText('beregning.avansert.button.beregn'))

      expect(
        await screen.findByText(
          'Du har ikke høy nok opptjening til å kunne starte uttak ved 62 år og 4 md. Prøv en høyere alder.'
        )
      ).toBeVisible()
    })

    it('viser ikke optional info om TMU', async () => {
      const user = userEvent.setup()
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
      expect(
        screen.queryByText(
          'Den oppgitte alderen er et estimat etter dagens regler.',
          { exact: false }
        )
      ).not.toBeInTheDocument()
    })
  })

  it('viser info om utsettelse av TMU når gradert uttak og brukeren ikke har maks opptjening', async () => {
    const currentSimulation: Simulation = {
      formatertUttaksalderReadOnly: '68 år string.og 0 alder.maaned',
      uttaksalder: { aar: 68, maaneder: 0 },
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
          hasVilkaarIkkeOppfylt={false}
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

    expect(
      await screen.findByText(
        'Når du har valgt gradert uttak, utsettes alderen du kan ta ut 100 % fra 65 alder.aar string.og 3 alder.maaneder til en senere alder. Fra 67 år kan alle ta ut 100 % alderspensjon.'
      )
    ).toBeVisible()
  })

  it('nullstiller feltene når uttakgsgrad endres', async () => {
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
      screen.getByTestId('age-picker-sluttalder-inntekt-vsa-pensjon-maaneder'),
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

    // Endrer uttaksgrad
    fireEvent.change(await screen.findByTestId('uttaksgrad-select'), {
      target: { value: '80 %' },
    })

    // Sjekker at feltene er nullstilt
    expect(
      (
        screen.getByTestId(
          `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-aar`
        ) as HTMLSelectElement
      ).value
    ).toBe('')
    expect(
      (
        screen.getByTestId(
          `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-maaneder`
        ) as HTMLSelectElement
      ).value
    ).toBe('')
    expect(
      screen.queryByText('Forventet årsinntekt mens du tar ut', {
        exact: false,
      })
    ).not.toBeInTheDocument()
  })

  it('nullstiller feltene når inntekt frem til uttak endres', async () => {
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

    // Fykller ut feltene for gradert og 100 % uttak + inntekt vsa begge
    fireEvent.change(await screen.findByTestId('uttaksgrad-select'), {
      target: { value: '80 %' },
    })
    fireEvent.change(
      await screen.findByTestId(
        `age-picker-${FORM_NAMES.uttaksalderGradertUttak}-aar`
      ),
      {
        target: { value: '67' },
      }
    )
    fireEvent.change(
      await screen.findByTestId(
        `age-picker-${FORM_NAMES.uttaksalderGradertUttak}-maaneder`
      ),
      {
        target: { value: '6' },
      }
    )
    await user.type(
      screen.getByTestId('inntekt-vsa-gradert-pensjon-textfield'),
      '100000'
    )
    fireEvent.change(
      await screen.findByTestId(
        `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-aar`
      ),
      {
        target: { value: '69' },
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
    user.click(
      screen.getByText(
        'inntekt.endre_inntekt_vsa_pensjon_modal.open.button.legg_til'
      )
    )
    await user.type(
      screen.getByTestId('inntekt-vsa-pensjon-textfield'),
      '300000'
    )
    fireEvent.change(
      screen.getByTestId('age-picker-sluttalder-inntekt-vsa-pensjon-aar'),
      { target: { value: '70' } }
    )
    fireEvent.change(
      screen.getByTestId('age-picker-sluttalder-inntekt-vsa-pensjon-maaneder'),
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

    // Endrer inntekt frem til uttak
    await user.click(
      screen.getByText('beregning.avansert.rediger.inntekt.button')
    )
    const input = screen.getByTestId('inntekt-textfield')
    await user.clear(input)
    await user.type(input, '500000')
    await user.click(screen.getByText('inntekt.endre_inntekt_modal.button'))

    // Sjekker at feltene er nullstilt
    expect(
      (screen.getByTestId('uttaksgrad-select') as HTMLSelectElement).value
    ).toBe('100 %')
    expect(
      (
        screen.getByTestId(
          `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-aar`
        ) as HTMLSelectElement
      ).value
    ).toBe('')
    expect(
      (
        screen.getByTestId(
          `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-maaneder`
        ) as HTMLSelectElement
      ).value
    ).toBe('')
    expect(
      screen.queryByText('Forventet årsinntekt mens du tar ut', {
        exact: false,
      })
    ).not.toBeInTheDocument()
  })

  // TODO test for inntekt vsa 100 % pensjon og håndtering av default verdier
  // TODO test for ulike edge cases for handlers
})

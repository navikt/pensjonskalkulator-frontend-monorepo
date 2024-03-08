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
    userEvent.click(
      screen.getByText('beregning.avansert.rediger.read_more.uttaksgrad.label')
    )
    expect(
      screen.getByText(
        'Uttaksgrad angir hvor stor del av månedlig alderspensjon du ønsker å ta ut',
        { exact: false }
      )
    ).toBeVisible()
    userEvent.click(
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

    userEvent.click(
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
      userEvent.click(screen.getByText('beregning.avansert.button.beregn'))

      expect(
        await screen.findByText(
          'Du har ikke høy nok opptjening til å kunne starte uttak ved 65 år og 6 md. Prøv en høyere alder.'
        )
      ).toBeVisible()
    })

    it('viser alert med informasjon om at vilkår ikke er oppfylt med og uten måned for gradert uttak', async () => {
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
      userEvent.click(screen.getByText('beregning.avansert.button.beregn'))

      expect(
        await screen.findByText(
          'Du har ikke høy nok opptjening til å kunne starte uttak ved 62 år og 4 md. Prøv en høyere alder.'
        )
      ).toBeVisible()
    })

    it('viser ikke optional info om TMU', async () => {
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

      userEvent.click(
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

  // TODO test for nullstilling av feltene når uttaksgrad endrer seg
  // TODO test for inntekt vsa 100 % pensjon og håndtering av default verdier
  // TODO test for ulike handlers
})

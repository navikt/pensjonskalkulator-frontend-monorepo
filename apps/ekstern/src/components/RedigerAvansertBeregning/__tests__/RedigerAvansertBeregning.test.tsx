import { describe, expect, it } from 'vitest'

import { RedigerAvansertBeregning } from '../RedigerAvansertBeregning'
import { FORM_NAMES } from '../utils'
import * as RedigerAvansertBeregningUtils from '../utils'
import { mockResponse } from '@/mocks/server'
import {
  BeregningContext,
  AvansertBeregningModus,
} from '@/pages/Beregning/context'
import { apiSlice } from '@/state/api/apiSlice'
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
        <RedigerAvansertBeregning gaaTilResultat={vi.fn()} />
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
        <RedigerAvansertBeregning gaaTilResultat={vi.fn()} />
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

  it('når resetForm kalles, nullstilles det alle feltene', async () => {
    const user = userEvent.setup()
    const { store } = render(
      <BeregningContext.Provider
        value={{
          ...contextMockedValues,
        }}
      >
        <RedigerAvansertBeregning gaaTilResultat={vi.fn()} />
      </BeregningContext.Provider>
    )
    store.dispatch(apiSlice.endpoints.getInntekt.initiate())

    // Endrer inntekt frem til uttak
    await user.click(
      screen.getByText('beregning.avansert.rediger.inntekt.button')
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
        target: { value: '2' },
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
      { target: { value: '75' } }
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
      target: { value: '60 %' },
    })

    // Fyller ut feltene for helt uttak + inntekt vsa gradert uttak
    fireEvent.change(
      await screen.findByTestId(
        `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-aar`
      ),
      {
        target: { value: '70' },
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
    await user.type(
      screen.getByTestId('inntekt-vsa-gradert-pensjon-textfield'),
      '100000'
    )

    // Sjekker at feltene er fylt ut
    expect(
      await screen.findByTestId('formatert-inntekt-frem-til-uttak')
    ).toHaveTextContent('123 000')
    expect(
      (
        (await screen.findByTestId(
          `age-picker-${FORM_NAMES.uttaksalderGradertUttak}-aar`
        )) as HTMLSelectElement
      ).value
    ).toBe('67')
    expect(
      (
        (await screen.findByTestId(
          `age-picker-${FORM_NAMES.uttaksalderGradertUttak}-maaneder`
        )) as HTMLSelectElement
      ).value
    ).toBe('2')
    expect(
      (
        screen.queryByTestId(
          'inntekt-vsa-gradert-pensjon-textfield'
        ) as HTMLInputElement
      ).value
    ).toBe('100000')
    expect(
      (
        (await screen.findByTestId(
          `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-aar`
        )) as HTMLSelectElement
      ).value
    ).toBe('70')
    expect(
      (
        (await screen.findByTestId(
          `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-maaneder`
        )) as HTMLSelectElement
      ).value
    ).toBe('6')
    expect(
      screen.getByText('Forventet årsinntekt mens du tar ut', {
        exact: false,
      })
    ).toBeInTheDocument()

    fireEvent.click(screen.getByText('beregning.avansert.button.nullstill'))

    // Sjekker at feltene er nullstilt
    expect(
      await screen.findByTestId('formatert-inntekt-frem-til-uttak')
    ).toHaveTextContent('521 338')
    expect(
      screen.queryByTestId(
        `age-picker-${FORM_NAMES.uttaksalderGradertUttak}-aar`
      )
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId(
        `age-picker-${FORM_NAMES.uttaksalderGradertUttak}-maaneder`
      )
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('inntekt-vsa-gradert-pensjon-textfield')
    ).not.toBeInTheDocument()
    expect(
      (
        (await screen.findByTestId(
          `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-aar`
        )) as HTMLSelectElement
      ).value
    ).toBe('')
    expect(
      (
        (await screen.findByTestId(
          `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-maaneder`
        )) as HTMLSelectElement
      ).value
    ).toBe('')
    expect(
      screen.queryByText('Forventet årsinntekt mens du tar ut', {
        exact: false,
      })
    ).not.toBeInTheDocument()
  })

  describe('Når uttaksgrad endres', () => {
    it('overfører uttaksalder til gradert uttak når en grad lavere enn 100 % oppgis', async () => {
      render(
        <BeregningContext.Provider
          value={{
            ...contextMockedValues,
          }}
        >
          <RedigerAvansertBeregning gaaTilResultat={vi.fn()} />
        </BeregningContext.Provider>
      )

      fireEvent.change(
        screen.getByTestId(`age-picker-${FORM_NAMES.uttaksalderHeltUttak}-aar`),
        {
          target: { value: '65' },
        }
      )
      fireEvent.change(
        screen.getByTestId(
          `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-maaneder`
        ),
        {
          target: { value: '5' },
        }
      )
      fireEvent.change(await screen.findByTestId('uttaksgrad-select'), {
        target: { value: '80 %' },
      })

      // Sjekker at feltene for 100 % uttak er tomme
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

      // Sjekker at feltene for gradert uttak har fått riktig verdi
      expect(
        (
          (await screen.findByTestId(
            `age-picker-${FORM_NAMES.uttaksalderGradertUttak}-aar`
          )) as HTMLSelectElement
        ).value
      ).toBe('65')
      expect(
        (
          (await screen.findByTestId(
            `age-picker-${FORM_NAMES.uttaksalderGradertUttak}-maaneder`
          )) as HTMLSelectElement
        ).value
      ).toBe('5')
    })
    it('nullstiller feltene for gradert og overfører uttaksalder til helt uttak, når uttaksgrad settes tilbake til 100 %', async () => {
      const onSubmitMock = vi.spyOn(
        RedigerAvansertBeregningUtils,
        'onAvansertBeregningSubmit'
      )

      const user = userEvent.setup()
      render(
        <BeregningContext.Provider
          value={{
            ...contextMockedValues,
          }}
        >
          <RedigerAvansertBeregning gaaTilResultat={vi.fn()} />
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
          target: { value: '2' },
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
        { target: { value: '75' } }
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

      // Endrer uttaksgrad
      fireEvent.change(await screen.findByTestId('uttaksgrad-select'), {
        target: { value: '60 %' },
      })

      // Fyller ut feltene for helt uttak + inntekt vsa gradert uttak
      fireEvent.change(
        await screen.findByTestId(
          `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-aar`
        ),
        {
          target: { value: '70' },
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
      await user.type(
        screen.getByTestId('inntekt-vsa-gradert-pensjon-textfield'),
        '100000'
      )

      // Endrer uttaksgrad
      fireEvent.change(await screen.findByTestId('uttaksgrad-select'), {
        target: { value: '100 %' },
      })

      // Sjekker at feltene for gradert uttak er skjult
      expect(
        screen.queryByTestId(
          `age-picker-${FORM_NAMES.uttaksalderGradertUttak}-aar`
        )
      ).not.toBeInTheDocument()
      expect(
        screen.queryByTestId(
          `age-picker-${FORM_NAMES.uttaksalderGradertUttak}-maaneder`
        )
      ).not.toBeInTheDocument()
      expect(
        screen.queryByTestId('inntekt-vsa-gradert-pensjon-textfield')
      ).not.toBeInTheDocument()

      // Sjekker at uttaksalderen ble overført tilbake til helt uttak
      expect(
        (
          (await screen.findByTestId(
            `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-aar`
          )) as HTMLSelectElement
        ).value
      ).toBe('67')
      expect(
        (
          (await screen.findByTestId(
            `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-maaneder`
          )) as HTMLSelectElement
        ).value
      ).toBe('2')

      await user.click(screen.getByText('beregning.avansert.button.beregn'))

      expect(onSubmitMock.mock.calls[0][4]).toStrictEqual({
        harAvansertSkjemaUnsavedChanges: false,
        hasVilkaarIkkeOppfylt: false,
        localHeltUttak: {
          aarligInntektVsaPensjon: {
            beloep: 123000,
            sluttAlder: {
              aar: 75,
              maaneder: 0,
            },
          },
          uttaksalder: {
            aar: 67,
            maaneder: 2,
          },
        },
        localInntektFremTilUttak: null,
      })
    })
    it('oppdaterer uttaksgrad uten å nullstille uttaksaldere når grad endres fra en verdi lavere enn 100 % til en annen verdi lavere enn 100 %', async () => {
      render(
        <BeregningContext.Provider
          value={{
            ...contextMockedValues,
          }}
        >
          <RedigerAvansertBeregning gaaTilResultat={vi.fn()} />
        </BeregningContext.Provider>
      )

      // Fyller ut feltene for helt uttak
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

      // Endrer uttaksgrad uten å ha fylt ut noe uttaksalder
      fireEvent.change(await screen.findByTestId('uttaksgrad-select'), {
        target: { value: '60 %' },
      })

      // Fyller ut feltene for helt uttak
      fireEvent.change(
        await screen.findByTestId(
          `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-aar`
        ),
        {
          target: { value: '70' },
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

      // Endrer uttaksgrad til en annen grad (ikke 100 %)
      fireEvent.change(await screen.findByTestId('uttaksgrad-select'), {
        target: { value: '40 %' },
      })

      // Sjekker at uttaksalderene ikke ble endret
      expect(
        (
          (await screen.findByTestId(
            `age-picker-${FORM_NAMES.uttaksalderGradertUttak}-aar`
          )) as HTMLSelectElement
        ).value
      ).toBe('67')
      expect(
        (
          (await screen.findByTestId(
            `age-picker-${FORM_NAMES.uttaksalderGradertUttak}-maaneder`
          )) as HTMLSelectElement
        ).value
      ).toBe('6')
      expect(
        (
          (await screen.findByTestId(
            `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-aar`
          )) as HTMLSelectElement
        ).value
      ).toBe('70')
      expect(
        (
          (await screen.findByTestId(
            `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-maaneder`
          )) as HTMLSelectElement
        ).value
      ).toBe('6')

      // Endrer feltene for gradert uttaksalder
      fireEvent.change(
        await screen.findByTestId(
          `age-picker-${FORM_NAMES.uttaksalderGradertUttak}-aar`
        ),
        {
          target: { value: '68' },
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

      // Sjekker igjen at uttaksalder for hel pensjon ikke ble påvirket
      expect(
        (
          (await screen.findByTestId(
            `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-aar`
          )) as HTMLSelectElement
        ).value
      ).toBe('70')
      expect(
        (
          (await screen.findByTestId(
            `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-maaneder`
          )) as HTMLSelectElement
        ).value
      ).toBe('6')
    })
  })

  describe('Når simuleringen svarer med vilkaarIkkeOppfylt', () => {
    it('viser alert med informasjon om alternativer', async () => {
      const vilkaarsproevingMock = {
        vilkaarErOppfylt: false,
        alternativ: {
          heltUttaksalder: { aar: 67, maaneder: 0 },
        },
      }

      mockResponse('/v3/alderspensjon/simulering', {
        status: 200,
        method: 'post',
        json: {
          alderspensjon: [],
          afpPrivat: [],
          vilkaarsproeving: vilkaarsproevingMock,
        },
      })

      const currentSimulation: Simulation = {
        formatertUttaksalderReadOnly: '62 år string.og 0 alder.maaned',
        uttaksalder: { aar: 62, maaneder: 0 },
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
            vilkaarsproeving={vilkaarsproevingMock}
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
        screen.getByText('beregning.vilkaarsproeving.intro', { exact: false })
      ).toBeVisible()
    })
  })

  // TODO PEK-358 test for inntekt vsa 100 % pensjon og håndtering av default verdier
})

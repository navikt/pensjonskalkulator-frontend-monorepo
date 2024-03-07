import { describe, expect, it } from 'vitest'

import { RedigerAvansertBeregning } from '../RedigerAvansertBeregning'
import { FORM_NAMES } from '../utils'
import {
  BeregningContext,
  AvansertBeregningModus,
} from '@/pages/Beregning/context'
import { render, screen, fireEvent, userEvent } from '@/test-utils'

describe('RedigerAvansertBeregning', () => {
  const contextMockedValues = {
    avansertSkjemaModus: 'redigering' as AvansertBeregningModus,
    setAvansertSkjemaModus: vi.fn(),
    harAvansertSkjemaUnsavedChanges: false,
    setHarAvansertSkjemaUnsavedChanges: () => {},
  }

  it('Feltene rendres riktig som default, og når brukeren legger til en gradert periode', async () => {
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

  // TODO test for readmores, og plassering av readmores ved riktig AgePicker

  // TODO test for alert ved vilkaarIkkeOppfylt

  // TODO test for nullstilling av feltene når uttaksgrad endrer seg
})

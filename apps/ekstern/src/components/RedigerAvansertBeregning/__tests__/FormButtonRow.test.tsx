import { describe, expect, it } from 'vitest'

import { FormButtonRow } from '../FormButtonRow'
import { AVANSERT_FORM_NAMES } from '../utils'
import {
  BeregningContext,
  AvansertBeregningModus,
} from '@/pages/Beregning/context'
import { userInputInitialState } from '@/state/userInput/userInputReducer'
import { render, screen, fireEvent } from '@/test-utils'

describe('FormButtonRow', () => {
  const contextMockedValues = {
    avansertSkjemaModus: 'redigering' as AvansertBeregningModus,
    setAvansertSkjemaModus: vi.fn(),
    harAvansertSkjemaUnsavedChanges: false,
    setHarAvansertSkjemaUnsavedChanges: () => {},
  }

  it('Når knapperaden rendres uten uttaksalder og med harAvansertSkjemaUnsavedChanges false, vises det riktig tekst og avbryt knappen er skjult', () => {
    render(
      <BeregningContext.Provider
        value={{
          ...contextMockedValues,
        }}
      >
        <FormButtonRow resetForm={vi.fn()} gaaTilResultat={vi.fn()} />
      </BeregningContext.Provider>
    )
    expect(screen.getByText('beregning.avansert.button.beregn')).toBeVisible()
    expect(
      screen.queryByText('beregning.avansert.button.oppdater')
    ).not.toBeInTheDocument()
    expect(
      screen.getByText('beregning.avansert.button.nullstill')
    ).toBeVisible()
    expect(
      screen.queryByText('beregning.avansert.button.avbryt')
    ).not.toBeInTheDocument()
  })

  it('Når knapperaden rendres med uttaksalder og med harAvansertSkjemaUnsavedChanges false, vises det riktig tekst og avbryt knappen er synlig', () => {
    render(
      <BeregningContext.Provider
        value={{
          ...contextMockedValues,
        }}
      >
        <FormButtonRow resetForm={vi.fn()} gaaTilResultat={vi.fn()} />
      </BeregningContext.Provider>,
      {
        preloadedState: {
          userInput: {
            ...userInputInitialState,
            currentSimulation: {
              ...userInputInitialState.currentSimulation,
              uttaksalder: { aar: 67, maaneder: 0 },
            },
          },
        },
      }
    )
    expect(screen.getByText('beregning.avansert.button.beregn')).toBeVisible()
    expect(
      screen.queryByText('beregning.avansert.button.oppdater')
    ).not.toBeInTheDocument()
    expect(
      screen.getByText('beregning.avansert.button.nullstill')
    ).toBeVisible()
    expect(screen.getByText('beregning.avansert.button.avbryt')).toBeVisible()
  })

  it('Når knapperaden rendres etter at brukeren har hatt vilkår ikke oppfylt, vises det riktig tekst og avbryt knappen er skjult', () => {
    render(
      <BeregningContext.Provider
        value={{
          ...contextMockedValues,
        }}
      >
        <FormButtonRow
          resetForm={vi.fn()}
          gaaTilResultat={vi.fn()}
          hasVilkaarIkkeOppfylt={true}
        />
      </BeregningContext.Provider>,
      {
        preloadedState: {
          userInput: {
            ...userInputInitialState,
            currentSimulation: {
              ...userInputInitialState.currentSimulation,
              uttaksalder: { aar: 62, maaneder: 0 },
            },
          },
        },
      }
    )
    expect(screen.getByText('beregning.avansert.button.beregn')).toBeVisible()
    expect(
      screen.queryByText('beregning.avansert.button.oppdater')
    ).not.toBeInTheDocument()
    expect(
      screen.getByText('beregning.avansert.button.nullstill')
    ).toBeVisible()
    expect(
      screen.queryByText('beregning.avansert.button.avbryt')
    ).not.toBeInTheDocument()
  })

  it('Når knapperaden rendres etter at brukeren har hatt vilkår ikke oppfylt og har ulagrede endringer, vises det riktig tekst og avbryt knappen er skjult', () => {
    render(
      <BeregningContext.Provider
        value={{
          ...contextMockedValues,
          harAvansertSkjemaUnsavedChanges: true,
        }}
      >
        <FormButtonRow
          resetForm={vi.fn()}
          gaaTilResultat={vi.fn()}
          hasVilkaarIkkeOppfylt={true}
        />
      </BeregningContext.Provider>,
      {
        preloadedState: {
          userInput: {
            ...userInputInitialState,
            currentSimulation: {
              ...userInputInitialState.currentSimulation,
              uttaksalder: { aar: 67, maaneder: 0 },
            },
          },
        },
      }
    )
    expect(screen.getByText('beregning.avansert.button.beregn')).toBeVisible()
    expect(
      screen.queryByText('beregning.avansert.button.oppdater')
    ).not.toBeInTheDocument()
    expect(
      screen.getByText('beregning.avansert.button.nullstill')
    ).toBeVisible()
    expect(
      screen.queryByText('beregning.avansert.button.avbryt')
    ).not.toBeInTheDocument()
  })

  it('Når knapperaden rendres etter at brukeren har valgt uttaksalder og har ulagrede endringer, vises det riktig tekst og avbryt knappen er synlig', () => {
    render(
      <BeregningContext.Provider
        value={{
          ...contextMockedValues,
          harAvansertSkjemaUnsavedChanges: true,
        }}
      >
        <FormButtonRow resetForm={vi.fn()} gaaTilResultat={vi.fn()} />
      </BeregningContext.Provider>,
      {
        preloadedState: {
          userInput: {
            ...userInputInitialState,
            currentSimulation: {
              ...userInputInitialState.currentSimulation,
              uttaksalder: { aar: 67, maaneder: 0 },
            },
          },
        },
      }
    )
    expect(
      screen.queryByText('beregning.avansert.button.beregn')
    ).not.toBeInTheDocument()
    expect(screen.getByText('beregning.avansert.button.oppdater')).toBeVisible()
    expect(
      screen.getByText('beregning.avansert.button.nullstill')
    ).toBeVisible()
    expect(screen.getByText('beregning.avansert.button.avbryt')).toBeVisible()
  })

  it('Når Beregn knappen trykkes på, submittes formen', () => {
    const onSubmitMock = vi.fn()
    render(
      <BeregningContext.Provider
        value={{
          ...contextMockedValues,
        }}
      >
        <form
          id={AVANSERT_FORM_NAMES.form}
          method="dialog"
          onSubmit={onSubmitMock}
        >
          <FormButtonRow resetForm={vi.fn()} gaaTilResultat={vi.fn()} />
        </form>
      </BeregningContext.Provider>
    )

    fireEvent.click(screen.getByText('beregning.avansert.button.beregn'))
    expect(onSubmitMock).toHaveBeenCalledTimes(1)
  })

  it('Når Nullstill knappen trykkes på, kalles det onReset', () => {
    const onResetMock = vi.fn()
    render(
      <BeregningContext.Provider
        value={{
          ...contextMockedValues,
        }}
      >
        <FormButtonRow resetForm={onResetMock} gaaTilResultat={vi.fn()} />
      </BeregningContext.Provider>
    )

    fireEvent.click(screen.getByText('beregning.avansert.button.nullstill'))
    expect(onResetMock).toHaveBeenCalledTimes(1)
  })

  it('Når Avbryt knappen trykkes på, kalles det gaaTilResultat', () => {
    const gaaTilResultatMock = vi.fn()
    render(
      <BeregningContext.Provider
        value={{
          ...contextMockedValues,
          harAvansertSkjemaUnsavedChanges: true,
        }}
      >
        <FormButtonRow
          resetForm={vi.fn()}
          gaaTilResultat={gaaTilResultatMock}
        />
      </BeregningContext.Provider>,
      {
        preloadedState: {
          userInput: {
            ...userInputInitialState,
            currentSimulation: {
              ...userInputInitialState.currentSimulation,
              uttaksalder: { aar: 67, maaneder: 0 },
            },
          },
        },
      }
    )

    fireEvent.click(screen.getByText('beregning.avansert.button.avbryt'))
    expect(gaaTilResultatMock).toHaveBeenCalledTimes(1)
  })
})

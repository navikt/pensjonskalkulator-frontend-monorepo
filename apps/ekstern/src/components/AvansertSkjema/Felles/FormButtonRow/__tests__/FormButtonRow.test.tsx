import { describe, expect, it } from 'vitest'

import { AVANSERT_FORM_NAMES } from '../../../utils'
import { FormButtonRow } from '../FormButtonRow'
import { fulfilledGetLoependeVedtakLoependeAlderspensjon } from '@/mocks/mockedRTKQueryApiCalls'
import {
  BeregningContext,
  AvansertBeregningModus,
} from '@/pages/Beregning/context'
import { userInputInitialState } from '@/state/userInput/userInputSlice'
import { render, screen, fireEvent } from '@/test-utils'

describe('FormButtonRow', () => {
  const contextMockedValues = {
    avansertSkjemaModus: 'redigering' as AvansertBeregningModus,
    setAvansertSkjemaModus: vi.fn(),
    harAvansertSkjemaUnsavedChanges: false,
    setHarAvansertSkjemaUnsavedChanges: () => {},
  }
  describe('Gitt at skjemaet ikke har ulagrede endringer, ', () => {
    it('Når knapperaden rendres uten uttaksalder, vises det riktig tekst og avbryt knappen er skjult', () => {
      render(
        <BeregningContext.Provider
          value={{
            ...contextMockedValues,
          }}
        >
          <FormButtonRow
            formId={''}
            resetForm={vi.fn()}
            gaaTilResultat={vi.fn()}
          />
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

    it('Når knapperaden rendres med uttaksalder, vises det riktig tekst og avbryt knappen er synlig', () => {
      render(
        <BeregningContext.Provider
          value={{
            ...contextMockedValues,
          }}
        >
          <FormButtonRow
            formId={''}
            resetForm={vi.fn()}
            gaaTilResultat={vi.fn()}
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
      expect(screen.getByText('beregning.avansert.button.avbryt')).toBeVisible()
    })
  })

  describe('Gitt at skjemaet har ulagrede endringer, ', () => {
    it('Når brukeren har valgt uttaksalder, vises knapperaden med riktig tekst og avbryt knappen er synlig', () => {
      render(
        <BeregningContext.Provider
          value={{
            ...contextMockedValues,
            harAvansertSkjemaUnsavedChanges: true,
          }}
        >
          <FormButtonRow
            formId={''}
            resetForm={vi.fn()}
            gaaTilResultat={vi.fn()}
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
      expect(
        screen.queryByText('beregning.avansert.button.beregn')
      ).not.toBeInTheDocument()
      expect(
        screen.getByText('beregning.avansert.button.oppdater')
      ).toBeVisible()
      expect(
        screen.getByText('beregning.avansert.button.nullstill')
      ).toBeVisible()
      expect(screen.getByText('beregning.avansert.button.avbryt')).toBeVisible()
    })
  })

  describe('Gitt at knapperaden rendres etter at brukeren har hatt vilkår ikke oppfylt,  ', () => {
    it('vises det riktig tekst og avbryt knappen er skjult', () => {
      render(
        <BeregningContext.Provider
          value={{
            ...contextMockedValues,
          }}
        >
          <FormButtonRow
            formId={''}
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

    it('Når brukeren har ulagrede endringer, vises det riktig tekst og avbryt knappen er skjult', () => {
      render(
        <BeregningContext.Provider
          value={{
            ...contextMockedValues,
            harAvansertSkjemaUnsavedChanges: true,
          }}
        >
          <FormButtonRow
            formId={''}
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
  })

  describe('Gitt at brukeren har vedtak om alderspensjon, ', () => {
    it('Når skjemaet ikke har ulagrede endringer, vises det riktig tekst', () => {
      render(
        <BeregningContext.Provider
          value={{
            ...contextMockedValues,
          }}
        >
          <FormButtonRow
            formId={''}
            resetForm={vi.fn()}
            gaaTilResultat={vi.fn()}
          />
        </BeregningContext.Provider>,
        {
          preloadedState: {
            api: {
              // @ts-ignore
              queries: {
                ...fulfilledGetLoependeVedtakLoependeAlderspensjon,
              },
            },
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
      expect(
        screen.getByText('beregning.avansert.button.beregn.endring')
      ).toBeVisible()
      expect(
        screen.queryByText('beregning.avansert.button.beregn')
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText('beregning.avansert.button.oppdater')
      ).not.toBeInTheDocument()
    })
    it('Når skjemaet har ulagrede endringer, vises det riktig tekst', () => {
      render(
        <BeregningContext.Provider
          value={{
            ...contextMockedValues,
            harAvansertSkjemaUnsavedChanges: true,
          }}
        >
          <FormButtonRow
            formId={''}
            resetForm={vi.fn()}
            gaaTilResultat={vi.fn()}
          />
        </BeregningContext.Provider>,
        {
          preloadedState: {
            api: {
              // @ts-ignore
              queries: {
                ...fulfilledGetLoependeVedtakLoependeAlderspensjon,
              },
            },
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
      expect(
        screen.getByText('beregning.avansert.button.oppdater')
      ).toBeVisible()
      expect(
        screen.queryByText('beregning.avansert.button.beregn.endring')
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText('beregning.avansert.button.beregn')
      ).not.toBeInTheDocument()
    })
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
          <FormButtonRow
            formId={AVANSERT_FORM_NAMES.form}
            resetForm={vi.fn()}
            gaaTilResultat={vi.fn()}
          />
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
        <FormButtonRow
          formId={''}
          resetForm={onResetMock}
          gaaTilResultat={vi.fn()}
        />
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
          formId={''}
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

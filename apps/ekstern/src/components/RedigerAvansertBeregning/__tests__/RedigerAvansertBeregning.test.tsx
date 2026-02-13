import { describe, expect, it } from 'vitest'

import {
  loependeVedtak0UfoeregradMock,
  loependeVedtak75UfoeregradMock,
  loependeVedtak100UfoeregradMock,
  personMock,
} from '@/mocks'
import {
  AvansertBeregningModus,
  BeregningContext,
} from '@/pages/Beregning/context'
import { userInputInitialState } from '@/state/userInput/userInputSlice'
import { render, screen } from '@/test-utils'

import { RedigerAvansertBeregning } from '..'

describe('RedigerAvansertBeregning', () => {
  const contextMockedValues = {
    avansertSkjemaModus: 'redigering' as AvansertBeregningModus,
    setAvansertSkjemaModus: vi.fn(),
    harAvansertSkjemaUnsavedChanges: false,
    setHarAvansertSkjemaUnsavedChanges: () => {},
  }

  it('scroller på toppen av siden når en route endrer seg', async () => {
    const scrollToMock = vi.fn()
    Object.defineProperty(global.window, 'scrollTo', {
      value: scrollToMock,
      writable: true,
    })
    render(
      <BeregningContext.Provider
        value={{
          ...contextMockedValues,
        }}
      >
        <RedigerAvansertBeregning />
      </BeregningContext.Provider>,
      {
        preloadedState: {
          userInput: {
            ...userInputInitialState,
          },
        },
        preloadedApiState: {
          getPerson: personMock,
          getLoependeVedtak: loependeVedtak0UfoeregradMock,
        },
      }
    )
    expect(scrollToMock).toHaveBeenCalledWith(0, 0)
  })

  it('rendrer riktig skjema for brukere uten uføretrygd', async () => {
    render(
      <BeregningContext.Provider
        value={{
          ...contextMockedValues,
        }}
      >
        <RedigerAvansertBeregning />
      </BeregningContext.Provider>,
      {
        preloadedState: {
          userInput: {
            ...userInputInitialState,
          },
        },
        preloadedApiState: {
          getPerson: personMock,
          getLoependeVedtak: loependeVedtak0UfoeregradMock,
        },
      }
    )
    expect(
      screen.getByTestId(`AVANSERT_SKJEMA_FOR_ANDRE_BRUKERE`)
    ).toBeVisible()
  })

  it('rendrer riktig skjema for brukere med gradert uføretrygd', async () => {
    render(
      <BeregningContext.Provider
        value={{
          ...contextMockedValues,
        }}
      >
        <RedigerAvansertBeregning />
      </BeregningContext.Provider>,
      {
        preloadedState: {
          userInput: {
            ...userInputInitialState,
          },
        },
        preloadedApiState: {
          getPerson: personMock,
          getLoependeVedtak: loependeVedtak75UfoeregradMock,
        },
      }
    )
    expect(
      screen.getByTestId(`AVANSERT_SKJEMA_FOR_BRUKERE_MED_GRADERT_UFOERETRYGD`)
    ).toBeVisible()
  })

  it('rendrer riktig skjema for brukere med 100 % uføretrygd', async () => {
    render(
      <BeregningContext.Provider
        value={{
          ...contextMockedValues,
        }}
      >
        <RedigerAvansertBeregning />
      </BeregningContext.Provider>,
      {
        preloadedState: {
          userInput: {
            ...userInputInitialState,
          },
        },
        preloadedApiState: {
          getPerson: personMock,
          getLoependeVedtak: loependeVedtak100UfoeregradMock,
        },
      }
    )
    expect(
      screen.getByTestId(`AVANSERT_SKJEMA_FOR_ANDRE_BRUKERE`)
    ).toBeVisible()
  })
})

import React from 'react'
import { IntlProvider } from 'react-intl'
import { Provider } from 'react-redux'

import { RootState, setupStore } from '@/state/store'
import { userInputInitialState } from '@/state/userInput/userInputSlice'
import { renderHook } from '@/test-utils'
import translations_nb from '@/translations/nb'

import { useFormatertAfpHeader } from '../hooks'

describe('useFormatertAfpHeader', () => {
  it('should return "Nei" when AFP is "nei"', () => {
    const mockedState = {
      userInput: {
        ...userInputInitialState,
        afp: 'nei',
      },
    }

    const wrapper = ({ children }: { children: React.ReactNode }) => {
      const storeRef = setupStore(mockedState as unknown as RootState, true)
      return (
        <Provider store={storeRef}>
          <IntlProvider locale="nb" messages={translations_nb}>
            {children}
          </IntlProvider>
        </Provider>
      )
    }

    const { result } = renderHook(() => useFormatertAfpHeader(), { wrapper })

    expect(result.current).toBe('Nei')
  })

  it('should return "Vet ikke" when AFP is "vet_ikke"', () => {
    const mockedState = {
      userInput: {
        ...userInputInitialState,
        afp: 'vet_ikke',
      },
    }

    const wrapper = ({ children }: { children: React.ReactNode }) => {
      const storeRef = setupStore(mockedState as unknown as RootState, true)
      return (
        <Provider store={storeRef}>
          <IntlProvider locale="nb" messages={translations_nb}>
            {children}
          </IntlProvider>
        </Provider>
      )
    }

    const { result } = renderHook(() => useFormatertAfpHeader(), { wrapper })

    expect(result.current).toBe('Vet ikke')
  })

  it('should return "Privat AFP" when AFP is "ja_privat"', () => {
    const mockedState = {
      userInput: {
        ...userInputInitialState,
        afp: 'ja_privat',
      },
    }

    const wrapper = ({ children }: { children: React.ReactNode }) => {
      const storeRef = setupStore(mockedState as unknown as RootState, true)
      return (
        <Provider store={storeRef}>
          <IntlProvider locale="nb" messages={translations_nb}>
            {children}
          </IntlProvider>
        </Provider>
      )
    }

    const { result } = renderHook(() => useFormatertAfpHeader(), { wrapper })

    expect(result.current).toBe('Privat')
  })

  it('should return "Offentlig AFP" when AFP is "ja_offentlig"', () => {
    const mockedState = {
      userInput: {
        ...userInputInitialState,
        afp: 'ja_offentlig',
        samtykkeOffentligAFP: true,
      },
    }

    const wrapper = ({ children }: { children: React.ReactNode }) => {
      const storeRef = setupStore(mockedState as unknown as RootState, true)
      return (
        <Provider store={storeRef}>
          <IntlProvider locale="nb" messages={translations_nb}>
            {children}
          </IntlProvider>
        </Provider>
      )
    }

    const { result } = renderHook(() => useFormatertAfpHeader(), { wrapper })

    expect(result.current).toBe('Offentlig')
  })

  it('should return "Offentlig AFP (ikke beregnet)" when AFP is "ja_offentlig" but user has not consented', () => {
    const mockedState = {
      userInput: {
        ...userInputInitialState,
        afp: 'ja_offentlig',
        samtykkeOffentligAFP: false,
      },
    }

    const wrapper = ({ children }: { children: React.ReactNode }) => {
      const storeRef = setupStore(mockedState as unknown as RootState, true)
      return (
        <Provider store={storeRef}>
          <IntlProvider locale="nb" messages={translations_nb}>
            {children}
          </IntlProvider>
        </Provider>
      )
    }

    const { result } = renderHook(() => useFormatertAfpHeader(), { wrapper })

    expect(result.current).toBe('Offentlig (ikke beregnet)')
  })

  it('should default to "Vet ikke" when AFP is null', () => {
    const mockedState = {
      userInput: {
        ...userInputInitialState,
        afp: null,
      },
    }

    const wrapper = ({ children }: { children: React.ReactNode }) => {
      const storeRef = setupStore(mockedState as unknown as RootState, true)
      return (
        <Provider store={storeRef}>
          <IntlProvider locale="nb" messages={translations_nb}>
            {children}
          </IntlProvider>
        </Provider>
      )
    }

    const { result } = renderHook(() => useFormatertAfpHeader(), { wrapper })

    expect(result.current).toBe('Vet ikke')
  })
})

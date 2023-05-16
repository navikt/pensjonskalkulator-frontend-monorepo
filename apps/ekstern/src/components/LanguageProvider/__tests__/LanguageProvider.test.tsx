import { useIntl } from 'react-intl'

import { render, screen } from '@testing-library/react'

import { LanguageProvider } from '../LanguageProvider'

export function TestComponent() {
  const intl = useIntl()

  return <div>{intl.formatMessage({ id: 'forside.title' })}</div>
}

describe('LanguageProvider', () => {
  afterEach(() => {
    document.cookie.split(';').forEach(function (c) {
      document.cookie = c
        .replace(/^ +/, '')
        .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/')
    })
  })
  it('gir tilgang til react-intl translations', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    )
    expect(screen.getByText('Pensjonskalkulator')).toBeInTheDocument()
  })

  it('bruker locale fra cookie når den er tilgjengelig', () => {
    document.cookie = 'decorator-language=en'
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    )
    expect(screen.getByText('Retirement income calculator')).toBeInTheDocument()
  })
})

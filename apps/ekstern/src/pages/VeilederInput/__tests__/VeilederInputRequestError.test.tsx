import { FetchBaseQueryError } from '@reduxjs/toolkit/query'

import { render, screen } from '@/test-utils'

import { VeilederInputRequestError } from '../VeilederInputRequestError'

describe('veileder - feilmeldinger', () => {
  it('403 - Ikke tilgang', () => {
    const personError: FetchBaseQueryError = {
      status: 403,
      data: null,
    }
    render(<VeilederInputRequestError personError={personError} />)
    expect(screen.getByTestId('alert-ikke-tilgang')).toBeInTheDocument()
  })

  it('404 - Ikke funnet/gyldig fnr', () => {
    const personError: FetchBaseQueryError = {
      status: 404,
      data: null,
    }
    render(<VeilederInputRequestError personError={personError} />)
    expect(screen.getByTestId('alert-ikke-gyldig')).toBeInTheDocument()
  })

  it('500 - Annet', () => {
    const personError: FetchBaseQueryError = {
      status: 500,
      data: null,
    }
    render(<VeilederInputRequestError personError={personError} />)
    expect(screen.getByTestId('alert-annet')).toBeInTheDocument()
  })

  it('Feil i formatring er request error', () => {
    const personError = {
      data: null,
    } as FetchBaseQueryError
    render(<VeilederInputRequestError personError={personError} />)
    expect(screen.getByTestId('alert-annet')).toBeInTheDocument()
  })

  it('Ingen feil', async () => {
    const { container } = render(
      <VeilederInputRequestError personError={undefined} />
    )
    expect(container).toBeEmptyDOMElement()
  })
})

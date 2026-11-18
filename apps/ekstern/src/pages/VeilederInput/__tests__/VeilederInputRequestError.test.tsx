import { SerializedError } from '@reduxjs/toolkit'
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
    expect(screen.getByTestId('veileder.ingen-tilgang')).toBeVisible()
  })

  it('404 - Ikke funnet/gyldig fnr', () => {
    const personError: FetchBaseQueryError = {
      status: 404,
      data: null,
    }
    render(<VeilederInputRequestError personError={personError} />)
    expect(screen.getByTestId('veileder.ugyldig-foedselsnummer')).toBeVisible()
  })

  it('500 - Annet', () => {
    const personError: FetchBaseQueryError = {
      status: 500,
      data: null,
    }
    render(<VeilederInputRequestError personError={personError} />)
    expect(screen.getByTestId('veileder.alle-andre-feil')).toBeVisible()
  })

  it('Serialisert feil viser generelt Sanity-varsel', () => {
    const personError: SerializedError = {
      message: 'Request failed',
    }
    render(<VeilederInputRequestError personError={personError} />)
    expect(screen.getByTestId('veileder.alle-andre-feil')).toBeVisible()
  })

  it('Ingen feil', async () => {
    const { container } = render(
      <VeilederInputRequestError personError={undefined} />
    )
    expect(container).toBeEmptyDOMElement()
  })
})

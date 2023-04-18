import { describe, expect, it } from 'vitest'

import { mockErrorResponse, mockResponse } from '../../../api/server'
import {
  render,
  screen,
  swallowErrorsAsync,
  waitFor,
} from '../../../test-utils'
import { Uttaksalternativer } from '../Uttaksalternativer'

describe('Uttaksalternativer', () => {
  it('viser loading og deretter pensjonsberegning hentet fra backend', async () => {
    const result = render(<Uttaksalternativer />)
    expect(screen.getByTestId('loader')).toBeVisible()

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        'Når kan du ta ut alderspensjon?'
      )
      expect(
        screen.getByText('Hvis du fortsetter å ha en inntekt på', {
          exact: false,
        })
      ).toBeVisible()
      expect(screen.getByRole('link')).toHaveTextContent(
        'Om hvordan vi beregner din pensjon'
      )
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument()
      expect(result.asFragment()).toMatchSnapshot()
    })
  })

  it('viser feilmelding om henting av pensjonberegning feiler', async () => {
    mockErrorResponse('/pensjonsberegning')

    const result = render(<Uttaksalternativer />)

    await waitFor(() => {
      expect(
        screen.getByText(
          'Vi klarte ikke å kalkulere pensjonen din. Prøv igjen senere.'
        )
      ).toBeVisible()
      expect(result.asFragment()).toMatchSnapshot()
    })
  })

  it('viser feilmelding om pensjonsberegning er på ugyldig format', async () => {
    const invalidData = {
      alder: 67,
      pensjonsaar: null,
    } as unknown as Pensjonsberegning
    mockResponse('/pensjonsberegning', { json: [invalidData] })

    render(<Uttaksalternativer />)

    await swallowErrorsAsync(async () => {
      await waitFor(() => {
        expect(
          screen.getByText(
            'Vi klarte ikke å kalkulere pensjonen din. Prøv igjen senere.'
          )
        ).toBeVisible()
      })
    })
  })
})

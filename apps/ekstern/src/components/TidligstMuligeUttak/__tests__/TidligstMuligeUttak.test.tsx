import { describe, expect, it } from 'vitest'

import { TidligstMuligeUttak } from '../TidligstMuligeUttak'
import { mockErrorResponse, mockResponse } from '@/api/server'
import { render, screen, swallowErrorsAsync, waitFor } from '@/test-utils'

describe('TidligstMuligeUttak', () => {
  it('viser loading og deretter pensjonsberegning hentet fra backend', async () => {
    const result = render(<TidligstMuligeUttak />)
    expect(screen.getByTestId('loader')).toBeVisible()

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        'Når kan du ta ut alderspensjon?'
      )
      expect(
        screen.getByText('Du kan tidligst ta ut alderspensjon', {
          exact: false,
        })
      ).toBeVisible()
      expect(
        screen.getByText('Hva avgjør tidligste uttakstidspunkt?')
      ).toBeVisible()

      expect(screen.queryByTestId('loader')).not.toBeInTheDocument()
      expect(result.asFragment()).toMatchSnapshot()
    })
  })

  it('viser feilmelding om henting av pensjonberegning feiler', async () => {
    mockErrorResponse('/tidligste-uttaksalder')

    const result = render(<TidligstMuligeUttak />)

    await waitFor(() => {
      expect(
        screen.getByText(
          'Vi klarte ikke å hente tidligste mulige uttaksladeren din. Prøv igjen senere.'
        )
      ).toBeVisible()
      expect(result.asFragment()).toMatchSnapshot()
    })
  })

  it('viser feilmelding om pensjonsberegning er på ugyldig format', async () => {
    const invalidData = {
      aar: 67,
      maaned: null,
    } as unknown as TidligsteMuligeUttaksalder
    mockResponse('/tidligste-uttaksalder', { json: [invalidData] })

    render(<TidligstMuligeUttak />)

    await swallowErrorsAsync(async () => {
      await waitFor(() => {
        expect(
          screen.getByText(
            'Vi klarte ikke å hente tidligste mulige uttaksladeren din. Prøv igjen senere.'
          )
        ).toBeVisible()
      })
    })
  })
})

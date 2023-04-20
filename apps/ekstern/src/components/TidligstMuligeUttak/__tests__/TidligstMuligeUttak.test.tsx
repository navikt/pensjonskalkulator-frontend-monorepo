import { describe, expect, it, vi } from 'vitest'

import { TidligstMuligeUttak } from '../TidligstMuligeUttak'
import { mockErrorResponse, mockResponse } from '@/api/server'
import {
  fireEvent,
  render,
  screen,
  swallowErrorsAsync,
  waitFor,
} from '@/test-utils'

describe('TidligstMuligeUttak', () => {
  it('viser loading og deretter riktig header, tekst og knapper', async () => {
    const result = render(<TidligstMuligeUttak />)
    expect(screen.getByTestId('loader')).toBeVisible()

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        'Når vil du ta ut alderspensjon?'
      )
      expect(
        screen.getByText('Du kan tidligst ta ut alderspensjon', {
          exact: false,
        })
      ).toBeVisible()
      expect(
        screen.getByText('Hva avgjør tidligste uttakstidspunkt?')
      ).toBeVisible()
      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(8)
      expect(
        screen.queryByRole('button', { pressed: true })
      ).not.toBeInTheDocument()
      fireEvent.click(screen.getByText('Vis flere aldere'))
      const flereButtons = screen.getAllByRole('button')
      expect(flereButtons).toHaveLength(13)
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

  it('oppdaterer valgt knapp og tegner graph når brukeren klikker på en knapp', async () => {
    const { container, asFragment } = render(<TidligstMuligeUttak />)

    await waitFor(async () => {
      await fireEvent.click(screen.getByText('68 år'))
      expect(screen.getByRole('button', { pressed: true })).toHaveTextContent(
        '68 år'
      )
      fireEvent.click(screen.getByText('Vis flere aldere'))

      fireEvent.click(screen.getByText('72 år'))
      expect(screen.getByRole('button', { pressed: true })).toHaveTextContent(
        '72 år'
      )
      vi.useFakeTimers()
      vi.advanceTimersByTime(250)
      expect(container.getElementsByClassName('ct-chart').length).toBe(1)
      expect(asFragment()).toMatchSnapshot()
      vi.useRealTimers()
    })
  })
})

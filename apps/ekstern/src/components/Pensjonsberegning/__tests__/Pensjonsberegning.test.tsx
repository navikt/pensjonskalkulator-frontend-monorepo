import { describe, expect, it, vi } from 'vitest'

import { Pensjonsberegning } from '../Pensjonsberegning'
import { mockErrorResponse, mockResponse } from '@/mocks/server'
import {
  fireEvent,
  render,
  screen,
  swallowErrorsAsync,
  waitFor,
} from '@/test-utils'

describe('Pensjonsberegning', () => {
  it('viser loading og deretter riktig header, tekst og knapper', async () => {
    const result = render(<Pensjonsberegning />)

    expect(screen.getByTestId('loader')).toBeVisible()

    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument()
    })

    expect(screen.getByTestId('tidligst-mulig-uttak')).toBeVisible()
    expect(screen.getByRole('heading', { level: 2 })).toBeVisible()
    expect(screen.getAllByRole('button')).toHaveLength(10)

    expect(result.asFragment()).toMatchSnapshot()
  })

  it('viser riktig label og antall knapper når brukeren ønsker å se flere aldere', async () => {
    const result = render(<Pensjonsberegning />)
    await waitFor(() => {
      expect(screen.getAllByRole('button')).toHaveLength(10)
    })
    fireEvent.click(screen.getByText('Vis flere aldere'))

    await waitFor(() => {
      expect(screen.getAllByRole('button')).toHaveLength(15)
      expect(screen.getByText('Vis færre aldere')).toBeInTheDocument()
    })

    expect(result.asFragment()).toMatchSnapshot()
  })

  it('viser feilmelding om henting av pensjonberegning feiler', async () => {
    mockErrorResponse('/tidligste-uttaksalder')

    const result = render(<Pensjonsberegning />)

    await waitFor(() => {
      expect(
        screen.getByText(
          'Vi klarte ikke å hente din tidligste mulige uttaksalder. Prøv igjen senere.'
        )
      ).toBeVisible()
      expect(result.asFragment()).toMatchSnapshot()
    })
  })

  it('viser feilmelding om pensjonsberegning er på ugyldig format', async () => {
    const invalidData = {
      aar: 67,
      maaned: null,
    } as unknown as Uttaksalder
    mockResponse('/tidligste-uttaksalder', { json: [invalidData] })

    render(<Pensjonsberegning />)

    await swallowErrorsAsync(async () => {
      await waitFor(() => {
        expect(
          screen.getByText(
            'Vi klarte ikke å hente din tidligste mulige uttaksalder. Prøv igjen senere.'
          )
        ).toBeVisible()
      })
    })
  })

  it('oppdaterer valgt knapp og tegner graph når brukeren klikker på en knapp', async () => {
    const { container } = render(<Pensjonsberegning />)

    await waitFor(async () => {
      fireEvent.click(screen.getByText('Vis flere aldere'))
      fireEvent.click(screen.getByText('72 år'))

      expect(screen.getByRole('button', { pressed: true })).toHaveTextContent(
        '72 år'
      )
      vi.useFakeTimers()
      vi.advanceTimersByTime(250)
      expect(
        container.getElementsByClassName('highcharts-container').length
      ).toBe(1)

      vi.useRealTimers()
    })
  })
})

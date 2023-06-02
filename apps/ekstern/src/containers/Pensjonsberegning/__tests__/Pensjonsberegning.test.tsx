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
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(2)
    expect(screen.getAllByRole('button')).toHaveLength(12)

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

  it('oppdaterer valgt knapp og tegner graph når uttaksalder er valgt', async () => {
    const { container } = render(<Pensjonsberegning />)

    await waitFor(async () => {
      fireEvent.click(screen.getByText('65 år'))

      expect(screen.getByRole('button', { pressed: true })).toHaveTextContent(
        '65 år'
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

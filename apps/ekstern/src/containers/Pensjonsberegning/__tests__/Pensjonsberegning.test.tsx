import { describe, expect, it } from 'vitest'

import { Pensjonsberegning } from '../Pensjonsberegning'
import { mockErrorResponse, mockResponse } from '@/mocks/server'
import {
  render,
  screen,
  swallowErrorsAsync,
  userEvent,
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
    expect(screen.getAllByRole('button')).toHaveLength(13)

    expect(result.asFragment()).toMatchSnapshot()
  })

  it('viser feilmelding om henting av pensjonberegning feiler', async () => {
    mockErrorResponse('/tidligste-uttaksalder', {
      status: 500,
      json: "Beep boop I'm an error!",
      method: 'post',
    })

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
    mockResponse('/tidligste-uttaksalder', {
      json: [invalidData],
      method: 'post',
    })

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

    const button = await screen.findByText('68 år')

    await userEvent.click(button)

    expect(screen.getByRole('button', { pressed: true })).toHaveTextContent(
      '68 år'
    )
    expect(
      container.getElementsByClassName('highcharts-container').length
    ).toBe(1)
  })
})

import * as ReactRouterUtils from 'react-router'

import { describe, expect, it, vi } from 'vitest'

import { Pensjonsberegning } from '../Pensjonsberegning'
import { mockErrorResponse, mockResponse } from '@/mocks/server'
import { userInputInitialState } from '@/state/userInput/userInputReducer'
import {
  render,
  screen,
  swallowErrorsAsync,
  userEvent,
  waitFor,
} from '@/test-utils'

describe('Pensjonsberegning', () => {
  it('redirigerer til Step 1 når brukeren prøver å aksessere beregningen direkte uten å ha svart på spørsmålet om samtykke,', async () => {
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    render(<Pensjonsberegning />, {
      preloadedState: {
        userInput: { ...userInputInitialState, samtykke: null },
      },
    })
    expect(navigateMock).toHaveBeenCalledWith('/start')
  })

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

import { describe, expect, it, vi } from 'vitest'

import { Pensjonsberegning } from '../Pensjonsberegning'
import { mockErrorResponse, mockResponse } from '@/mocks/server'
import * as apiSliceUtils from '@/state/api/apiSlice'
import { RootState } from '@/state/store'
import {
  render,
  screen,
  swallowErrorsAsync,
  userEvent,
  waitFor,
} from '@/test-utils'

describe('Pensjonsberegning', () => {
  it('har riktig sidetittel', () => {
    render(<Pensjonsberegning />)
    expect(document.title).toBe('application.title.beregning')
  })

  it('viser loading og deretter riktig header, tekst og knapper', async () => {
    const result = render(<Pensjonsberegning />)
    expect(screen.getByTestId('loader')).toBeVisible()
    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument()
    })
    expect(screen.getByTestId('tidligst-mulig-uttak')).toBeVisible()
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(1)
    expect(screen.getAllByRole('button')).toHaveLength(12)
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

  describe('Når brukeren velger uttaksalder', () => {
    it('oppdaterer valgt knapp og tegner graph', async () => {
      const user = userEvent.setup()
      const { container } = render(<Pensjonsberegning />)
      const button = await screen.findByText('68 år')
      await user.click(button)
      expect(screen.getByRole('button', { pressed: true })).toHaveTextContent(
        '68 år'
      )
      expect(
        container.getElementsByClassName('highcharts-container').length
      ).toBe(1)
    })

    it('henter ikke pensjonsavtaler når brukeren ikke har samtykket', async () => {
      const user = userEvent.setup()
      const initiateMock = vi.spyOn(
        apiSliceUtils.apiSlice.endpoints.getTpoMedlemskap,
        'initiate'
      )
      render(<Pensjonsberegning />, {
        preloadedState: { userInput: { samtykke: false } } as RootState,
      })
      const button = await screen.findByText('68 år')
      await user.click(button)
      expect(initiateMock).not.toHaveBeenCalled()
    })

    it('henter pensjonsavtaler med riktig år og måned og viser dem når brukeren har samtykket', async () => {
      const usePensjonsavtalerQueryMock = vi.spyOn(
        apiSliceUtils,
        'usePensjonsavtalerQuery'
      )
      const user = userEvent.setup()
      render(<Pensjonsberegning />, {
        preloadedState: { userInput: { samtykke: true } } as RootState,
      })
      const buttons = await screen.findAllByRole('button')
      expect(buttons).toHaveLength(12)
      await user.click(buttons[2])
      await waitFor(async () => {
        expect(await screen.findByTestId('pensjonsavtaler')).toBeInTheDocument()
      })
      expect(usePensjonsavtalerQueryMock.mock?.lastCall?.[0]).toEqual({
        antallInntektsaarEtterUttak: 0,
        uttaksperioder: [
          {
            aarligInntekt: 0,
            grad: 100,
            startAlder: 68,
            startMaaned: 1,
          },
        ],
      })
      await user.click(buttons[1])
      expect(usePensjonsavtalerQueryMock.mock?.lastCall?.[0]).toEqual({
        antallInntektsaarEtterUttak: 0,
        uttaksperioder: [
          {
            aarligInntekt: 0,
            grad: 100,
            startAlder: 67,
            startMaaned: 3,
          },
        ],
      })
    })

    it('henter pensjonsavtaler og viser riktig feilmelding ved feil', async () => {
      const user = userEvent.setup()
      mockErrorResponse('/pensjonsavtaler', {
        status: 500,
        json: "Beep boop I'm an error!",
        method: 'post',
      })
      render(<Pensjonsberegning />, {
        preloadedState: { userInput: { samtykke: true } } as RootState,
      })
      const button = await screen.findByText('68 år')
      await user.click(button)

      await waitFor(async () => {
        expect(
          await screen.findByText(
            'Vi klarte ikke å hente pensjonsavtalene dine fra Norsk Pensjon. Prøv igjen senere.'
          )
        ).toBeVisible()
      })
    })
  })
})

import * as ReactRouterUtils from 'react-router'

import { describe, it, vi } from 'vitest'

import { Pensjonsavtaler } from '../Pensjonsavtaler'
import { mockErrorResponse, mockResponse } from '@/mocks/server'
import {
  userInputInitialState,
  Simulation,
} from '@/state/userInput/userInputReducer'
import { render, screen, userEvent } from '@/test-utils'

describe('Pensjonsavtaler', () => {
  const currentSimulation: Simulation = {
    startAlder: 67,
    startMaaned: 1,
    uttaksgrad: 100,
    aarligInntekt: 0,
  }

  it('rendrer tittel med 0 avtaler når avtalelisten er tom', () => {
    mockResponse('/pensjonsavtaler', {
      status: 200,
      json: { avtaler: [], utilgjengeligeSelskap: [] },
      method: 'post',
    })
    render(<Pensjonsavtaler />, {
      preloadedState: {
        userInput: {
          ...userInputInitialState,
          samtykke: true,
          currentSimulation: currentSimulation,
        },
      },
    })
    expect(
      screen.queryByText('Pensjonsavtaler', { exact: false })
    ).toBeVisible()
  })

  it('viser riktig header og melding når brukeren ikke samtykker', async () => {
    const user = userEvent.setup()
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    render(<Pensjonsavtaler />, {
      preloadedState: {
        userInput: { ...userInputInitialState, samtykke: false },
      },
    })
    expect(await screen.findByText('Ikke innhentet')).toBeVisible()
    expect(screen.queryByText('Kan ikke hentes')).not.toBeInTheDocument()
    expect(
      await screen.findByText(
        'Du har ikke samtykket til å hente inn pensjonsavtaler om tjenestepensjon.',
        { exact: false }
      )
    ).toBeVisible()
    await user.click(screen.getByText('Start en ny beregning'))
    expect(navigateMock).toHaveBeenCalledWith('/start')
  })

  describe('Gitt at brukeren har samtykket', () => {
    it('viser riktig header og melding dersom pensjonsavtaler har feilet', async () => {
      mockErrorResponse('/pensjonsavtaler', {
        status: 500,
        json: "Beep boop I'm an error!",
        method: 'post',
      })
      render(<Pensjonsavtaler />, {
        preloadedState: {
          userInput: {
            ...userInputInitialState,
            samtykke: true,
            currentSimulation: currentSimulation,
          },
        },
      })
      expect(await screen.findByText('Kan ikke hentes')).toBeVisible()
      expect(
        await screen.findByText(
          'Vi klarte ikke å hente pensjonsavtalene dine fra Norsk Pensjon. Prøv igjen senere.'
        )
      ).toBeVisible()
    })

    it('rendrer riktig med avtaler som bare har start dato', () => {
      const avtale: Pensjonsavtale = {
        key: 0,
        produktbetegnelse: 'DNB',
        kategori: 'PRIVAT_TJENESTEPENSJON',
        startAlder: 67,
        utbetalingsperioder: [
          {
            startAlder: 67,
            startMaaned: 1,
            aarligUtbetaling: 12345,
            grad: 100,
          },
        ],
      }
      mockResponse('/pensjonsavtaler', {
        status: 200,
        json: {
          avtaler: [avtale],
          utilgjengeligeSelskap: [],
        },
        method: 'post',
      })
      const { asFragment } = render(<Pensjonsavtaler />, {
        preloadedState: {
          userInput: {
            ...userInputInitialState,
            samtykke: true,
            currentSimulation: currentSimulation,
          },
        },
      })
      expect(
        screen.queryByText('Pensjonsavtaler', { exact: false })
      ).toBeVisible()
      expect(asFragment()).toMatchSnapshot()
    })

    it('rendrer riktig med avtaler som har både start- og sluttdato', () => {
      const avtale: Pensjonsavtale = {
        key: 0,
        produktbetegnelse: 'DNB',
        kategori: 'PRIVAT_TJENESTEPENSJON',
        startAlder: 67,
        sluttAlder: 77,
        utbetalingsperioder: [
          {
            startAlder: 67,
            startMaaned: 1,
            sluttAlder: 77,
            sluttMaaned: 8,
            aarligUtbetaling: 12345,
            grad: 100,
          },
        ],
      }

      mockResponse('/pensjonsavtaler', {
        status: 200,
        json: {
          avtaler: [avtale],
          utilgjengeligeSelskap: [],
        },
        method: 'post',
      })
      const { asFragment } = render(<Pensjonsavtaler />, {
        preloadedState: {
          userInput: {
            ...userInputInitialState,
            samtykke: true,
            currentSimulation: currentSimulation,
          },
        },
      })
      expect(
        screen.queryByText('Pensjonsavtaler', { exact: false })
      ).toBeVisible()
      expect(asFragment()).toMatchSnapshot()
    })
  })
})

import { describe, it } from 'vitest'

import { GrunnlagPensjonsavtaler } from '../GrunnlagPensjonsavtaler'
import { mockErrorResponse, mockResponse } from '@/mocks/server'
import {
  userInputInitialState,
  Simulation,
} from '@/state/userInput/userInputReducer'
import { render, screen, userEvent, waitFor } from '@/test-utils'

describe('GrunnlagPensjonsavtaler', () => {
  const currentSimulation: Simulation = {
    startAlder: 67,
    startMaaned: 1,
    uttaksgrad: 100,
    aarligInntekt: 0,
  }
  describe('Gitt at brukeren ikke har samtykket', () => {
    it('viser riktig header og melding, og skjuler ingress og tabell', async () => {
      const user = userEvent.setup()
      render(<GrunnlagPensjonsavtaler />, {
        preloadedState: {
          userInput: { ...userInputInitialState, samtykke: false },
        },
      })
      expect(
        await screen.findByText('grunnlag.pensjonsavtaler.title')
      ).toBeVisible()
      expect(
        await screen.findByText('grunnlag.pensjonsavtaler.title.error.samtykke')
      ).toBeVisible()
      const buttons = screen.getAllByRole('button')
      await user.click(buttons[0])
      expect(
        await screen.findByText(
          'Du har ikke samtykket til å hente inn pensjonsavtaler om tjenestepensjon',
          {
            exact: false,
          }
        )
      ).toBeVisible()
      expect(
        screen.queryByText('Alle avtaler i privat sektor er hentet fra', {
          exact: false,
        })
      ).not.toBeInTheDocument()
      expect(screen.queryByRole('table')).not.toBeInTheDocument()
    })
  })

  describe('Gitt at brukeren har samtykket', () => {
    it('Når pensjonsavtaler laster, viser riktig header og melding', async () => {
      render(<GrunnlagPensjonsavtaler />, {
        preloadedState: {
          userInput: {
            ...userInputInitialState,
            samtykke: true,
            currentSimulation: currentSimulation,
          },
        },
      })
      expect(
        screen.queryByText(
          'Du har ikke samtykket til å hente inn pensjonsavtaler om tjenestepensjon',
          {
            exact: false,
          }
        )
      ).not.toBeInTheDocument()
      expect(
        await screen.findByText('grunnlag.pensjonsavtaler.title')
      ).toBeVisible()
      expect(
        screen.getByTestId('grunnlag.pensjonsavtaler.title-loader')
      ).toBeVisible()
    })

    it('Når pensjonsavtaler har feilet, viser riktig header og melding, og skjuler ingress og tabell', async () => {
      mockErrorResponse('/pensjonsavtaler', {
        status: 500,
        json: "Beep boop I'm an error!",
        method: 'post',
      })
      render(<GrunnlagPensjonsavtaler />, {
        preloadedState: {
          userInput: {
            ...userInputInitialState,
            samtykke: true,
            currentSimulation: currentSimulation,
          },
        },
      })
      expect(
        await screen.findByText(
          'grunnlag.pensjonsavtaler.title.error.pensjonsavtaler'
        )
      ).toBeVisible()
      expect(
        await screen.findByText(
          'grunnlag.pensjonsavtaler.ingress.error.pensjonsavtaler'
        )
      ).toBeVisible()
      expect(
        screen.queryByText('Alle avtaler i privat sektor er hentet fra', {
          exact: false,
        })
      ).not.toBeInTheDocument()
      expect(screen.queryByRole('table')).not.toBeInTheDocument()
    })

    it('viser riktig tittel med antall avtaler og tekst når avtalelisten er tom', async () => {
      mockResponse('/pensjonsavtaler', {
        status: 200,
        json: { avtaler: [], utilgjengeligeSelskap: [] },
        method: 'post',
      })
      const user = userEvent.setup()
      render(<GrunnlagPensjonsavtaler />, {
        preloadedState: {
          userInput: {
            ...userInputInitialState,
            samtykke: true,
            currentSimulation: currentSimulation,
          },
        },
      })
      expect(screen.getByText('grunnlag.pensjonsavtaler.title')).toBeVisible()
      expect(await screen.findByText('0')).toBeVisible()
      const buttons = screen.getAllByRole('button')
      await user.click(buttons[0])
      expect(
        await screen.findByText('Alle avtaler i privat sektor er hentet fra', {
          exact: false,
        })
      ).toBeVisible()
    })

    it('rendrer riktig med avtaler som bare har start dato', async () => {
      const user = userEvent.setup()
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
          avtaler: [
            avtale,
            {
              ...avtale,
              utbetalingsperioder: [
                { ...avtale.utbetalingsperioder[0], startMaaned: 6 },
              ],
            },
          ],
          utilgjengeligeSelskap: [],
        },
        method: 'post',
      })
      render(<GrunnlagPensjonsavtaler />, {
        preloadedState: {
          userInput: {
            ...userInputInitialState,
            samtykke: true,
            currentSimulation: currentSimulation,
          },
        },
      })
      const buttons = screen.getAllByRole('button')
      await user.click(buttons[0])
      expect(await screen.findByRole('table')).toBeVisible()
      expect(
        await screen.findByText('grunnlag.pensjonsavtaler.tabell.title.left')
      ).toBeVisible()
      expect(
        await screen.findByText('grunnlag.pensjonsavtaler.tabell.title.right')
      ).toBeVisible()
      await waitFor(async () => {
        expect(await screen.findByText('Privat tjenestepensjon')).toBeVisible()
        expect(await screen.findByText('Livsvarig fra 67 år')).toBeVisible()
        expect(
          await screen.findByText('Livsvarig fra 67 år og 6 mnd.')
        ).toBeVisible()
        expect(await screen.findAllByText('12 345 kr')).toHaveLength(2)
        const rows = await screen.findAllByRole('row')
        expect(rows.length).toBe(6)
        expect(
          await screen.findByText(
            'Alle avtaler i privat sektor er hentet fra',
            {
              exact: false,
            }
          )
        ).toBeVisible()
      })
    })

    it('rendrer riktig med avtaler som har både start- og sluttdato', async () => {
      const user = userEvent.setup()
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
          {
            startAlder: 67,
            startMaaned: 6,
            sluttAlder: 77,
            sluttMaaned: 1,
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
      render(<GrunnlagPensjonsavtaler />, {
        preloadedState: {
          userInput: {
            ...userInputInitialState,
            samtykke: true,
            currentSimulation: currentSimulation,
          },
        },
      })
      const buttons = screen.getAllByRole('button')
      await user.click(buttons[0])
      expect(await screen.findByRole('table')).toBeVisible()
      expect(
        await screen.findByText('grunnlag.pensjonsavtaler.tabell.title.left')
      ).toBeVisible()
      expect(
        await screen.findByText('grunnlag.pensjonsavtaler.tabell.title.right')
      ).toBeVisible()
      await waitFor(async () => {
        expect(await screen.findByText('Privat tjenestepensjon')).toBeVisible()
        expect(
          await screen.findByText('Fra 67 år til 77 år og 8 mnd.')
        ).toBeVisible()
        expect(
          await screen.findByText('Fra 67 år og 6 mnd. til 77 år')
        ).toBeVisible()
        expect(await screen.findAllByText('12 345 kr')).toHaveLength(2)
        const rows = await screen.findAllByRole('row')
        expect(rows.length).toBe(5)
        expect(
          await screen.findByText(
            'Alle avtaler i privat sektor er hentet fra',
            {
              exact: false,
            }
          )
        ).toBeVisible()
      })
    })
  })
})

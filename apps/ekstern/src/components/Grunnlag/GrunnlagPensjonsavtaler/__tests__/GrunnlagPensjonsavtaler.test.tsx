import * as ReactRouterUtils from 'react-router'

import { describe, it, vi } from 'vitest'

import { GrunnlagPensjonsavtaler } from '../GrunnlagPensjonsavtaler'
import { mockErrorResponse, mockResponse } from '@/mocks/server'
import { paths } from '@/router'
import {
  userInputInitialState,
  Simulation,
} from '@/state/userInput/userInputReducer'
import { render, screen, userEvent, waitFor } from '@/test-utils'

describe('GrunnlagPensjonsavtaler', () => {
  const fakeInntektApiCall = {
    queries: {
      ['getInntekt(undefined)']: {
        status: 'fulfilled',
        endpointName: 'getInntekt',
        requestId: 'xTaE6mOydr5ZI75UXq4Wi',
        startedTimeStamp: 1688046411971,
        data: {
          beloep: 500000,
          aar: 2021,
        },
        fulfilledTimeStamp: 1688046412103,
      },
    },
  }

  const currentSimulation: Simulation = {
    startAar: 67,
    startMaaned: 1,
    uttaksgrad: 100,
    aarligInntekt: 0,
  }
  describe('Gitt at brukeren ikke har samtykket', () => {
    it('viser riktig header og melding med lenke tilbake til start, og skjuler ingress og tabell', async () => {
      const user = userEvent.setup()
      const navigateMock = vi.fn()
      vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
        () => navigateMock
      )

      const { store } = render(<GrunnlagPensjonsavtaler />, {
        preloadedState: {
          /* eslint-disable @typescript-eslint/ban-ts-comment */
          // @ts-ignore
          api: { ...fakeInntektApiCall },
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
        await screen.findAllByText(
          'grunnlag.pensjonsavtaler.ingress.error.samtykke',
          { exact: false }
        )
      ).toHaveLength(2)

      expect(
        screen.queryByTestId('pensjonsavtaler-table')
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText('Alle avtaler i privat sektor er hentet fra ', {
          exact: false,
        })
      ).not.toBeInTheDocument()
      await user.click(
        await screen.findByText(
          'grunnlag.pensjonsavtaler.ingress.error.samtykke_link_1'
        )
      )
      expect(navigateMock).toHaveBeenCalledWith(paths.start)
      expect(store.getState().userInput.samtykke).toBe(null)
    })
  })

  describe('Gitt at brukeren har samtykket', () => {
    it('Når pensjonsavtaler laster, viser riktig header og melding', async () => {
      render(<GrunnlagPensjonsavtaler />, {
        preloadedState: {
          /* eslint-disable @typescript-eslint/ban-ts-comment */
          // @ts-ignore
          api: { ...fakeInntektApiCall },
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
      mockErrorResponse('/v1/pensjonsavtaler', {
        method: 'post',
      })
      render(<GrunnlagPensjonsavtaler />, {
        preloadedState: {
          /* eslint-disable @typescript-eslint/ban-ts-comment */
          // @ts-ignore
          api: { ...fakeInntektApiCall },
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
        screen.queryByTestId('pensjonsavtaler-table')
      ).not.toBeInTheDocument()
      expect(
        await screen.findByText('Alle avtaler i privat sektor er hentet fra ', {
          exact: false,
        })
      ).toBeVisible()
    })

    it('Når pensjonsavtaler har delvis svar, viser riktig header og melding, og viser ingress og tabell', async () => {
      mockResponse('/v1/pensjonsavtaler', {
        status: 200,
        json: {
          avtaler: [
            {
              produktbetegnelse: 'IPS',
              kategori: 'INDIVIDUELL_ORDNING',
              startAar: 70,
              sluttAar: 75,
              utbetalingsperioder: [
                {
                  startAlder: { aar: 70, maaneder: 6 },
                  sluttAlder: { aar: 75, maaneder: 6 },
                  aarligUtbetaling: 41802,
                  grad: 100,
                },
              ],
            },
          ],
          utilgjengeligeSelskap: ['Something'],
        },
        method: 'post',
      })
      render(<GrunnlagPensjonsavtaler />, {
        preloadedState: {
          /* eslint-disable @typescript-eslint/ban-ts-comment */
          // @ts-ignore
          api: { ...fakeInntektApiCall },
          userInput: {
            ...userInputInitialState,
            samtykke: true,
            currentSimulation: currentSimulation,
          },
        },
      })
      expect(
        await screen.findByText(
          'grunnlag.pensjonsavtaler.title.error.pensjonsavtaler.partial',
          { exact: false }
        )
      ).toBeVisible()
      expect(
        await screen.findByText(
          'grunnlag.pensjonsavtaler.ingress.error.pensjonsavtaler.partial'
        )
      ).toBeVisible()
      expect(await screen.findByTestId('pensjonsavtaler-table')).toBeVisible()
      expect(
        await screen.findByText('Alle avtaler i privat sektor er hentet fra ', {
          exact: false,
        })
      ).toBeVisible()
    })

    it('Når brukeren har 0 pensjonsavtaler, viser riktig infomelding, og skjuler ingress og tabell', async () => {
      const user = userEvent.setup()
      mockResponse('/v1/pensjonsavtaler', {
        status: 200,
        json: {
          avtaler: [],
          utilgjengeligeSelskap: [],
        },
        method: 'post',
      })
      render(<GrunnlagPensjonsavtaler />, {
        preloadedState: {
          /* eslint-disable @typescript-eslint/ban-ts-comment */
          // @ts-ignore
          api: { ...fakeInntektApiCall },
          userInput: {
            ...userInputInitialState,
            samtykke: true,
            currentSimulation: currentSimulation,
          },
        },
      })
      expect(screen.getByText('grunnlag.pensjonsavtaler.title')).toBeVisible()
      expect(await screen.findByText('0', { exact: false })).toBeVisible()
      expect(
        await screen.findByText('grunnlag.pensjonsavtaler.ingress.ingen')
      ).toBeVisible()
      expect(
        screen.queryByTestId('pensjonsavtaler-table')
      ).not.toBeInTheDocument()
      const buttons = screen.getAllByRole('button')
      await user.click(buttons[0])
      expect(
        await screen.findByText('Alle avtaler i privat sektor er hentet fra ', {
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
        startAar: 67,
        utbetalingsperioder: [
          {
            startAlder: { aar: 67, maaneder: 1 },
            aarligUtbetaling: 12345,
            grad: 100,
          },
        ],
      }
      mockResponse('/v1/pensjonsavtaler', {
        status: 200,
        json: {
          avtaler: [
            avtale,
            {
              ...avtale,
              utbetalingsperioder: [
                {
                  ...avtale.utbetalingsperioder[0],
                  startAlder: { aar: 67, maaneder: 6 },
                },
              ],
            },
          ],
          utilgjengeligeSelskap: [],
        },
        method: 'post',
      })
      const { container } = render(<GrunnlagPensjonsavtaler />, {
        preloadedState: {
          /* eslint-disable @typescript-eslint/ban-ts-comment */
          // @ts-ignore
          api: { ...fakeInntektApiCall },
          userInput: {
            ...userInputInitialState,
            samtykke: true,
            currentSimulation: currentSimulation,
          },
        },
      })
      const buttons = screen.getAllByRole('button')
      await user.click(buttons[0])
      expect(await screen.findByTestId('pensjonsavtaler-table')).toBeVisible()
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
          await screen.findByText('Livsvarig fra 67 år og 6 md.')
        ).toBeVisible()
        expect(await screen.findAllByText('12 345 kr')).toHaveLength(2)
        const rows = container.querySelectorAll('tr')
        expect(rows?.length).toBe(6)
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
        startAar: 67,
        sluttAar: 77,
        utbetalingsperioder: [
          {
            startAlder: { aar: 67, maaneder: 1 },
            sluttAlder: { aar: 77, maaneder: 8 },
            aarligUtbetaling: 12345,
            grad: 100,
          },
          {
            startAlder: { aar: 67, maaneder: 6 },
            sluttAlder: { aar: 77, maaneder: 1 },
            aarligUtbetaling: 12345,
            grad: 100,
          },
        ],
      }
      mockResponse('/v1/pensjonsavtaler', {
        status: 200,
        json: {
          avtaler: [avtale],
          utilgjengeligeSelskap: [],
        },
        method: 'post',
      })
      const { container } = render(<GrunnlagPensjonsavtaler />, {
        preloadedState: {
          /* eslint-disable @typescript-eslint/ban-ts-comment */
          // @ts-ignore
          api: { ...fakeInntektApiCall },
          userInput: {
            ...userInputInitialState,
            samtykke: true,
            currentSimulation: currentSimulation,
          },
        },
      })
      const buttons = screen.getAllByRole('button')
      await user.click(buttons[0])
      expect(await screen.findByTestId('pensjonsavtaler-table')).toBeVisible()
      expect(
        await screen.findByText('grunnlag.pensjonsavtaler.tabell.title.left')
      ).toBeVisible()
      expect(
        await screen.findByText('grunnlag.pensjonsavtaler.tabell.title.right')
      ).toBeVisible()
      await waitFor(async () => {
        expect(await screen.findByText('Privat tjenestepensjon')).toBeVisible()
        expect(
          await screen.findByText('Fra 67 år til 77 år og 8 md.')
        ).toBeVisible()
        expect(
          await screen.findByText('Fra 67 år og 6 md. til 77 år')
        ).toBeVisible()
        expect(await screen.findAllByText('12 345 kr')).toHaveLength(2)
        const rows = container.querySelectorAll('tr')
        expect(rows?.length).toBe(5)
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

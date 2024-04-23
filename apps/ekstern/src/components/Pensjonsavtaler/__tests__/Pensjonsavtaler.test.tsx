import * as ReactRouterUtils from 'react-router'

import { describe, it, vi } from 'vitest'

import { Pensjonsavtaler } from '../Pensjonsavtaler'
import { mockErrorResponse, mockResponse } from '@/mocks/server'
import { paths } from '@/router/constants'
import {
  userInputInitialState,
  Simulation,
} from '@/state/userInput/userInputReducer'
import { render, screen, userEvent } from '@/test-utils'

describe('Pensjonsavtaler', () => {
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
    formatertUttaksalderReadOnly: '67 år string.og 1 alder.maaned',
    uttaksalder: { aar: 67, maaneder: 1 },
    aarligInntektFoerUttakBeloep: '0',
    gradertUttaksperiode: null,
  }
  describe('Gitt at brukeren ikke har samtykket', () => {
    it('viser riktig header og melding med lenke tilbake til start, og skjuler ingress og tabell', async () => {
      const user = userEvent.setup()
      const navigateMock = vi.fn()
      vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
        () => navigateMock
      )

      const { store } = render(<Pensjonsavtaler headingLevel="3" />, {
        preloadedState: {
          /* eslint-disable @typescript-eslint/ban-ts-comment */
          // @ts-ignore
          api: { ...fakeInntektApiCall },
          userInput: { ...userInputInitialState, samtykke: false },
        },
      })
      expect(
        await screen.findByRole('heading', { level: 3 })
      ).toHaveTextContent('pensjonsavtaler.title')
      expect(
        await screen.findByText(
          'pensjonsavtaler.ingress.error.samtykke_ingress',
          { exact: false }
        )
      ).toBeVisible()

      screen.debug()
      expect(
        await screen.findAllByText(
          'pensjonsavtaler.ingress.error.samtykke_link',
          { exact: false }
        )
      ).toHaveLength(2)

      expect(
        screen.queryByTestId('pensjonsavtaler-table')
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText('Alle avtaler i privat sektor hentes fra ', {
          exact: false,
        })
      ).not.toBeInTheDocument()

      await user.click(
        await screen.findByText('pensjonsavtaler.ingress.error.samtykke_link_1')
      )

      expect(navigateMock).toHaveBeenCalledWith(paths.start)
      expect(store.getState().userInput.samtykke).toBe(null)
    })
  })

  describe('Gitt at brukeren har samtykket', () => {
    it('Når pensjonsavtaler laster, viser riktig header og melding', async () => {
      render(<Pensjonsavtaler headingLevel="3" />, {
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
        await screen.findByRole('heading', { level: 3 })
      ).toHaveTextContent('pensjonsavtaler.title')
    })

    it('Når pensjonsavtaler har feilet, viser riktig header og melding, og skjuler ingress og tabell', async () => {
      mockErrorResponse('/v2/pensjonsavtaler', {
        method: 'post',
      })
      render(<Pensjonsavtaler headingLevel="3" />, {
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
        await screen.findByText('pensjonsavtaler.ingress.error.pensjonsavtaler')
      ).toBeVisible()
      expect(
        screen.queryByTestId('pensjonsavtaler-list')
      ).not.toBeInTheDocument()
    })

    it('Når pensjonsavtaler har delvis svar, viser riktig header og melding, og viser ingress og tabell', async () => {
      mockResponse('/v2/pensjonsavtaler', {
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
      render(<Pensjonsavtaler headingLevel="3" />, {
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
          'pensjonsavtaler.ingress.error.pensjonsavtaler.partial'
        )
      ).toBeVisible()
      expect(await screen.findByTestId('pensjonsavtaler-list')).toBeVisible()
      expect(
        await screen.findByText('Alle avtaler i privat sektor hentes fra ', {
          exact: false,
        })
      ).toBeVisible()
      expect(
        await screen.findByRole('heading', { level: 3 })
      ).toHaveTextContent('pensjonsavtaler.title')
      expect(await screen.findAllByRole('heading', { level: 4 })).toHaveLength(
        1
      )
    })

    it('Når pensjonsavtaler har delvis svar og ingen avtaler, viser riktig header og melding, og viser ingress og tabell', async () => {
      mockResponse('/v2/pensjonsavtaler', {
        status: 200,
        json: {
          avtaler: [],
          utilgjengeligeSelskap: ['Something'],
        },
        method: 'post',
      })
      render(<Pensjonsavtaler headingLevel="3" />, {
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
          'pensjonsavtaler.title.error.pensjonsavtaler.partial',
          { exact: false }
        )
      ).not.toBeInTheDocument()
      expect(
        await screen.findByText('pensjonsavtaler.ingress.error.pensjonsavtaler')
      ).toBeVisible()
      expect(
        screen.queryByText(
          'pensjonsavtaler.ingress.error.pensjonsavtaler.partial'
        )
      ).not.toBeInTheDocument()
      expect(
        screen.queryByTestId('pensjonsavtaler-table')
      ).not.toBeInTheDocument()
      expect(
        await screen.findByText('Alle avtaler i privat sektor hentes fra ', {
          exact: false,
        })
      ).toBeVisible()
      expect(
        await screen.findByRole('heading', { level: 3 })
      ).toHaveTextContent('pensjonsavtaler.title')
    })

    it('Når brukeren har 0 pensjonsavtaler, viser riktig infomelding, og skjuler ingress og tabell', async () => {
      mockResponse('/v2/pensjonsavtaler', {
        status: 200,
        json: {
          avtaler: [],
          utilgjengeligeSelskap: [],
        },
        method: 'post',
      })
      render(<Pensjonsavtaler headingLevel="3" />, {
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
      expect(screen.getByText('pensjonsavtaler.title')).toBeVisible()
      expect(
        await screen.findByText('pensjonsavtaler.ingress.ingen')
      ).toBeVisible()
      expect(
        screen.queryByTestId('pensjonsavtaler-table')
      ).not.toBeInTheDocument()

      expect(
        await screen.findByText('Alle avtaler i privat sektor hentes fra ', {
          exact: false,
        })
      ).toBeVisible()
    })
  })
})

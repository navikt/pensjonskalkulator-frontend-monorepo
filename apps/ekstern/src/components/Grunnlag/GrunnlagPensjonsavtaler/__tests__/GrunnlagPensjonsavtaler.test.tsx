import * as ReactRouterUtils from 'react-router'

import { Accordion } from '@navikt/ds-react'
import { describe, it, vi } from 'vitest'

import { GrunnlagPensjonsavtaler } from '../GrunnlagPensjonsavtaler'
import { mockErrorResponse, mockResponse } from '@/mocks/server'
import { paths } from '@/router/constants'
import {
  userInputInitialState,
  Simulation,
} from '@/state/userInput/userInputReducer'
import { render, screen, userEvent } from '@/test-utils'

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
    uttaksperioder: [],
    formatertUttaksalderReadOnly: '67 år string.og 1 alder.maaned',
    startAlder: { aar: 67, maaneder: 1 },
    aarligInntektFoerUttak: 0,
  }
  describe('Gitt at brukeren ikke har samtykket', () => {
    it('viser riktig header og melding med lenke tilbake til start, og skjuler ingress og tabell', async () => {
      const user = userEvent.setup()
      const navigateMock = vi.fn()
      vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
        () => navigateMock
      )

      const { store } = render(
        <Accordion>
          <GrunnlagPensjonsavtaler />
        </Accordion>,
        {
          preloadedState: {
            /* eslint-disable @typescript-eslint/ban-ts-comment */
            // @ts-ignore
            api: { ...fakeInntektApiCall },
            userInput: { ...userInputInitialState, samtykke: false },
          },
        }
      )
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
        screen.queryByText('Alle avtaler i privat sektor hentes fra ', {
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
      render(
        <Accordion>
          <GrunnlagPensjonsavtaler />
        </Accordion>,
        {
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
        }
      )
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
      render(
        <Accordion>
          <GrunnlagPensjonsavtaler />
        </Accordion>,
        {
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
        }
      )
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
        await screen.findByText('Alle avtaler i privat sektor hentes fra ', {
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
      render(
        <Accordion>
          <GrunnlagPensjonsavtaler />
        </Accordion>,
        {
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
        }
      )
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
        await screen.findByText('Alle avtaler i privat sektor hentes fra ', {
          exact: false,
        })
      ).toBeVisible()
    })

    it('Når pensjonsavtaler har delvis svar og ingen avtaler, viser riktig header og melding, og viser ingress og tabell', async () => {
      mockResponse('/v1/pensjonsavtaler', {
        status: 200,
        json: {
          avtaler: [],
          utilgjengeligeSelskap: ['Something'],
        },
        method: 'post',
      })
      render(
        <Accordion>
          <GrunnlagPensjonsavtaler />
        </Accordion>,
        {
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
        }
      )
      expect(
        await screen.findByText(
          'grunnlag.pensjonsavtaler.title.error.pensjonsavtaler'
        )
      ).toBeVisible()
      expect(
        await screen.queryByText(
          'grunnlag.pensjonsavtaler.title.error.pensjonsavtaler.partial',
          { exact: false }
        )
      ).not.toBeInTheDocument()
      expect(
        await screen.findByText(
          'grunnlag.pensjonsavtaler.ingress.error.pensjonsavtaler'
        )
      ).toBeVisible()
      expect(
        await screen.queryByText(
          'grunnlag.pensjonsavtaler.ingress.error.pensjonsavtaler.partial'
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
      render(
        <Accordion>
          <GrunnlagPensjonsavtaler />
        </Accordion>,
        {
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
        }
      )
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
        await screen.findByText('Alle avtaler i privat sektor hentes fra ', {
          exact: false,
        })
      ).toBeVisible()
    })
  })
})

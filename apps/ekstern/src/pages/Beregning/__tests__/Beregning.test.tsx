import { act } from 'react-dom/test-utils'
import { describe, expect, it, vi } from 'vitest'

import { Beregning } from '../Beregning'
import { mockResponse, mockErrorResponse } from '@/mocks/server'
import * as apiSliceUtils from '@/state/api/apiSlice'
import { userInputInitialState } from '@/state/userInput/userInputReducer'
import * as userInputReducerUtils from '@/state/userInput/userInputReducer'
import { render, screen, userEvent, waitFor } from '@/test-utils'

describe('Beregning', () => {
  const fakeApiCalls = {
    queries: {
      ['getPerson(undefined)']: {
        status: 'fulfilled',
        endpointName: 'getPerson',
        requestId: 'xTaE6mOydr5ZI75UXq4Wi',
        startedTimeStamp: 1688046411971,
        data: {
          fornavn: 'Aprikos',
          sivilstand: 'UGIFT',
          foedselsdato: '1963-04-30',
        },
        fulfilledTimeStamp: 1688046412103,
      },
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
  describe('Gitt at feature-toggle for detaljert fane skrues av og på', () => {
    it('vises det toggle mellom "enkel" og "detaljert" visning', () => {
      mockResponse('/feature/pensjonskalkulator.enable-detaljert-fane', {
        status: 200,
        json: { enabled: false },
      })
      render(<Beregning visning="enkel" />)
      expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument()
    })

    it('vises det toggle mellom "enkel" og "detaljert" visning', async () => {
      mockResponse('/feature/pensjonskalkulator.enable-detaljert-fane', {
        status: 200,
        json: { enabled: true },
      })
      render(<Beregning visning="enkel" />)
      expect(await screen.findByRole('radiogroup')).toBeInTheDocument()
    })

    it('når brukeren har gjort en simulering og bytter fane, nullstiller det pågående simulering', async () => {
      const user = userEvent.setup()
      const flushCurrentSimulationMock = vi.spyOn(
        userInputReducerUtils.userInputActions,
        'flushCurrentSimulation'
      )
      mockResponse('/feature/pensjonskalkulator.enable-detaljert-fane', {
        status: 200,
        json: { enabled: true },
      })
      render(<Beregning visning="enkel" />, {
        preloadedState: {
          userInput: {
            ...userInputInitialState,
            samtykke: true,
            currentSimulation: {
              startAar: 70,
              startMaaned: 4,
              aarligInntektFoerUttak: 300000,
            },
          },
        },
      })

      expect(await screen.findByRole('radiogroup')).toBeInTheDocument()
      await user.click(await screen.findByText('beregning.toggle.avansert'))
      expect(flushCurrentSimulationMock).toHaveBeenCalled()
    })
  })

  it('har riktig sidetittel', () => {
    render(<Beregning visning="enkel" />)
    expect(document.title).toBe('application.title.beregning')
  })

  describe('Når tidligst mulig uttaksalder hentes', () => {
    it('kalles endepunktet med riktig request body', async () => {
      const initiateMock = vi.spyOn(
        apiSliceUtils.apiSlice.endpoints.tidligsteUttaksalder,
        'initiate'
      )
      render(<Beregning visning="enkel" />, {
        preloadedState: {
          /* eslint-disable @typescript-eslint/ban-ts-comment */
          // @ts-ignore
          api: { ...fakeApiCalls },
          userInput: {
            ...userInputInitialState,
            samtykke: true,
            samboer: false,
            afp: 'ja_privat',
          },
        },
      })
      expect(initiateMock).toHaveBeenCalledWith(
        {
          harEps: false,
          simuleringstype: 'ALDERSPENSJON_MED_AFP_PRIVAT',
          sisteInntekt: 500000,
          sivilstand: 'UGIFT',
        },
        {
          forceRefetch: undefined,
          subscriptionOptions: {
            pollingInterval: 0,
            refetchOnFocus: undefined,
            refetchOnReconnect: undefined,
          },
        }
      )
    })
    it('viser loading og deretter riktig header, tekst og knapper', async () => {
      render(<Beregning visning="enkel" />)
      expect(screen.getByTestId('uttaksalder-loader')).toBeVisible()
      await waitFor(async () => {
        expect(
          screen.queryByTestId('uttaksalder-loader')
        ).not.toBeInTheDocument()
      })
      expect(await screen.findByTestId('tidligst-mulig-uttak')).toBeVisible()
      expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(1)
      expect(screen.getAllByRole('button')).toHaveLength(12)
    })
    it('når kallet feiler, viser det feilmelding om tidligst mulig uttaksalder og resten av siden er som vanlig', async () => {
      const user = userEvent.setup()
      mockErrorResponse('/v1/tidligste-uttaksalder', {
        method: 'post',
      })
      const { container } = render(<Beregning visning="enkel" />, {
        preloadedState: {
          /* eslint-disable @typescript-eslint/ban-ts-comment */
          // @ts-ignore
          api: { ...fakeApiCalls },
          userInput: {
            ...userInputInitialState,
            samtykke: true,
            samboer: false,
          },
        },
      })
      await waitFor(async () => {
        expect(
          await screen.findByText('tidligsteuttaksalder.error')
        ).toBeInTheDocument()
      })
      const button = await screen.findByText('68 alder.aar')

      await user.click(button)

      await waitFor(() => {
        expect(
          screen.queryByTestId('uttaksalder-loader')
        ).not.toBeInTheDocument()
      })
      await waitFor(async () => {
        expect(
          await screen.findByTestId('highcharts-done-drawing')
        ).toBeVisible()
      })
      // Nødvendig for at animasjonen rekker å bli ferdig
      await act(async () => {
        await new Promise((r) => {
          setTimeout(r, 500)
        })
      })
      expect(
        container.getElementsByClassName('highcharts-container').length
      ).toBe(1)
      expect(await screen.findByText('beregning.tabell.vis')).toBeVisible()
    })
  })

  describe('Gitt at pensjonskalkulator er i "enkel" visning', () => {
    it('vises det riktig innhold', async () => {
      render(<Beregning visning="enkel" />)
      expect(
        await screen.findByText('velguttaksalder.title')
      ).toBeInTheDocument()
    })
  })
  describe('Gitt at pensjonskalkulator er i "avansert" visning', () => {
    it('vises det riktig innhold', async () => {
      render(<Beregning visning="avansert" />)
      expect(
        await screen.findByText('Pensjonsgivende inntekt frem til pensjon')
      ).toBeInTheDocument()
    })
  })
})

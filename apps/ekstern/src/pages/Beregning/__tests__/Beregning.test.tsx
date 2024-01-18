import { describe, expect, it, vi } from 'vitest'

import { Beregning } from '../Beregning'
import { mockResponse, mockErrorResponse } from '@/mocks/server'
import * as apiSliceUtils from '@/state/api/apiSlice'
import { userInputInitialState } from '@/state/userInput/userInputReducer'
import * as userInputReducerUtils from '@/state/userInput/userInputReducer'
import { render, screen, userEvent, waitFor } from '@/test-utils'

const alderspensjonResponse = require('../../../mocks/data/alderspensjon/68.json')

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
              formatertUttaksalderReadOnly:
                '70 alder.aar string.og 4 alder.maaned',
              uttaksalder: { aar: 70, maaneder: 4 },
              aarligInntektFoerUttak: 300000,
              gradertUttaksperiode: null,
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
          aarligInntekt: 500000,
          gradertUttak: undefined,
          heltUttak: undefined,
          harEps: false,
          simuleringstype: 'ALDERSPENSJON_MED_AFP_PRIVAT',
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

    it('når kallet til tidligst mulig uttak feiler, viser det feilmelding og alle knappene fra 62 år. Resten av siden er som vanlig', async () => {
      mockErrorResponse('/v1/tidligste-uttaksalder', {
        method: 'post',
      })
      mockResponse('/v1/alderspensjon/simulering', {
        status: 200,
        method: 'post',
        json: {
          ...alderspensjonResponse,
        },
      })
      render(<Beregning visning="enkel" />, {
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

      expect(
        await screen.findByText('tidligsteuttaksalder.error')
      ).toBeInTheDocument()

      expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(1)
      expect(screen.getAllByRole('button')).toHaveLength(17)
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

  it('gir mulighet til å avbryte og starte ny beregning ', async () => {
    render(<Beregning visning="enkel" />)

    expect(await screen.findByText('stegvisning.avbryt')).toBeVisible()
    expect(await screen.findByText('stegvisning.tilbake_start')).toBeVisible()
  })
})

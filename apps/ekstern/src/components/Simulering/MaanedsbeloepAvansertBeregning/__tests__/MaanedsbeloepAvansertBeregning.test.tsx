import { describe, expect, it } from 'vitest'

import { fulfilledGetPerson } from '@/mocks/mockedRTKQueryApiCalls'
import { userInputInitialState } from '@/state/userInput/userInputSlice'
import { render, screen } from '@/test-utils'

import { MaanedsbeloepAvansertBeregning } from '../MaanedsbeloepAvansertBeregning'

describe('MaanedsbeloepAvansertBeregning', () => {
  const pensjonsavtale: Pensjonsavtale = {
    key: 0,
    produktbetegnelse: 'DNB',
    kategori: 'PRIVAT_TJENESTEPENSJON',
    startAar: 67,
    utbetalingsperioder: [
      {
        startAlder: { aar: 67, maaneder: 0 } as Alder,
        aarligUtbetaling: 12345,
        grad: 100,
      },
    ],
  }

  const pensjonsavtaler: Pensjonsavtale[] = [
    pensjonsavtale,
    {
      ...pensjonsavtale,
      key: 1,
      utbetalingsperioder: [
        {
          ...pensjonsavtale.utbetalingsperioder[0],
          startAlder: { aar: 67, maaneder: 6 } as Alder,
          sluttAlder: { aar: 71, maaneder: 0 } as Alder,
          aarligUtbetaling: 12345,
        },
      ],
    },
  ]

  const afpOffentligListe = [
    {
      alder: 62,
      beloep: 12000,
      maanedligBeloep: 980,
    },
    {
      alder: 63,
      beloep: 13000,
      maanedligBeloep: 10000,
    },
  ]

  it('rendrer riktig', () => {
    render(
      <MaanedsbeloepAvansertBeregning
        alderspensjonMaanedligVedEndring={{
          heltUttakMaanedligBeloep: 20000,
          gradertUttakMaanedligBeloep: 15000,
        }}
        afpPrivatListe={[]}
        afpOffentligListe={afpOffentligListe}
        pensjonsavtaler={pensjonsavtaler}
      />,
      {
        preloadedState: {
          api: {
            // @ts-ignore
            queries: {
              ...fulfilledGetPerson,
            },
          },
          userInput: {
            ...userInputInitialState,
            currentSimulation: {
              ...userInputInitialState.currentSimulation,
              uttaksalder: { aar: 67, maaneder: 0 },
            },
          },
        },
      }
    )

    expect(
      screen.getByTestId('maanedsbloep-avansert-beregning')
    ).toBeInTheDocument()
  })

  it('returnerer null når uttaksalder ikke er definert', async () => {
    const { container } = render(
      <MaanedsbeloepAvansertBeregning
        alderspensjonMaanedligVedEndring={{
          heltUttakMaanedligBeloep: 20000,
          gradertUttakMaanedligBeloep: 15000,
        }}
        afpPrivatListe={[]}
        afpOffentligListe={afpOffentligListe}
        pensjonsavtaler={pensjonsavtaler}
      />,
      {
        preloadedState: {
          api: {
            // @ts-ignore
            queries: {
              ...fulfilledGetPerson,
            },
          },
          userInput: {
            ...userInputInitialState,
            currentSimulation: {
              ...userInputInitialState.currentSimulation,
              uttaksalder: null,
            },
          },
        },
      }
    )

    expect(container).toBeEmptyDOMElement()
  })
})

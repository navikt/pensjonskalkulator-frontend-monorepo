import { describe, expect, it, vi } from 'vitest'

import { personMock } from '@/mocks'
import { userInputInitialState } from '@/state/userInput/userInputSlice'
import { fireEvent, render, screen } from '@/test-utils'

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
          userInput: {
            ...userInputInitialState,
            currentSimulation: {
              ...userInputInitialState.currentSimulation,
              uttaksalder: { aar: 67, maaneder: 0 },
            },
          },
        },
        preloadedApiState: { getPerson: personMock },
      }
    )

    expect(
      screen.getByTestId('maanedsbloep-avansert-beregning')
    ).toBeInTheDocument()

    const table = screen
      .getByTestId('maanedsbloep-avansert-beregning')
      .querySelector('table')!
    const range = document.createRange()
    range.selectNodeContents(table)
    window.getSelection()?.addRange(range)
    const setData = vi.fn()
    try {
      expect(fireEvent.copy(table, { clipboardData: { setData } })).toBe(false)
      const expected = Array.from(table.rows, (row) =>
        Array.from(row.cells, (cell) => cell.textContent?.trim()).join(' ')
      ).join('\n')
      expect(setData).toHaveBeenCalledExactlyOnceWith('text/plain', expected)

      const heading = table.parentElement!.querySelector('h4')!
      heading.textContent = 'Ved \n              65 år\n              '
      range.setStartBefore(heading)
      range.setEndAfter(table)
      window.getSelection()?.removeAllRanges()
      window.getSelection()?.addRange(range)
      setData.mockClear()

      fireEvent.copy(heading, { clipboardData: { setData } })
      expect(setData).toHaveBeenCalledExactlyOnceWith(
        'text/plain',
        `Ved 65 år\n${expected}`
      )
    } finally {
      window.getSelection()?.removeAllRanges()
    }
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
          userInput: {
            ...userInputInitialState,
            currentSimulation: {
              ...userInputInitialState.currentSimulation,
              uttaksalder: null,
            },
          },
        },
        preloadedApiState: { getPerson: personMock },
      }
    )

    expect(container).toBeEmptyDOMElement()
  })
})

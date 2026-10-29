import { afterEach, describe, expect, it, vi } from 'vitest'

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

  const renderMaanedsbeloep = (uttaksalder: Alder | null) =>
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
              uttaksalder,
            },
          },
        },
        preloadedApiState: { getPerson: personMock },
      }
    )

  const kopier = (fra: Node, til: Node) => {
    const range = document.createRange()
    range.setStartBefore(fra)
    range.setEndAfter(til)
    window.getSelection()?.removeAllRanges()
    window.getSelection()?.addRange(range)
    const setData = vi.fn()
    fireEvent.copy(fra, { clipboardData: { setData } })
    return setData.mock.calls[0]?.[1] as string
  }

  const rader = (table: HTMLTableElement) =>
    Array.from(table.rows, (row) =>
      Array.from(row.cells, (cell) => cell.textContent?.trim()).join(' ')
    ).join('\n')

  afterEach(() => {
    window.getSelection()?.removeAllRanges()
  })

  it('kopierer én rad per linje med etikett og beløp på samme linje', () => {
    renderMaanedsbeloep({ aar: 67, maaneder: 0 })
    const table = screen
      .getByTestId('maanedsbloep-avansert-beregning')
      .querySelector('table')!

    expect(kopier(table, table)).toBe(rader(table))
  })

  it('kopierer ikke skjult innhold', () => {
    renderMaanedsbeloep({ aar: 67, maaneder: 0 })
    const box = screen.getByTestId('maanedsbloep-avansert-beregning')
    const [heading, desktop, mobile] = Array.from(box.children) as HTMLElement[]
    const mobileTable = mobile.querySelector('table')!
    desktop.style.display = 'none'

    expect(kopier(heading, mobileTable).match(/Sum pensjon/g)).toHaveLength(1)
  })

  it('returnerer null når uttaksalder ikke er definert', () => {
    const { container } = renderMaanedsbeloep(null)
    expect(container).toBeEmptyDOMElement()
  })
})

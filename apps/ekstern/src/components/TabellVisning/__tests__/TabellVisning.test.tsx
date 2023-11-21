import { SeriesColumnOptions } from 'highcharts'
import { describe, it } from 'vitest'

import { TabellVisning } from '../TabellVisning'
import { render, screen, userEvent, waitFor } from '@/test-utils'
import * as loggerUtils from '@/utils/logging'

describe('TabellVisning', () => {
  const series: SeriesColumnOptions[] = [
    {
      type: 'column',
      name: 'beregning.highcharts.serie.inntekt.name',
      data: [100000, 175000, 0, 0, 0, 0, 0, 0, 0],
    },
    {
      type: 'column',
      name: 'beregning.highcharts.serie.alderspensjon.name',
      data: [200000, 350000, 400000, 400000, 400000, 400000, 400000, 400000, 0],
    },
    {
      type: 'column',
      name: 'beregning.highcharts.serie.tp.name',
      data: [180000, 250000, 380000, 380000, 380000, 380000, 380000, 380000, 0],
    },
    {
      type: 'column',
      name: 'beregning.highcharts.serie.AFP.name',
      data: [18000, 50000, 50000, 50000, 50000, 50000, 50000, 50000, 0],
    },
  ]

  it('rendrer riktig formatert tabell med detaljer når 2 serier er oppgitt og showAfp og showPensjonsavtaler er false', async () => {
    const user = userEvent.setup()
    const { asFragment } = render(
      <TabellVisning
        series={[series[0], series[1]]}
        aarArray={['69', '70', '71', '72', '73', '74', '75', '76', '77+']}
      />
    )
    expect(screen.getByText('beregning.tabell.vis')).toBeVisible()

    await user.click(screen.getByText('beregning.tabell.vis'))

    await waitFor(async () => {
      expect(screen.getByText('beregning.tabell.lukk')).toBeVisible()
      expect(screen.getAllByRole('row').length).toBe(19)
      expect(screen.getAllByRole('cell').length).toBe(63)
      expect(screen.getAllByRole('button')).toHaveLength(10)
      expect(screen.getByText('300 000')).toBeInTheDocument()
      expect(asFragment()).toMatchSnapshot()
    })

    const buttons = screen.getAllByRole('button')
    await user.click(buttons[1])
    await waitFor(() => {
      expect(screen.getAllByRole('term')).toHaveLength(2)
      expect(screen.getByText('100 000')).toBeInTheDocument()
      expect(screen.getByText('200 000')).toBeInTheDocument()
      expect(asFragment()).toMatchSnapshot()
    })
  })

  it('rendrer riktig formatert tabell med detaljer når 4 serier er oppgitt og showAfp og showPensjonsavtaler er true', async () => {
    const user = userEvent.setup()
    const { asFragment } = render(
      <TabellVisning
        series={[...series]}
        aarArray={['69', '70', '71', '72', '73', '74', '75', '76', '77+']}
        showAfp={true}
        showPensjonsavtaler={true}
      />
    )
    expect(screen.getByText('beregning.tabell.vis')).toBeVisible()

    await user.click(screen.getByText('beregning.tabell.vis'))

    await waitFor(async () => {
      expect(screen.getByText('beregning.tabell.lukk')).toBeVisible()
      expect(screen.getAllByRole('row').length).toBe(19)
      expect(screen.getAllByRole('cell').length).toBe(81)
      expect(screen.getAllByRole('button')).toHaveLength(10)
      expect(screen.getByText('498 000')).toBeInTheDocument()
      expect(asFragment()).toMatchSnapshot()
    })

    const buttons = screen.getAllByRole('button')

    await user.click(buttons[1])

    await waitFor(() => {
      expect(screen.getAllByRole('term')).toHaveLength(4)
      expect(screen.getByText('100 000')).toBeInTheDocument()
      expect(screen.getByText('180 000')).toBeInTheDocument()
      expect(screen.getByText('18 000')).toBeInTheDocument()
      expect(screen.getByText('200 000')).toBeInTheDocument()

      expect(asFragment()).toMatchSnapshot()
    })
  })

  it('logger når en rad i tabellen åpnes og lukkes', async () => {
    const user = userEvent.setup()
    const loggerSpy = vi.spyOn(loggerUtils, 'logger')
    render(
      <TabellVisning
        series={series}
        aarArray={['69', '70', '71', '72', '73', '74', '75', '76', '77+']}
        showAfp={true}
        showPensjonsavtaler={true}
      />
    )
    await user.click(screen.getByText('beregning.tabell.vis'))

    const buttons = screen.getAllByRole('button')
    await user.click(buttons[1])

    expect(loggerSpy).toHaveBeenNthCalledWith(2, 'table expand åpnet', {
      data: '69 alder.aar',
      tekst: 'detaljert beregning',
    })

    await user.click(buttons[1])

    expect(loggerSpy).toHaveBeenNthCalledWith(3, 'table expand lukket', {
      data: '69 alder.aar',
      tekst: 'detaljert beregning',
    })
  })
})

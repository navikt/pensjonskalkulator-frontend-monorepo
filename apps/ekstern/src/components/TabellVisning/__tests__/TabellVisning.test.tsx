import { SeriesColumnOptions } from 'highcharts'
import { describe, it } from 'vitest'

import { TabellVisning } from '../TabellVisning'
import { render, screen, userEvent } from '@/test-utils'
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

    await user.click(await screen.findByText('beregning.tabell.vis'))
    expect(await screen.findByText('beregning.tabell.lukk')).toBeVisible()
    expect(await screen.findAllByRole('button')).toHaveLength(10)
    expect(await screen.findByText('300 000')).toBeInTheDocument()
    expect(await screen.findAllByRole('row')).toHaveLength(19)
    expect(await screen.findAllByRole('cell')).toHaveLength(54)
    expect(asFragment()).toMatchSnapshot()

    const buttons = await screen.findAllByRole('button')
    await user.click(buttons[1])
    expect(await screen.findAllByRole('term')).toHaveLength(2)
    expect(await screen.findByText('100 000')).toBeInTheDocument()
    expect(await screen.findByText('200 000')).toBeInTheDocument()
    expect(asFragment()).toMatchSnapshot()
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
    expect(await screen.findByText('beregning.tabell.vis')).toBeVisible()

    await user.click(await screen.findByText('beregning.tabell.vis'))

    expect(await screen.findByText('beregning.tabell.lukk')).toBeVisible()
    expect(await screen.findAllByRole('row')).toHaveLength(19)
    expect(await screen.findAllByRole('cell')).toHaveLength(72)
    expect(await screen.findAllByRole('button')).toHaveLength(10)
    expect(await screen.findByText('498 000')).toBeInTheDocument()
    expect(asFragment()).toMatchSnapshot()

    const buttons = screen.getAllByRole('button')
    await user.click(buttons[1])

    expect(await screen.findAllByRole('term')).toHaveLength(4)
    expect(await screen.findByText('100 000')).toBeInTheDocument()
    expect(await screen.findByText('180 000')).toBeInTheDocument()
    expect(await screen.findByText('18 000')).toBeInTheDocument()
    expect(await screen.findByText('200 000')).toBeInTheDocument()

    expect(asFragment()).toMatchSnapshot()
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
    await user.click(await screen.findByText('beregning.tabell.vis'))

    const buttons = await screen.findAllByRole('button')
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

import { SeriesColumnOptions } from 'highcharts'
import { describe, it } from 'vitest'

import { render, screen, userEvent } from '@/test-utils'

import { TabellVisning } from '../TabellVisning'

describe('TabellVisning', () => {
  const inntektSerie: SeriesColumnOptions = {
    type: 'column',
    name: 'beregning.highcharts.serie.inntekt.name',
    data: [100000, 175000, 0, 0, 0, 0, 0, 0, 0],
  }

  const alderspensjonSerie: SeriesColumnOptions = {
    type: 'column',
    name: 'beregning.highcharts.serie.alderspensjon.name',
    data: [200000, 350000, 400000, 400000, 400000, 400000, 400000, 400000, 0],
  }

  const afpSerie: SeriesColumnOptions = {
    type: 'column',
    name: 'beregning.highcharts.serie.AFP.name',
    data: [18000, 50000, 50000, 50000, 50000, 50000, 50000, 50000, 0],
  }
  const pensjonsavtalerSerie: SeriesColumnOptions = {
    type: 'column',
    name: 'beregning.highcharts.serie.tp.name',
    data: [180000, 250000, 380000, 380000, 380000, 380000, 380000, 380000, 0],
  }

  it('rendrer riktig formatert tabell med detaljer når 1 serie er oppgitt: alderspensjon', async () => {
    const user = userEvent.setup()
    render(
      <TabellVisning
        series={[alderspensjonSerie]}
        aarArray={['69', '70', '71', '72', '73', '74', '75', '76', '77+']}
      />
    )

    await user.click(await screen.findByText('beregning.tabell.vis'))
    expect(await screen.findByText('beregning.tabell.lukk')).toBeVisible()
    expect(await screen.findAllByRole('button')).toHaveLength(10)
    expect(await screen.findAllByRole('row')).toHaveLength(19)
    expect(await screen.findAllByRole('cell')).toHaveLength(45)

    const buttons = await screen.findAllByRole('button')
    await user.click(buttons[1])
    expect(await screen.findAllByRole('term')).toHaveLength(1)
  })

  it('rendrer riktig formatert tabell med detaljer når 2 serier er oppgitt: inntekt og alderspensjon', async () => {
    const user = userEvent.setup()
    render(
      <TabellVisning
        series={[inntektSerie, alderspensjonSerie]}
        aarArray={['69', '70', '71', '72', '73', '74', '75', '76', '77+']}
      />
    )

    await user.click(await screen.findByText('beregning.tabell.vis'))
    expect(await screen.findByText('beregning.tabell.lukk')).toBeVisible()
    expect(await screen.findAllByRole('button')).toHaveLength(10)
    expect(await screen.findByText('300 000')).toBeInTheDocument()
    expect(await screen.findAllByRole('row')).toHaveLength(19)
    expect(await screen.findAllByRole('cell')).toHaveLength(54)

    const buttons = await screen.findAllByRole('button')
    await user.click(buttons[1])
    expect(await screen.findAllByRole('term')).toHaveLength(2)
    expect(await screen.findByText('100 000')).toBeInTheDocument()
    expect(await screen.findByText('200 000')).toBeInTheDocument()
  })

  it('rendrer riktig formatert tabell med detaljer når 4 serier er oppgitt: inntekt, alderspensjon, afp og pensjonsavtaler', async () => {
    const user = userEvent.setup()
    render(
      <TabellVisning
        series={[
          inntektSerie,
          alderspensjonSerie,
          afpSerie,
          pensjonsavtalerSerie,
        ]}
        aarArray={['69', '70', '71', '72', '73', '74', '75', '76', '77+']}
      />
    )
    expect(await screen.findByText('beregning.tabell.vis')).toBeVisible()

    await user.click(await screen.findByText('beregning.tabell.vis'))

    expect(await screen.findByText('beregning.tabell.lukk')).toBeVisible()
    expect(await screen.findAllByRole('row')).toHaveLength(19)
    expect(await screen.findAllByRole('cell')).toHaveLength(72)
    expect(await screen.findAllByRole('button')).toHaveLength(10)
    expect(await screen.findByText('498 000')).toBeInTheDocument()

    const buttons = screen.getAllByRole('button')
    await user.click(buttons[1])

    expect(await screen.findAllByRole('term')).toHaveLength(4)
    expect(await screen.findByText('100 000')).toBeInTheDocument()
    expect(await screen.findByText('180 000')).toBeInTheDocument()
    expect(await screen.findByText('18 000')).toBeInTheDocument()
    expect(await screen.findByText('200 000')).toBeInTheDocument()
  })

  it('logger når en rad i tabellen åpnes og lukkes', async () => {
    const user = userEvent.setup()
    render(
      <TabellVisning
        series={[
          inntektSerie,
          alderspensjonSerie,
          afpSerie,
          pensjonsavtalerSerie,
        ]}
        aarArray={['69', '70', '71', '72', '73', '74', '75', '76', '77+']}
      />
    )
    await user.click(await screen.findByText('beregning.tabell.vis'))

    const buttons = await screen.findAllByRole('button')
    await user.click(buttons[1])

    await user.click(buttons[1])
  })
})

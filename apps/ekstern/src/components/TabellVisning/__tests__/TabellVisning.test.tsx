import { SeriesColumnOptions } from 'highcharts'
import { describe, it } from 'vitest'

import { TabellVisning } from '../TabellVisning'
import { render, screen, userEvent, waitFor } from '@/test-utils'

describe('TabellVisning', () => {
  const series: SeriesColumnOptions[] = [
    {
      type: 'column',
      name: 'Pensjonsgivende inntekt',
      data: [100000, 175000, 0, 0, 0, 0, 0, 0, 0],
    },
    {
      type: 'column',
      name: 'Pensjonsavtaler (arbeidsgiver)',
      data: [180000, 250000, 380000, 380000, 380000, 380000, 380000, 380000, 0],
    },
    {
      type: 'column',
      name: 'Alderspensjon (NAV)',
      data: [200000, 350000, 400000, 400000, 400000, 400000, 400000, 400000, 0],
    },
  ]

  it('rendrer riktig formatert tabell med detaljer', async () => {
    const user = userEvent.setup()
    const { asFragment } = render(
      <TabellVisning
        series={[...series]}
        aarArray={['69', '70', '71', '72', '73', '74', '75', '76', '77+']}
      />
    )
    expect(screen.getByText('Vis tabell av beregningen')).toBeVisible()
    await user.click(screen.getByText('Vis tabell av beregningen'))
    await waitFor(async () => {
      expect(screen.getByText('Lukk tabell av beregningen')).toBeVisible()
      expect(screen.getAllByRole('row').length).toBe(19)
      expect(screen.getAllByRole('cell').length).toBe(72)
      expect(screen.getAllByRole('button')).toHaveLength(10)
      expect(screen.getByText('480 000')).toBeInTheDocument()
      expect(asFragment()).toMatchSnapshot()
    })

    const buttons = screen.getAllByRole('button')
    await user.click(buttons[1])
    await waitFor(() => {
      expect(screen.getAllByRole('term')).toHaveLength(3)
      expect(screen.getByText('100 000')).toBeInTheDocument()
      expect(screen.getByText('180 000')).toBeInTheDocument()
      expect(screen.getByText('200 000')).toBeInTheDocument()

      expect(asFragment()).toMatchSnapshot()
    })
  })
})

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
      name: 'Pensjonsavtaler (arbeidsgivere)',
      data: [
        180000, 250000, 380000, 380000, 380000, 380000, 380000, 380000, 380000,
      ],
    },
    {
      type: 'column',
      name: 'Alderspensjon (NAV)',
      data: [
        200000, 350000, 400000, 400000, 400000, 400000, 400000, 400000, 400000,
      ],
    },
  ]

  it('rendrer riktig formatert tabell med detaljer', async () => {
    const user = userEvent.setup()
    const { asFragment } = render(
      <TabellVisning
        series={[...series]}
        aarArray={['70', '71', '72', '73', '74', '75', '76', '77+']}
      />
    )
    expect(asFragment()).toMatchSnapshot()

    expect(screen.getAllByRole('row').length).toBe(9)
    expect(screen.getAllByRole('cell').length).toBe(24)

    expect(screen.getAllByRole('button')).toHaveLength(8)
    const buttons = screen.getAllByRole('button')
    expect(screen.getByText('480 000')).toBeInTheDocument()
    await user.click(buttons[0])
    await waitFor(() => {
      expect(screen.getAllByRole('term')).toHaveLength(3)
      expect(screen.getByText('100 000')).toBeInTheDocument()
      expect(screen.getByText('180 000')).toBeInTheDocument()
      expect(screen.getByText('200 000')).toBeInTheDocument()

      expect(asFragment()).toMatchSnapshot()
    })
  })
})

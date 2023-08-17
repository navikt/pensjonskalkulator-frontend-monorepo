import { describe, it } from 'vitest'

import { Pensjonssimulering } from '../Pensjonssimulering'
import { render, screen, userEvent } from '@/test-utils'

describe('Pensjonssimulering', () => {
  it('rendrer med riktig tittel og chart og uten scroll-knapper', async () => {
    const { container, asFragment } = render(
      <Pensjonssimulering uttaksalder={65} />
    )

    expect(await screen.findByText('Beregning')).toBeVisible()
    expect(
      container.getElementsByClassName('highcharts-container')
    ).toHaveLength(1)
    expect(asFragment()).toMatchSnapshot()
  })

  it('viser tabell og oppdaterer label når brukeren klikker på Vis tabell knapp', async () => {
    const user = userEvent.setup()
    render(<Pensjonssimulering uttaksalder={65} />)

    expect(screen.getByText('Vis tabell av beregningen')).toBeVisible()
    await user.click(screen.getByText('Vis tabell av beregningen'))
    expect(screen.getByText('Lukk tabell av beregningen')).toBeVisible()
    expect(screen.getAllByRole('row').length).toBe(31)
  })
})

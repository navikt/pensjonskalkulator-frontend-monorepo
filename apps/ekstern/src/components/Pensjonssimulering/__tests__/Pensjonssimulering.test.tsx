import React from 'react'

import { describe, it } from 'vitest'

import { Pensjonssimulering } from '../Pensjonssimulering'
import { render, screen, waitFor, fireEvent } from '@/test-utils'

describe('Pensjonssimulering', () => {
  it('rendrer med riktig tittel og chart', async () => {
    const { container, asFragment } = render(
      <Pensjonssimulering uttaksalder={65} />
    )
    await waitFor(() => {
      expect(screen.getByText('Beregning')).toBeInTheDocument()
      expect(
        container.getElementsByClassName('highcharts-container').length
      ).toBe(1)
      expect(asFragment()).toMatchSnapshot()
    })
  })

  it('viser tabell og oppdaterer label når brukeren klikker på Vis tabell knapp', async () => {
    render(<Pensjonssimulering uttaksalder={65} />)

    expect(screen.getByText('Vis tabell')).toBeVisible()
    fireEvent.click(screen.getByText('Vis tabell'))
    expect(screen.getByText('Lukk tabell')).toBeVisible()
    expect(screen.getAllByRole('row').length).toBe(1)
  })
})

import React from 'react'

import { describe, it } from 'vitest'

import { Pensjonssimulering } from '../Pensjonssimulering'
import { render, screen, waitFor } from '@/test-utils'

describe('Pensjonssimulering', () => {
  it('rendrer med riktig tittel og chart', async () => {
    const { container, asFragment } = render(
      <Pensjonssimulering uttaksalder={65} />
    )
    await waitFor(() => {
      expect(screen.getByText('Årlig pensjon')).toBeInTheDocument()
      expect(
        container.getElementsByClassName('highcharts-container').length
      ).toBe(1)
      expect(asFragment()).toMatchSnapshot()
    })
  })
})

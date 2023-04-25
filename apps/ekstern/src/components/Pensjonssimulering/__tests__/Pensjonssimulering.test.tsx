import React from 'react'

import { describe, it } from 'vitest'

import { Pensjonssimulering } from '../Pensjonssimulering'
import { render, screen } from '@/test-utils'

describe('Pensjonssimulering', () => {
  it('rendrer med riktig tittel og chart', () => {
    const { container, asFragment } = render(
      <Pensjonssimulering uttaksalder={65} />
    )
    expect(screen.getByText('Årlig pensjon')).toBeInTheDocument()
    expect(
      container.getElementsByClassName('highcharts-container').length
    ).toBe(1)
    expect(asFragment()).toMatchSnapshot()
  })
})

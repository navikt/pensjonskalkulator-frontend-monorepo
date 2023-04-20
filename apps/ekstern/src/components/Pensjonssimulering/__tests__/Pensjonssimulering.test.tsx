import React from 'react'

import { describe, it } from 'vitest'

import { Pensjonssimulering } from '../Pensjonssimulering'
import { render, screen } from '@/test-utils'

describe('Pensjonssimulering', () => {
  it('rendrer med riktig tittel og chart', () => {
    const { container, asFragment } = render(
      <Pensjonssimulering uttaksalder={65} />
    )
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(1)
    expect(
      screen.getByText('Årlig pensjon hvis du starter uttak ved 65 år')
    ).toBeInTheDocument()
    expect(container.getElementsByClassName('ct-chart').length).toBe(1)
    expect(asFragment()).toMatchSnapshot()
  })
})

import React from 'react'

import { describe, it } from 'vitest'

import { TabellVisning } from '../TabellVisning'
import { render, screen, waitFor } from '@/test-utils'

describe('TabellVisning', () => {
  it('rendrer riktig formatert tabell', () => {
    const { asFragment } = render(
      <TabellVisning
        data={[
          {
            alder: '62 år',
            sum: '300 000 kr',
            detaljer: 'lorem ipsum dolor sit amet',
          },
        ]}
      />
    )

    expect(screen.getAllByRole('row').length).toBe(2)
    expect(screen.getAllByRole('cell').length).toBe(3)

    expect(asFragment()).toMatchSnapshot()
  })
})

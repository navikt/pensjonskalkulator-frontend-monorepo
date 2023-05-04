import React from 'react'

import { describe, it } from 'vitest'

import { App } from '../App'
import { render, screen, waitFor } from '@/test-utils'

describe('App', () => {
  it('rendrer slik den skal, med main tag og Heading på riktig nivå', async () => {
    const result = render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'Pensjonskalkulator'
      )
      expect(result.asFragment()).toMatchSnapshot()
    })
  })
})

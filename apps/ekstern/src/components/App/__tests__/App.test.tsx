import React from 'react'

import { waitFor } from '@testing-library/react'
import { describe, it } from 'vitest'

import { render, screen } from '../../../test-utils'
import { App } from '../App'

describe('App', () => {
  it('rendrer slik den skal, med main tag og Heading på riktig nivå', async () => {
    const result = render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Hei Ola!')).toBeVisible()
      expect(result.asFragment()).toMatchSnapshot()
    })
  })
})

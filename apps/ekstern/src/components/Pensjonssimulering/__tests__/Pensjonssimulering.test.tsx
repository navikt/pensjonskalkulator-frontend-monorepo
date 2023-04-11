import React from 'react'

import { waitFor } from '@testing-library/react'
import { describe, it } from 'vitest'

import { render, screen } from '../../../test-utils'
import { Pensjonssimulering } from '../Pensjonssimulering'

describe('Pensjonssimulering', () => {
  it('rendrer slik den skal, med Heading på riktig nivå', async () => {
    const result = render(<Pensjonssimulering />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
        'Når vil du ta ut alderspensjon?'
      )
      expect(result.asFragment()).toMatchSnapshot()
    })
  })
})

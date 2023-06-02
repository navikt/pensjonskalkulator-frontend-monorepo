import { MemoryRouter, Routes, Route } from 'react-router-dom'

import { render } from '@testing-library/react'
import { describe, it } from 'vitest'

import { Step } from '..'
import { screen, waitFor } from '@/test-utils'

describe('Step', () => {
  it('rendrer slik den skal, med riktig heading basert på url parameter', async () => {
    const result = render(
      <MemoryRouter initialEntries={['/whateverroute/3']}>
        <Routes>
          <Route path="/whateverroute/:stepId" element={<Step />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
        'Dette er steg 3'
      )
      expect(result.asFragment()).toMatchSnapshot()
    })
  })
})

import { MemoryRouter, Routes, Route } from 'react-router-dom'

import { describe, it } from 'vitest'

import { Stegvisning } from '..'
import { render, screen, waitFor } from '@/test-utils'

describe('Stegvisning', () => {
  it('rendrer Step 0 slik den skal, med riktig steg basert på url parameter', async () => {
    render(
      <MemoryRouter initialEntries={['/whateverroute/0']}>
        <Routes>
          <Route path="/whateverroute/:stepId" element={<Stegvisning />} />
        </Routes>
      </MemoryRouter>,
      {},
      { hasRouter: false }
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        'stegvisning.steg0.title'
      )
    })
  })

  it('rendrer Step 1 slik den skal, med riktig steg basert på url parameter', async () => {
    render(
      <MemoryRouter initialEntries={['/whateverroute/1']}>
        <Routes>
          <Route path="/whateverroute/:stepId" element={<Stegvisning />} />
        </Routes>
      </MemoryRouter>,
      {},
      { hasRouter: false }
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        'stegvisning.steg1.title'
      )
    })
  })

  it('rendrer steg0 som default når steget er ukjent', async () => {
    render(
      <MemoryRouter initialEntries={['/whateverroute/7654']}>
        <Routes>
          <Route path="/whateverroute/:stepId" element={<Stegvisning />} />
        </Routes>
      </MemoryRouter>,
      {},
      { hasRouter: false }
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        'stegvisning.steg0.title'
      )
    })
  })
})

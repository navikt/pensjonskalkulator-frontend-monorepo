import * as ReactRouterUtils from 'react-router'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

import { describe, it, vi } from 'vitest'

import { Stegvisning } from '..'
import { RootState } from '@/state/store'
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

  it('Når brukeren har samtykket, rendrer Step 2 slik den skal, med riktig steg basert på url parameter', async () => {
    render(
      <MemoryRouter initialEntries={['/whateverroute/2']}>
        <Routes>
          <Route path="/whateverroute/:stepId" element={<Stegvisning />} />
        </Routes>
      </MemoryRouter>,
      {
        preloadedState: { userInput: { samtykke: true } } as RootState,
      },
      { hasRouter: false }
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        'stegvisning.steg2.title'
      )
    })
  })

  it('Når brukeren ikke har samtykket og prøver å aksessere steg 2 direkte, redirigerer til steg 3', async () => {
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )

    render(
      <MemoryRouter initialEntries={['/whateverroute/2']}>
        <Routes>
          <Route path="/whateverroute/:stepId" element={<Stegvisning />} />
        </Routes>
      </MemoryRouter>,
      {},
      { hasRouter: false }
    )

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/stegvisning/3')
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

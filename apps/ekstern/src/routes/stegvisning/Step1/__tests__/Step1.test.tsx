import * as ReactRouterUtils from 'react-router'

import { describe, it, vi } from 'vitest'

import { Step1 } from '..'
import { mockResponse, mockErrorResponse } from '@/mocks/server'
import { paths } from '@/routes'
import * as apiSliceUtils from '@/state/api/apiSlice'
import { userEvent, render, screen, waitFor } from '@/test-utils'
describe('Step 1', () => {
  it('har riktig sidetittel', () => {
    render(<Step1 />)
    expect(document.title).toBe('application.title.stegvisning.step1')
  })

  it('henter personopplysninger og viser hilsen med fornavnet til brukeren', async () => {
    render(<Step1 />)
    await waitFor(() => {
      expect(screen.getByText('stegvisning.start.title Aprikos!')).toBeVisible()
    })
  })

  it('render hilsen uten fornavn når henting av personopplysninger er delvis vellykket (mangler sivilstand)', async () => {
    mockResponse('/person', {
      status: 200,
      json: { fornavn: 'Ola', sivilstand: null },
    })
    render(<Step1 />)
    await waitFor(async () => {
      expect(screen.getByText('stegvisning.start.title Ola!')).toBeVisible()
    })
  })

  it('render hilsen uten fornavn når henting av personopplysninger feiler', async () => {
    mockErrorResponse('/person')
    render(<Step1 />)
    await waitFor(() => {
      expect(screen.getByText('stegvisning.start.title!')).toBeVisible()
    })
  })

  it('sender videre til steg 2 når brukeren klikker på Neste', async () => {
    const user = userEvent.setup()
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    render(<Step1 />)
    await waitFor(async () => {
      await user.click(await screen.findByText('stegvisning.start.start'))
      expect(navigateMock).toHaveBeenCalledWith(paths.samtykke)
    })
  })

  it('nullstiller cachen for /person kall når brukeren klikker på Neste og at kallet har feilet', async () => {
    mockErrorResponse('/person')
    const user = userEvent.setup()
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )

    let invalidateTagsMock = vi
      .spyOn(apiSliceUtils.apiSlice.util, 'invalidateTags')
      .mockReturnValue({
        type: 'something',
        payload: ['Person'],
      })
    invalidateTagsMock = Object.assign(invalidateTagsMock, { match: vi.fn() })

    render(<Step1 />)
    await waitFor(async () => {
      await user.click(screen.getByText('stegvisning.start.start'))
      expect(navigateMock).toHaveBeenCalledWith(paths.samtykke)
      expect(invalidateTagsMock).toHaveBeenCalledWith(['Person'])
    })
  })

  it('redirigerer til landingssiden når brukeren klikker på Avbryt', async () => {
    const user = userEvent.setup()
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    render(<Step1 />)
    await waitFor(async () => {
      await user.click(screen.getByText('stegvisning.avbryt'))
      expect(navigateMock).toHaveBeenCalledWith(paths.root)
    })
  })
})

import * as ReactRouterUtils from 'react-router'

import { describe, it, vi } from 'vitest'

import { Step0 } from '..'
import { mockErrorResponse, mockResponse } from '@/mocks/server'
import { paths } from '@/router/constants'
import * as apiSliceUtils from '@/state/api/apiSlice'
import { userEvent, render, screen, waitFor } from '@/test-utils'

describe('Step 0', () => {
  it('har riktig sidetittel', () => {
    render(<Step0 />)
    expect(document.title).toBe('application.title.stegvisning.step0')
  })

  it('viser loader mens person og inntekt fetches', () => {
    render(<Step0 />)
    expect(screen.getByTestId('step0-loader')).toBeVisible()
  })

  it('henter personopplysninger og viser hilsen med fornavnet til brukeren', async () => {
    render(<Step0 />)
    await waitFor(() => {
      expect(screen.getByText('stegvisning.start.title Aprikos!')).toBeVisible()
    })
  })

  it('rendrer hilsen uten fornavn når henting av personopplysninger feiler', async () => {
    mockErrorResponse('/v1/person')
    render(<Step0 />)
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
    render(<Step0 />)
    await waitFor(async () => {
      await user.click(await screen.findByText('stegvisning.start.button'))
      expect(navigateMock).toHaveBeenCalledWith(paths.utenlandsopphold)
    })
  })

  it('nullstiller cachen for /person kall når brukeren klikker på Neste og at kallet har feilet', async () => {
    mockErrorResponse('/v1/person')
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

    render(<Step0 />)
    await waitFor(async () => {
      await user.click(screen.getByText('stegvisning.start.button'))
      expect(navigateMock).toHaveBeenCalledWith(paths.utenlandsopphold)
      expect(invalidateTagsMock).toHaveBeenCalledWith(['Person'])
    })
  })

  it('nullstiller cachen for /inntekt kall når brukeren klikker på Neste og at kallet har feilet', async () => {
    mockErrorResponse('/inntekt')
    const user = userEvent.setup()
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )

    let invalidateTagsMock = vi
      .spyOn(apiSliceUtils.apiSlice.util, 'invalidateTags')
      .mockReturnValue({
        type: 'something',
        payload: ['Inntekt'],
      })
    invalidateTagsMock = Object.assign(invalidateTagsMock, { match: vi.fn() })

    render(<Step0 />)
    await waitFor(async () => {
      await user.click(screen.getByText('stegvisning.start.button'))
      expect(navigateMock).toHaveBeenCalledWith(paths.utenlandsopphold)
      expect(invalidateTagsMock).toHaveBeenCalledWith(['Inntekt'])
    })
  })

  it('redirigerer til landingssiden når brukeren klikker på Avbryt', async () => {
    const user = userEvent.setup()
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    render(<Step0 />)
    await waitFor(async () => {
      await user.click(screen.getByText('stegvisning.avbryt'))
      expect(navigateMock).toHaveBeenCalledWith(paths.login)
    })
  })

  it('redirigerer til feilside dersom bruker er født før 1963', async () => {
    mockResponse('/v1/person', {
      json: {
        fornavn: 'Test',
        sivilstand: 'UGIFT',
        foedselsdato: '1960-12-31',
      },
    })
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    render(<Step0 />)

    // expect(navigateMock).toHaveBeenCalledWith(paths.henvisning1963)
    await waitFor(async () => {
      expect(navigateMock).toHaveBeenCalledWith(paths.henvisning1963)
    })
  })

  it('redirigerer til feilside dersom bruker har uføretrygd eller gjenlevendepensjon', async () => {
    mockResponse('/sak-status', {
      json: {
        harUfoeretrygdEllerGjenlevendeytelse: true,
      },
    })
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    render(<Step0 />)

    // expect(navigateMock).toHaveBeenCalledWith(paths.henvisning1963)
    await waitFor(async () => {
      expect(navigateMock).toHaveBeenCalledWith(
        paths.henvisningUfoeretrygdGjenlevendepensjon
      )
    })
  })
})

import * as ReactRouterUtils from 'react-router'

import { describe, it, vi } from 'vitest'

import { Start } from '..'
import { render, screen, waitFor, userEvent } from '@/test-utils'

describe('stegvisning - Start', () => {
  const onCancelMock = vi.fn()
  const onNextMock = vi.fn()

  const loependeVedtak = {
    alderspensjon: {
      loepende: false,
      grad: 0,
    },
    ufoeretrygd: {
      loepende: false,
      grad: 0,
    },
    afpPrivat: {
      loepende: false,
      grad: 0,
    },
    afpOffentlig: {
      loepende: false,
      grad: 0,
    },
  }

  it('kaller navigate når shouldRedirectTo er angitt', async () => {
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    const randomPath = '/random-path'

    render(
      <Start
        shouldRedirectTo={randomPath}
        navn=""
        loependeVedtak={loependeVedtak}
        onCancel={onCancelMock}
        onNext={onNextMock}
      />
    )
    expect(navigateMock).toHaveBeenCalledWith(randomPath)
  })

  it('rendrer slik den skal med navn, med riktig heading, bilde, tekst og knapper', async () => {
    const result = render(
      <Start
        navn="Ola"
        loependeVedtak={loependeVedtak}
        onCancel={onCancelMock}
        onNext={onNextMock}
      />
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        'stegvisning.start.title Ola!'
      )
      expect(result.asFragment()).toMatchSnapshot()
    })
  })

  it('rendrer slik den skal uten navn, med riktig heading, bilde, tekst og knapper', async () => {
    const result = render(
      <Start
        navn=""
        loependeVedtak={loependeVedtak}
        onCancel={onCancelMock}
        onNext={onNextMock}
      />
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        'stegvisning.start.title!'
      )
      expect(result.asFragment()).toMatchSnapshot()
    })
  })

  it('rendrer slik den skal med vedtak om alderspensjon', async () => {
    const result = render(
      <Start
        navn="Ola"
        loependeVedtak={{
          alderspensjon: {
            loepende: true,
            grad: 50,
          },
          ufoeretrygd: {
            loepende: false,
            grad: 0,
          },
          afpPrivat: {
            loepende: false,
            grad: 0,
          },
          afpOffentlig: {
            loepende: false,
            grad: 0,
          },
        }}
        onCancel={onCancelMock}
        onNext={onNextMock}
      />
    )

    await waitFor(() => {
      expect(
        screen.getByText(
          'Vil du sjekke hva du kan få hvis du endrer uttaket, må du gå til',
          { exact: false }
        )
      ).toBeVisible()
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        'stegvisning.start.title Ola!'
      )
      expect(screen.getByText('Du har nå', { exact: false })).toBeVisible()
      expect(
        screen.getByText('50 % alderspensjon', { exact: false })
      ).toBeVisible()
      expect(result.asFragment()).toMatchSnapshot()
    })
  })

  it('rendrer slik den skal med vedtak om alderspensjon og uføregrad', async () => {
    const result = render(
      <Start
        navn="Ola"
        loependeVedtak={{
          alderspensjon: {
            loepende: true,
            grad: 50,
          },
          ufoeretrygd: {
            loepende: true,
            grad: 80,
          },
          afpPrivat: {
            loepende: false,
            grad: 0,
          },
          afpOffentlig: {
            loepende: false,
            grad: 0,
          },
        }}
        onCancel={onCancelMock}
        onNext={onNextMock}
      />
    )

    await waitFor(() => {
      expect(
        screen.getByText(
          'Vil du sjekke hva du kan få hvis du endrer uttaket, må du gå til',
          { exact: false }
        )
      ).toBeVisible()
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        'stegvisning.start.title Ola!'
      )
      expect(screen.getByText('Du har nå', { exact: false })).toBeVisible()
      expect(
        screen.getByText('50 % alderspensjon', { exact: false })
      ).toBeVisible()
      expect(
        screen.getByText('80 % uføretrygd', { exact: false })
      ).toBeVisible()
      expect(result.asFragment()).toMatchSnapshot()
    })
  })

  it('rendrer slik den skal med vedtak om alderspensjon og AFP privat', async () => {
    const result = render(
      <Start
        navn="Ola"
        loependeVedtak={{
          alderspensjon: {
            loepende: true,
            grad: 50,
          },
          ufoeretrygd: {
            loepende: false,
            grad: 0,
          },
          afpPrivat: {
            loepende: true,
            grad: 100,
          },
          afpOffentlig: {
            loepende: false,
            grad: 0,
          },
        }}
        onCancel={onCancelMock}
        onNext={onNextMock}
      />
    )

    await waitFor(() => {
      expect(
        screen.getByText(
          'Vil du sjekke hva du kan få hvis du endrer uttaket, må du gå til',
          { exact: false }
        )
      ).toBeVisible()
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        'stegvisning.start.title Ola!'
      )
      expect(screen.getByText('Du har nå', { exact: false })).toBeVisible()
      expect(
        screen.getByText('50 % alderspensjon', { exact: false })
      ).toBeVisible()
      expect(
        screen.getByText('AFP i privat sektor', { exact: false })
      ).toBeVisible()
      expect(result.asFragment()).toMatchSnapshot()
    })
  })

  it('rendrer slik den skal med vedtak om alderspensjon og AFP offentlig', async () => {
    const result = render(
      <Start
        navn="Ola"
        loependeVedtak={{
          alderspensjon: {
            loepende: true,
            grad: 50,
          },
          ufoeretrygd: {
            loepende: false,
            grad: 0,
          },
          afpPrivat: {
            loepende: false,
            grad: 0,
          },
          afpOffentlig: {
            loepende: true,
            grad: 100,
          },
        }}
        onCancel={onCancelMock}
        onNext={onNextMock}
      />
    )

    await waitFor(() => {
      expect(
        screen.getByText(
          'Vil du sjekke hva du kan få hvis du endrer uttaket, må du gå til',
          { exact: false }
        )
      ).toBeVisible()
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        'stegvisning.start.title Ola!'
      )
      expect(screen.getByText('Du har nå', { exact: false })).toBeVisible()
      expect(
        screen.getByText('50 % alderspensjon', { exact: false })
      ).toBeVisible()
      expect(
        screen.getByText('AFP i offentlig sektor', { exact: false })
      ).toBeVisible()

      expect(result.asFragment()).toMatchSnapshot()
    })
  })

  it('kaller onNext når brukeren klikker på Neste', async () => {
    const user = userEvent.setup()
    render(
      <Start
        navn="Ola"
        loependeVedtak={loependeVedtak}
        onCancel={onCancelMock}
        onNext={onNextMock}
      />
    )
    await user.click(screen.getByText('stegvisning.start.button'))
    expect(onNextMock).toHaveBeenCalled()
  })

  it('viser ikke avbryt knapp når onCancel ikke er definert', async () => {
    render(
      <Start
        navn="Ola"
        loependeVedtak={loependeVedtak}
        onCancel={undefined}
        onNext={onNextMock}
      />
    )
    expect(screen.queryByText('stegvisning.avbryt')).not.toBeInTheDocument()
  })

  it('viser ikke avbryt knapp når onCancel ikke er definert', async () => {
    render(
      <Start
        navn="Ola"
        loependeVedtak={loependeVedtak}
        onCancel={undefined}
        onNext={onNextMock}
      />
    )
    expect(screen.queryByText('stegvisning.avbryt')).not.toBeInTheDocument()
  })

  it('kaller onCancel når brukeren klikker på Avbryt', async () => {
    const user = userEvent.setup()
    render(
      <Start
        navn="Ola"
        loependeVedtak={loependeVedtak}
        onCancel={onCancelMock}
        onNext={onNextMock}
      />
    )
    expect(screen.getByText('stegvisning.avbryt')).toBeInTheDocument()
    await user.click(screen.getByText('stegvisning.avbryt'))
    expect(onCancelMock).toHaveBeenCalled()
  })
})

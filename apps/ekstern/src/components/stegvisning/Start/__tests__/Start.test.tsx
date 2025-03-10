import { describe, it, vi } from 'vitest'

import { Start } from '..'
import { render, screen, waitFor, userEvent } from '@/test-utils'

const navigateMock = vi.fn()
vi.mock(import('react-router'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

describe('stegvisning - Start', () => {
  const onCancelMock = vi.fn()
  const onNextMock = vi.fn()

  const loependeVedtak: LoependeVedtak = {
    ufoeretrygd: { grad: 0 },
  }

  it('kaller navigate når shouldRedirectTo er angitt', async () => {
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

  it('rendrer slik den skal med vedtak om alderspensjon', async () => {
    render(
      <Start
        navn="Ola"
        loependeVedtak={{
          alderspensjon: {
            grad: 50,
            fom: '2020-10-02',
            sivilstand: 'UGIFT',
          },
          ufoeretrygd: { grad: 0 },
        }}
        onCancel={onCancelMock}
        onNext={onNextMock}
      />
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        'stegvisning.start.title Ola!'
      )
      expect(screen.getByText('Du har nå', { exact: false })).toBeVisible()
      expect(
        screen.getByText('50 % alderspensjon', { exact: false })
      ).toBeVisible()
    })
  })

  it('rendrer slik den skal med vedtak om alderspensjon og uføregrad', async () => {
    render(
      <Start
        navn="Ola"
        loependeVedtak={{
          alderspensjon: {
            grad: 50,
            fom: '2020-10-02',
            sivilstand: 'UGIFT',
          },
          ufoeretrygd: { grad: 80 },
        }}
        onCancel={onCancelMock}
        onNext={onNextMock}
      />
    )

    await waitFor(() => {
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
    })
  })

  it('rendrer slik den skal med vedtak om alderspensjon og AFP privat', async () => {
    render(
      <Start
        navn="Ola"
        loependeVedtak={{
          alderspensjon: {
            grad: 50,
            fom: '2020-10-02',
            sivilstand: 'UGIFT',
          },
          ufoeretrygd: {
            grad: 0,
          },
          afpPrivat: {
            fom: '2020-10-02',
          },
        }}
        onCancel={onCancelMock}
        onNext={onNextMock}
      />
    )

    await waitFor(() => {
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
    })
  })

  it('rendrer slik den skal med vedtak om alderspensjon og AFP offentlig', async () => {
    render(
      <Start
        navn="Ola"
        loependeVedtak={{
          alderspensjon: {
            grad: 50,
            fom: '2020-10-02',
            sivilstand: 'UGIFT',
          },
          ufoeretrygd: {
            grad: 0,
          },
          afpOffentlig: {
            fom: '2020-10-02',
          },
        }}
        onCancel={onCancelMock}
        onNext={onNextMock}
      />
    )

    await waitFor(() => {
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
    })
  })

  it('rendrer slik den skal med fremtidig vedtak', async () => {
    render(
      <Start
        navn="Ola"
        loependeVedtak={{
          ufoeretrygd: {
            grad: 0,
          },
          fremtidigAlderspensjon: {
            grad: 100,
            fom: '2099-01-01',
          },
        }}
        onCancel={onCancelMock}
        onNext={onNextMock}
      />
    )

    await waitFor(() => {
      expect(
        screen.getByText('stegvisning.fremtidigvedtak.alert')
      ).toBeVisible()
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        'stegvisning.start.title Ola!'
      )
    })
  })

  it('rendrer slik den skal med vedtak om alderspensjon og fremtidig vedtak', async () => {
    render(
      <Start
        navn="Ola"
        loependeVedtak={{
          alderspensjon: {
            grad: 50,
            fom: '2020-10-02',
            sivilstand: 'UGIFT',
          },
          ufoeretrygd: {
            grad: 0,
          },
          fremtidigAlderspensjon: {
            grad: 100,
            fom: '2099-01-01',
          },
        }}
        onCancel={onCancelMock}
        onNext={onNextMock}
      />
    )

    await waitFor(() => {
      expect(
        screen.getByText('stegvisning.fremtidigvedtak.endring.alert')
      ).toBeVisible()
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        'stegvisning.start.title Ola!'
      )
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

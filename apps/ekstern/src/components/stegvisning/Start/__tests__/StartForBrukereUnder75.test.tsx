import { describe, it, vi } from 'vitest'

import { render, screen, userEvent } from '@/test-utils'

import { StartForBrukereUnder75 } from '..'

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
    harLoependeVedtak: false,
    ufoeretrygd: { grad: 0 },
  }

  it('rendrer slik den skal med navn, med riktig heading, bilde, tekst og knapper', async () => {
    render(
      <StartForBrukereUnder75
        navn="Ola"
        loependeVedtak={loependeVedtak}
        onCancel={onCancelMock}
        onNext={onNextMock}
      />
    )

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'stegvisning.start.title Ola!'
    )
  })

  it('rendrer slik den skal med vedtak om alderspensjon', async () => {
    render(
      <StartForBrukereUnder75
        navn="Ola"
        loependeVedtak={{
          harLoependeVedtak: true,
          alderspensjon: {
            grad: 50,
            uttaksgradFom: '2020-10-02',
            fom: '2020-10-02',
            sivilstand: 'UGIFT',
          },
          ufoeretrygd: { grad: 0 },
        }}
        onCancel={onCancelMock}
        onNext={onNextMock}
      />
    )

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'stegvisning.start.title Ola!'
    )
    expect(screen.getByText('Du har nå', { exact: false })).toBeVisible()
    expect(
      screen.getByText('50 % alderspensjon', { exact: false })
    ).toBeVisible()
    expect(
      screen.queryByText('uføretrygd', { exact: false })
    ).not.toBeInTheDocument()
    expect(screen.queryByText('AFP', { exact: false })).not.toBeInTheDocument()
    expect(
      screen.getByText(
        'Her kan du sjekke hva du kan få hvis du vil endre alderspensjonen din.',
        { exact: false }
      )
    ).toBeVisible()
  })

  it('rendrer slik den skal med vedtak om alderspensjon og uføregrad', async () => {
    render(
      <StartForBrukereUnder75
        navn="Ola"
        loependeVedtak={{
          harLoependeVedtak: true,
          alderspensjon: {
            grad: 50,
            uttaksgradFom: '2020-10-02',
            fom: '2020-10-02',
            sivilstand: 'UGIFT',
          },
          ufoeretrygd: { grad: 80 },
        }}
        onCancel={onCancelMock}
        onNext={onNextMock}
      />
    )

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'stegvisning.start.title Ola!'
    )
    expect(screen.getByText('Du har nå', { exact: false })).toBeVisible()
    expect(
      screen.getByText('50 % alderspensjon', { exact: false })
    ).toBeVisible()
    expect(screen.getByText('80 % uføretrygd', { exact: false })).toBeVisible()
  })

  it('rendrer slik den skal med vedtak om alderspensjon og AFP privat', async () => {
    render(
      <StartForBrukereUnder75
        navn="Ola"
        loependeVedtak={{
          harLoependeVedtak: true,
          alderspensjon: {
            grad: 50,
            uttaksgradFom: '2020-10-02',
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

  it('rendrer slik den skal med vedtak om alderspensjon og AFP offentlig', async () => {
    render(
      <StartForBrukereUnder75
        navn="Ola"
        loependeVedtak={{
          harLoependeVedtak: true,
          alderspensjon: {
            grad: 50,
            uttaksgradFom: '2020-10-02',
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

  it('rendrer slik den skal med fremtidig vedtak', async () => {
    render(
      <StartForBrukereUnder75
        navn="Ola"
        loependeVedtak={{
          harLoependeVedtak: true,
          ufoeretrygd: {
            grad: 0,
          },
          fremtidigAlderspensjon: {
            grad: 100,
            fom: '2099-12-01',
          },
        }}
        onCancel={onCancelMock}
        onNext={onNextMock}
      />
    )

    expect(
      screen.getByText(
        'Du har vedtak om 100 % alderspensjon fra 01.12.2099. Frem til denne datoen kan du gjøre en ny beregning av andre alternativer.'
      )
    ).toBeVisible()
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'stegvisning.start.title Ola!'
    )
    expect(screen.getByText('stegvisning.start.button')).toBeVisible()
  })

  it('rendrer slik den skal med vedtak om alderspensjon og fremtidig vedtak', async () => {
    render(
      <StartForBrukereUnder75
        navn="Ola"
        loependeVedtak={{
          harLoependeVedtak: true,
          alderspensjon: {
            grad: 50,
            uttaksgradFom: '2020-10-02',
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

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'stegvisning.start.title Ola!'
    )
    expect(
      screen.getByText(
        'Du har nå . Du har endret til . Du kan ikke gjøre en ny beregning her før denne datoen.',
        { exact: false }
      )
    ).toBeVisible()
    expect(screen.getByText('50 % alderspensjon')).toBeVisible()
    expect(screen.getByText('100 % alderspensjon fra 01.01.2099')).toBeVisible()
    expect(
      screen.queryByText('stegvisning.start.button')
    ).not.toBeInTheDocument()
  })

  it('rendrer slik den skal med vedtak om pre2025 offentlig Afp', async () => {
    render(
      <StartForBrukereUnder75
        navn="Ola"
        loependeVedtak={{
          harLoependeVedtak: true,
          ufoeretrygd: {
            grad: 0,
          },
          pre2025OffentligAfp: {
            fom: '2024-08-01',
          },
        }}
        onCancel={onCancelMock}
        onNext={onNextMock}
      />
    )

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'stegvisning.start.title Ola!'
    )
    expect(
      screen.getByTestId('stegvisning-start-ingress-pre2025-offentlig-afp')
    ).toBeVisible()
  })

  it('kaller onNext når brukeren klikker på Neste', async () => {
    const user = userEvent.setup()
    render(
      <StartForBrukereUnder75
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
      <StartForBrukereUnder75
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
      <StartForBrukereUnder75
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
      <StartForBrukereUnder75
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

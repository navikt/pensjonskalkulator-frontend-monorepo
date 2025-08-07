import { describe, it, vi } from 'vitest'

import { render, screen, userEvent, waitFor } from '@/test-utils'

import { AFPOvergangskullUtenAP } from '..'

const navigateMock = vi.fn()
vi.mock(import('react-router'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

describe('stegvisning - AFP - født mellom 1954-1962 uten vedtak om alderspensjon', () => {
  const onCancelMock = vi.fn()
  const onPreviousMock = vi.fn()
  const onNextMock = vi.fn()

  it('rendrer slik den skal når afp og skalBeregneAfpKap19 ikke er oppgitt', async () => {
    render(
      <AFPOvergangskullUtenAP
        previousAfp={null}
        previousAfpUtregningValg={null}
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'stegvisning.afp.title'
    )

    expect(
      screen.queryByTestId('om_livsvarig_AFP_i_privat_sektor')
    ).toBeVisible()
    expect(
      screen.getByText('stegvisning.afpOvergangskull.readmore_offentlig_title')
    ).toBeVisible()

    const radioButtons = await screen.findAllByRole('radio')
    await waitFor(() => {
      expect(radioButtons).toHaveLength(4)
      expect(radioButtons[0]).not.toBeChecked()
      expect(radioButtons[1]).not.toBeChecked()
      expect(radioButtons[2]).not.toBeChecked()
      expect(radioButtons[3]).not.toBeChecked()
    })
  })

  it('rendrer slik den skal når afp er oppgitt', async () => {
    render(
      <AFPOvergangskullUtenAP
        previousAfp="nei"
        previousAfpUtregningValg={null}
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'stegvisning.afp.title'
    )
    const radioButtons = screen.getAllByRole('radio')
    await waitFor(() => {
      expect(radioButtons).toHaveLength(4)
      expect(radioButtons[0]).not.toBeChecked()
      expect(radioButtons[1]).not.toBeChecked()
      expect(radioButtons[2]).toBeChecked()
      expect(radioButtons[3]).not.toBeChecked()
    })
  })

  it('viser infomelding når brukeren velger "Vet ikke"', async () => {
    const user = userEvent.setup()
    render(
      <AFPOvergangskullUtenAP
        previousAfp={null}
        previousAfpUtregningValg={null}
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'stegvisning.afp.title'
    )
    const radioButtons = screen.getAllByRole('radio')
    expect(
      screen.queryByText('stegvisning.afp.alert_vet_ikke')
    ).not.toBeInTheDocument()

    await user.click(radioButtons[0])

    expect(
      screen.queryByText('stegvisning.afp.alert_vet_ikke')
    ).not.toBeInTheDocument()

    await user.click(radioButtons[1])

    expect(
      screen.queryByText('stegvisning.afp.alert_vet_ikke')
    ).not.toBeInTheDocument()

    await user.click(radioButtons[2])

    expect(
      screen.queryByText('stegvisning.afp.alert_vet_ikke')
    ).not.toBeInTheDocument()

    await user.click(radioButtons[3])

    expect(screen.queryByText('stegvisning.afp.alert_vet_ikke')).toBeVisible()
  })

  it('validerer, viser feilmelding, fjerner feilmelding og kaller onNext når brukeren klikker på Neste', async () => {
    const user = userEvent.setup()
    render(
      <AFPOvergangskullUtenAP
        previousAfp={null}
        previousAfpUtregningValg={null}
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )

    await user.click(screen.getByText('stegvisning.neste'))

    expect(screen.getByText('stegvisning.afp.validation_error')).toBeVisible()
    expect(onNextMock).not.toHaveBeenCalled()

    await user.click(
      screen.getByRole('radio', { name: 'stegvisning.afp.radio_ja_offentlig' })
    )

    expect(
      screen.queryByText('stegvisning.afp.validation_error')
    ).not.toBeInTheDocument()

    await user.click(screen.getByText('stegvisning.neste'))

    expect(
      screen.getByText('stegvisning.afpOverganskull.validation_error')
    ).toBeVisible()
    expect(onNextMock).not.toHaveBeenCalled()

    await user.click(
      screen.getByRole('radio', {
        name: 'stegvisning.afp.overgangskullUtenAP.radio_ja',
      })
    )

    expect(
      screen.queryByText('stegvisning.afpOverganskull.validation_error')
    ).not.toBeInTheDocument()

    await user.click(screen.getByText('stegvisning.neste'))
    expect(onNextMock).toHaveBeenCalled()
  })

  it('kaller onNext når brukeren klikker på Neste', async () => {
    const user = userEvent.setup()
    render(
      <AFPOvergangskullUtenAP
        previousAfp={null}
        previousAfpUtregningValg={null}
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )
    const radioButtons = screen.getAllByRole('radio')
    await user.click(radioButtons[0])
    await user.click(
      screen.getByRole('radio', {
        name: 'stegvisning.afp.overgangskullUtenAP.radio_ja',
      })
    )
    await user.click(screen.getByText('stegvisning.neste'))
    expect(onNextMock).toHaveBeenCalled()
  })

  it('kaller onPrevious når brukeren klikker på Tilbake', async () => {
    const user = userEvent.setup()
    render(
      <AFPOvergangskullUtenAP
        previousAfp="ja_privat"
        previousAfpUtregningValg={null}
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )
    await user.click(screen.getByText('stegvisning.tilbake'))
    expect(onPreviousMock).toHaveBeenCalled()
  })

  it('kaller onCancelMock når brukeren klikker på Avbryt', async () => {
    const user = userEvent.setup()
    render(
      <AFPOvergangskullUtenAP
        previousAfp="ja_privat"
        previousAfpUtregningValg={null}
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )

    await user.click(screen.getByText('stegvisning.avbryt'))

    expect(screen.getByText('stegvisning.avbryt')).toBeInTheDocument()
    await user.click(screen.getByText('stegvisning.avbryt'))
    expect(onCancelMock).toHaveBeenCalled()
  })

  it('viser ikke avbryt knapp når onCancel ikke er definert', async () => {
    render(
      <AFPOvergangskullUtenAP
        previousAfp={null}
        previousAfpUtregningValg={null}
        onCancel={undefined}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )
    expect(screen.queryByText('stegvisning.avbryt')).not.toBeInTheDocument()
  })
})

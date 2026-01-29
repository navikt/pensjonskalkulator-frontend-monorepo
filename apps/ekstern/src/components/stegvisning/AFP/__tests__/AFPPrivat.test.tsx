import { describe, it, vi } from 'vitest'

import { render, screen, userEvent, waitFor } from '@/test-utils'

import { AFPPrivat } from '..'

const navigateMock = vi.fn()
vi.mock(import('react-router'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

describe('stegvisning - AFP - født før 1963 og og fylt 67 år, eller født før 1963 og har vedtak om alderspensjon', () => {
  const onCancelMock = vi.fn()
  const onPreviousMock = vi.fn()
  const onNextMock = vi.fn()

  it('rendrer slik den skal når afp ikke er oppgitt', async () => {
    render(
      <AFPPrivat
        previousAfp={null}
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'stegvisning.afpPrivat.title'
    )

    expect(
      screen.queryByTestId('om_livsvarig_AFP_i_privat_sektor')
    ).toBeVisible()

    const radioButtons = await screen.findAllByRole('radio')
    await waitFor(() => {
      expect(radioButtons).toHaveLength(2)
      expect(radioButtons[0]).not.toBeChecked()
      expect(radioButtons[1]).not.toBeChecked()
    })
  })

  it('rendrer slik den skal når afp er oppgitt', async () => {
    render(
      <AFPPrivat
        previousAfp="nei"
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'stegvisning.afpPrivat.title'
    )
    const radioButtons = screen.getAllByRole('radio')
    await waitFor(() => {
      expect(radioButtons).toHaveLength(2)
      expect(radioButtons[0]).not.toBeChecked()
      expect(radioButtons[1]).toBeChecked()
    })
  })

  it('validerer, viser feilmelding, fjerner feilmelding og kaller onNext når brukeren klikker på Neste', async () => {
    const user = userEvent.setup()
    render(
      <AFPPrivat
        previousAfp={null}
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )
    const radioButtons = screen.getAllByRole('radio')

    await user.click(screen.getByText('stegvisning.neste'))

    expect(
      screen.getByText('stegvisning.afpPrivat.validation_error')
    ).toBeInTheDocument()
    expect(onNextMock).not.toHaveBeenCalled()

    await user.click(radioButtons[0])

    expect(
      screen.queryByText('stegvisning.afpPrivat.validation_error')
    ).not.toBeInTheDocument()

    await user.click(screen.getByText('stegvisning.neste'))

    expect(onNextMock).toHaveBeenCalled()
  })

  it('kaller onNext når brukeren klikker på Neste', async () => {
    const user = userEvent.setup()
    render(
      <AFPPrivat
        previousAfp={null}
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )
    const radioButtons = screen.getAllByRole('radio')
    await user.click(radioButtons[0])
    await user.click(screen.getByText('stegvisning.neste'))
    expect(onNextMock).toHaveBeenCalled()
  })

  it('kaller onPrevious når brukeren klikker på Tilbake', async () => {
    const user = userEvent.setup()
    render(
      <AFPPrivat
        previousAfp="ja_privat"
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
      <AFPPrivat
        previousAfp="ja_privat"
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
      <AFPPrivat
        previousAfp={null}
        onCancel={undefined}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )
    expect(screen.queryByText('stegvisning.avbryt')).not.toBeInTheDocument()
  })
})

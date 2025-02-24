import { describe, it, vi } from 'vitest'

import { AFP } from '..'
import { screen, render, waitFor, userEvent } from '@/test-utils'

const navigateMock = vi.fn()
vi.mock(import('react-router'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

describe('stegvisning - AFP', () => {
  const onCancelMock = vi.fn()
  const onPreviousMock = vi.fn()
  const onNextMock = vi.fn()

  it('kaller navigate når shouldRedirectTo er angitt', async () => {
    const randomPath = '/random-path'

    render(
      <AFP
        shouldRedirectTo={randomPath}
        afp={null}
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )
    expect(navigateMock).toHaveBeenCalledWith(randomPath)
  })

  it('rendrer slik den skal når afp ikke er oppgitt', async () => {
    const user = userEvent.setup()
    const result = render(
      <AFP
        afp={null}
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'stegvisning.afp.title'
    )

    await user.click(screen.getByText('stegvisning.afp.readmore_privat_title'))
    await user.click(
      screen.getByText('stegvisning.afp.readmore_offentlig_title')
    )

    expect(result.asFragment()).toMatchSnapshot()

    const radioButtons = await screen.findAllByRole('radio')
    await waitFor(() => {
      expect(radioButtons).toHaveLength(4)
      expect(radioButtons[0]).not.toBeChecked()
      expect(radioButtons[1]).not.toBeChecked()
      expect(radioButtons[2]).not.toBeChecked()
      expect(radioButtons[3]).not.toBeChecked()
      expect(result.asFragment()).toMatchSnapshot()
    })
  })

  it('rendrer slik den skal når afp er oppgitt', async () => {
    const result = render(
      <AFP
        afp="nei"
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
      expect(result.asFragment()).toMatchSnapshot()
    })
  })

  it('viser riktig infomeldinger når brukeren klikker på de ulike valgene', async () => {
    const user = userEvent.setup()
    render(
      <AFP
        afp={null}
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

    expect(
      screen.queryByText('stegvisning.afp.alert_vet_ikke')
    ).toBeInTheDocument()
  })

  it('validerer, viser feilmelding, fjerner feilmelding og kaller onNext når brukeren klikker på Neste', async () => {
    const user = userEvent.setup()
    render(
      <AFP
        afp={null}
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )
    const radioButtons = screen.getAllByRole('radio')

    await user.click(screen.getByText('stegvisning.neste'))

    waitFor(() => {
      expect(
        screen.getByText('stegvisning.afp.validation_error')
      ).toBeInTheDocument()
      expect(onNextMock).not.toHaveBeenCalled()
    })

    await user.click(radioButtons[0])

    expect(
      screen.queryByText('stegvisning.afp.validation_error')
    ).not.toBeInTheDocument()

    await user.click(screen.getByText('stegvisning.neste'))

    waitFor(() => {
      expect(onNextMock).toHaveBeenCalled()
    })
  })

  it('kaller onNext når brukeren klikker på Neste', async () => {
    const user = userEvent.setup()
    render(
      <AFP
        afp={null}
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )
    const radioButtons = screen.getAllByRole('radio')
    await user.click(radioButtons[0])
    await user.click(screen.getByText('stegvisning.neste'))
    waitFor(() => {
      expect(onNextMock).toHaveBeenCalled()
    })
  })

  it('kaller onPrevious når brukeren klikker på Tilbake', async () => {
    const user = userEvent.setup()
    render(
      <AFP
        afp="ja_privat"
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
      <AFP
        afp="ja_privat"
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )

    await user.click(screen.getByText('stegvisning.avbryt'))

    expect(screen.getByText('stegvisning.avbryt')).toBeInTheDocument()
    await user.click(screen.getByText('stegvisning.avbryt'))
    waitFor(() => {
      expect(onCancelMock).toHaveBeenCalled()
    })
  })

  it('viser ikke avbryt knapp når onCancel ikke er definert', async () => {
    render(
      <AFP
        afp={null}
        onCancel={undefined}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )
    expect(screen.queryByText('stegvisning.avbryt')).not.toBeInTheDocument()
  })
})

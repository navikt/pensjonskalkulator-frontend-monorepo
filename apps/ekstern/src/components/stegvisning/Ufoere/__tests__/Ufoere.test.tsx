import { describe, it, vi } from 'vitest'

import { RootState } from '@/state/store'
import { render, screen, userEvent, waitFor } from '@/test-utils'

import { Ufoere } from '..'

describe('stegvisning - Ufoere', () => {
  const onCancelMock = vi.fn()
  const onPreviousMock = vi.fn()
  const onNextMock = vi.fn()

  it('rendrer slik den skal', async () => {
    render(
      <Ufoere
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'stegvisning.ufoere.title'
    )

    expect(screen.getByTestId('ufoere-info')).toHaveTextContent(
      'Før du fyller 62 år må du'
    )

    await waitFor(() => {
      expect(screen.getByTestId('om_UT_AFP')).toBeVisible()
    })
    expect(screen.getByTestId('ufoere-ingress')).toHaveTextContent(
      'Du kan få hjelp til å vurdere alternativene dine.'
    )
  })

  it('kaller onNext når brukeren klikker på Neste', async () => {
    const user = userEvent.setup()
    render(
      <Ufoere
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )
    await user.click(screen.getByText('stegvisning.neste'))

    expect(onNextMock).toHaveBeenCalled()
  })

  it('kaller onPrevious når brukeren klikker på Tilbake', async () => {
    const user = userEvent.setup()
    render(
      <Ufoere
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />,
      {
        preloadedState: {
          userInput: { afp: 'ja_privat' },
        } as RootState,
      }
    )

    await user.click(screen.getByText('stegvisning.tilbake'))
    expect(onPreviousMock).toHaveBeenCalled()
  })

  it('kaller onCancelMock når brukeren klikker på Avbryt', async () => {
    const user = userEvent.setup()
    render(
      <Ufoere
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )

    await user.click(screen.getByText('stegvisning.avbryt'))
    expect(onCancelMock).toHaveBeenCalled()
  })

  it('viser ikke avbryt knapp når onCancel ikke er definert', async () => {
    render(
      <Ufoere
        onCancel={undefined}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )
    expect(screen.queryByText('stegvisning.avbryt')).not.toBeInTheDocument()
  })
})

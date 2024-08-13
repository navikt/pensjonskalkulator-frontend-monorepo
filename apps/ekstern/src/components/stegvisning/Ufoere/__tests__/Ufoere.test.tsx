import { describe, it, vi } from 'vitest'

import { Ufoere } from '..'
import { RootState } from '@/state/store'
import { screen, render, waitFor, userEvent } from '@/test-utils'

describe('stegvisning - Ufoere', () => {
  const onCancelMock = vi.fn()
  const onPreviousMock = vi.fn()
  const onNextMock = vi.fn()

  it('rendrer slik den skal', async () => {
    const user = userEvent.setup()
    const result = render(
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

    await user.click(screen.getByText('stegvisning.ufoere.readmore_1.title'))
    expect(
      await screen.findByText(
        'For å ha rett til AFP, kan du ikke ha fått utbetalt uføretrygd',
        { exact: false }
      )
    ).toBeVisible()
    expect(screen.getByTestId('ufoere-ingress')).toHaveTextContent(
      'Du kan få hjelp til å finne ut hva som lønner seg'
    )
    expect(result.asFragment()).toMatchSnapshot()
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

    waitFor(() => {
      expect(onNextMock).toHaveBeenCalled()
    })
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
    waitFor(() => {
      expect(onCancelMock).toHaveBeenCalled()
    })
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

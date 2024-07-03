import { describe, it, vi } from 'vitest'

import { Utenlandsopphold } from '..'
import { RootState } from '@/state/store'
import { userInputInitialState } from '@/state/userInput/userInputReducer'
import { screen, render, waitFor, userEvent } from '@/test-utils'

describe('stegvisning - Utenlandsopphold', () => {
  const onCancelMock = vi.fn()
  const onPreviousMock = vi.fn()
  const onNextMock = vi.fn()

  it('rendrer slik den skal når spørsmålet om utenlandsopphold ikke er besvart', async () => {
    const result = render(
      <Utenlandsopphold
        harUtenlandsopphold={null}
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'stegvisning.utenlandsopphold.title'
    )
    expect(
      screen.getByText('stegvisning.utenlandsopphold.ingress')
    ).toBeVisible()
    expect(
      screen.getByText(
        'stegvisning.utenlandsopphold.readmore_opphold_utenfor_norge.title'
      )
    ).toBeVisible()
    expect(
      screen.getByText(
        'stegvisning.utenlandsopphold.readmore_konsekvenser.title'
      )
    ).toBeVisible()
    const radioButtons = screen.getAllByRole('radio')

    await waitFor(() => {
      expect(screen.getAllByRole('radio')).toHaveLength(2)
      expect(radioButtons[0]).not.toBeChecked()
      expect(radioButtons[1]).not.toBeChecked()
      expect(result.asFragment()).toMatchSnapshot()
    })
  })

  describe('rendrer slik den skal når spørsmålet om utenlandsopphold er besvart', async () => {
    it('Når harUtenlandsopphold er false', async () => {
      render(
        <Utenlandsopphold
          harUtenlandsopphold={false}
          onCancel={onCancelMock}
          onPrevious={onPreviousMock}
          onNext={onNextMock}
        />
      )
      const radioButtons = screen.getAllByRole('radio')
      await waitFor(() => {
        expect(screen.getAllByRole('radio')).toHaveLength(2)
        expect(radioButtons[0]).not.toBeChecked()
        expect(radioButtons[1]).toBeChecked()
        expect(
          screen.queryByText('stegvisning.utenlandsopphold.oppholdene.title')
        ).not.toBeInTheDocument()
      })
    })

    it('Når harUtenlandsopphold er true', async () => {
      render(
        <Utenlandsopphold
          harUtenlandsopphold={true}
          onCancel={onCancelMock}
          onPrevious={onPreviousMock}
          onNext={onNextMock}
        />
      )
      const radioButtons = screen.getAllByRole('radio')
      await waitFor(async () => {
        expect(screen.getAllByRole('radio')).toHaveLength(2)
        expect(radioButtons[0]).toBeChecked()
        expect(radioButtons[1]).not.toBeChecked()
        expect(
          await screen.findByText(
            'stegvisning.utenlandsopphold.oppholdene.title'
          )
        ).toBeVisible()
        expect(
          await screen.findByText(
            'stegvisning.utenlandsopphold.oppholdene.description'
          )
        ).toBeVisible()
        expect(
          await screen.findByText(
            'stegvisning.utenlandsopphold.oppholdene.button'
          )
        ).toBeVisible()
      })
    })
  })

  it('validerer, viser feilmelding, fjerner feilmelding og kaller onNext når brukeren klikker på Neste', async () => {
    const user = userEvent.setup()
    render(
      <Utenlandsopphold
        harUtenlandsopphold={null}
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )

    await user.click(screen.getByText('stegvisning.neste'))

    expect(
      await screen.findByText('stegvisning.utenlandsopphold.validation_error')
    ).toBeInTheDocument()
    expect(onNextMock).not.toHaveBeenCalled()

    const radioButtons = screen.getAllByRole('radio')

    await user.click(radioButtons[1])

    expect(
      screen.queryByText('stegvisning.utenlandsopphold.validation_error')
    ).not.toBeInTheDocument()

    await user.click(screen.getByText('stegvisning.neste'))

    waitFor(() => {
      expect(onNextMock).toHaveBeenCalled()
    })
  })

  it('kaller onPrevious når brukeren klikker på Tilbake', async () => {
    const user = userEvent.setup()
    render(
      <Utenlandsopphold
        harUtenlandsopphold={false}
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />,
      {
        preloadedState: {
          userInput: { ...userInputInitialState, harUtenlandsopphold: false },
        } as RootState,
      }
    )
    const radioButtons = screen.getAllByRole('radio')
    expect(radioButtons[1]).toBeChecked()
    await user.click(screen.getByText('stegvisning.tilbake'))
    waitFor(() => {
      expect(onPreviousMock).toHaveBeenCalled()
    })
  })

  it('kaller onCancelMock når brukeren klikker på Avbryt', async () => {
    const user = userEvent.setup()
    render(
      <Utenlandsopphold
        harUtenlandsopphold={false}
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )
    expect(screen.getByText('stegvisning.avbryt')).toBeInTheDocument()
    await user.click(screen.getByText('stegvisning.avbryt'))
    waitFor(() => {
      expect(onCancelMock).toHaveBeenCalled()
    })
  })

  it('viser ikke avbryt knapp når onCancel ikke er definert', async () => {
    render(
      <Utenlandsopphold
        harUtenlandsopphold={null}
        onCancel={undefined}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )
    expect(screen.queryByText('stegvisning.avbryt')).not.toBeInTheDocument()
  })
})

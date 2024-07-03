import { describe, it, vi } from 'vitest'

import { UtenlandsoppholdMedHenvisning } from '..'
import { RootState } from '@/state/store'
import { screen, render, waitFor, userEvent } from '@/test-utils'

describe('stegvisning - UtenlandsoppholdMedHenvisning', () => {
  const onCancelMock = vi.fn()
  const onPreviousMock = vi.fn()
  const onNextMock = vi.fn()

  it('rendrer slik den skal når spørsmålet om utenlandsopphold ikke er besvart', async () => {
    const result = render(
      <UtenlandsoppholdMedHenvisning
        harUtenlandsopphold={null}
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'stegvisning.utenlandsopphold_med_henvisning.title'
    )
    const radioButtons = screen.getAllByRole('radio')

    await waitFor(() => {
      expect(screen.getAllByRole('radio')).toHaveLength(2)
      expect(radioButtons[0]).not.toBeChecked()
      expect(radioButtons[1]).not.toBeChecked()
      expect(result.asFragment()).toMatchSnapshot()
    })
  })

  describe('rendrer slik den skal når spørsmålet om utenlandsopphold er besvart', async () => {
    it('Når utenlandsopphold er false', async () => {
      render(
        <UtenlandsoppholdMedHenvisning
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
      })
    })

    it('Når utenlandsopphold er true', async () => {
      render(
        <UtenlandsoppholdMedHenvisning
          harUtenlandsopphold={true}
          onCancel={onCancelMock}
          onPrevious={onPreviousMock}
          onNext={onNextMock}
        />
      )
      const radioButtons = screen.getAllByRole('radio')
      await waitFor(() => {
        expect(screen.getAllByRole('radio')).toHaveLength(2)
        expect(radioButtons[0]).toBeChecked()
        expect(radioButtons[1]).not.toBeChecked()
      })
    })
  })

  it('validerer, viser feilmelding, fjerner feilmelding og kaller onNext når brukeren klikker på Neste', async () => {
    const user = userEvent.setup()
    render(
      <UtenlandsoppholdMedHenvisning
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
      <UtenlandsoppholdMedHenvisning
        harUtenlandsopphold={false}
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />,
      {
        preloadedState: {
          userInput: { harUtenlandsopphold: false },
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
      <UtenlandsoppholdMedHenvisning
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
      <UtenlandsoppholdMedHenvisning
        harUtenlandsopphold={null}
        onCancel={undefined}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )
    expect(screen.queryByText('stegvisning.avbryt')).not.toBeInTheDocument()
  })
})

import { describe, it, vi } from 'vitest'

import { LightBlueFooter } from '..'
import { paths } from '@/router/constants'
import { userInputInitialState } from '@/state/userInput/userInputSlice'
import { render, screen, userEvent } from '@/test-utils'

const navigateMock = vi.fn()
vi.mock(import('react-router'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

describe('LightBlueFooter', () => {
  it('rendrer med riktig tekst og knapper', () => {
    const { asFragment } = render(<LightBlueFooter />)
    expect(screen.getAllByRole('button')).toHaveLength(1)
    expect(asFragment()).toMatchSnapshot()
  })

  describe('Gitt at brukeren klikker på knappen, åpnes det modalen og brukeren kan avbryte eller gå tilbake til start ved bekreftelse', async () => {
    it('Når brukeren bekrefter, nullstiller input fra brukeren og redirigerer til første steg av stegvisning', async () => {
      const user = userEvent.setup()

      const { store } = render(<LightBlueFooter />, {
        preloadedState: {
          userInput: { ...userInputInitialState, samtykke: true },
        },
      })

      await user.click(screen.getByText('stegvisning.tilbake_start'))
      expect(
        await screen.findByText('stegvisning.tilbake_start.modal.title')
      ).toBeVisible()
      expect(
        await screen.findByText('stegvisning.tilbake_start.modal.avbryt')
      ).toBeVisible()
      expect(navigateMock).not.toHaveBeenCalled()
      expect(
        await screen.findByText('stegvisning.tilbake_start.modal.bekreft')
      ).toBeVisible()
      await user.click(
        screen.getByText('stegvisning.tilbake_start.modal.avbryt')
      )
      await user.click(screen.getByText('stegvisning.tilbake_start'))
      await user.click(
        screen.getByText('stegvisning.tilbake_start.modal.bekreft')
      )

      expect(navigateMock).toHaveBeenCalledWith(paths.start)
      expect(store.getState().userInput.samtykke).toBe(null)
    })
  })
})

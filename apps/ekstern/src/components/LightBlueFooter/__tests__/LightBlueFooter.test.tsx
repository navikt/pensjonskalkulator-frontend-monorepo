import * as ReactRouterUtils from 'react-router'

import { describe, it, vi } from 'vitest'

import { LightBlueFooter } from '..'
import { paths } from '@/router/constants'
import { userInputInitialState } from '@/state/userInput/userInputReducer'
import { render, screen, userEvent } from '@/test-utils'

describe('LightBlueFooter', () => {
  it('rendrer med riktig tekst og knapper', () => {
    const { asFragment } = render(<LightBlueFooter />)
    expect(screen.getAllByRole('button')).toHaveLength(1)
    expect(asFragment()).toMatchSnapshot()
  })

  describe('Gitt at brukeren klikker på knappen, åpnes det modalen og brukeren kan avbryte eller gå tilbake til start ved bekreftelse', async () => {
    it('Når brukeren bekrefter, nullstiller input fra brukeren og redirigerer til første steg av stegvisning', async () => {
      const user = userEvent.setup()
      const navigateMock = vi.fn()
      vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
        () => navigateMock
      )

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

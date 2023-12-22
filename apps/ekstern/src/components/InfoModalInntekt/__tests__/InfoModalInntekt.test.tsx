import { InfoModalInntekt } from '..'
import { render, screen, userEvent } from '@/test-utils'

describe('InfoModalInntekt', () => {
  describe('Gitt at brukeren ikke har noe inntekt', () => {
    it('brukeren kan åpne modal for å lese mer om pensjonsgivende inntekt', async () => {
      const user = userEvent.setup()
      render(<InfoModalInntekt />)

      const buttons = screen.getAllByRole('button')
      await user.click(buttons[2])
      await user.click(screen.getByText('grunnlag.inntekt.link'))
      expect(screen.getByText('grunnlag.inntekt.infomodal.title')).toBeVisible()
      expect(
        screen.getByText('grunnlag.inntekt.infomodal.subtitle')
      ).toBeVisible()
      await user.click(screen.getByText('grunnlag.inntekt.infomodal.lukk'))
      expect(
        screen.queryByText('grunnlag.inntekt.infomodal.title')
      ).not.toBeVisible()
    })
  })
})

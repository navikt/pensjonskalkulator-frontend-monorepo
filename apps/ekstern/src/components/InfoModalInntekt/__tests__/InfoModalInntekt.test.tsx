import { InfoModalInntekt } from '..'
import { render, screen, userEvent } from '@/test-utils'

describe('InfoModalInntekt', () => {
  describe('Gitt at brukeren ikke har noe inntekt', () => {
    it('brukeren kan åpne modal for å lese mer om pensjonsgivende inntekt', async () => {
      const user = userEvent.setup()
      render(<InfoModalInntekt />)
      await user.click(screen.getByText('inntekt.info_modal.open.link'))
      expect(screen.getByText('inntekt.info_modal.title')).toBeVisible()
      expect(screen.getByText('inntekt.info_modal.subtitle')).toBeVisible()
      await user.click(screen.getByText('inntekt.info_modal.lukk'))
      expect(screen.queryByText('inntekt.info_modal.title')).not.toBeVisible()
    })
  })
})

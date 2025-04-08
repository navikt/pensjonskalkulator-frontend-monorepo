import { externalUrls } from '@/router/constants'
import { render, screen, userEvent, waitFor } from '@/test-utils'

import { IngenTilgang } from '../IngenTilgang'

describe('IngenTilgang', () => {
  it('har riktig sidetittel', async () => {
    render(<IngenTilgang />)
    await waitFor(async () => {
      expect(document.title).toBe('application.title.stegvisning.uventet_feil')
    })
  })

  it('rendrer riktig innhold', () => {
    render(<IngenTilgang />)
    expect(screen.getByTestId('error-step-unexpected')).toBeVisible()
    expect(screen.getByText('error.fullmakt.title')).toBeVisible()
    expect(screen.getByText('error.fullmakt.ingress')).toBeVisible()
  })

  it('opens the external URL when the primary button is clicked', async () => {
    const user = userEvent.setup()
    const open = vi.fn()
    vi.stubGlobal('open', open)
    render(<IngenTilgang />)
    await user.click(screen.getByTestId('card-button-primary'))
    expect(open).toHaveBeenCalledWith(externalUrls.byttBruker, '_self')
  })
})

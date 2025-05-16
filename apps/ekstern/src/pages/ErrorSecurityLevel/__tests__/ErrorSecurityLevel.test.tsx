import { paths } from '@/router/constants'
import { render, screen, userEvent, waitFor } from '@/test-utils'

import { ErrorSecurityLevel } from '../ErrorSecurityLevel'

const navigateMock = vi.fn()
vi.mock(import('react-router'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

describe('ErrorSecurityLevel', () => {
  it('sjekk at siden har riktig sidetittel.', async () => {
    render(<ErrorSecurityLevel />)
    await waitFor(async () => {
      expect(document.title).toBe('application.title.securityLevel_feil')
    })
  })

  it('sjekk at feilmelding vises korrekt.', () => {
    render(<ErrorSecurityLevel />)
    expect(screen.getByTestId('error-page-security-level')).toBeVisible()
    expect(screen.getByText('error.securityLevel.title')).toBeVisible()
    expect(screen.getByText('error.securityLevel.ingress')).toBeVisible()
  })

  it('når bruker velger å logge inn på nytt, så blir bruker logget ut og videresendt tilbake til login skjema.', async () => {
    const user = userEvent.setup()
    const open = vi.fn()
    vi.stubGlobal('open', open)
    render(<ErrorSecurityLevel />)
    await user.click(screen.getByTestId('card-button-primary'))
    expect(open).toHaveBeenCalledWith(
      `https://${window.location.host}/pensjon/kalkulator/oauth2/logout?redirect=https://${window.location.host}/pensjon/kalkulator/start`,
      '_self'
    )
  })

  it('når bruker velger å avbryte, så blir bruker videresendt tilbake til login-siden.', async () => {
    const user = userEvent.setup()
    render(<ErrorSecurityLevel />)
    await user.click(screen.getByTestId('card-button-secondary'))
    expect(navigateMock).toHaveBeenCalledWith(paths.login)
  })
})

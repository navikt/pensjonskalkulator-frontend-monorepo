import { describe, it } from 'vitest'

import { TidligstMuligUttaksalderAvansertToggle } from '..'
import { render, screen, waitFor, userEvent } from '@/test-utils'
import { loggerTeardown } from '@/utils/__tests__/logging-stub'

describe('TidligstMuligUttaksalderAvansertToggle', () => {
  afterEach(() => {
    loggerTeardown()
  })

  it('rendrer slik den skal med riktig tekst og hjelpeknapp basert på uttaksalder, og uten AFP melding når brukeren har ikke valgt AFP', async () => {
    const user = userEvent.setup()
    render(
      <TidligstMuligUttaksalderAvansertToggle
        tidligstMuligUttak={{ aar: 62, maaneder: 9 }}
        hasAfpOffentlig={false}
      />
    )

    await waitFor(() => {
      expect(
        screen.getByText('tidligsteuttaksalder.ingress')
      ).toBeInTheDocument()
      expect(
        screen.getByText('62 alder.aar string.og 9 alder.maaneder', {
          exact: false,
        })
      ).toBeInTheDocument()
      expect(
        screen.getByText('tidligsteuttaksalder.ingress')
      ).toBeInTheDocument()
    })

    await user.click(screen.getByText('tidligsteuttaksalder.readmore_title'))
    expect(
      screen.getByText('tidligsteuttaksalder.readmore_ingress')
    ).toBeInTheDocument()
  })
  it('viser AFP melding hvis brukeren har AFP offentlig og tidligstMuligUttak etter 62', async () => {
    render(
      <TidligstMuligUttaksalderAvansertToggle
        tidligstMuligUttak={{ aar: 62, maaneder: 9 }}
        hasAfpOffentlig={true}
      />
    )
    await waitFor(() => {
      expect(
        screen.getByText('tidligsteuttaksalder.ingress')
      ).toBeInTheDocument()

      expect(
        screen.getByText('tidligsteuttaksalder.info_afp')
      ).toBeInTheDocument()
    })
  })
  it('viser ikke AFP melding hvis brukeren har AFP offentlig men at tidligstMuligUttak er 62', async () => {
    render(
      <TidligstMuligUttaksalderAvansertToggle
        tidligstMuligUttak={{ aar: 62, maaneder: 0 }}
        hasAfpOffentlig={true}
      />
    )
    await waitFor(() => {
      expect(
        screen.getByText('tidligsteuttaksalder.ingress')
      ).toBeInTheDocument()
      expect(
        screen.queryByText('tidligsteuttaksalder.info_afp')
      ).not.toBeInTheDocument()
    })
  })
})

import { describe, it } from 'vitest'

import { TidligstMuligUttaksalder } from '..'
import { render, screen, waitFor, userEvent } from '@/test-utils'
import { loggerSpy, loggerTeardown } from '@/utils/__tests__/logging-stub'

describe('TidligstMuligUttaksalder', () => {
  afterEach(() => {
    loggerTeardown()
  })

  it('rendrer slik den skal med riktig tekst og hjelpeknapp basert på uttaksalder, og uten AFP merlding når brukeren har ikke valgt AFP', async () => {
    const user = userEvent.setup()
    render(
      <TidligstMuligUttaksalder
        tidligstMuligUttak={{ aar: 62, maaneder: 9 }}
        hasAfpOffentlig={false}
      />
    )

    await waitFor(() => {
      expect(
        screen.getByText(
          'Din opptjening i folketrygden gjør at du tidligst kan ta',
          { exact: false }
        )
      ).toBeInTheDocument()
      expect(
        screen.getByText('62 alder.aar string.og 9 alder.maaneder')
      ).toBeInTheDocument()
      expect(
        screen.getByText('tidligsteuttaksalder.ingress_2')
      ).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button'))

    expect(screen.getByText('tidligsteuttaksalder.help')).toBeInTheDocument()
    expect(loggerSpy).toHaveBeenNthCalledWith(
      1,
      'help text åpnet',
      expect.any(Object)
    )
  })
  it('viser AFP melding hvis brukeren har AFP offentlig og tidligstMuligUttak etter 62', async () => {
    render(
      <TidligstMuligUttaksalder
        tidligstMuligUttak={{ aar: 62, maaneder: 9 }}
        hasAfpOffentlig={true}
      />
    )
    await waitFor(() => {
      expect(
        screen.getByText(
          'Din opptjening i folketrygden gjør at du tidligst kan ta',
          { exact: false }
        )
      ).toBeInTheDocument()

      expect(
        screen.getByText('tidligsteuttaksalder.info_afp')
      ).toBeInTheDocument()
    })
  })
  it('viser ikke AFP melding hvis brukeren har AFP offentlig men at tidligstMuligUttak er 62', async () => {
    render(
      <TidligstMuligUttaksalder
        tidligstMuligUttak={{ aar: 62, maaneder: 0 }}
        hasAfpOffentlig={true}
      />
    )
    await waitFor(() => {
      expect(
        screen.getByText(
          'Din opptjening i folketrygden gjør at du tidligst kan ta',
          { exact: false }
        )
      ).toBeInTheDocument()
      expect(
        screen.queryByText('tidligsteuttaksalder.info_afp')
      ).not.toBeInTheDocument()
    })
  })
})

import { describe, it } from 'vitest'

import { TidligstMuligUttaksalder } from '..'
import { render, screen, waitFor, userEvent } from '@/test-utils'

describe('TidligstMuligUttaksalder', () => {
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
          'Din opptjening i folketrygden gjør at du tidligst kan ta ut alderspensjon når du er'
        )
      ).toBeInTheDocument()
      expect(screen.getByText('62 år og 9 måneder')).toBeInTheDocument()
      expect(
        screen.getByText('Jo lenger du venter, desto mer får du i året.')
      ).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button'))

    expect(
      screen.getByText(
        'For å starte uttak mellom 62 og 67 år må opptjeningen være høy nok. Tidspunktet er et estimat.'
      )
    ).toBeInTheDocument()
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
          'Din opptjening i folketrygden gjør at du tidligst kan ta ut alderspensjon når du er'
        )
      ).toBeInTheDocument()

      expect(
        screen.getByText('Din AFP kan gjøre at tidspunktet blir tidligere')
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
          'Din opptjening i folketrygden gjør at du tidligst kan ta ut alderspensjon når du er'
        )
      ).toBeInTheDocument()
      expect(
        screen.queryByText('Din AFP kan gjøre at tidspunktet blir tidligere')
      ).not.toBeInTheDocument()
    })
  })
})

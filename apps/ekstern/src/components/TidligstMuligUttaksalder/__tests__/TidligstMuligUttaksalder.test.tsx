import { describe, it } from 'vitest'

import { TidligstMuligUttaksalder } from '..'
import { render, screen, waitFor, userEvent } from '@/test-utils'

describe('TidligstMuligUttaksalder', () => {
  it('rendrer slik den skal med riktig tekst og hjelpeknapp basert på uttaksalder', async () => {
    const user = userEvent.setup()
    render(
      <TidligstMuligUttaksalder
        uttaksalder={{ aar: 62, maaned: 9, uttaksdato: '2031-11-01' }}
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
})

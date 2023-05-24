import React from 'react'

import { describe, it } from 'vitest'

import { TidligstMuligUttaksalder } from '..'
import { render, screen, waitFor } from '@/test-utils'

describe('TidligstMuligUttaksalder', () => {
  it('rendrer slik den skal med riktig tekst basert på uttaksalder', async () => {
    render(<TidligstMuligUttaksalder uttaksalder={{ aar: 62, maaned: 9 }} />)

    await waitFor(() => {
      expect(
        screen.getByText('Ditt tidligste mulige tidspunkt for uttak:')
      ).toBeInTheDocument()
      expect(screen.getByText('62 år og 9 måneder')).toBeInTheDocument()
      expect(
        screen.getByText('Hvis du går av senere, får du høyere pensjon i året.')
      ).toBeInTheDocument()
    })
  })
})

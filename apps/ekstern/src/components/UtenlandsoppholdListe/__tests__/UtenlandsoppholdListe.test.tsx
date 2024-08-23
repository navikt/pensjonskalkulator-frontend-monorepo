import { describe, it } from 'vitest'

import { UtenlandsoppholdListe } from '..'
import { screen, render } from '@/test-utils'

describe('UtenlandsoppholdListe', () => {
  it('rendrer slik den skal', async () => {
    render(<UtenlandsoppholdListe />)

    expect(
      await screen.findByText('stegvisning.utenlandsopphold.oppholdene.title')
    ).toBeVisible()
  })
})

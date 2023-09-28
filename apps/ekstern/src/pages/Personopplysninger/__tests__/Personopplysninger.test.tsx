import { describe, it } from 'vitest'

import { Personopplysninger } from '..'
import { render, screen } from '@/test-utils'

describe('Personopplysninger', () => {
  it('har riktig sidetittel', () => {
    render(<Personopplysninger />)
    expect(document.title).toBe('application.title.personopplysninger')
  })

  it('rendrer riktig', () => {
    render(<Personopplysninger />)
    expect(screen.getByText('Personopplysninger')).toBeVisible()
  })
})

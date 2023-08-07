import { describe, it } from 'vitest'

import { Forbehold } from '..'
import { render, screen } from '@/test-utils'

describe('Forbehold', () => {
  it('har riktig sidetittel', () => {
    render(<Forbehold />)
    expect(document.title).toBe('application.title.forbehold')
  })

  it('render riktig', () => {
    render(<Forbehold />)
    expect(screen.getByText('Forbehold')).toBeVisible()
  })
})

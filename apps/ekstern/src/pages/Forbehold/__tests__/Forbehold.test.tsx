import { describe, it } from 'vitest'

import { Forbehold } from '..'
import { render, screen } from '@/test-utils'

describe('Forbehold', () => {
  it('har riktig sidetittel', () => {
    render(<Forbehold />)
    expect(document.title).toBe('application.title.forbehold')
  })

  it('rendrer riktig', () => {
    const { asFragment } = render(<Forbehold />)
    expect(screen.getByText('forbehold.title')).toBeVisible()
    expect(asFragment()).toMatchSnapshot()
  })
})

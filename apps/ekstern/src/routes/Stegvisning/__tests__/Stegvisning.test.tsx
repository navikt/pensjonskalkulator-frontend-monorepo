import { describe, it } from 'vitest'

import { Stegvisning } from '..'
import { render, screen } from '@/test-utils'

describe('Stegvisning', () => {
  it('rendrer slik den skal, med riktig heading', () => {
    const result = render(<Stegvisning />)

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Midlertidig stegvisning'
    )
    expect(result.asFragment()).toMatchSnapshot()
  })
})

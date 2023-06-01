import { describe, it } from 'vitest'

import { PageFramework } from '..'
import { render, screen } from '@/test-utils'

describe('PageFramework', () => {
  it('rendrer slik den skal, med main tag og Heading på riktig nivå', () => {
    const result = render(<PageFramework />)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'forside.title'
    )
    expect(result.asFragment()).toMatchSnapshot()
  })
})

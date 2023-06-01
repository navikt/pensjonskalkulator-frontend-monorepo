import { describe, it } from 'vitest'

import { ErrorPage404 } from '..'
import { render, screen } from '@/test-utils'

describe('ErrorPage404', () => {
  it('rendrer slik den skal, med riktig heading', () => {
    render(<ErrorPage404 />)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Oops!')
    expect(screen.getByText('Denne siden finnes ikke')).toBeInTheDocument()
  })
})

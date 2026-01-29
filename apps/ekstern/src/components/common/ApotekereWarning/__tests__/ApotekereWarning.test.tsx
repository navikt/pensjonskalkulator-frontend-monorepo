import { describe, expect, it } from 'vitest'

import { render, screen } from '@/test-utils'

import { ApotekereWarning } from '..'

describe('ApotekereWarning', () => {
  it('renders the warning when showWarning is true', () => {
    render(<ApotekereWarning showWarning={true} />)

    expect(screen.getByTestId('apotekere-warning')).toBeInTheDocument()
    expect(screen.getByText('error.apoteker_warning')).toBeInTheDocument()
  })

  it('returns null when showWarning is false', () => {
    const { container } = render(<ApotekereWarning showWarning={false} />)

    expect(screen.queryByTestId('apotekere-warning')).not.toBeInTheDocument()
    expect(container.firstChild).toBeNull()
  })
})

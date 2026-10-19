import { describe, expect, it } from 'vitest'

import { render, screen } from '@/test-utils'

import { ApotekereWarning } from '..'

describe('ApotekereWarning', () => {
  it('renders the warning when showWarning is true', () => {
    render(<ApotekereWarning showWarning={true} />)

    const alert = screen.getByTestId('apoteker.beregning-med-afp-feil')
    expect(alert).toBeInTheDocument()
    expect(alert).toHaveTextContent(
      'Hvis du er medlem av Pensjonsordningen for apotekvirksomhet (POA) er beregning med AFP for øyeblikket feil. Prøv igjen senere.'
    )
  })

  it('returns null when showWarning is false', () => {
    const { container } = render(<ApotekereWarning showWarning={false} />)

    expect(
      screen.queryByTestId('apoteker.beregning-med-afp-feil')
    ).not.toBeInTheDocument()
    expect(container.firstChild).toBeNull()
  })
})

import { describe, it } from 'vitest'

import { render, screen, waitFor } from '@/test-utils'

import { Forbehold } from '..'

describe('Forbehold', () => {
  it('har riktig sidetittel', () => {
    render(<Forbehold />)
    expect(document.title).toBe('application.title.forbehold')
  })

  it('rendrer seksjonene riktig med innhold fra Sanity', async () => {
    render(<Forbehold />)
    await waitFor(() => {
      expect(screen.getByText('forbehold.title')).toBeVisible()
      expect(screen.getAllByRole('paragraph').length).toBeGreaterThanOrEqual(3)
    })
  })
})

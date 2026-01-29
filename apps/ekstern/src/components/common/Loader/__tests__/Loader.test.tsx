import { describe, it } from 'vitest'

import { render, screen } from '@/test-utils'

import { Loader } from '..'

describe('Loader', () => {
  it('rendrer med riktig className og props by default', () => {
    render(<Loader title="fake title" data-testid="loader" />)

    expect(screen.getByTestId('loader')).toBeVisible()
  })

  it('rendrer med riktig className når isCentered er false', () => {
    render(
      <Loader title="fake title" data-testid="loader" isCentered={false} />
    )

    expect(screen.getByTestId('loader')).toBeVisible()
  })
})

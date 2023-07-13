import { describe, it } from 'vitest'

import { Loader } from '..'
import { render, screen } from '@/test-utils'

describe('Loader', () => {
  it('rendrer med riktig className og props by default', () => {
    const { asFragment } = render(
      <Loader title="fake title" data-testid="loader" />
    )

    expect(screen.getByTestId('loader')).toBeVisible()
    expect(asFragment()).toMatchSnapshot()
  })

  it('rendrer med riktig className når isCentered er false', () => {
    const { asFragment } = render(
      <Loader title="fake title" data-testid="loader" isCentered={false} />
    )

    expect(screen.getByTestId('loader')).toBeVisible()
    expect(asFragment()).toMatchSnapshot()
  })
})

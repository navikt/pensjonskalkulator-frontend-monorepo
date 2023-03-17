import { describe, expect, it } from 'vitest'

import { render, screen } from '../../test-utils'
import { ErrorBoundary } from '../ErrorBoundary'

describe('ErrorBoundary', () => {
  it('rendrer children når children ikke kaster en feil', async () => {
    const actualError: Error | undefined = undefined
    const ComponentThatIsJustFine = () => {
      return <p>I am just fine</p>
    }
    render(
      <ErrorBoundary>
        <ComponentThatIsJustFine />
      </ErrorBoundary>
    )

    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    expect(screen.getByText('I am just fine')).toBeInTheDocument()
    expect(actualError).toBeUndefined()
  })

  it('rendrer feilmelding når det kastes en feil i children', async () => {
    const ComponentThatThrows = () => {
      throw new Error('my expected error')
    }
    const component = render(
      <ErrorBoundary>
        <ComponentThatThrows />
      </ErrorBoundary>
    )

    expect(screen.getByRole('heading')).toHaveTextContent('Oisann!')
    expect(component.asFragment()).toMatchSnapshot()
  })
})

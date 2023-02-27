import { describe, expect, test } from 'vitest'

import { render, screen, swallowErrors } from '../../test-utils'
import { ErrorBoundary } from '../ErrorBoundary'

describe('Gitt at ErrorBoundary wrapper en komponent,', () => {
  test('Når den nested komponent ikke har noe feil, Så rendres den slik den skal', async () => {
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

  test('Når den nested komponent kaster feil, Så vises det riktig feilmelding fra ErrorBoundary', async () => {
    const ComponentThatThrows = () => {
      throw new Error('my expected error')
    }

    swallowErrors(() => {
      render(
        <ErrorBoundary>
          <ComponentThatThrows />
        </ErrorBoundary>
      )

      expect(screen.getByRole('heading')).toBeInTheDocument()
      expect(screen.getByRole('heading')).toHaveTextContent(
        'Sorry.. there was an error'
      )
    })
  })
})

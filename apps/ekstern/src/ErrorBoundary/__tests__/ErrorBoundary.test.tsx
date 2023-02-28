import { describe, expect, test } from 'vitest'

import { RenderResult, render, screen, swallowErrors } from '../../test-utils'
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
    let component
    swallowErrors(() => {
      component = render(
        <ErrorBoundary>
          <ComponentThatThrows />
        </ErrorBoundary>
      )

      expect(screen.getByRole('heading')).toHaveTextContent(
        'Beklager, det har oppstått en feil'
      )
      expect(
        (
          component as unknown as RenderResult<
            typeof import('@testing-library/dom/types/queries'),
            HTMLElement,
            HTMLElement
          >
        ).asFragment()
      ).toMatchSnapshot()
    })
  })
})

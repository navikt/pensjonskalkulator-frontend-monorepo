import React from 'react'

import { describe, it } from 'vitest'

import { render, screen, fireEvent } from '../../../test-utils'
import { Pensjonssimulering } from '../Pensjonssimulering'

describe('Pensjonssimulering', () => {
  it('rendrer slik den skal, med Heading på riktig nivå og knapper for alder', () => {
    const result = render(<Pensjonssimulering />)

    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
      'Når vil du ta ut alderspensjon?'
    )
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(14)
    expect(result.asFragment()).toMatchSnapshot()
  })

  it('har riktig alder valgt per default og oppdateres når brukeren klikker på en annen knapp', () => {
    render(<Pensjonssimulering />)
    expect(screen.getByRole('button', { pressed: true })).toHaveTextContent(
      '62'
    )
    const button = screen.getByText('72')
    fireEvent.click(button)
    expect(screen.getByRole('button', { pressed: true })).toHaveTextContent(
      '72'
    )
  })
})

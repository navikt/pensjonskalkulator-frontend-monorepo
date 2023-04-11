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
    expect(buttons).toHaveLength(7)

    fireEvent.click(screen.getByText('Vis flere aldere'))
    expect(screen.getAllByRole('button')).toHaveLength(15)

    expect(result.asFragment()).toMatchSnapshot()
  })

  it('har riktig alder valgt per default og oppdateres når brukeren klikker på en annen knapp', () => {
    render(<Pensjonssimulering />)
    expect(screen.getByRole('button', { pressed: true })).toHaveTextContent(
      '62'
    )

    fireEvent.click(screen.getByText('65'))
    expect(screen.getByRole('button', { pressed: true })).toHaveTextContent(
      '65'
    )

    fireEvent.click(screen.getByText('Vis flere aldere'))

    fireEvent.click(screen.getByText('72'))
    expect(screen.getByRole('button', { pressed: true })).toHaveTextContent(
      '72'
    )
  })
})

import React from 'react'

import { describe, it, vi } from 'vitest'

import { render, screen, fireEvent, waitFor, act } from '../../../test-utils'
import { Pensjonssimulering } from '../Pensjonssimulering'

describe('Pensjonssimulering', () => {
  it('rendrer slik den skal, med Heading på riktig nivå og knapper for alder', async () => {
    const { asFragment } = render(<Pensjonssimulering />)

    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
      'Når vil du ta ut alderspensjon?'
    )
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(7)
    fireEvent.click(screen.getByText('Vis flere aldere'))
    expect(screen.getAllByRole('button')).toHaveLength(15)
    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot()
    })
  })

  it('har ingen alder valgt per default, og ingen tittel eller graph vises', () => {
    const { container } = render(<Pensjonssimulering />)
    expect(
      screen.queryByRole('button', { pressed: true })
    ).not.toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(1)
    expect(container.getElementsByClassName('ct-chart').length).toBe(0)
  })

  it('oppdaterer valgt knapp og tittel - både synlige knapper, og de under vis flere - når brukeren klikker på en knapp', () => {
    render(<Pensjonssimulering />)
    fireEvent.click(screen.getByText('65'))
    expect(screen.getByRole('button', { pressed: true })).toHaveTextContent(
      '65'
    )
    expect(
      screen.getByText('Årlig pensjon hvis du starter uttak ved 65 år')
    ).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(2)

    fireEvent.click(screen.getByText('Vis flere aldere'))

    fireEvent.click(screen.getByText('72'))
    expect(screen.getByRole('button', { pressed: true })).toHaveTextContent(
      '72'
    )
    expect(
      screen.getByText('Årlig pensjon hvis du starter uttak ved 72 år')
    ).toBeInTheDocument()
  })

  it('tegner graph når brukeren klikker på en knapp', async () => {
    vi.useFakeTimers()
    const { container, asFragment } = render(<Pensjonssimulering />)
    await act(async () => {
      waitFor(() => {
        fireEvent.click(screen.getByText('65'))
        expect(container.getElementsByClassName('ct-chart').length).toBe(1)
        vi.advanceTimersByTime(250)
        expect(asFragment()).toMatchSnapshot()
      })
    })
    vi.useRealTimers()
  })
})

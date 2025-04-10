import { describe, it } from 'vitest'

import { render } from '@/test-utils'

import { Divider } from '..'

describe('Divider', () => {
  it('viser korrekt med standardverdier', async () => {
    const { container } = render(<Divider />)
    const divider = container.querySelector('hr')
    expect(divider).toBeInTheDocument()
    expect(divider?.className).toMatch(/divider_[a-zA-Z0-9]+/)
    expect(divider?.className).not.toContain('smallMargin')
    expect(divider?.className).not.toContain('noMargin')
    expect(divider?.className).not.toContain('noMarginBottom')
  })

  it('viser korrekt uten margin', async () => {
    const { container } = render(<Divider noMargin />)
    const divider = container.querySelector('hr')
    expect(divider).toBeInTheDocument()
    expect(divider?.className).toContain('noMargin')
  })

  it('viser korrekt med liten margin', async () => {
    const { container } = render(<Divider smallMargin />)
    const divider = container.querySelector('hr')
    expect(divider).toBeInTheDocument()
    expect(divider?.className).toContain('smallMargin')
  })

  it('viser korrekt uten margin i bunnen', async () => {
    const { container } = render(<Divider noMarginBottom />)
    const divider = container.querySelector('hr')
    expect(divider).toBeInTheDocument()
    expect(divider?.className).toContain('noMarginBottom')
  })
})

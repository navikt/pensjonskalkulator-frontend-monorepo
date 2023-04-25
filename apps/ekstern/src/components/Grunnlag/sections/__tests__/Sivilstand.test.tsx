import { Sivilstand } from '../Sivilstand'
import { render, screen } from '@/test-utils'

describe('Sivilstand', () => {
  it('rendrer gift, bor sammen', () => {
    render(<Sivilstand sivilstand={{ gift: true, samboer: true }} />)

    expect(screen.getByText('Gift, bor sammen med noen')).toBeVisible()
  })

  it('rendrer ugift, bor sammen', () => {
    render(<Sivilstand sivilstand={{ gift: false, samboer: true }} />)

    expect(screen.getByText('Ugift, bor sammen med noen')).toBeVisible()
  })

  it('rendrer ugift, bor ikke sammen', () => {
    render(<Sivilstand sivilstand={{ gift: false, samboer: false }} />)

    expect(screen.getByText('Ugift, bor alene')).toBeVisible()
  })

  it('rendrer gift, bor ikke sammen', () => {
    render(<Sivilstand sivilstand={{ gift: true, samboer: false }} />)

    expect(screen.getByText('Gift, bor alene')).toBeVisible()
  })
})

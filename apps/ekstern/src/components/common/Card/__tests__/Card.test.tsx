import { describe, it } from 'vitest'

import { render } from '@/test-utils'

import { Card } from '..'

describe('Card', () => {
  it('viser innhold korrekt uten className', async () => {
    const testContent = 'lorem ipsum'
    const { getByText } = render(
      <Card>
        <p>{testContent}</p>
      </Card>
    )
    expect(getByText(testContent)).toBeInTheDocument()
  })

  it('bruker egendefinert className når det er gitt', async () => {
    const customClass = 'className'
    const { container } = render(
      <Card className={customClass}>
        <p>lorem ipsum</p>
      </Card>
    )
    const cardElement = container.firstChild
    expect(cardElement).toHaveClass(customClass)
  })

  it('bruker stor padding når hasLargePadding er satt til true', async () => {
    const { container } = render(
      <Card hasLargePadding>
        <p>lorem ipsum</p>
      </Card>
    )
    const cardElement = container.firstChild as HTMLElement
    expect(cardElement?.className).toContain('largePadding')
  })

  it('bruker margin når hasMargin er satt til true', async () => {
    const { container } = render(
      <Card hasMargin>
        <p>lorem ipsum</p>
      </Card>
    )
    const cardElement = container.firstChild as HTMLElement
    expect(cardElement?.className).toContain('marginBotton')
  })

  it('kombinerer alle props korrekt', async () => {
    const customClass = 'customClassName'
    const { container } = render(
      <Card className={customClass} hasLargePadding hasMargin>
        <p>lorem ipsum</p>
      </Card>
    )
    const cardElement = container.firstChild as HTMLElement
    expect(cardElement).toHaveClass(customClass)
    expect(cardElement?.className).toContain('largePadding')
    expect(cardElement?.className).toContain('marginBotton')
  })
})

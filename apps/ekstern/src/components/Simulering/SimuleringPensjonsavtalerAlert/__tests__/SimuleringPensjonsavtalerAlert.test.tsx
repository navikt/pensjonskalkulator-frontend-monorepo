import { vi } from 'vitest'

import { SimuleringPensjonsavtalerAlert } from '../SimuleringPensjonsavtalerAlert'
import { render, screen, fireEvent } from '@/test-utils'

describe('SimuleringPensjonsavtalerAlert', () => {
  const text = 'beregning.tpo.info.pensjonsavtaler.error'
  it('viser ikke alert når variant er undefined ', () => {
    render(<SimuleringPensjonsavtalerAlert variant={undefined} />)
    expect(screen.queryByTestId('pensjonsavtaler-alert')).toBeNull()
    expect(screen.queryByTestId('pensjonsavtaler-info')).toBeNull()
  })

  it('viser alert når variant er satt til "alert-info"', () => {
    render(<SimuleringPensjonsavtalerAlert variant="alert-info" text={text} />)
    expect(screen.getByTestId('pensjonsavtaler-alert')).toBeVisible()
    expect(
      screen.getByText('Denne beregningen viser kanskje ikke alt', {
        exact: false,
      })
    ).toBeVisible()
  })

  it('viser alert når variant er satt til "alert-warning"', () => {
    render(
      <SimuleringPensjonsavtalerAlert variant="alert-warning" text={text} />
    )
    expect(screen.getByTestId('pensjonsavtaler-alert')).toBeVisible()
    expect(
      screen.getByText('Denne beregningen viser kanskje ikke alt', {
        exact: false,
      })
    ).toBeVisible()
  })

  it('viser info når variant er satt til "info"', () => {
    render(<SimuleringPensjonsavtalerAlert variant={'info'} text={text} />)
    expect(screen.getByTestId('pensjonsavtaler-info')).toBeVisible()
    expect(
      screen.getByText('Denne beregningen viser kanskje ikke alt', {
        exact: false,
      })
    ).toBeVisible()
  })

  it('scroller til pensjonsavtaler-heading når lenken klikkes i alert-boksen', () => {
    const scrollToMock = vi.fn()
    Object.defineProperty(global.window, 'scrollTo', {
      value: scrollToMock,
      writable: true,
    })

    const elemDiv = document.createElement('div')
    elemDiv.setAttribute('id', 'pensjonsavtaler-heading')
    document.body.appendChild(elemDiv)

    render(<SimuleringPensjonsavtalerAlert variant="alert-info" text={text} />)
    fireEvent.click(screen.getByTestId('pensjonsavtaler-alert-link'))

    expect(scrollToMock).toHaveBeenCalledWith({
      behavior: 'smooth',
      top: -15,
    })
  })

  it('scroller til pensjonsavtaler-heading når lenken klikkes i info-boksen', () => {
    const scrollToMock = vi.fn()
    Object.defineProperty(global.window, 'scrollTo', {
      value: scrollToMock,
      writable: true,
    })

    const elemDiv = document.createElement('div')
    elemDiv.setAttribute('id', 'pensjonsavtaler-heading')
    document.body.appendChild(elemDiv)

    render(<SimuleringPensjonsavtalerAlert variant={'info'} text={text} />)
    fireEvent.click(screen.getByTestId('pensjonsavtaler-info-link'))

    expect(scrollToMock).toHaveBeenCalledWith({
      behavior: 'smooth',
      top: -15,
    })
  })
})

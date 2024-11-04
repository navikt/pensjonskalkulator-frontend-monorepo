import { vi } from 'vitest'

import { SimuleringPensjonsavtalerAlert } from '../SimuleringPensjonsavtalerAlert'
import { render, screen, fireEvent } from '@/test-utils'

describe('SimuleringPensjonsavtalerAlert', () => {
  it('viser ikke alert når variant er undefined og showInfo er false', () => {
    render(<SimuleringPensjonsavtalerAlert showInfo={false} />)
    expect(screen.queryByTestId('pensjonsavtaler-alert')).toBeNull()
    expect(screen.queryByTestId('pensjonsavtaler-info')).toBeNull()
  })

  it('viser alert når variant er satt', () => {
    render(
      <SimuleringPensjonsavtalerAlert
        variant="info"
        showInfo={false}
        text="beregning.tpo.info.pensjonsavtaler.error"
      />
    )
    expect(screen.getByTestId('pensjonsavtaler-alert')).toBeVisible()
    expect(
      screen.getByText('Denne beregningen viser kanskje ikke alt', {
        exact: false,
      })
    ).toBeVisible()
  })

  it('viser info når showInfo er true', () => {
    render(<SimuleringPensjonsavtalerAlert showInfo={true} />)
    expect(screen.getByTestId('pensjonsavtaler-info')).toBeVisible()
    expect(
      screen.getByText('Du har pensjonsavtaler som starter før valgt alder.', {
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

    render(
      <SimuleringPensjonsavtalerAlert
        variant="info"
        text={'beregning.tpo.info.pensjonsavtaler.error'}
        showInfo={false}
      />
    )
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

    render(<SimuleringPensjonsavtalerAlert showInfo={true} />)
    fireEvent.click(screen.getByTestId('pensjonsavtaler-info-link'))

    expect(scrollToMock).toHaveBeenCalledWith({
      behavior: 'smooth',
      top: -15,
    })
  })
})

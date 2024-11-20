import { vi } from 'vitest'

import { SimuleringPensjonsavtalerAlert } from '../SimuleringPensjonsavtalerAlert'
import { ShowMoreRef } from '@/components/common/ShowMore/ShowMore'
import {
  AvansertBeregningModus,
  BeregningContext,
} from '@/pages/Beregning/context'
import { render, screen, fireEvent } from '@/test-utils'

describe('SimuleringPensjonsavtalerAlert', () => {
  const text = 'beregning.tpo.info.pensjonsavtaler.error'
  const contextMockedValues = {
    avansertSkjemaModus: 'resultat' as AvansertBeregningModus,
    setAvansertSkjemaModus: vi.fn(),
    harAvansertSkjemaUnsavedChanges: false,
    setHarAvansertSkjemaUnsavedChanges: () => {},
    pensjonsavtalerShowMoreRef: {
      current: { focus: vi.fn() },
    } as unknown as React.RefObject<ShowMoreRef>,
  }
  afterEach(() => {
    vi.resetAllMocks()
  })

  it('viser ikke alert når variant er undefined', () => {
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

  it('ShowMore visesscroller til Pensjonsavtaler når lenken klikkes i alert-boksen', () => {
    render(
      <BeregningContext.Provider value={contextMockedValues}>
        <SimuleringPensjonsavtalerAlert
          variant="info"
          text={'beregning.tpo.info.pensjonsavtaler.error'}
        />
      </BeregningContext.Provider>
    )
    fireEvent.click(screen.getByTestId('pensjonsavtaler-info-link'))
    if (!contextMockedValues.pensjonsavtalerShowMoreRef.current) {
      throw Error('pensjonsavtalerShowMoreRef.current should not be null')
    }
    expect(
      contextMockedValues.pensjonsavtalerShowMoreRef.current.focus
    ).toHaveBeenCalledTimes(1)
  })

  it('ShowMore vises og scroller til Pensjonsavtaler når lenken klikkes i info-boksen', () => {
    render(
      <BeregningContext.Provider value={contextMockedValues}>
        <SimuleringPensjonsavtalerAlert
          variant="info"
          text={'beregning.tpo.info.pensjonsavtaler.error'}
        />
      </BeregningContext.Provider>
    )
    fireEvent.click(screen.getByTestId('pensjonsavtaler-info-link'))
    if (!contextMockedValues.pensjonsavtalerShowMoreRef.current) {
      throw Error('pensjonsavtalerShowMoreRef.current should not be null')
    }
    expect(
      contextMockedValues.pensjonsavtalerShowMoreRef.current.focus
    ).toHaveBeenCalledTimes(1)
  })
})

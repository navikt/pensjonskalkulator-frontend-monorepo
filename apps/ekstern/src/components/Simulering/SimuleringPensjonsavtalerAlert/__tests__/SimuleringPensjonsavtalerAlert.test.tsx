import { vi } from 'vitest'

import { SimuleringPensjonsavtalerAlert } from '../SimuleringPensjonsavtalerAlert'
import { ShowMoreRef } from '@/components/common/ShowMore/ShowMore'
import {
  AvansertBeregningModus,
  BeregningContext,
} from '@/pages/Beregning/context'
import { render, screen, fireEvent } from '@/test-utils'

describe('SimuleringPensjonsavtalerAlert', () => {
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

  it('ShowMore visesscroller til Pensjonsavtaler når lenken klikkes i alert-boksen', () => {
    render(
      <BeregningContext.Provider value={contextMockedValues}>
        <SimuleringPensjonsavtalerAlert
          variant="info"
          text={'beregning.tpo.info.pensjonsavtaler.error'}
          showInfo={false}
        />
      </BeregningContext.Provider>
    )
    fireEvent.click(screen.getByTestId('pensjonsavtaler-alert-link'))
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
        <SimuleringPensjonsavtalerAlert showInfo={true} />
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

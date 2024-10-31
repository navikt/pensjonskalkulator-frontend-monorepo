import * as grafNavigationUtils from '../../utils'
import { GrafNavigation } from '../GrafNavigation'
import { render, screen, fireEvent } from '@/test-utils'
import * as loggerUtils from '@/utils/logging'

describe('GrafNavigation', () => {
  it('Når showVisFaerreAarButton og showVisFlereAarButton er false, rendrer ikke knappene.', () => {
    render(
      <GrafNavigation
        showVisFaerreAarButton={false}
        showVisFlereAarButton={false}
      />
    )
    expect(screen.queryAllByRole('button')).toHaveLength(0)
  })

  it('Når showVisFaerreAarButton er true, rendrer Vis færre år knapp.', () => {
    render(
      <GrafNavigation
        showVisFaerreAarButton={true}
        showVisFlereAarButton={false}
      />
    )
    expect(screen.getAllByRole('button')).toHaveLength(1)
    expect(screen.getByText('beregning.button.faerre_aar')).toBeVisible()
  })

  it('Når showVisFlereAarButton er true, rendrer Vis flere år knapp.', () => {
    render(
      <GrafNavigation
        showVisFaerreAarButton={false}
        showVisFlereAarButton={true}
      />
    )
    expect(screen.getAllByRole('button')).toHaveLength(1)
    expect(screen.getByText('beregning.button.flere_aar')).toBeVisible()
  })

  it('Når brukeren klikker på Vis færre år knapp, , kalles det wrapLogger med riktig arguments.', () => {
    const wrapLoggerMock = vi.spyOn(loggerUtils, 'wrapLogger')
    const onVisFaerreAarClickMock = vi.spyOn(
      grafNavigationUtils,
      'onVisFaerreAarClick'
    )
    render(
      <GrafNavigation
        showVisFaerreAarButton={true}
        showVisFlereAarButton={false}
      />
    )
    fireEvent.click(screen.getByText('beregning.button.faerre_aar'))
    expect(wrapLoggerMock).toHaveBeenCalledWith('button klikk', {
      tekst: 'Vis færre år',
    })
    expect(onVisFaerreAarClickMock).toHaveBeenCalled()
  })

  it('Når brukeren klikker på Vis flere år knapp, kalles det wrapLogger med riktig arguments.', () => {
    const wrapLoggerMock = vi.spyOn(loggerUtils, 'wrapLogger')
    render(
      <GrafNavigation
        showVisFaerreAarButton={false}
        showVisFlereAarButton={true}
      />
    )

    fireEvent.click(screen.getByText('beregning.button.flere_aar'))
    expect(wrapLoggerMock).toHaveBeenCalledWith('button klikk', {
      tekst: 'Vis flere år',
    })
  })
})

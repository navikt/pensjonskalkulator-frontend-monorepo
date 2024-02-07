import { describe, expect, it } from 'vitest'

import { FormButtonRow } from '../FormButtonRow'
import { FORM_NAMES } from '../utils'
import { render, screen, fireEvent } from '@/test-utils'

describe('FormButtonRow', () => {
  it('Når knapperaden rendres med isFormUnderUpdate false, vises det riktig tekst og avbryt knappen er skjult', () => {
    render(
      <FormButtonRow
        isFormUnderUpdate={false}
        resetForm={vi.fn()}
        gaaTilResultat={vi.fn()}
      />
    )
    expect(screen.getByText('beregning.avansert.button.beregn')).toBeVisible()
    expect(
      screen.queryByText('beregning.avansert.button.oppdater')
    ).not.toBeInTheDocument()
    expect(
      screen.getByText('beregning.avansert.button.nullstill')
    ).toBeVisible()
    expect(
      screen.queryByText('beregning.avansert.button.avbryt')
    ).not.toBeInTheDocument()
  })

  it('Når knapperaden rendres med isFormUnderUpdate true, vises det riktig tekst og avbryt knappen er synlig', () => {
    render(
      <FormButtonRow
        isFormUnderUpdate={true}
        resetForm={vi.fn()}
        gaaTilResultat={vi.fn()}
      />
    )
    expect(
      screen.queryByText('beregning.avansert.button.beregn')
    ).not.toBeInTheDocument()
    expect(screen.getByText('beregning.avansert.button.oppdater')).toBeVisible()
    expect(
      screen.getByText('beregning.avansert.button.nullstill')
    ).toBeVisible()
    expect(screen.getByText('beregning.avansert.button.avbryt')).toBeVisible()
  })

  it('Når Beregn knappen trykkes på, submittes formen', () => {
    const onSubmitMock = vi.fn()
    render(
      <>
        <form id={FORM_NAMES.form} method="dialog" onSubmit={onSubmitMock}>
          <FormButtonRow
            isFormUnderUpdate={false}
            resetForm={vi.fn()}
            gaaTilResultat={vi.fn()}
          />
        </form>
      </>
    )

    fireEvent.click(screen.getByText('beregning.avansert.button.beregn'))
    expect(onSubmitMock).toHaveBeenCalledTimes(1)
  })

  it('Når Nullstill knappen trykkes på, kalles det onReset', () => {
    const onResetMock = vi.fn()
    render(
      <FormButtonRow
        isFormUnderUpdate={false}
        resetForm={onResetMock}
        gaaTilResultat={vi.fn()}
      />
    )

    fireEvent.click(screen.getByText('beregning.avansert.button.nullstill'))
    expect(onResetMock).toHaveBeenCalledTimes(1)
  })

  it('Når Avbryt knappen trykkes på, kalles det gaaTilResultat', () => {
    const gaaTilResultatMock = vi.fn()
    render(
      <FormButtonRow
        isFormUnderUpdate={true}
        resetForm={vi.fn()}
        gaaTilResultat={gaaTilResultatMock}
      />
    )

    fireEvent.click(screen.getByText('beregning.avansert.button.avbryt'))
    expect(gaaTilResultatMock).toHaveBeenCalledTimes(1)
  })
})

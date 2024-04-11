import { describe, expect, it } from 'vitest'

import { RedigerAvansertBeregning } from '../RedigerAvansertBeregning'
import { FORM_NAMES } from '../utils'
import * as RedigerAvansertBeregningUtils from '../utils'
import { mockResponse } from '@/mocks/server'
import {
  BeregningContext,
  AvansertBeregningModus,
} from '@/pages/Beregning/context'
import { apiSlice } from '@/state/api/apiSlice'
import {
  userInputInitialState,
  Simulation,
} from '@/state/userInput/userInputReducer'
import { render, screen, fireEvent, userEvent } from '@/test-utils'

describe('RedigerAvansertBeregning', () => {
  const contextMockedValues = {
    avansertSkjemaModus: 'redigering' as AvansertBeregningModus,
    setAvansertSkjemaModus: vi.fn(),
    harAvansertSkjemaUnsavedChanges: false,
    setHarAvansertSkjemaUnsavedChanges: () => {},
  }

  it('scroller på toppen av siden når en route endrer seg', async () => {
    const scrollToMock = vi.fn()
    Object.defineProperty(global.window, 'scrollTo', {
      value: scrollToMock,
      writable: true,
    })
    render(
      <BeregningContext.Provider
        value={{
          ...contextMockedValues,
        }}
      >
        <RedigerAvansertBeregning gaaTilResultat={vi.fn()} />
      </BeregningContext.Provider>
    )
    expect(scrollToMock).toHaveBeenCalledWith(0, 0)
  })

  it('feltene rendres riktig som default, og når brukeren legger til en gradert periode', async () => {
    const user = userEvent.setup()
    render(
      <BeregningContext.Provider
        value={{
          ...contextMockedValues,
        }}
      >
        <RedigerAvansertBeregning gaaTilResultat={vi.fn()} />
      </BeregningContext.Provider>
    )
    expect(
      screen.getByText(
        'beregning.avansert.rediger.inntekt_frem_til_uttak.label'
      )
    ).toBeVisible()
    expect(
      screen.getByText('beregning.avansert.rediger.inntekt.button')
    ).toBeVisible()
    expect(
      screen.getByText('beregning.avansert.rediger.uttaksgrad.label')
    ).toBeVisible()
    expect(
      screen.getByTestId(`age-picker-${FORM_NAMES.uttaksalderHeltUttak}-aar`)
    ).toBeVisible()
    expect(
      screen.getByText(
        'beregning.avansert.rediger.read_more.pensjonsalder.label'
      )
    ).toBeVisible()
    expect(
      screen.queryByTestId(FORM_NAMES.inntektVsaHeltUttakRadio)
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId(FORM_NAMES.inntektVsaHeltUttak)
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId(
        `age-picker-${FORM_NAMES.inntektVsaHeltUttakSluttAlder}-aar`
      )
    ).not.toBeInTheDocument()

    // Fyller inn uttaksalder slik at RadioGroup vises
    fireEvent.change(
      screen.getByTestId(`age-picker-${FORM_NAMES.uttaksalderHeltUttak}-aar`),
      {
        target: { value: '65' },
      }
    )
    fireEvent.change(
      screen.getByTestId(
        `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-maaneder`
      ),
      {
        target: { value: '5' },
      }
    )
    // Hukker av for inntekt vsa. helt uttak og viser felt for beløp og sluttalder
    const heltRadioGroup = screen.getByTestId(
      FORM_NAMES.inntektVsaHeltUttakRadio
    )
    expect(heltRadioGroup).toBeVisible()
    await user.click(
      screen.getByTestId(`${FORM_NAMES.inntektVsaHeltUttakRadio}-ja`)
    )
    expect(screen.getByTestId(FORM_NAMES.inntektVsaHeltUttak)).toBeVisible()
    expect(
      screen.getByTestId(
        `age-picker-${FORM_NAMES.inntektVsaHeltUttakSluttAlder}-aar`
      )
    ).toBeVisible()

    // Velger gradert uttak
    fireEvent.change(await screen.findByTestId(FORM_NAMES.uttaksgrad), {
      target: { value: '80 %' },
    })
    expect(
      screen.getByTestId(`age-picker-${FORM_NAMES.uttaksalderGradertUttak}-aar`)
    ).toBeVisible()
    expect(
      screen.queryByTestId(FORM_NAMES.inntektVsaGradertUttak)
    ).not.toBeInTheDocument()

    // Hukker av for inntekt vsa. gradert uttak og viser felt for beløp
    await user.click(
      screen.getByTestId(`${FORM_NAMES.inntektVsaGradertUttakRadio}-ja`)
    )
    expect(screen.getByTestId(FORM_NAMES.inntektVsaGradertUttak)).toBeVisible()
  })

  it('readmore med tilleggsinformasjon til bruker vises riktig', async () => {
    const user = userEvent.setup()
    render(
      <BeregningContext.Provider
        value={{
          ...contextMockedValues,
        }}
      >
        <RedigerAvansertBeregning gaaTilResultat={vi.fn()} />
      </BeregningContext.Provider>
    )

    expect(screen.getByText('inntekt.info_om_inntekt.read_more')).toBeVisible()
    user.click(
      screen.getByText('beregning.avansert.rediger.read_more.uttaksgrad.label')
    )
    expect(
      screen.getByText(
        'Uttaksgrad angir hvor stor del av månedlig alderspensjon du ønsker å ta ut',
        { exact: false }
      )
    ).toBeVisible()
    user.click(
      screen.getByText(
        'beregning.avansert.rediger.read_more.pensjonsalder.label'
      )
    )
    expect(
      screen.getByText(
        'beregning.avansert.rediger.read_more.pensjonsalder.subtitle'
      )
    ).toBeVisible()

    fireEvent.change(await screen.findByTestId(FORM_NAMES.uttaksgrad), {
      target: { value: '80 %' },
    })

    user.click(
      screen.getByText(
        'beregning.avansert.rediger.read_more.pensjonsalder.label'
      )
    )
    expect(
      screen.getByText(
        'beregning.avansert.rediger.read_more.pensjonsalder.subtitle'
      )
    ).toBeVisible()
  })

  it('når alle feltene fylles ut og resetForm kalles, nullstilles det alle feltene', async () => {
    const user = userEvent.setup()
    const { store } = render(
      <BeregningContext.Provider
        value={{
          ...contextMockedValues,
        }}
      >
        <RedigerAvansertBeregning gaaTilResultat={vi.fn()} />
      </BeregningContext.Provider>
    )
    store.dispatch(apiSlice.endpoints.getInntekt.initiate())

    // Endrer inntekt frem til uttak
    await user.click(
      screen.getByText('beregning.avansert.rediger.inntekt.button')
    )
    const input = screen.getByTestId('inntekt-textfield')
    await user.clear(input)
    await user.type(input, '123000')
    expect(
      screen.queryByText(
        'inntekt.endre_inntekt_modal.textfield.validation_error'
      )
    ).not.toBeInTheDocument()
    await user.click(screen.getByText('inntekt.endre_inntekt_modal.button'))

    // Fyller ut feltene for 100 % uttak + inntekt vsa 100 % uttak
    fireEvent.change(
      await screen.findByTestId(
        `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-aar`
      ),
      {
        target: { value: '67' },
      }
    )
    fireEvent.change(
      await screen.findByTestId(
        `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-maaneder`
      ),
      {
        target: { value: '2' },
      }
    )
    await user.click(
      screen.getByTestId(`${FORM_NAMES.inntektVsaHeltUttakRadio}-ja`)
    )

    await user.type(
      screen.getByTestId(FORM_NAMES.inntektVsaHeltUttak),
      '123000'
    )
    fireEvent.change(
      screen.getByTestId(
        `age-picker-${FORM_NAMES.inntektVsaHeltUttakSluttAlder}-aar`
      ),
      { target: { value: '75' } }
    )
    fireEvent.change(
      screen.getByTestId(
        `age-picker-${FORM_NAMES.inntektVsaHeltUttakSluttAlder}-maaneder`
      ),
      { target: { value: '0' } }
    )

    // Endrer uttaksgrad
    fireEvent.change(await screen.findByTestId(FORM_NAMES.uttaksgrad), {
      target: { value: '60 %' },
    })

    // Verdien er overført til gradert uttak.
    // Fyller ut feltene for helt uttak + inntekt vsa gradert uttak
    fireEvent.change(
      await screen.findByTestId(
        `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-aar`
      ),
      {
        target: { value: '70' },
      }
    )
    fireEvent.change(
      await screen.findByTestId(
        `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-maaneder`
      ),
      {
        target: { value: '6' },
      }
    )
    await user.click(
      screen.getByTestId(`${FORM_NAMES.inntektVsaGradertUttakRadio}-ja`)
    )
    await user.type(
      screen.getByTestId(FORM_NAMES.inntektVsaGradertUttak),
      '100000'
    )

    // Sjekker at feltene er fylt ut
    expect(
      await screen.findByTestId('formatert-inntekt-frem-til-uttak')
    ).toHaveTextContent('123 000')
    expect(
      (
        (await screen.findByTestId(
          `age-picker-${FORM_NAMES.uttaksalderGradertUttak}-aar`
        )) as HTMLSelectElement
      ).value
    ).toBe('67')
    expect(
      (
        (await screen.findByTestId(
          `age-picker-${FORM_NAMES.uttaksalderGradertUttak}-maaneder`
        )) as HTMLSelectElement
      ).value
    ).toBe('2')
    expect(
      (
        screen.queryByTestId(
          FORM_NAMES.inntektVsaGradertUttak
        ) as HTMLInputElement
      ).value
    ).toBe('100000')
    expect(
      (
        (await screen.findByTestId(
          `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-aar`
        )) as HTMLSelectElement
      ).value
    ).toBe('70')
    expect(
      (
        (await screen.findByTestId(
          `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-maaneder`
        )) as HTMLSelectElement
      ).value
    ).toBe('6')

    fireEvent.click(screen.getByText('beregning.avansert.button.nullstill'))

    // Sjekker at feltene er nullstilt
    expect(
      await screen.findByTestId('formatert-inntekt-frem-til-uttak')
    ).toHaveTextContent('521 338')
    expect(
      (
        (await screen.findByTestId(
          `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-aar`
        )) as HTMLSelectElement
      ).value
    ).toBe('')
    expect(
      (
        (await screen.findByTestId(
          `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-maaneder`
        )) as HTMLSelectElement
      ).value
    ).toBe('')
    expect(
      screen.queryByTestId(FORM_NAMES.inntektVsaHeltUttakRadio)
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId(FORM_NAMES.inntektVsaHeltUttak)
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId(
        `age-picker-${FORM_NAMES.inntektVsaHeltUttakSluttAlder}-aar`
      )
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId(
        `age-picker-${FORM_NAMES.uttaksalderGradertUttak}-aar`
      )
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId(
        `age-picker-${FORM_NAMES.uttaksalderGradertUttak}-maaneder`
      )
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId(FORM_NAMES.inntektVsaGradertUttak)
    ).not.toBeInTheDocument()
  })

  it('når alle feltene for 100 % uttak fylles ut og at radioknappen for inntekt endres til nei, skjules det inntekt og sluttAlder', async () => {
    const user = userEvent.setup()
    const { store } = render(
      <BeregningContext.Provider
        value={{
          ...contextMockedValues,
        }}
      >
        <RedigerAvansertBeregning gaaTilResultat={vi.fn()} />
      </BeregningContext.Provider>
    )
    store.dispatch(apiSlice.endpoints.getInntekt.initiate())

    // Fyller ut feltene for 100 % uttak + inntekt vsa 100 % uttak
    fireEvent.change(
      await screen.findByTestId(
        `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-aar`
      ),
      {
        target: { value: '67' },
      }
    )
    fireEvent.change(
      await screen.findByTestId(
        `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-maaneder`
      ),
      {
        target: { value: '2' },
      }
    )
    await user.click(
      screen.getByTestId(`${FORM_NAMES.inntektVsaHeltUttakRadio}-ja`)
    )

    await user.type(
      screen.getByTestId(FORM_NAMES.inntektVsaHeltUttak),
      '123000'
    )
    fireEvent.change(
      screen.getByTestId(
        `age-picker-${FORM_NAMES.inntektVsaHeltUttakSluttAlder}-aar`
      ),
      { target: { value: '72' } }
    )
    fireEvent.change(
      screen.getByTestId(
        `age-picker-${FORM_NAMES.inntektVsaHeltUttakSluttAlder}-maaneder`
      ),
      { target: { value: '0' } }
    )

    // Endrer radio knappen til "nei"
    await user.click(
      screen.getByTestId(`${FORM_NAMES.inntektVsaHeltUttakRadio}-nei`)
    )

    // Sjekker at feltene for sluttAlder er skjult
    expect(
      screen.queryByTestId(
        `age-picker-${FORM_NAMES.inntektVsaHeltUttakSluttAlder}-aar`
      )
    ).not.toBeInTheDocument()

    expect(
      screen.queryByTestId(FORM_NAMES.inntektVsaHeltUttak)
    ).not.toBeInTheDocument()
  })

  it('når alle feltene for gradert uttak fylles ut og at radioknappen for inntekt endres til nei, skjules det inputfeltet for inntekt', async () => {
    const user = userEvent.setup()
    const { store } = render(
      <BeregningContext.Provider
        value={{
          ...contextMockedValues,
        }}
      >
        <RedigerAvansertBeregning gaaTilResultat={vi.fn()} />
      </BeregningContext.Provider>
    )
    store.dispatch(apiSlice.endpoints.getInntekt.initiate())

    // Fyller ut feltene for 100 % uttak
    fireEvent.change(
      await screen.findByTestId(
        `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-aar`
      ),
      {
        target: { value: '67' },
      }
    )
    fireEvent.change(
      await screen.findByTestId(
        `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-maaneder`
      ),
      {
        target: { value: '2' },
      }
    )

    // Endrer uttaksgrad
    fireEvent.change(await screen.findByTestId(FORM_NAMES.uttaksgrad), {
      target: { value: '60 %' },
    })

    // Verdien er overført til gradert uttak.
    // Fyller ut feltene for helt uttak + inntekt vsa gradert uttak
    fireEvent.change(
      await screen.findByTestId(
        `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-aar`
      ),
      {
        target: { value: '70' },
      }
    )
    fireEvent.change(
      await screen.findByTestId(
        `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-maaneder`
      ),
      {
        target: { value: '6' },
      }
    )
    await user.click(
      screen.getByTestId(`${FORM_NAMES.inntektVsaGradertUttakRadio}-ja`)
    )
    await user.type(
      screen.getByTestId(FORM_NAMES.inntektVsaGradertUttak),
      '100000'
    )

    // Endrer radio knappen til "nei"
    await user.click(
      screen.getByTestId(`${FORM_NAMES.inntektVsaGradertUttakRadio}-nei`)
    )

    // Sjekker at feltene er fylt ut og inputfelt for inntekt er skjult

    expect(
      (
        (await screen.findByTestId(
          `age-picker-${FORM_NAMES.uttaksalderGradertUttak}-aar`
        )) as HTMLSelectElement
      ).value
    ).toBe('67')
    expect(
      (
        (await screen.findByTestId(
          `age-picker-${FORM_NAMES.uttaksalderGradertUttak}-maaneder`
        )) as HTMLSelectElement
      ).value
    ).toBe('2')

    expect(
      (
        (await screen.findByTestId(
          `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-aar`
        )) as HTMLSelectElement
      ).value
    ).toBe('70')
    expect(
      (
        (await screen.findByTestId(
          `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-maaneder`
        )) as HTMLSelectElement
      ).value
    ).toBe('6')
    expect(
      screen.queryByTestId(FORM_NAMES.inntektVsaGradertUttak)
    ).not.toBeInTheDocument()
  })

  it('når feltene for 100 % uttak fylles ut og uttaksalder endres til en alder større enn sluttAlder for inntekt, nullstilles det sluttAlder feltet', async () => {
    const user = userEvent.setup()
    const { store } = render(
      <BeregningContext.Provider
        value={{
          ...contextMockedValues,
        }}
      >
        <RedigerAvansertBeregning gaaTilResultat={vi.fn()} />
      </BeregningContext.Provider>
    )
    store.dispatch(apiSlice.endpoints.getInntekt.initiate())

    // Fyller ut feltene for 100 % uttak + inntekt vsa 100 % uttak
    fireEvent.change(
      await screen.findByTestId(
        `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-aar`
      ),
      {
        target: { value: '67' },
      }
    )
    fireEvent.change(
      await screen.findByTestId(
        `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-maaneder`
      ),
      {
        target: { value: '2' },
      }
    )
    await user.click(
      screen.getByTestId(`${FORM_NAMES.inntektVsaHeltUttakRadio}-ja`)
    )

    await user.type(
      screen.getByTestId(FORM_NAMES.inntektVsaHeltUttak),
      '123000'
    )
    fireEvent.change(
      screen.getByTestId(
        `age-picker-${FORM_NAMES.inntektVsaHeltUttakSluttAlder}-aar`
      ),
      { target: { value: '72' } }
    )
    fireEvent.change(
      screen.getByTestId(
        `age-picker-${FORM_NAMES.inntektVsaHeltUttakSluttAlder}-maaneder`
      ),
      { target: { value: '0' } }
    )

    // Endrer uttaksalder til en alder som er større enn sluttAlder for inntekt
    fireEvent.change(
      await screen.findByTestId(
        `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-aar`
      ),
      {
        target: { value: '73' },
      }
    )
    fireEvent.change(
      await screen.findByTestId(
        `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-maaneder`
      ),
      {
        target: { value: '2' },
      }
    )

    // Sjekker at feltet for sluttAlder er nullstilt, men ikke de andre feltene

    expect(
      (
        (await screen.findByTestId(
          `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-aar`
        )) as HTMLSelectElement
      ).value
    ).toBe('73')
    expect(
      (
        (await screen.findByTestId(
          `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-maaneder`
        )) as HTMLSelectElement
      ).value
    ).toBe('2')

    expect(
      (
        (await screen.findByTestId(
          `age-picker-${FORM_NAMES.inntektVsaHeltUttakSluttAlder}-aar`
        )) as HTMLSelectElement
      ).value
    ).toBe('')
    expect(
      (
        (await screen.findByTestId(
          `age-picker-${FORM_NAMES.inntektVsaHeltUttakSluttAlder}-maaneder`
        )) as HTMLSelectElement
      ).value
    ).toBe('')
    expect(screen.getByTestId(FORM_NAMES.inntektVsaHeltUttak)).toHaveValue(
      '123000'
    )
  })

  describe('Når uttaksgrad endres', () => {
    it('overfører uttaksalder til gradert uttak når en grad lavere enn 100 % oppgis', async () => {
      render(
        <BeregningContext.Provider
          value={{
            ...contextMockedValues,
          }}
        >
          <RedigerAvansertBeregning gaaTilResultat={vi.fn()} />
        </BeregningContext.Provider>
      )

      fireEvent.change(
        screen.getByTestId(`age-picker-${FORM_NAMES.uttaksalderHeltUttak}-aar`),
        {
          target: { value: '65' },
        }
      )
      fireEvent.change(
        screen.getByTestId(
          `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-maaneder`
        ),
        {
          target: { value: '5' },
        }
      )
      fireEvent.change(await screen.findByTestId(FORM_NAMES.uttaksgrad), {
        target: { value: '80 %' },
      })

      // Sjekker at feltene for 100 % uttak er tomme
      expect(
        (
          screen.getByTestId(
            `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-aar`
          ) as HTMLSelectElement
        ).value
      ).toBe('')
      expect(
        (
          screen.getByTestId(
            `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-maaneder`
          ) as HTMLSelectElement
        ).value
      ).toBe('')

      // Sjekker at feltene for gradert uttak har fått riktig verdi
      expect(
        (
          (await screen.findByTestId(
            `age-picker-${FORM_NAMES.uttaksalderGradertUttak}-aar`
          )) as HTMLSelectElement
        ).value
      ).toBe('65')
      expect(
        (
          (await screen.findByTestId(
            `age-picker-${FORM_NAMES.uttaksalderGradertUttak}-maaneder`
          )) as HTMLSelectElement
        ).value
      ).toBe('5')
    })
    it('nullstiller feltene for gradert og overfører uttaksalder til helt uttak, når uttaksgrad settes tilbake til 100 %', async () => {
      const onSubmitMock = vi.spyOn(
        RedigerAvansertBeregningUtils,
        'onAvansertBeregningSubmit'
      )

      const user = userEvent.setup()
      render(
        <BeregningContext.Provider
          value={{
            ...contextMockedValues,
          }}
        >
          <RedigerAvansertBeregning gaaTilResultat={vi.fn()} />
        </BeregningContext.Provider>
      )

      // Fyller ut feltene for 100 % uttak + inntekt vsa 100 % uttak
      fireEvent.change(
        await screen.findByTestId(
          `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-aar`
        ),
        {
          target: { value: '67' },
        }
      )
      fireEvent.change(
        await screen.findByTestId(
          `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-maaneder`
        ),
        {
          target: { value: '2' },
        }
      )

      // Endrer uttaksgrad
      fireEvent.change(await screen.findByTestId(FORM_NAMES.uttaksgrad), {
        target: { value: '60 %' },
      })

      // Fyller ut feltene for helt uttak + inntekt vsa gradert uttak
      fireEvent.change(
        await screen.findByTestId(
          `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-aar`
        ),
        {
          target: { value: '70' },
        }
      )
      fireEvent.change(
        await screen.findByTestId(
          `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-maaneder`
        ),
        {
          target: { value: '6' },
        }
      )

      await user.click(
        screen.getByTestId(`${FORM_NAMES.inntektVsaHeltUttakRadio}-ja`)
      )

      await user.type(
        screen.getByTestId(FORM_NAMES.inntektVsaHeltUttak),
        '123000'
      )
      fireEvent.change(
        screen.getByTestId(
          `age-picker-${FORM_NAMES.inntektVsaHeltUttakSluttAlder}-aar`
        ),
        { target: { value: '75' } }
      )
      fireEvent.change(
        screen.getByTestId(
          `age-picker-${FORM_NAMES.inntektVsaHeltUttakSluttAlder}-maaneder`
        ),
        { target: { value: '0' } }
      )

      await user.click(
        screen.getByTestId(`${FORM_NAMES.inntektVsaGradertUttakRadio}-ja`)
      )
      await user.type(
        screen.getByTestId(FORM_NAMES.inntektVsaGradertUttak),
        '100000'
      )

      // Endrer uttaksgrad
      fireEvent.change(await screen.findByTestId(FORM_NAMES.uttaksgrad), {
        target: { value: '100 %' },
      })

      // Sjekker at feltene for gradert uttak er skjult
      expect(
        screen.queryByTestId(
          `age-picker-${FORM_NAMES.uttaksalderGradertUttak}-aar`
        )
      ).not.toBeInTheDocument()
      expect(
        screen.queryByTestId(
          `age-picker-${FORM_NAMES.uttaksalderGradertUttak}-maaneder`
        )
      ).not.toBeInTheDocument()
      expect(
        screen.queryByTestId(FORM_NAMES.inntektVsaGradertUttakRadio)
      ).not.toBeInTheDocument()
      expect(
        screen.queryByTestId(FORM_NAMES.inntektVsaGradertUttak)
      ).not.toBeInTheDocument()

      // Sjekker at uttaksalderen ble overført tilbake til helt uttak
      expect(
        (
          (await screen.findByTestId(
            `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-aar`
          )) as HTMLSelectElement
        ).value
      ).toBe('67')
      expect(
        (
          (await screen.findByTestId(
            `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-maaneder`
          )) as HTMLSelectElement
        ).value
      ).toBe('2')

      await user.click(screen.getByText('beregning.avansert.button.beregn'))

      expect(onSubmitMock.mock.calls[0][4]).toStrictEqual({
        harAvansertSkjemaUnsavedChanges: false,
        hasVilkaarIkkeOppfylt: false,
        localInntektFremTilUttak: null,
      })
    })
    it('oppdaterer uttaksgrad uten å nullstille uttaksaldere når grad endres fra en verdi lavere enn 100 % til en annen verdi lavere enn 100 %', async () => {
      const user = userEvent.setup()
      render(
        <BeregningContext.Provider
          value={{
            ...contextMockedValues,
          }}
        >
          <RedigerAvansertBeregning gaaTilResultat={vi.fn()} />
        </BeregningContext.Provider>
      )

      // Fyller ut feltene for helt uttak
      fireEvent.change(
        await screen.findByTestId(
          `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-aar`
        ),
        {
          target: { value: '67' },
        }
      )
      fireEvent.change(
        await screen.findByTestId(
          `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-maaneder`
        ),
        {
          target: { value: '6' },
        }
      )

      // Endrer uttaksgrad uten å ha fylt ut noe uttaksalder
      fireEvent.change(await screen.findByTestId(FORM_NAMES.uttaksgrad), {
        target: { value: '60 %' },
      })

      // Legger til inntekt vsa gradert uttak
      await user.click(
        screen.getByTestId(`${FORM_NAMES.inntektVsaGradertUttakRadio}-ja`)
      )
      await user.type(
        screen.getByTestId(FORM_NAMES.inntektVsaGradertUttak),
        '100000'
      )

      // Fyller ut feltene for helt uttak
      fireEvent.change(
        await screen.findByTestId(
          `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-aar`
        ),
        {
          target: { value: '70' },
        }
      )
      fireEvent.change(
        await screen.findByTestId(
          `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-maaneder`
        ),
        {
          target: { value: '6' },
        }
      )

      // Endrer uttaksgrad til en annen grad (ikke 100 %)
      fireEvent.change(await screen.findByTestId(FORM_NAMES.uttaksgrad), {
        target: { value: '40 %' },
      })

      // Sjekker at uttaksalderene ikke ble endret
      expect(
        (
          (await screen.findByTestId(
            `age-picker-${FORM_NAMES.uttaksalderGradertUttak}-aar`
          )) as HTMLSelectElement
        ).value
      ).toBe('67')
      expect(
        (
          (await screen.findByTestId(
            `age-picker-${FORM_NAMES.uttaksalderGradertUttak}-maaneder`
          )) as HTMLSelectElement
        ).value
      ).toBe('6')
      expect(
        (
          (await screen.findByTestId(
            `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-aar`
          )) as HTMLSelectElement
        ).value
      ).toBe('70')
      expect(
        (
          (await screen.findByTestId(
            `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-maaneder`
          )) as HTMLSelectElement
        ).value
      ).toBe('6')

      // Endrer feltene for gradert uttaksalder
      fireEvent.change(
        await screen.findByTestId(
          `age-picker-${FORM_NAMES.uttaksalderGradertUttak}-aar`
        ),
        {
          target: { value: '68' },
        }
      )
      fireEvent.change(
        await screen.findByTestId(
          `age-picker-${FORM_NAMES.uttaksalderGradertUttak}-maaneder`
        ),
        {
          target: { value: '6' },
        }
      )

      // Sjekker igjen at uttaksalder for hel pensjon ikke ble påvirket
      expect(
        (
          (await screen.findByTestId(
            `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-aar`
          )) as HTMLSelectElement
        ).value
      ).toBe('70')
      expect(
        (
          (await screen.findByTestId(
            `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-maaneder`
          )) as HTMLSelectElement
        ).value
      ).toBe('6')
      // Sjekker igjen at inntekt vsa gradert pensjon ikke ble påvirket
      expect(
        (
          (await screen.findByTestId(
            `${FORM_NAMES.inntektVsaGradertUttak}`
          )) as HTMLSelectElement
        ).value
      ).toBe('100000')
    })
    it('når uttaksgrad er ugyldig, håndteres den som om den var 100% og nullstiller feltene for gradert', async () => {
      const onSubmitMock = vi.spyOn(
        RedigerAvansertBeregningUtils,
        'onAvansertBeregningSubmit'
      )

      const user = userEvent.setup()
      render(
        <BeregningContext.Provider
          value={{
            ...contextMockedValues,
          }}
        >
          <RedigerAvansertBeregning gaaTilResultat={vi.fn()} />
        </BeregningContext.Provider>
      )

      // Fyller ut feltene for 100 % uttak + inntekt vsa 100 % uttak
      fireEvent.change(
        await screen.findByTestId(
          `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-aar`
        ),
        {
          target: { value: '67' },
        }
      )
      fireEvent.change(
        await screen.findByTestId(
          `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-maaneder`
        ),
        {
          target: { value: '2' },
        }
      )

      // Endrer uttaksgrad
      fireEvent.change(await screen.findByTestId(FORM_NAMES.uttaksgrad), {
        target: { value: '60 %' },
      })

      // Fyller ut feltene for helt uttak + inntekt vsa gradert uttak
      fireEvent.change(
        await screen.findByTestId(
          `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-aar`
        ),
        {
          target: { value: '70' },
        }
      )
      fireEvent.change(
        await screen.findByTestId(
          `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-maaneder`
        ),
        {
          target: { value: '6' },
        }
      )

      await user.click(
        screen.getByTestId(`${FORM_NAMES.inntektVsaHeltUttakRadio}-ja`)
      )

      await user.type(
        screen.getByTestId(FORM_NAMES.inntektVsaHeltUttak),
        '123000'
      )
      fireEvent.change(
        screen.getByTestId(
          `age-picker-${FORM_NAMES.inntektVsaHeltUttakSluttAlder}-aar`
        ),
        { target: { value: '75' } }
      )
      fireEvent.change(
        screen.getByTestId(
          `age-picker-${FORM_NAMES.inntektVsaHeltUttakSluttAlder}-maaneder`
        ),
        { target: { value: '0' } }
      )

      await user.click(
        screen.getByTestId(`${FORM_NAMES.inntektVsaGradertUttakRadio}-ja`)
      )
      await user.type(
        screen.getByTestId(FORM_NAMES.inntektVsaGradertUttak),
        '100000'
      )

      // Endrer uttaksgrad
      fireEvent.change(await screen.findByTestId(FORM_NAMES.uttaksgrad), {
        target: { value: 'noe ugyldig' },
      })

      // Sjekker at feltene for gradert uttak er skjult
      expect(
        screen.queryByTestId(
          `age-picker-${FORM_NAMES.uttaksalderGradertUttak}-aar`
        )
      ).not.toBeInTheDocument()
      expect(
        screen.queryByTestId(
          `age-picker-${FORM_NAMES.uttaksalderGradertUttak}-maaneder`
        )
      ).not.toBeInTheDocument()
      expect(
        screen.queryByTestId(FORM_NAMES.inntektVsaGradertUttakRadio)
      ).not.toBeInTheDocument()
      expect(
        screen.queryByTestId(FORM_NAMES.inntektVsaGradertUttak)
      ).not.toBeInTheDocument()

      // Sjekker at uttaksalderen ble overført tilbake til helt uttak
      expect(
        (
          (await screen.findByTestId(
            `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-aar`
          )) as HTMLSelectElement
        ).value
      ).toBe('67')
      expect(
        (
          (await screen.findByTestId(
            `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-maaneder`
          )) as HTMLSelectElement
        ).value
      ).toBe('2')

      await user.click(screen.getByText('beregning.avansert.button.beregn'))

      expect(onSubmitMock.mock.calls[0][4]).toStrictEqual({
        harAvansertSkjemaUnsavedChanges: false,
        hasVilkaarIkkeOppfylt: false,
        localInntektFremTilUttak: null,
      })
    })
  })

  it('Når brukeren klikker på beregn med ugyldige felter, vises det feilmeldinger og fokus flyttes til riktig felt', async () => {
    const user = userEvent.setup()
    render(
      <BeregningContext.Provider
        value={{
          ...contextMockedValues,
        }}
      >
        <RedigerAvansertBeregning gaaTilResultat={vi.fn()} />
      </BeregningContext.Provider>
    )

    await user.click(screen.getByText('beregning.avansert.button.beregn'))
    // Feilmelding for uttaksalder for 100% uttak
    expect(
      screen.getByText('agepicker.validation_error.aar', {
        exact: false,
      })
    ).toBeVisible()
    expect((document.activeElement as HTMLElement).getAttribute('name')).toBe(
      `${FORM_NAMES.uttaksalderHeltUttak}-aar`
    )

    // Fyller inn uttaksalder slik at RadioGroup vises
    fireEvent.change(
      screen.getByTestId(`age-picker-${FORM_NAMES.uttaksalderHeltUttak}-aar`),
      {
        target: { value: '65' },
      }
    )
    fireEvent.change(
      screen.getByTestId(
        `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-maaneder`
      ),
      {
        target: { value: '5' },
      }
    )

    await user.click(screen.getByText('beregning.avansert.button.beregn'))
    // Feilmelding for radioknapp inntekt vsa 100 % uttak
    expect(
      screen.getByText('Du må svare på om du forventer å ha inntekt samtidig', {
        exact: false,
      })
    ).toBeVisible()
    expect((document.activeElement as HTMLElement).getAttribute('name')).toBe(
      FORM_NAMES.inntektVsaHeltUttakRadio
    )

    // Hukker av for inntekt vsa. gradert uttak og viser felt for beløp
    await user.click(
      screen.getByTestId(`${FORM_NAMES.inntektVsaHeltUttakRadio}-ja`)
    )
    await user.click(screen.getByText('beregning.avansert.button.beregn'))
    // Feilmelding for inntekt vsa 100 % uttak
    expect(
      screen.getByText(
        'Du må fylle ut forventet inntekt samtidig som du tar ut',
        {
          exact: false,
        }
      )
    ).toBeVisible()
    expect((document.activeElement as HTMLElement).getAttribute('name')).toBe(
      FORM_NAMES.inntektVsaHeltUttak
    )

    // Fylle ut inntekt vsa 100 % uttak
    await user.type(
      screen.getByTestId(FORM_NAMES.inntektVsaHeltUttak),
      '123000'
    )
    await user.click(screen.getByText('beregning.avansert.button.beregn'))
    // Feilmelding for sluttAlder for inntekt vsa 100 % uttak
    expect(
      screen.getByText('agepicker.validation_error.aar', {
        exact: false,
      })
    ).toBeVisible()
    expect((document.activeElement as HTMLElement).getAttribute('name')).toBe(
      `${FORM_NAMES.inntektVsaHeltUttakSluttAlder}-aar`
    )

    // Hukker av nei for inntekt vsa. helt uttak og skjuler feltene
    await user.click(
      screen.getByTestId(`${FORM_NAMES.inntektVsaHeltUttakRadio}-nei`)
    )

    // Velger gradert uttak
    fireEvent.change(await screen.findByTestId(FORM_NAMES.uttaksgrad), {
      target: { value: '80 %' },
    })

    await user.click(screen.getByText('beregning.avansert.button.beregn'))

    // Feilmelding for uttaksalder for 100% uttak
    expect(
      screen.getByText('agepicker.validation_error.aar', {
        exact: false,
      })
    ).toBeVisible()

    // fyller ut 100 % uttaksalder
    fireEvent.change(
      screen.getByTestId(`age-picker-${FORM_NAMES.uttaksalderHeltUttak}-aar`),
      {
        target: { value: '67' },
      }
    )
    fireEvent.change(
      screen.getByTestId(
        `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-maaneder`
      ),
      {
        target: { value: '5' },
      }
    )
    // Hukker av nei for inntekt vsa. gradert uttak
    await user.click(
      screen.getByTestId(`${FORM_NAMES.inntektVsaHeltUttakRadio}-nei`)
    )

    await user.click(screen.getByText('beregning.avansert.button.beregn'))

    // Feilmelding radioknapp for inntekt vsa gradert
    expect(
      screen.getByText(
        'Du må svare på om du forventer å ha inntekt samtidig som du tar ut',
        {
          exact: false,
        }
      )
    ).toBeVisible()
    expect((document.activeElement as HTMLElement).getAttribute('name')).toBe(
      FORM_NAMES.inntektVsaGradertUttakRadio
    )

    // Hukker av ja for inntekt vsa. gradert uttak
    await user.click(
      screen.getByTestId(`${FORM_NAMES.inntektVsaGradertUttakRadio}-ja`)
    )
    await user.click(screen.getByText('beregning.avansert.button.beregn'))

    // Feilmelding for inntekt vsa gradert uttak
    expect(
      screen.getByText(
        'Du må fylle ut forventet inntekt samtidig som du tar ut',
        { exact: false }
      )
    ).toBeVisible()

    expect((document.activeElement as HTMLElement).getAttribute('name')).toBe(
      FORM_NAMES.inntektVsaGradertUttak
    )
  })

  describe('Når simuleringen svarer med vilkaarIkkeOppfylt', () => {
    it('viser alert med informasjon om alternativer', async () => {
      const vilkaarsproevingMock = {
        vilkaarErOppfylt: false,
        alternativ: {
          heltUttaksalder: { aar: 67, maaneder: 0 },
        },
      }

      mockResponse('/v3/alderspensjon/simulering', {
        status: 200,
        method: 'post',
        json: {
          alderspensjon: [],
          afpPrivat: [],
          vilkaarsproeving: vilkaarsproevingMock,
        },
      })

      const currentSimulation: Simulation = {
        formatertUttaksalderReadOnly: '62 år string.og 0 alder.maaned',
        uttaksalder: { aar: 62, maaneder: 0 },
        aarligInntektFoerUttakBeloep: null,
        gradertUttaksperiode: null,
      }

      render(
        <BeregningContext.Provider
          value={{
            ...contextMockedValues,
          }}
        >
          <RedigerAvansertBeregning
            gaaTilResultat={vi.fn()}
            vilkaarsproeving={vilkaarsproevingMock}
          />
        </BeregningContext.Provider>,
        {
          preloadedState: {
            userInput: {
              ...userInputInitialState,
              samtykke: false,
              currentSimulation: { ...currentSimulation },
            },
          },
        }
      )
      expect(
        screen.getByText('beregning.vilkaarsproeving.intro', { exact: false })
      ).toBeVisible()
    })
  })
})

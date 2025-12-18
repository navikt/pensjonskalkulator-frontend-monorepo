import { describe, expect, it } from 'vitest'

import {
  fulfilledGetLoependeVedtak0Ufoeregrad,
  fulfilledGetLoependeVedtak100Ufoeregrad,
  fulfilledGetLoependeVedtakLoepende0Alderspensjon100Ufoeretrygd,
  fulfilledGetLoependeVedtakLoependeAlderspensjon,
  fulfilledGetPerson,
  fulfilledGetPersonMedOekteAldersgrenser,
  loependeVedtak0UfoeregradMock,
  personMock,
} from '@/mocks/mockedRTKQueryApiCalls'
import { mockResponse } from '@/mocks/server'
import {
  AvansertBeregningModus,
  BeregningContext,
} from '@/pages/Beregning/context'
import { apiSlice } from '@/state/api/apiSlice'
import {
  Simulation,
  userInputInitialState,
} from '@/state/userInput/userInputSlice'
import { fireEvent, render, screen, userEvent } from '@/test-utils'
import * as alderUtils from '@/utils/alder'

import { AvansertSkjemaForAndreBrukere } from '..'
import { getPreviousMonth } from '../../test-utils'
import * as AvansertSkjemaForAndreBrukereUtils from '../../utils'
import { AVANSERT_FORM_NAMES } from '../../utils'

describe('AvansertSkjemaForAndreBrukere', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  const contextMockedValues = {
    avansertSkjemaModus: 'redigering' as AvansertBeregningModus,
    setAvansertSkjemaModus: vi.fn(),
    harAvansertSkjemaUnsavedChanges: false,
    setHarAvansertSkjemaUnsavedChanges: () => {},
  }

  const mockedQueries = {
    ...fulfilledGetPerson,
    ...fulfilledGetLoependeVedtak0Ufoeregrad,
  }

  const agePickerMonth = getPreviousMonth()

  it('vises informasjon om inntekt, uttaksgrad og pensjonsalder', async () => {
    render(
      <BeregningContext.Provider
        value={{
          ...contextMockedValues,
        }}
      >
        <AvansertSkjemaForAndreBrukere />
      </BeregningContext.Provider>,
      {
        preloadedState: {
          userInput: {
            ...userInputInitialState,
          },
        },
        preloadedApiState: {
          getPerson: personMock,
          getLoependeVedtak: loependeVedtak0UfoeregradMock,
        },
      }
    )

    expect(screen.queryByTestId('om_pensjonsgivende_inntekt')).toBeVisible()
    expect(screen.queryByTestId('om_uttaksgrad')).toBeVisible()
    expect(screen.queryByTestId('om_TMU')).toBeVisible()

    fireEvent.change(
      await screen.findByTestId(AVANSERT_FORM_NAMES.uttaksgrad),
      {
        target: { value: '80' },
      }
    )

    expect(screen.queryByTestId('om_TMU')).toBeVisible()
  })

  it('feltene rendres riktig som default, og når brukeren legger til en gradert periode', async () => {
    vi.spyOn(alderUtils, 'getBrukerensAlderISluttenAvMaaneden').mockReturnValue(
      { aar: 64, maaneder: 5 }
    )

    const user = userEvent.setup()
    render(
      <BeregningContext.Provider
        value={{
          ...contextMockedValues,
        }}
      >
        <AvansertSkjemaForAndreBrukere />
      </BeregningContext.Provider>,
      {
        preloadedState: {
          api: {
            // @ts-ignore
            queries: { ...mockedQueries },
          },
          userInput: {
            ...userInputInitialState,
          },
        },
      }
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
      screen.getByTestId(
        `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-aar`
      )
    ).toBeVisible()
    expect(screen.queryByTestId('om_TMU')).toBeVisible()
    expect(
      screen.queryByTestId(AVANSERT_FORM_NAMES.inntektVsaHeltUttakRadio)
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId(AVANSERT_FORM_NAMES.inntektVsaHeltUttak)
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId(
        `age-picker-${AVANSERT_FORM_NAMES.inntektVsaHeltUttakSluttAlder}-aar`
      )
    ).not.toBeInTheDocument()

    // Fyller inn uttaksalder og grad slik at RadioGroup vises
    const selectAarElement = screen.getByTestId(
      `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-aar`
    )
    const optionAarElements = selectAarElement?.querySelectorAll('option')
    expect(optionAarElements?.[0].value).toBe('')
    // 64 er brukerens alder + 1 måned
    expect(optionAarElements?.[1].value).toBe('64')

    fireEvent.change(
      screen.getByTestId(
        `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-aar`
      ),
      {
        target: { value: '64' },
      }
    )

    const selectMaanederElement = screen.getByTestId(
      `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-maaneder`
    )
    const optionMaanederElements =
      selectMaanederElement?.querySelectorAll('option')
    expect(optionMaanederElements?.[0].value).toBe('5')

    fireEvent.change(
      screen.getByTestId(
        `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-maaneder`
      ),
      {
        target: { value: '5' },
      }
    )
    fireEvent.change(
      await screen.findByTestId(AVANSERT_FORM_NAMES.uttaksgrad),
      {
        target: { value: '100' },
      }
    )

    // Hukker av for inntekt vsa. helt uttak og viser felt for beløp og sluttalder
    const heltRadioGroup = screen.getByTestId(
      AVANSERT_FORM_NAMES.inntektVsaHeltUttakRadio
    )
    expect(heltRadioGroup).toBeVisible()
    await user.click(
      screen.getByTestId(`${AVANSERT_FORM_NAMES.inntektVsaHeltUttakRadio}-ja`)
    )
    expect(
      screen.getByTestId(AVANSERT_FORM_NAMES.inntektVsaHeltUttak)
    ).toBeVisible()
    expect(
      screen.getByTestId(
        `age-picker-${AVANSERT_FORM_NAMES.inntektVsaHeltUttakSluttAlder}-aar`
      )
    ).toBeVisible()

    // Velger gradert uttak
    fireEvent.change(
      await screen.findByTestId(AVANSERT_FORM_NAMES.uttaksgrad),
      {
        target: { value: '80' },
      }
    )
    expect(
      screen.getByTestId(
        `age-picker-${AVANSERT_FORM_NAMES.uttaksalderGradertUttak}-aar`
      )
    ).toBeVisible()
    const selectAarElement2 = screen.getByTestId(
      `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-aar`
    )
    const optionAarElements2 = selectAarElement2?.querySelectorAll('option')
    expect(optionAarElements2?.[0].value).toBe('')
    expect(optionAarElements2?.[1].value).toBe('64')

    fireEvent.change(
      screen.getByTestId(
        `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-aar`
      ),
      {
        target: { value: '64' },
      }
    )

    const selectMaanederElement2 = screen.getByTestId(
      `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-maaneder`
    )
    const optionMaanederElements2 =
      selectMaanederElement2?.querySelectorAll('option')
    expect(optionMaanederElements2?.[0].value).toBe('5')

    const selectAarElement3 = screen.getByTestId(
      `age-picker-${AVANSERT_FORM_NAMES.uttaksalderGradertUttak}-aar`
    )
    const optionAarElements3 = selectAarElement3?.querySelectorAll('option')
    expect(optionAarElements3?.[0].value).toBe('')
    expect(optionAarElements3?.[1].value).toBe('64')

    fireEvent.change(
      screen.getByTestId(
        `age-picker-${AVANSERT_FORM_NAMES.uttaksalderGradertUttak}-aar`
      ),
      {
        target: { value: '64' },
      }
    )

    const selectMaanederElement3 = screen.getByTestId(
      `age-picker-${AVANSERT_FORM_NAMES.uttaksalderGradertUttak}-maaneder`
    )
    const optionMaanederElements3 =
      selectMaanederElement3?.querySelectorAll('option')
    expect(optionMaanederElements3?.[0].value).toBe('5')

    expect(
      screen.queryByTestId(AVANSERT_FORM_NAMES.inntektVsaGradertUttak)
    ).not.toBeInTheDocument()

    // Hukker av for inntekt vsa. gradert uttak og viser felt for beløp
    await user.click(
      screen.getByTestId(
        `${AVANSERT_FORM_NAMES.inntektVsaGradertUttakRadio}-ja`
      )
    )
    expect(
      screen.getByTestId(AVANSERT_FORM_NAMES.inntektVsaGradertUttak)
    ).toBeVisible()
  })

  it('Når alle feltene fylles ut og resetForm kalles, nullstilles alle feltene', async () => {
    const user = userEvent.setup()
    const { store } = render(
      <BeregningContext.Provider
        value={{
          ...contextMockedValues,
        }}
      >
        <AvansertSkjemaForAndreBrukere />
      </BeregningContext.Provider>,
      {
        preloadedState: {
          api: {
            // @ts-ignore
            queries: { ...mockedQueries },
          },
          userInput: {
            ...userInputInitialState,
          },
        },
      }
    )
    await store.dispatch(apiSlice.endpoints.getInntekt.initiate())

    // Endrer inntekt frem til uttak
    await user.click(
      screen.getByText('beregning.avansert.rediger.inntekt.button')
    )
    const input = screen.getByTestId('inntekt-textfield')
    await user.clear(input)
    await user.type(input, '1')
    await user.type(input, '2')
    await user.type(input, '3')
    await user.type(input, '0')
    await user.type(input, '0')
    await user.type(input, '0')
    expect(
      screen.queryByText(
        'inntekt.endre_inntekt_modal.textfield.validation_error'
      )
    ).not.toBeInTheDocument()
    await user.click(screen.getByText('inntekt.endre_inntekt_modal.button'))

    // Fyller ut feltene for 100 % uttak + inntekt vsa 100 % uttak
    fireEvent.change(
      await screen.findByTestId(
        `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-aar`
      ),
      {
        target: { value: '67' },
      }
    )
    fireEvent.change(
      await screen.findByTestId(
        `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-maaneder`
      ),
      {
        target: { value: '2' },
      }
    )
    // Endrer uttaksgrad
    fireEvent.change(
      await screen.findByTestId(AVANSERT_FORM_NAMES.uttaksgrad),
      {
        target: { value: '60' },
      }
    )

    await user.click(
      screen.getByTestId(
        `${AVANSERT_FORM_NAMES.inntektVsaGradertUttakRadio}-ja`
      )
    )
    await user.type(
      screen.getByTestId(AVANSERT_FORM_NAMES.inntektVsaGradertUttak),
      '100000'
    )

    // Verdien er overført til gradert uttak.
    // Fyller ut feltene for helt uttak + inntekt vsa gradert uttak
    fireEvent.change(
      await screen.findByTestId(
        `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-aar`
      ),
      {
        target: { value: '70' },
      }
    )
    fireEvent.change(
      await screen.findByTestId(
        `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-maaneder`
      ),
      {
        target: { value: '6' },
      }
    )

    await user.click(
      screen.getByTestId(`${AVANSERT_FORM_NAMES.inntektVsaHeltUttakRadio}-ja`)
    )
    const inputField = screen.getByTestId(
      AVANSERT_FORM_NAMES.inntektVsaHeltUttak
    )
    await user.type(inputField, '1')
    await user.type(inputField, '2')
    await user.type(inputField, '3')
    await user.type(inputField, '0')
    await user.type(inputField, '0')
    await user.type(inputField, '0')

    fireEvent.change(
      screen.getByTestId(
        `age-picker-${AVANSERT_FORM_NAMES.inntektVsaHeltUttakSluttAlder}-aar`
      ),
      { target: { value: '75' } }
    )
    fireEvent.change(
      screen.getByTestId(
        `age-picker-${AVANSERT_FORM_NAMES.inntektVsaHeltUttakSluttAlder}-maaneder`
      ),
      { target: { value: '0' } }
    )

    // Sjekker at feltene er fylt ut
    expect(
      await screen.findByTestId('formatert-inntekt-frem-til-uttak')
    ).toHaveTextContent('123 000')
    expect(
      (
        await screen.findByTestId<HTMLSelectElement>(
          `age-picker-${AVANSERT_FORM_NAMES.uttaksalderGradertUttak}-aar`
        )
      ).value
    ).toBe('67')
    expect(
      (
        await screen.findByTestId<HTMLSelectElement>(
          `age-picker-${AVANSERT_FORM_NAMES.uttaksalderGradertUttak}-maaneder`
        )
      ).value
    ).toBe('2')
    expect(
      (
        screen.queryByTestId(
          AVANSERT_FORM_NAMES.inntektVsaGradertUttak
        ) as HTMLInputElement
      ).value
    ).toBe('100 000')
    expect(
      (
        await screen.findByTestId<HTMLSelectElement>(
          `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-aar`
        )
      ).value
    ).toBe('70')
    expect(
      (
        await screen.findByTestId<HTMLSelectElement>(
          `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-maaneder`
        )
      ).value
    ).toBe('6')

    fireEvent.click(screen.getByText('beregning.avansert.button.nullstill'))

    // Sjekker at feltene er nullstilt
    expect(
      await screen.findByTestId('formatert-inntekt-frem-til-uttak')
    ).toHaveTextContent('521 338')
    expect(
      (
        await screen.findByTestId<HTMLSelectElement>(
          `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-aar`
        )
      ).value
    ).toBe('')
    expect(
      (
        await screen.findByTestId<HTMLSelectElement>(
          `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-maaneder`
        )
      ).value
    ).toBe('')
    expect(
      screen.queryByTestId(AVANSERT_FORM_NAMES.inntektVsaHeltUttakRadio)
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId(AVANSERT_FORM_NAMES.inntektVsaHeltUttak)
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId(
        `age-picker-${AVANSERT_FORM_NAMES.inntektVsaHeltUttakSluttAlder}-aar`
      )
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId(
        `age-picker-${AVANSERT_FORM_NAMES.uttaksalderGradertUttak}-aar`
      )
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId(
        `age-picker-${AVANSERT_FORM_NAMES.uttaksalderGradertUttak}-maaneder`
      )
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId(AVANSERT_FORM_NAMES.inntektVsaGradertUttak)
    ).not.toBeInTheDocument()

    // Fyller uttaksalder igjen
    fireEvent.change(
      await screen.findByTestId(
        `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-aar`
      ),
      {
        target: { value: '70' },
      }
    )
    fireEvent.change(
      await screen.findByTestId(
        `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-maaneder`
      ),
      {
        target: { value: '6' },
      }
    )
    fireEvent.change(
      await screen.findByTestId(AVANSERT_FORM_NAMES.uttaksgrad),
      {
        target: { value: '60' },
      }
    )
    // sjekker at radio knappen for gradert uttak er nullstilt
    expect(
      screen.getByTestId(
        `${AVANSERT_FORM_NAMES.inntektVsaGradertUttakRadio}-ja`
      )
    ).not.toBeChecked()
    expect(
      screen.getByTestId(
        `${AVANSERT_FORM_NAMES.inntektVsaGradertUttakRadio}-nei`
      )
    ).not.toBeChecked()
    // Fyller uttaksalder igjen
    fireEvent.change(
      await screen.findByTestId(
        `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-aar`
      ),
      {
        target: { value: '73' },
      }
    )
    fireEvent.change(
      await screen.findByTestId(
        `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-maaneder`
      ),
      {
        target: { value: '3' },
      }
    )
    // sjekker at radio knappen for helt uttaker nullstilt
    expect(
      screen.getByTestId(`${AVANSERT_FORM_NAMES.inntektVsaHeltUttakRadio}-ja`)
    ).not.toBeChecked()
    expect(
      screen.getByTestId(`${AVANSERT_FORM_NAMES.inntektVsaHeltUttakRadio}-nei`)
    ).not.toBeChecked()
  })

  it('Når alle feltene for 100 % uttak fylles ut og radioknappen for inntekt endres til nei, skjules inntekt og sluttAlder', async () => {
    const user = userEvent.setup()
    const { store } = render(
      <BeregningContext.Provider
        value={{
          ...contextMockedValues,
        }}
      >
        <AvansertSkjemaForAndreBrukere />
      </BeregningContext.Provider>,
      {
        preloadedState: {
          api: {
            // @ts-ignore
            queries: { ...mockedQueries },
          },
          userInput: {
            ...userInputInitialState,
          },
        },
      }
    )
    await store.dispatch(apiSlice.endpoints.getInntekt.initiate())

    // Fyller ut feltene for 100 % uttak + inntekt vsa 100 % uttak
    fireEvent.change(
      await screen.findByTestId(
        `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-aar`
      ),
      {
        target: { value: '67' },
      }
    )
    fireEvent.change(
      await screen.findByTestId(
        `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-maaneder`
      ),
      {
        target: { value: '2' },
      }
    )
    // Endrer uttaksgrad
    fireEvent.change(
      await screen.findByTestId(AVANSERT_FORM_NAMES.uttaksgrad),
      {
        target: { value: '100' },
      }
    )
    await user.click(
      screen.getByTestId(`${AVANSERT_FORM_NAMES.inntektVsaHeltUttakRadio}-ja`)
    )
    const inputField = screen.getByTestId(
      AVANSERT_FORM_NAMES.inntektVsaHeltUttak
    )
    await user.type(inputField, '1')
    await user.type(inputField, '2')
    await user.type(inputField, '3')
    await user.type(inputField, '0')
    await user.type(inputField, '0')
    await user.type(inputField, '0')
    fireEvent.change(
      screen.getByTestId(
        `age-picker-${AVANSERT_FORM_NAMES.inntektVsaHeltUttakSluttAlder}-aar`
      ),
      { target: { value: '72' } }
    )
    fireEvent.change(
      screen.getByTestId(
        `age-picker-${AVANSERT_FORM_NAMES.inntektVsaHeltUttakSluttAlder}-maaneder`
      ),
      { target: { value: '0' } }
    )

    // Endrer radio knappen til "nei"
    await user.click(
      screen.getByTestId(`${AVANSERT_FORM_NAMES.inntektVsaHeltUttakRadio}-nei`)
    )

    // Sjekker at feltene for sluttAlder er skjult
    expect(
      screen.queryByTestId(
        `age-picker-${AVANSERT_FORM_NAMES.inntektVsaHeltUttakSluttAlder}-aar`
      )
    ).not.toBeInTheDocument()

    expect(
      screen.queryByTestId(AVANSERT_FORM_NAMES.inntektVsaHeltUttak)
    ).not.toBeInTheDocument()
  })

  it('Når alle feltene for gradert uttak fylles ut og radioknappen for inntekt endres til nei, skjules inputfeltet for inntekt', async () => {
    const user = userEvent.setup()
    const { store } = render(
      <BeregningContext.Provider
        value={{
          ...contextMockedValues,
        }}
      >
        <AvansertSkjemaForAndreBrukere />
      </BeregningContext.Provider>,
      {
        preloadedState: {
          api: {
            // @ts-ignore
            queries: { ...mockedQueries },
          },
          userInput: {
            ...userInputInitialState,
          },
        },
      }
    )
    await store.dispatch(apiSlice.endpoints.getInntekt.initiate())

    // Fyller ut feltene for 100 % uttak
    fireEvent.change(
      await screen.findByTestId(
        `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-aar`
      ),
      {
        target: { value: '67' },
      }
    )
    fireEvent.change(
      await screen.findByTestId(
        `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-maaneder`
      ),
      {
        target: { value: '2' },
      }
    )

    // Endrer uttaksgrad
    fireEvent.change(
      await screen.findByTestId(AVANSERT_FORM_NAMES.uttaksgrad),
      {
        target: { value: '60' },
      }
    )

    // Verdien er overført til gradert uttak.
    // Fyller ut feltene for helt uttak + inntekt vsa gradert uttak
    fireEvent.change(
      await screen.findByTestId(
        `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-aar`
      ),
      {
        target: { value: '70' },
      }
    )
    fireEvent.change(
      await screen.findByTestId(
        `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-maaneder`
      ),
      {
        target: { value: '6' },
      }
    )
    await user.click(
      screen.getByTestId(
        `${AVANSERT_FORM_NAMES.inntektVsaGradertUttakRadio}-ja`
      )
    )
    await user.type(
      screen.getByTestId(AVANSERT_FORM_NAMES.inntektVsaGradertUttak),
      '100000'
    )

    // Endrer radio knappen til "nei"
    await user.click(
      screen.getByTestId(
        `${AVANSERT_FORM_NAMES.inntektVsaGradertUttakRadio}-nei`
      )
    )

    // Sjekker at feltene er fylt ut og inputfelt for inntekt er skjult

    expect(
      (
        await screen.findByTestId<HTMLSelectElement>(
          `age-picker-${AVANSERT_FORM_NAMES.uttaksalderGradertUttak}-aar`
        )
      ).value
    ).toBe('67')
    expect(
      (
        await screen.findByTestId<HTMLSelectElement>(
          `age-picker-${AVANSERT_FORM_NAMES.uttaksalderGradertUttak}-maaneder`
        )
      ).value
    ).toBe('2')

    expect(
      (
        await screen.findByTestId<HTMLSelectElement>(
          `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-aar`
        )
      ).value
    ).toBe('70')
    expect(
      (
        await screen.findByTestId<HTMLSelectElement>(
          `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-maaneder`
        )
      ).value
    ).toBe('6')
    expect(
      screen.queryByTestId(AVANSERT_FORM_NAMES.inntektVsaGradertUttak)
    ).not.toBeInTheDocument()
  })

  it('Når feltene for 100 % uttak fylles ut og uttaksalder endres til en alder større enn sluttAlder for inntekt, nullstilles sluttAlder', async () => {
    const user = userEvent.setup()
    const { store } = render(
      <BeregningContext.Provider
        value={{
          ...contextMockedValues,
        }}
      >
        <AvansertSkjemaForAndreBrukere />
      </BeregningContext.Provider>,
      {
        preloadedState: {
          api: {
            // @ts-ignore
            queries: { ...mockedQueries },
          },
          userInput: {
            ...userInputInitialState,
          },
        },
      }
    )
    await store.dispatch(apiSlice.endpoints.getInntekt.initiate())

    // Fyller ut feltene for 100 % uttak + inntekt vsa 100 % uttak
    fireEvent.change(
      await screen.findByTestId(
        `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-aar`
      ),
      { target: { value: '67' } }
    )
    fireEvent.change(
      await screen.findByTestId(
        `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-maaneder`
      ),
      { target: { value: '2' } }
    )
    // Endrer uttaksgrad
    fireEvent.change(
      await screen.findByTestId(AVANSERT_FORM_NAMES.uttaksgrad),
      { target: { value: '100' } }
    )
    await user.click(
      screen.getByTestId(`${AVANSERT_FORM_NAMES.inntektVsaHeltUttakRadio}-ja`)
    )
    const inputField = screen.getByTestId(
      AVANSERT_FORM_NAMES.inntektVsaHeltUttak
    )
    await user.type(inputField, '1')
    await user.type(inputField, '2')
    await user.type(inputField, '3')
    await user.type(inputField, '0')
    await user.type(inputField, '0')
    await user.type(inputField, '0')
    fireEvent.change(
      screen.getByTestId(
        `age-picker-${AVANSERT_FORM_NAMES.inntektVsaHeltUttakSluttAlder}-aar`
      ),
      { target: { value: '72' } }
    )
    fireEvent.change(
      screen.getByTestId(
        `age-picker-${AVANSERT_FORM_NAMES.inntektVsaHeltUttakSluttAlder}-maaneder`
      ),
      { target: { value: '0' } }
    )

    // Endrer uttaksalder til en alder som er større enn sluttAlder for inntekt
    fireEvent.change(
      await screen.findByTestId(
        `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-aar`
      ),
      { target: { value: '73' } }
    )
    fireEvent.change(
      await screen.findByTestId(
        `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-maaneder`
      ),
      { target: { value: '2' } }
    )

    // Sjekker at feltet for sluttAlder er nullstilt, men ikke de andre feltene

    expect(
      (
        await screen.findByTestId<HTMLSelectElement>(
          `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-aar`
        )
      ).value
    ).toBe('73')
    expect(
      (
        await screen.findByTestId<HTMLSelectElement>(
          `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-maaneder`
        )
      ).value
    ).toBe('2')

    expect(
      (
        await screen.findByTestId<HTMLSelectElement>(
          `age-picker-${AVANSERT_FORM_NAMES.inntektVsaHeltUttakSluttAlder}-aar`
        )
      ).value
    ).toBe('')
    expect(
      (
        await screen.findByTestId<HTMLSelectElement>(
          `age-picker-${AVANSERT_FORM_NAMES.inntektVsaHeltUttakSluttAlder}-maaneder`
        )
      ).value
    ).toBe('')
    expect(
      screen.getByTestId(AVANSERT_FORM_NAMES.inntektVsaHeltUttak)
    ).toHaveValue('123 000')
  })

  describe('Når uttaksgrad endres,', () => {
    it('overfører uttaksalder til gradert uttak når en grad lavere enn 100 % oppgis', async () => {
      render(
        <BeregningContext.Provider
          value={{
            ...contextMockedValues,
          }}
        >
          <AvansertSkjemaForAndreBrukere />
        </BeregningContext.Provider>,
        {
          preloadedState: {
            api: {
              // @ts-ignore
              queries: { ...mockedQueries },
            },
            userInput: {
              ...userInputInitialState,
            },
          },
        }
      )

      fireEvent.change(
        screen.getByTestId(
          `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-aar`
        ),
        {
          target: { value: '65' },
        }
      )
      fireEvent.change(
        screen.getByTestId(
          `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-maaneder`
        ),
        {
          target: { value: '5' },
        }
      )
      fireEvent.change(
        await screen.findByTestId(AVANSERT_FORM_NAMES.uttaksgrad),
        {
          target: { value: '80' },
        }
      )

      // Sjekker at feltene for 100 % uttak er tomme
      expect(
        screen.getByTestId<HTMLSelectElement>(
          `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-aar`
        ).value
      ).toBe('')
      expect(
        screen.getByTestId<HTMLSelectElement>(
          `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-maaneder`
        ).value
      ).toBe('')

      // Sjekker at feltene for gradert uttak har fått riktig verdi
      expect(
        (
          await screen.findByTestId<HTMLSelectElement>(
            `age-picker-${AVANSERT_FORM_NAMES.uttaksalderGradertUttak}-aar`
          )
        ).value
      ).toBe('65')
      expect(
        (
          await screen.findByTestId<HTMLSelectElement>(
            `age-picker-${AVANSERT_FORM_NAMES.uttaksalderGradertUttak}-maaneder`
          )
        ).value
      ).toBe('5')
    })

    it('nullstiller feltene for gradert og overfører uttaksalder til helt uttak, når uttaksgrad settes tilbake til 100 %', async () => {
      const onSubmitMock = vi.spyOn(
        AvansertSkjemaForAndreBrukereUtils,
        'onAvansertBeregningSubmit'
      )

      const user = userEvent.setup()
      render(
        <BeregningContext.Provider
          value={{
            ...contextMockedValues,
          }}
        >
          <AvansertSkjemaForAndreBrukere />
        </BeregningContext.Provider>,
        {
          preloadedState: {
            api: {
              // @ts-ignore
              queries: { ...mockedQueries },
            },
            userInput: {
              ...userInputInitialState,
            },
          },
        }
      )

      // Fyller ut feltene for 100 % uttak + inntekt vsa 100 % uttak
      fireEvent.change(
        await screen.findByTestId(
          `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-aar`
        ),
        {
          target: { value: '67' },
        }
      )
      fireEvent.change(
        await screen.findByTestId(
          `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-maaneder`
        ),
        {
          target: { value: '2' },
        }
      )

      // Endrer uttaksgrad
      fireEvent.change(
        await screen.findByTestId(AVANSERT_FORM_NAMES.uttaksgrad),
        {
          target: { value: '60' },
        }
      )

      // Fyller ut feltene for helt uttak + inntekt vsa gradert uttak
      fireEvent.change(
        await screen.findByTestId(
          `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-aar`
        ),
        {
          target: { value: '70' },
        }
      )
      fireEvent.change(
        await screen.findByTestId(
          `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-maaneder`
        ),
        {
          target: { value: '6' },
        }
      )

      await user.click(
        screen.getByTestId(`${AVANSERT_FORM_NAMES.inntektVsaHeltUttakRadio}-ja`)
      )
      const inputField = screen.getByTestId(
        AVANSERT_FORM_NAMES.inntektVsaHeltUttak
      )
      await user.type(inputField, '1')
      await user.type(inputField, '2')
      await user.type(inputField, '3')
      await user.type(inputField, '0')
      await user.type(inputField, '0')
      await user.type(inputField, '0')
      fireEvent.change(
        screen.getByTestId(
          `age-picker-${AVANSERT_FORM_NAMES.inntektVsaHeltUttakSluttAlder}-aar`
        ),
        { target: { value: '75' } }
      )
      fireEvent.change(
        screen.getByTestId(
          `age-picker-${AVANSERT_FORM_NAMES.inntektVsaHeltUttakSluttAlder}-maaneder`
        ),
        { target: { value: '0' } }
      )

      await user.click(
        screen.getByTestId(
          `${AVANSERT_FORM_NAMES.inntektVsaGradertUttakRadio}-ja`
        )
      )
      await user.type(
        screen.getByTestId(AVANSERT_FORM_NAMES.inntektVsaGradertUttak),
        '100000'
      )

      // Endrer uttaksgrad
      fireEvent.change(
        await screen.findByTestId(AVANSERT_FORM_NAMES.uttaksgrad),
        {
          target: { value: '100' },
        }
      )

      // Sjekker at feltene for gradert uttak er skjult
      expect(
        screen.queryByTestId(
          `age-picker-${AVANSERT_FORM_NAMES.uttaksalderGradertUttak}-aar`
        )
      ).not.toBeInTheDocument()
      expect(
        screen.queryByTestId(
          `age-picker-${AVANSERT_FORM_NAMES.uttaksalderGradertUttak}-maaneder`
        )
      ).not.toBeInTheDocument()
      expect(
        screen.queryByTestId(AVANSERT_FORM_NAMES.inntektVsaGradertUttakRadio)
      ).not.toBeInTheDocument()
      expect(
        screen.queryByTestId(AVANSERT_FORM_NAMES.inntektVsaGradertUttak)
      ).not.toBeInTheDocument()

      // Sjekker at uttaksalderen ble overført tilbake til helt uttak
      expect(
        (
          await screen.findByTestId<HTMLSelectElement>(
            `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-aar`
          )
        ).value
      ).toBe('67')
      expect(
        (
          await screen.findByTestId<HTMLSelectElement>(
            `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-maaneder`
          )
        ).value
      ).toBe('2')

      await user.click(screen.getByText('beregning.avansert.button.beregn'))

      expect(onSubmitMock.mock.calls[0][4]).toStrictEqual({
        foedselsdato: '1963-04-30',
        harAvansertSkjemaUnsavedChanges: false,
        hasVilkaarIkkeOppfylt: false,
        localInntektFremTilUttak: null,
        loependeVedtak: {
          harLoependeVedtak: false,
          ufoeretrygd: { grad: 0 },
        } satisfies LoependeVedtak,
        normertPensjonsalder: {
          aar: 67,
          maaneder: 0,
        },
      })
      expect(onSubmitMock.mock.calls[0][5]).toStrictEqual({
        skalValidereStillingsprosentVsaPensjon: false,
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
          <AvansertSkjemaForAndreBrukere />
        </BeregningContext.Provider>,
        {
          preloadedState: {
            api: {
              // @ts-ignore
              queries: { ...mockedQueries },
            },
            userInput: {
              ...userInputInitialState,
            },
          },
        }
      )

      // Fyller ut feltene for helt uttak
      fireEvent.change(
        await screen.findByTestId(
          `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-aar`
        ),
        {
          target: { value: '67' },
        }
      )
      fireEvent.change(
        await screen.findByTestId(
          `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-maaneder`
        ),
        {
          target: { value: '6' },
        }
      )

      // Endrer uttaksgrad uten å ha fylt ut noe uttaksalder
      fireEvent.change(
        await screen.findByTestId(AVANSERT_FORM_NAMES.uttaksgrad),
        {
          target: { value: '60' },
        }
      )

      // Legger til inntekt vsa gradert uttak
      await user.click(
        screen.getByTestId(
          `${AVANSERT_FORM_NAMES.inntektVsaGradertUttakRadio}-ja`
        )
      )
      await user.type(
        screen.getByTestId(AVANSERT_FORM_NAMES.inntektVsaGradertUttak),
        '100000'
      )

      // Fyller ut feltene for helt uttak
      fireEvent.change(
        await screen.findByTestId(
          `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-aar`
        ),
        {
          target: { value: '70' },
        }
      )
      fireEvent.change(
        await screen.findByTestId(
          `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-maaneder`
        ),
        {
          target: { value: '6' },
        }
      )

      // Endrer uttaksgrad til en annen grad (ikke 100 %)
      fireEvent.change(
        await screen.findByTestId(AVANSERT_FORM_NAMES.uttaksgrad),
        {
          target: { value: '40' },
        }
      )

      // Sjekker at uttaksalderene ikke ble endret
      expect(
        (
          await screen.findByTestId<HTMLSelectElement>(
            `age-picker-${AVANSERT_FORM_NAMES.uttaksalderGradertUttak}-aar`
          )
        ).value
      ).toBe('67')
      expect(
        (
          await screen.findByTestId<HTMLSelectElement>(
            `age-picker-${AVANSERT_FORM_NAMES.uttaksalderGradertUttak}-maaneder`
          )
        ).value
      ).toBe('6')
      expect(
        (
          await screen.findByTestId<HTMLSelectElement>(
            `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-aar`
          )
        ).value
      ).toBe('70')
      expect(
        (
          await screen.findByTestId<HTMLSelectElement>(
            `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-maaneder`
          )
        ).value
      ).toBe('6')

      // Endrer feltene for gradert uttaksalder
      fireEvent.change(
        await screen.findByTestId(
          `age-picker-${AVANSERT_FORM_NAMES.uttaksalderGradertUttak}-aar`
        ),
        {
          target: { value: '68' },
        }
      )
      fireEvent.change(
        await screen.findByTestId(
          `age-picker-${AVANSERT_FORM_NAMES.uttaksalderGradertUttak}-maaneder`
        ),
        {
          target: { value: '6' },
        }
      )

      // Sjekker igjen at uttaksalder for hel pensjon ikke ble påvirket
      expect(
        (
          await screen.findByTestId<HTMLSelectElement>(
            `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-aar`
          )
        ).value
      ).toBe('70')
      expect(
        (
          await screen.findByTestId<HTMLSelectElement>(
            `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-maaneder`
          )
        ).value
      ).toBe('6')
      // Sjekker igjen at inntekt vsa gradert pensjon ikke ble påvirket
      expect(
        (
          await screen.findByTestId<HTMLSelectElement>(
            `${AVANSERT_FORM_NAMES.inntektVsaGradertUttak}`
          )
        ).value
      ).toBe('100 000')
    })

    it('Når uttaksgrad er ugyldig, håndteres den som om den var 100% og nullstiller feltene for gradert', async () => {
      const onSubmitMock = vi.spyOn(
        AvansertSkjemaForAndreBrukereUtils,
        'onAvansertBeregningSubmit'
      )

      const user = userEvent.setup()
      render(
        <BeregningContext.Provider
          value={{
            ...contextMockedValues,
          }}
        >
          <AvansertSkjemaForAndreBrukere />
        </BeregningContext.Provider>,
        {
          preloadedState: {
            api: {
              // @ts-ignore
              queries: { ...mockedQueries },
            },
            userInput: {
              ...userInputInitialState,
            },
          },
        }
      )

      // Fyller ut feltene for 100 % uttak + inntekt vsa 100 % uttak
      fireEvent.change(
        await screen.findByTestId(
          `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-aar`
        ),
        {
          target: { value: '67' },
        }
      )
      fireEvent.change(
        await screen.findByTestId(
          `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-maaneder`
        ),
        {
          target: { value: '2' },
        }
      )

      // Endrer uttaksgrad
      fireEvent.change(
        await screen.findByTestId(AVANSERT_FORM_NAMES.uttaksgrad),
        {
          target: { value: '60' },
        }
      )

      // Fyller ut feltene for helt uttak + inntekt vsa gradert uttak
      fireEvent.change(
        await screen.findByTestId(
          `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-aar`
        ),
        {
          target: { value: '70' },
        }
      )
      fireEvent.change(
        await screen.findByTestId(
          `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-maaneder`
        ),
        {
          target: { value: '6' },
        }
      )

      await user.click(
        screen.getByTestId(`${AVANSERT_FORM_NAMES.inntektVsaHeltUttakRadio}-ja`)
      )
      const inputField = screen.getByTestId(
        AVANSERT_FORM_NAMES.inntektVsaHeltUttak
      )
      await user.type(inputField, '1')
      await user.type(inputField, '2')
      await user.type(inputField, '3')
      await user.type(inputField, '0')
      await user.type(inputField, '0')
      await user.type(inputField, '0')
      fireEvent.change(
        screen.getByTestId(
          `age-picker-${AVANSERT_FORM_NAMES.inntektVsaHeltUttakSluttAlder}-aar`
        ),
        { target: { value: '75' } }
      )
      fireEvent.change(
        screen.getByTestId(
          `age-picker-${AVANSERT_FORM_NAMES.inntektVsaHeltUttakSluttAlder}-maaneder`
        ),
        { target: { value: '0' } }
      )

      await user.click(
        screen.getByTestId(
          `${AVANSERT_FORM_NAMES.inntektVsaGradertUttakRadio}-ja`
        )
      )
      await user.type(
        screen.getByTestId(AVANSERT_FORM_NAMES.inntektVsaGradertUttak),
        '100000'
      )

      // Endrer uttaksgrad
      fireEvent.change(
        await screen.findByTestId(AVANSERT_FORM_NAMES.uttaksgrad),
        {
          target: { value: 'noe ugyldig' },
        }
      )

      // Sjekker at feltene for gradert uttak er skjult
      expect(
        screen.queryByTestId(
          `age-picker-${AVANSERT_FORM_NAMES.uttaksalderGradertUttak}-aar`
        )
      ).not.toBeInTheDocument()
      expect(
        screen.queryByTestId(
          `age-picker-${AVANSERT_FORM_NAMES.uttaksalderGradertUttak}-maaneder`
        )
      ).not.toBeInTheDocument()
      expect(
        screen.queryByTestId(AVANSERT_FORM_NAMES.inntektVsaGradertUttakRadio)
      ).not.toBeInTheDocument()
      expect(
        screen.queryByTestId(AVANSERT_FORM_NAMES.inntektVsaGradertUttak)
      ).not.toBeInTheDocument()

      // Sjekker at uttaksalderen ble overført tilbake til helt uttak
      expect(
        (
          await screen.findByTestId<HTMLSelectElement>(
            `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-aar`
          )
        ).value
      ).toBe('67')
      expect(
        (
          await screen.findByTestId<HTMLSelectElement>(
            `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-maaneder`
          )
        ).value
      ).toBe('2')

      await user.click(screen.getByText('beregning.avansert.button.beregn'))

      expect(onSubmitMock.mock.calls[0][4]).toStrictEqual({
        foedselsdato: '1963-04-30',
        harAvansertSkjemaUnsavedChanges: false,
        hasVilkaarIkkeOppfylt: false,
        localInntektFremTilUttak: null,
        loependeVedtak: {
          harLoependeVedtak: false,
          ufoeretrygd: { grad: 0 },
        } satisfies LoependeVedtak,
        normertPensjonsalder: {
          aar: 67,
          maaneder: 0,
        },
      })
      expect(onSubmitMock.mock.calls[0][5]).toStrictEqual({
        skalValidereStillingsprosentVsaPensjon: false,
      })
    })
  })

  describe('Når en bruker som mottar 100 % uføretrygd legger inn et gradert uttak, ', () => {
    it('vises informasjon om pensjonsalder og uføretrygd, og aldersvelgere begrenses fra normert pensjonsalder', async () => {
      const { store } = render(
        <BeregningContext.Provider
          value={{
            ...contextMockedValues,
          }}
        >
          <AvansertSkjemaForAndreBrukere />
        </BeregningContext.Provider>,
        {
          preloadedState: {
            api: {
              // @ts-ignore
              queries: {
                ...fulfilledGetPersonMedOekteAldersgrenser,
                ...fulfilledGetLoependeVedtak100Ufoeregrad,
              },
            },
            userInput: {
              ...userInputInitialState,
            },
          },
        }
      )
      await store.dispatch(apiSlice.endpoints.getLoependeVedtak.initiate())
      expect(
        await screen.findByText(
          'beregning.avansert.rediger.inntekt_frem_til_uttak.description_ufoere'
        )
      ).toBeVisible()
      expect(screen.queryByTestId('om_pensjonsalder_UT_hel')).toBeVisible()
      expect(screen.queryByTestId('om_uttaksgrad')).toBeVisible()

      const selectAarElement = screen.getByTestId(
        `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-aar`
      )
      const optionAarElements = selectAarElement?.querySelectorAll('option')
      expect(optionAarElements?.[0].value).toBe('')
      expect(optionAarElements?.[1].value).toBe('70')
      expect(optionAarElements?.[6].value).toBe('75')

      // Fyller ut uttaksalder
      fireEvent.change(
        screen.getByTestId(
          `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-aar`
        ),
        {
          target: { value: '70' },
        }
      )
      fireEvent.change(
        screen.getByTestId(
          `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-maaneder`
        ),
        {
          target: { value: '5' },
        }
      )
      // Velger gradert uttak
      fireEvent.change(
        await screen.findByTestId(AVANSERT_FORM_NAMES.uttaksgrad),
        {
          target: { value: '50' },
        }
      )

      const selectAarElementHelt = screen.getByTestId(
        `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-aar`
      )
      const optionAarElementsHelt =
        selectAarElementHelt?.querySelectorAll('option')
      expect(optionAarElementsHelt?.[0].value).toBe('')
      expect(optionAarElementsHelt?.[1].value).toBe('70')
      expect(optionAarElementsHelt?.[6].value).toBe('75')

      const selectAarElementGradert = screen.getByTestId(
        `age-picker-${AVANSERT_FORM_NAMES.uttaksalderGradertUttak}-aar`
      )
      const optionAarElementsGradert =
        selectAarElementGradert?.querySelectorAll('option')
      expect(optionAarElementsGradert?.[0].value).toBe('')
      expect(optionAarElementsGradert?.[1].value).toBe('70')
      expect(optionAarElementsGradert?.[6].value).toBe('75')
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
        <AvansertSkjemaForAndreBrukere />
      </BeregningContext.Provider>,
      {
        preloadedState: {
          api: {
            // @ts-ignore
            queries: { ...mockedQueries },
          },
          userInput: {
            ...userInputInitialState,
          },
        },
      }
    )

    await user.click(screen.getByText('beregning.avansert.button.beregn'))
    // Feilmelding for uttaksalder for 100% uttak
    expect(
      screen.getByText('agepicker.validation_error.aar', {
        exact: false,
      })
    ).toBeVisible()
    // Feilmelding for uttaksgrad
    expect(
      screen.getByText(
        'beregning.avansert.rediger.uttaksgrad.validation_error',
        {
          exact: false,
        }
      )
    ).toBeVisible()
    expect((document.activeElement as HTMLElement).getAttribute('name')).toBe(
      `${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-aar`
    )

    // Fyller inn uttaksalder slik at RadioGroup vises
    fireEvent.change(
      screen.getByTestId(
        `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-aar`
      ),
      {
        target: { value: '65' },
      }
    )
    fireEvent.change(
      screen.getByTestId(
        `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-maaneder`
      ),
      {
        target: { value: '5' },
      }
    )

    // Velger helt uttak
    fireEvent.change(
      await screen.findByTestId(AVANSERT_FORM_NAMES.uttaksgrad),
      {
        target: { value: '100' },
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
      AVANSERT_FORM_NAMES.inntektVsaHeltUttakRadio
    )

    // Hukker av for inntekt vsa. gradert uttak og viser felt for beløp
    await user.click(
      screen.getByTestId(`${AVANSERT_FORM_NAMES.inntektVsaHeltUttakRadio}-ja`)
    )
    await user.click(screen.getByText('beregning.avansert.button.beregn'))
    // Feilmelding for inntekt vsa 100 % uttak
    expect(
      screen.getByText(
        'Du må fylle ut forventet årsinntekt samtidig som du tar ut',
        {
          exact: false,
        }
      )
    ).toBeVisible()
    expect((document.activeElement as HTMLElement).getAttribute('name')).toBe(
      AVANSERT_FORM_NAMES.inntektVsaHeltUttak
    )

    // Fylle ut inntekt vsa 100 % uttak
    const inputField = screen.getByTestId(
      AVANSERT_FORM_NAMES.inntektVsaHeltUttak
    )
    await user.type(inputField, '1')
    await user.type(inputField, '2')
    await user.type(inputField, '3')
    await user.type(inputField, '0')
    await user.type(inputField, '0')
    await user.type(inputField, '0')
    await user.click(screen.getByText('beregning.avansert.button.beregn'))
    // Feilmelding for sluttAlder for inntekt vsa 100 % uttak
    expect(
      screen.getByText('agepicker.validation_error.aar', {
        exact: false,
      })
    ).toBeVisible()
    expect((document.activeElement as HTMLElement).getAttribute('name')).toBe(
      `${AVANSERT_FORM_NAMES.inntektVsaHeltUttakSluttAlder}-aar`
    )

    // Hukker av nei for inntekt vsa. helt uttak og skjuler feltene
    await user.click(
      screen.getByTestId(`${AVANSERT_FORM_NAMES.inntektVsaHeltUttakRadio}-nei`)
    )

    // Velger gradert uttak
    fireEvent.change(
      await screen.findByTestId(AVANSERT_FORM_NAMES.uttaksgrad),
      {
        target: { value: '80' },
      }
    )

    await user.click(screen.getByText('beregning.avansert.button.beregn'))

    // Feilmelding for uttaksalder for 100% uttak
    expect(
      screen.getByText('agepicker.validation_error.aar', {
        exact: false,
      })
    ).toBeVisible()

    // fyller ut 100 % uttaksalder
    fireEvent.change(
      screen.getByTestId(
        `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-aar`
      ),
      {
        target: { value: '67' },
      }
    )
    fireEvent.change(
      screen.getByTestId(
        `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-maaneder`
      ),
      {
        target: { value: '5' },
      }
    )
    // Hukker av nei for inntekt vsa. gradert uttak
    await user.click(
      screen.getByTestId(`${AVANSERT_FORM_NAMES.inntektVsaHeltUttakRadio}-nei`)
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
      AVANSERT_FORM_NAMES.inntektVsaGradertUttakRadio
    )

    // Hukker av ja for inntekt vsa. gradert uttak
    await user.click(
      screen.getByTestId(
        `${AVANSERT_FORM_NAMES.inntektVsaGradertUttakRadio}-ja`
      )
    )
    await user.click(screen.getByText('beregning.avansert.button.beregn'))

    // Feilmelding for inntekt vsa gradert uttak
    expect(
      screen.getByText(
        'Du må fylle ut forventet årsinntekt samtidig som du tar ut',
        { exact: false }
      )
    ).toBeVisible()

    expect((document.activeElement as HTMLElement).getAttribute('name')).toBe(
      AVANSERT_FORM_NAMES.inntektVsaGradertUttak
    )
  })

  it('viser valideringsfeil for stillingsprosent ved helt uttak når samtykke er gitt', async () => {
    const user = userEvent.setup()
    render(
      <BeregningContext.Provider
        value={{
          ...contextMockedValues,
        }}
      >
        <AvansertSkjemaForAndreBrukere />
      </BeregningContext.Provider>,
      {
        preloadedState: {
          api: {
            // @ts-ignore
            queries: { ...mockedQueries },
          },
          userInput: {
            ...userInputInitialState,
            samtykke: true,
            afpUtregningValg: 'KUN_ALDERSPENSJON',
          },
        },
      }
    )

    await user.click(screen.getByText('beregning.avansert.button.beregn'))

    fireEvent.change(
      screen.getByTestId(
        `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-aar`
      ),
      {
        target: { value: '67' },
      }
    )
    fireEvent.change(
      screen.getByTestId(
        `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-maaneder`
      ),
      {
        target: { value: '0' },
      }
    )

    fireEvent.change(
      await screen.findByTestId(AVANSERT_FORM_NAMES.uttaksgrad),
      {
        target: { value: '100 %' },
      }
    )

    await user.click(
      screen.getByTestId(`${AVANSERT_FORM_NAMES.inntektVsaHeltUttakRadio}-ja`)
    )

    const inputField = await screen.findByTestId(
      AVANSERT_FORM_NAMES.inntektVsaHeltUttak
    )
    await user.type(inputField, '123000')

    await user.click(screen.getByTestId('beregn-pensjon'))

    const stillingsSelect = await screen.findByTestId(
      AVANSERT_FORM_NAMES.stillingsprosentVsaHelPensjon
    )
    expect(stillingsSelect).toHaveAttribute('aria-invalid', 'true')
    expect(document.activeElement).toBe(stillingsSelect)

    await user.selectOptions(stillingsSelect, '100')
  })

  describe('Når simuleringen svarer med vilkaarIkkeOppfylt, ', () => {
    it('viser alert med informasjon om alternativer', async () => {
      const vilkaarsproevingMock = {
        vilkaarErOppfylt: false,
        alternativ: {
          heltUttaksalder: { aar: 67, maaneder: 0 },
        },
      }

      mockResponse('/v9/alderspensjon/simulering', {
        status: 200,
        method: 'post',
        json: {
          alderspensjon: [],
          vilkaarsproeving: vilkaarsproevingMock,
          harForLiteTrygdetid: false,
        },
      })

      const currentSimulation: Simulation = {
        beregningsvalg: null,
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
          <AvansertSkjemaForAndreBrukere
            vilkaarsproeving={vilkaarsproevingMock}
          />
        </BeregningContext.Provider>,
        {
          preloadedState: {
            api: {
              // @ts-ignore
              queries: { ...mockedQueries },
            },
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

  describe('Gitt at en bruker har vedtak om alderspensjon, ', () => {
    it('vises informasjon om vedtaket', async () => {
      render(
        <BeregningContext.Provider
          value={{
            ...contextMockedValues,
          }}
        >
          <AvansertSkjemaForAndreBrukere />
        </BeregningContext.Provider>,
        {
          preloadedState: {
            api: {
              // @ts-ignore
              queries: {
                ...fulfilledGetPerson,
                ...fulfilledGetLoependeVedtakLoependeAlderspensjon,
              },
            },
            userInput: {
              ...userInputInitialState,
            },
          },
        }
      )
      expect(
        await screen.findByText('beregning.endring.rediger.title')
      ).toBeVisible()
      expect(
        await screen.findByText(
          'Fra 02.10.2020 har du mottatt 100 % alderspensjon.'
        )
      ).toBeVisible()
    })

    it('vises det riktig label på feltene', async () => {
      const { store } = render(
        <BeregningContext.Provider
          value={{
            ...contextMockedValues,
          }}
        >
          <AvansertSkjemaForAndreBrukere />
        </BeregningContext.Provider>,
        {
          preloadedState: {
            api: {
              // @ts-ignore
              queries: {
                ...fulfilledGetPerson,
                ...fulfilledGetLoependeVedtakLoependeAlderspensjon,
              },
            },
            userInput: {
              ...userInputInitialState,
            },
          },
        }
      )
      await store.dispatch(apiSlice.endpoints.getLoependeVedtak.initiate())
      expect(
        await screen.findByText(
          'beregning.avansert.rediger.inntekt_frem_til_endring.label'
        )
      ).toBeVisible()
      expect(
        screen.queryByText(
          'beregning.avansert.rediger.inntekt_frem_til_uttak.label'
        )
      ).not.toBeInTheDocument()

      expect(
        await screen.findByText('velguttaksalder.endring.title')
      ).toBeVisible()
      expect(
        screen.queryByText('velguttaksalder.title')
      ).not.toBeInTheDocument()

      expect(
        await screen.findByText(
          'beregning.avansert.rediger.uttaksgrad.endring.description'
        )
      ).toBeVisible()
      expect(
        screen.queryByText('beregning.avansert.rediger.uttaksgrad.description')
      ).not.toBeInTheDocument()

      expect(screen.getByTestId('om_uttaksgrad_endring')).toBeVisible()
    })

    it('Når brukeren har 100 % uføretrygd, vises riktig tekst i readmore om uttaksgrad', async () => {
      const { store } = render(
        <BeregningContext.Provider
          value={{
            ...contextMockedValues,
          }}
        >
          <AvansertSkjemaForAndreBrukere />
        </BeregningContext.Provider>,
        {
          preloadedState: {
            api: {
              // @ts-ignore
              queries: {
                ...fulfilledGetLoependeVedtakLoepende0Alderspensjon100Ufoeretrygd,
                ...fulfilledGetPersonMedOekteAldersgrenser,
              },
            },
            userInput: {
              ...userInputInitialState,
            },
          },
        }
      )
      await store.dispatch(apiSlice.endpoints.getLoependeVedtak.initiate())

      expect(screen.getByTestId('om_uttaksgrad')).toBeVisible()
    })

    it('Når brukeren har fylt alle feltene riktig og klikker på beregn mens datoen på vedtaket er mindre enn 12 md. til ønsket uttak, vises det alert og siden scrolles opp til toppen', async () => {
      const scrollToMock = vi.fn()
      Object.defineProperty(global.window, 'scrollTo', {
        value: scrollToMock,
        writable: true,
      })
      const user = userEvent.setup()

      render(
        <BeregningContext.Provider
          value={{
            ...contextMockedValues,
          }}
        >
          <AvansertSkjemaForAndreBrukere />
        </BeregningContext.Provider>,
        {
          preloadedState: {
            api: {
              queries: {
                ...fulfilledGetPerson,
                ['getLoependeVedtak(undefined)']: {
                  // @ts-ignore
                  status: 'fulfilled',
                  endpointName: 'getLoependeVedtak',
                  requestId: 'xTaE6mOydr5ZI75UXq4Wi',
                  startedTimeStamp: 1688046411971,
                  data: {
                    harLoependeVedtak: true,
                    alderspensjon: {
                      grad: 100,
                      uttaksgradFom: new Date().toLocaleDateString('en-CA'),
                      fom: new Date().toLocaleDateString('en-CA'), // dette gir dato i format yyyy-mm-dd
                      sivilstand: 'UGIFT',
                    },
                    ufoeretrygd: { grad: 0 },
                  } satisfies LoependeVedtak,
                  fulfilledTimeStamp: 1688046412103,
                },
              },
            },
            userInput: {
              ...userInputInitialState,
            },
          },
        }
      )

      // Fyller inn uttaksalder slik at RadioGroup vises
      fireEvent.change(
        screen.getByTestId(
          `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-aar`
        ),
        {
          target: { value: '62' },
        }
      )
      fireEvent.change(
        screen.getByTestId(
          `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-maaneder`
        ),
        {
          target: { value: agePickerMonth },
        }
      )

      // Velger gradert uttak
      fireEvent.change(
        await screen.findByTestId(AVANSERT_FORM_NAMES.uttaksgrad),
        {
          target: { value: '40' },
        }
      )

      await user.click(
        screen.getByTestId(
          `${AVANSERT_FORM_NAMES.inntektVsaGradertUttakRadio}-nei`
        )
      )

      fireEvent.change(
        screen.getByTestId(
          `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-aar`
        ),
        {
          target: { value: '65' },
        }
      )
      fireEvent.change(
        screen.getByTestId(
          `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-maaneder`
        ),
        {
          target: { value: '0' },
        }
      )

      await user.click(
        screen.getByTestId(
          `${AVANSERT_FORM_NAMES.inntektVsaHeltUttakRadio}-nei`
        )
      )

      await user.click(
        screen.getByText('beregning.avansert.button.beregn.endring')
      )

      expect(
        screen.getByText(
          'Du kan tidligst endre uttaksgrad til 20, 40, 50, 60 eller 80 % fra',
          {
            exact: false,
          }
        )
      ).toBeVisible()
      expect(scrollToMock).toHaveBeenCalledWith(0, 0)
    })
  })
})

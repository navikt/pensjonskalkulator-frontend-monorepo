import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  grunnbeloepMock,
  loependeVedtak0UfoeregradMock,
  mockResponse,
  personMock,
} from '@/mocks'
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

import { AvansertSkjemaForBrukereMedKap19Afp } from '..'
import { AVANSERT_FORM_NAMES } from '../../utils'

describe('AvansertSkjemaForBrukereMedKap19Afp', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  const contextMockedValues = {
    avansertSkjemaModus: 'redigering' as AvansertBeregningModus,
    setAvansertSkjemaModus: vi.fn(),
    harAvansertSkjemaUnsavedChanges: false,
    setHarAvansertSkjemaUnsavedChanges: () => {},
  }
  it('Rendrer komponenten med riktig overskrift og innhold', () => {
    render(
      <BeregningContext.Provider value={contextMockedValues}>
        <AvansertSkjemaForBrukereMedKap19Afp />
      </BeregningContext.Provider>,
      {
        preloadedState: {
          userInput: {
            ...userInputInitialState,
          },
        },
        preloadedApiState: {
          getPerson: personMock,
          getGrunnbeloep: grunnbeloepMock,
          getLoependeVedtak: loependeVedtak0UfoeregradMock,
        },
      }
    )

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'beregning.avansert.rediger.afp_etterfulgt_av_ap.title'
    )
    expect(screen.getByTestId('agepicker-helt-uttaksalder')).toBeVisible()
    expect(
      screen.getByTestId(AVANSERT_FORM_NAMES.afpInntektMaanedFoerUttakRadio)
    ).toBeVisible()
    expect(
      screen.getByTestId(AVANSERT_FORM_NAMES.inntektVsaAfpRadio)
    ).toBeVisible()

    //test ved klikk av radioknapp at textfield vises
  })

  describe('Ved validering av obligatoriske felter', () => {
    describe('Gitt at det er valideringsfeil', () => {
      it('Vil valideringsfeil vises', async () => {
        const user = userEvent.setup()
        render(
          <BeregningContext.Provider value={contextMockedValues}>
            <AvansertSkjemaForBrukereMedKap19Afp />
          </BeregningContext.Provider>,
          {
            preloadedState: {
              userInput: {
                ...userInputInitialState,
              },
            },
            preloadedApiState: {
              getPerson: personMock,
              getGrunnbeloep: grunnbeloepMock,
              getLoependeVedtak: loependeVedtak0UfoeregradMock,
            },
          }
        )

        expect(
          screen.getByText('beregning.avansert.button.beregn')
        ).toBeVisible()

        await user.click(screen.getByText('beregning.avansert.button.beregn'))

        expect(
          screen.getByText('agepicker.validation_error.aar', {
            exact: false,
          })
        ).toBeVisible()

        expect(
          screen.getByText(
            'Du må svare på om du forventer å ha inntekt på minst',
            { exact: false }
          )
        ).toBeVisible()

        expect(
          screen.getByText(
            'beregning.avansert.rediger.radio.inntekt_vsa_afp.validation_error'
          )
        ).toBeVisible()
      })
    })

    describe('Gitt at det ikke er valideringsfeil', () => {
      it('Håndteres gyldig innsending av skjema', async () => {
        const user = userEvent.setup()
        render(
          <BeregningContext.Provider value={contextMockedValues}>
            <AvansertSkjemaForBrukereMedKap19Afp />
          </BeregningContext.Provider>,
          {
            preloadedState: {
              userInput: {
                ...userInputInitialState,
              },
            },
            preloadedApiState: {
              getPerson: personMock,
              getGrunnbeloep: grunnbeloepMock,
              getLoependeVedtak: loependeVedtak0UfoeregradMock,
            },
          }
        )

        const selectAarElement = screen.getByTestId(
          `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-aar`
        )
        const optionAarElements = selectAarElement?.querySelectorAll('option')
        expect(optionAarElements?.[0].value).toBe('')
        expect(optionAarElements?.[1].value).toBe('62')

        fireEvent.change(
          screen.getByTestId(
            `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-aar`
          ),
          {
            target: { value: '65' },
          }
        )

        const selectMaanederElement = screen.getByTestId(
          `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-maaneder`
        )
        const optionMaanederElements =
          selectMaanederElement?.querySelectorAll('option')
        expect(optionMaanederElements?.[0].value).toBe('0')

        fireEvent.change(
          screen.getByTestId(
            `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-maaneder`
          ),
          {
            target: { value: '5' },
          }
        )

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        const uttaksalderHeltUttakAar = (await screen.findByTestId(
          `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-aar`
        )) as HTMLSelectElement

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        const uttaksalderHeltUttakMaaneder = (await screen.findByTestId(
          `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-maaneder`
        )) as HTMLSelectElement

        expect(uttaksalderHeltUttakAar.value).toBe('65')
        expect(uttaksalderHeltUttakMaaneder.value).toBe('5')

        await user.click(
          screen.getByTestId(
            `${AVANSERT_FORM_NAMES.afpInntektMaanedFoerUttakRadio}-ja`
          )
        )

        await user.click(
          screen.getByTestId(`${AVANSERT_FORM_NAMES.inntektVsaAfpRadio}-nei`)
        )

        await user.click(screen.getByText('beregning.avansert.button.beregn'))

        expect(
          screen.queryByText('agepicker.validation_error.aar')
        ).not.toBeInTheDocument()

        expect(
          screen.queryByText('agepicker.validation_error.maaneder')
        ).not.toBeInTheDocument()

        expect(
          screen.queryByText(
            'Du må svare på om du forventer å ha inntekt på minst',
            { exact: false }
          )
        ).not.toBeInTheDocument()

        expect(
          screen.queryByText(
            'beregning.avansert.rediger.radio.inntekt_vsa_afp.validation_error'
          )
        ).not.toBeInTheDocument()
      })
      it('Når alle feltene fylles ut og resetForm kalles, nullstilles alle feltene', async () => {
        const user = userEvent.setup()
        const { store } = render(
          <BeregningContext.Provider
            value={{
              ...contextMockedValues,
            }}
          >
            <AvansertSkjemaForBrukereMedKap19Afp />
          </BeregningContext.Provider>,
          {
            preloadedState: {
              userInput: {
                ...userInputInitialState,
              },
            },
            preloadedApiState: {
              getPerson: personMock,
              getGrunnbeloep: grunnbeloepMock,
              getLoependeVedtak: loependeVedtak0UfoeregradMock,
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

        const selectAarElement = screen.getByTestId(
          `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-aar`
        )
        const optionAarElements = selectAarElement?.querySelectorAll('option')
        expect(optionAarElements?.[0].value).toBe('')
        expect(optionAarElements?.[1].value).toBe('62')

        fireEvent.change(
          screen.getByTestId(
            `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-aar`
          ),
          {
            target: { value: '65' },
          }
        )

        const selectMaanederElement = screen.getByTestId(
          `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-maaneder`
        )
        const optionMaanederElements =
          selectMaanederElement?.querySelectorAll('option')
        expect(optionMaanederElements?.[0].value).toBe('0')

        fireEvent.change(
          screen.getByTestId(
            `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-maaneder`
          ),
          {
            target: { value: '5' },
          }
        )

        await user.click(
          screen.getByTestId(
            `${AVANSERT_FORM_NAMES.afpInntektMaanedFoerUttakRadio}-ja`
          )
        )

        await user.click(
          screen.getByTestId(`${AVANSERT_FORM_NAMES.inntektVsaAfpRadio}-ja`)
        )

        const inputField = screen.getByTestId(AVANSERT_FORM_NAMES.inntektVsaAfp)

        await user.type(inputField, '1')
        await user.type(inputField, '2')
        await user.type(inputField, '3')
        await user.type(inputField, '0')
        await user.type(inputField, '0')
        await user.type(inputField, '0')
        // Sjekker at feltene er fylt ut

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        const uttaksalderHeltUttakAar = (await screen.findByTestId(
          `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-aar`
        )) as HTMLSelectElement

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        const uttaksalderHeltUttakMaaneder = (await screen.findByTestId(
          `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-maaneder`
        )) as HTMLSelectElement

        expect(uttaksalderHeltUttakAar.value).toBe('65')
        expect(uttaksalderHeltUttakMaaneder.value).toBe('5')

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        const afpInntektMaanedFoerUttakRadio = screen.getByTestId(
          `${AVANSERT_FORM_NAMES.afpInntektMaanedFoerUttakRadio}-ja`
        ) as HTMLInputElement
        expect(afpInntektMaanedFoerUttakRadio.checked).toBe(true)

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        const inntektVsaAfpRadio = screen.getByTestId(
          `${AVANSERT_FORM_NAMES.inntektVsaAfpRadio}-ja`
        ) as HTMLInputElement

        expect(inntektVsaAfpRadio.checked).toBe(true)

        expect(
          await screen.findByTestId(AVANSERT_FORM_NAMES.inntektVsaAfp)
        ).toHaveValue('123 000')

        fireEvent.click(screen.getByText('beregning.avansert.button.nullstill'))

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        const nullstiltUttaksalderHeltUttakAar = (await screen.findByTestId(
          `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-aar`
        )) as HTMLSelectElement

        const nullstiltUttaksalderHeltUttakMaaneder =
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
          (await screen.findByTestId(
            `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-maaneder`
          )) as HTMLSelectElement

        // Sjekker at feltene er nullstilt
        expect(
          await screen.findByTestId('formatert-inntekt-frem-til-uttak')
        ).toHaveTextContent('521 338')
        expect(nullstiltUttaksalderHeltUttakAar.value).toBe('')
        expect(nullstiltUttaksalderHeltUttakMaaneder.value).toBe('')

        expect(
          screen.queryByTestId(
            AVANSERT_FORM_NAMES.afpInntektMaanedFoerUttakRadio
          )
        ).not.toBeChecked()

        expect(
          screen.queryByTestId(AVANSERT_FORM_NAMES.inntektVsaAfpRadio)
        ).not.toBeChecked()

        expect(
          screen.queryByTestId(AVANSERT_FORM_NAMES.inntektVsaAfp)
        ).not.toBeInTheDocument()
      })
    })

    describe('Ved klikk på radioknapper', () => {
      it('Skal alert vises når bruker velger "Nei" på afpInntektMaanedFoerUttak', async () => {
        const user = userEvent.setup()
        render(
          <BeregningContext.Provider value={contextMockedValues}>
            <AvansertSkjemaForBrukereMedKap19Afp />
          </BeregningContext.Provider>,
          {
            preloadedState: {
              userInput: {
                ...userInputInitialState,
              },
            },
            preloadedApiState: {
              getPerson: personMock,
              getGrunnbeloep: grunnbeloepMock,
              getLoependeVedtak: loependeVedtak0UfoeregradMock,
            },
          }
        )
        expect(
          screen.getByTestId(AVANSERT_FORM_NAMES.afpInntektMaanedFoerUttakRadio)
        ).toBeVisible()

        await user.click(
          screen.getByTestId(
            `${AVANSERT_FORM_NAMES.afpInntektMaanedFoerUttakRadio}-nei`
          )
        )

        expect(
          screen.getByTestId('afp-etterfulgt-ap-informasjon')
        ).toBeVisible()
      })

      it('Skal inputfield vises når bruker velger "Ja" på inntektVsaAfp', async () => {
        const user = userEvent.setup()
        render(
          <BeregningContext.Provider value={contextMockedValues}>
            <AvansertSkjemaForBrukereMedKap19Afp />
          </BeregningContext.Provider>,
          {
            preloadedState: {
              userInput: {
                ...userInputInitialState,
              },
            },
            preloadedApiState: {
              getPerson: personMock,
              getGrunnbeloep: grunnbeloepMock,
              getLoependeVedtak: loependeVedtak0UfoeregradMock,
            },
          }
        )

        expect(
          screen.getByTestId(AVANSERT_FORM_NAMES.inntektVsaAfpRadio)
        ).toBeVisible()

        await user.click(
          screen.getByTestId(`${AVANSERT_FORM_NAMES.inntektVsaAfpRadio}-ja`)
        )

        expect(
          screen.getByTestId(AVANSERT_FORM_NAMES.inntektVsaAfpRadio)
        ).toBeVisible()
      })
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
            <AvansertSkjemaForBrukereMedKap19Afp
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
            preloadedApiState: {
              getPerson: personMock,
              getGrunnbeloep: grunnbeloepMock,
              getLoependeVedtak: loependeVedtak0UfoeregradMock,
            },
          }
        )
        expect(
          screen.getByText('beregning.vilkaarsproeving.intro', { exact: false })
        ).toBeVisible()
      })
    })
  })
})

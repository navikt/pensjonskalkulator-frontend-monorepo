import { vi } from 'vitest'

import { ShowMoreRef } from '@/components/common/ShowMore/ShowMore'
import { fulfilledGetLoependeVedtakLoependeAlderspensjon } from '@/mocks/mockedRTKQueryApiCalls'
import {
  AvansertBeregningModus,
  BeregningContext,
} from '@/pages/Beregning/context'
import { fireEvent, render, screen } from '@/test-utils'

import offentligTpData from '../../../../mocks/data/offentlig-tp.json' with { type: 'json' }
import pensjonsavtalerData from '../../../../mocks/data/pensjonsavtaler/67.json' with { type: 'json' }
import { SimuleringPensjonsavtalerAlert } from '../SimuleringPensjonsavtalerAlert'

describe('SimuleringPensjonsavtalerAlert', () => {
  const avtalerWithKeys = pensjonsavtalerData.avtaler.map(
    (avtale, index) =>
      ({
        ...avtale,
        key: index,
      }) as Pensjonsavtale
  )

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

  it('Når brukeren har vedtak om alderspensjon, viser riktig alert.', () => {
    render(
      <SimuleringPensjonsavtalerAlert
        pensjonsavtaler={{
          isLoading: false,
          isSuccess: true,
          isError: false,
          data: {
            avtaler: avtalerWithKeys,
            partialResponse: false,
          },
        }}
        offentligTp={{
          isError: false,
        }}
        isPensjonsavtaleFlagVisible={false}
      />,
      {
        preloadedState: {
          api: {
            // @ts-ignore
            queries: {
              ...fulfilledGetLoependeVedtakLoependeAlderspensjon,
            },
          },
        },
      }
    )
    expect(screen.queryByTestId('pensjonsavtaler-alert')).toBeVisible()
    expect(screen.getByTitle('Informasjon')).toBeInTheDocument()
    expect(
      screen.getByText('beregning.pensjonsavtaler.alert.endring')
    ).toBeVisible()
  })

  describe('Gitt at henting av offentlig-tp er "OK", (dvs. vellykket med status OK eller BRUKER_ER_IKKE_MEDLEM_AV_TP_ORDNING),', () => {
    it('Når simulering av offentlig-tp er vellykket med status "OK", og henting av private pensjonsavtaler også, viser ingen alert.', () => {
      render(
        <SimuleringPensjonsavtalerAlert
          pensjonsavtaler={{
            isLoading: false,
            isSuccess: true,
            isError: false,
            data: {
              avtaler: avtalerWithKeys,
              partialResponse: false,
            },
          }}
          offentligTp={{
            isError: false,
          }}
          isPensjonsavtaleFlagVisible={false}
        />
      )
      expect(screen.queryByTestId('pensjonsavtaler-alert')).toBeNull()
    })

    it('Når simulering av offentlig-tp er vellykket med status "OK", og henting av private pensjonsavtaler også, men en avtale starter før uttaksalder, viser riktig alert.', () => {
      render(
        <SimuleringPensjonsavtalerAlert
          pensjonsavtaler={{
            isLoading: false,
            isSuccess: true,
            isError: false,
            data: {
              avtaler: avtalerWithKeys,
              partialResponse: false,
            },
          }}
          offentligTp={{
            isError: false,
          }}
          isPensjonsavtaleFlagVisible
        />
      )
      expect(screen.queryByTestId('pensjonsavtaler-alert')).toBeVisible()
      expect(screen.getByTitle('Informasjon')).toBeInTheDocument()
      expect(
        screen.getByText(
          'Du har pensjonsavtaler som starter før valgt alder.',
          {
            exact: false,
          }
        )
      ).toBeVisible()
    })

    it('Når simulering av offentlig-tp er vellykket med status "OK", og at private pensjonsavtaler har feilet, viser riktig alert.', () => {
      render(
        <SimuleringPensjonsavtalerAlert
          pensjonsavtaler={{
            isLoading: false,
            isSuccess: false,
            isError: true,
          }}
          offentligTp={{
            isError: false,
            data: offentligTpData as OffentligTp,
          }}
          isPensjonsavtaleFlagVisible={false}
        />
      )
      expect(screen.queryByTestId('pensjonsavtaler-alert')).toBeVisible()
      expect(screen.getByTitle('Advarsel')).toBeInTheDocument()
      expect(
        screen.getByText(
          'Beregningen viser kanskje ikke alt. Noe gikk galt ved henting av pensjonsavtaler i privat sektor. Les mer under',
          {
            exact: false,
          }
        )
      ).toBeVisible()
    })

    it('Når simulering av offentlig-tp er vellykket med status "OK", og at private pensjonsavtaler har feilet, og en avtale starter før uttaksalder, viser to riktig alerts.', () => {
      render(
        <SimuleringPensjonsavtalerAlert
          pensjonsavtaler={{
            isLoading: false,
            isSuccess: false,
            isError: true,
          }}
          offentligTp={{
            isError: false,
            data: offentligTpData as OffentligTp,
          }}
          isPensjonsavtaleFlagVisible={true}
        />
      )
      const alerts = screen.queryAllByTestId('pensjonsavtaler-alert')
      expect(alerts).toHaveLength(2)
      alerts.forEach((alert) => {
        expect(alert).toBeVisible()
      })

      expect(screen.getByTitle('Informasjon')).toBeInTheDocument()
      expect(screen.getByTitle('Advarsel')).toBeInTheDocument()

      expect(
        screen.getByText(
          'Du har pensjonsavtaler som starter før valgt alder.',
          {
            exact: false,
          }
        )
      ).toBeVisible()

      expect(
        screen.getByText(
          'Beregningen viser kanskje ikke alt. Noe gikk galt ved henting av pensjonsavtaler i privat sektor. Les mer under',
          {
            exact: false,
          }
        )
      ).toBeVisible()
    })

    it('Når simulering av offentlig-tp er vellykket med status "OK", og at private pensjonsavtaler gir delvis svar med 0 avtaler, viser riktig alert.', () => {
      render(
        <SimuleringPensjonsavtalerAlert
          pensjonsavtaler={{
            isLoading: false,
            isSuccess: true,
            isError: false,
            data: {
              avtaler: [],
              partialResponse: true,
            },
          }}
          offentligTp={{
            isError: false,
            data: offentligTpData as OffentligTp,
          }}
          isPensjonsavtaleFlagVisible={false}
        />
      )
      expect(screen.queryByTestId('pensjonsavtaler-alert')).toBeVisible()
      expect(screen.getByTitle('Advarsel')).toBeInTheDocument()
      expect(
        screen.getByText(
          'Beregningen viser kanskje ikke alt. Noe gikk galt ved henting av pensjonsavtaler i privat sektor. Les mer under',
          {
            exact: false,
          }
        )
      ).toBeVisible()
    })

    it('Når simulering av offentlig-tp er vellykket men at brukeren ikke er meldem av noe ordning, og henting av private pensjonsavtaler er også vellykket, viser ingen alert.', () => {
      render(
        <SimuleringPensjonsavtalerAlert
          pensjonsavtaler={{
            isLoading: false,
            isSuccess: true,
            isError: false,
            data: {
              avtaler: avtalerWithKeys,
              partialResponse: false,
            },
          }}
          offentligTp={{
            isError: false,
            data: {
              simuleringsresultatStatus: 'BRUKER_ER_IKKE_MEDLEM_AV_TP_ORDNING',
              muligeTpLeverandoerListe: ['KLP'],
            },
          }}
          isPensjonsavtaleFlagVisible={false}
        />
      )
      expect(screen.queryByTestId('pensjonsavtaler-alert')).toBeNull()
    })

    it('Når simulering av offentlig-tp er vellykket men at brukeren ikke er meldem av noe ordning, og at private pensjonsavtaler har feilet, viser riktig alert.', () => {
      render(
        <SimuleringPensjonsavtalerAlert
          pensjonsavtaler={{
            isLoading: false,
            isSuccess: false,
            isError: true,
          }}
          offentligTp={{
            isError: false,
            data: {
              simuleringsresultatStatus: 'BRUKER_ER_IKKE_MEDLEM_AV_TP_ORDNING',
              muligeTpLeverandoerListe: ['KLP'],
            },
          }}
          isPensjonsavtaleFlagVisible={false}
        />
      )
      expect(screen.queryByTestId('pensjonsavtaler-alert')).toBeVisible()
      expect(screen.getByTitle('Advarsel')).toBeInTheDocument()
      expect(
        screen.getByText(
          'Beregningen viser kanskje ikke alt. Noe gikk galt ved henting av pensjonsavtaler i privat sektor. Les mer under',
          {
            exact: false,
          }
        )
      ).toBeVisible()
    })

    it('Når simulering av offentlig-tp er vellykket men at brukeren ikke er meldem av noe ordning,  og at private pensjonsavtaler gir delvis svar med 0 avtaler, viser riktig alert.', () => {
      render(
        <SimuleringPensjonsavtalerAlert
          pensjonsavtaler={{
            isLoading: false,
            isSuccess: true,
            isError: false,
            data: {
              avtaler: [],
              partialResponse: true,
            },
          }}
          offentligTp={{
            isError: false,
            data: {
              simuleringsresultatStatus: 'BRUKER_ER_IKKE_MEDLEM_AV_TP_ORDNING',
              muligeTpLeverandoerListe: ['KLP'],
            },
          }}
          isPensjonsavtaleFlagVisible={false}
        />
      )
      expect(screen.queryByTestId('pensjonsavtaler-alert')).toBeVisible()
      expect(screen.getByTitle('Advarsel')).toBeInTheDocument()
      expect(
        screen.getByText(
          'Beregningen viser kanskje ikke alt. Noe gikk galt ved henting av pensjonsavtaler i privat sektor. Les mer under',
          {
            exact: false,
          }
        )
      ).toBeVisible()
    })
  })

  describe('Gitt at henting av offentlig-tp er vellykket men at TP-ordningen ikke støttes, (dvs. vellykket med status TP_ORDNING_STOETTES_IKKE),', () => {
    it('Når private pensjonsavtaler er vellykket viser riktig alert.', () => {
      render(
        <SimuleringPensjonsavtalerAlert
          pensjonsavtaler={{
            isLoading: false,
            isSuccess: true,
            isError: false,
            data: {
              avtaler: avtalerWithKeys,
              partialResponse: false,
            },
          }}
          offentligTp={{
            isError: false,
            data: {
              simuleringsresultatStatus: 'TP_ORDNING_STOETTES_IKKE',
              muligeTpLeverandoerListe: ['KLP'],
            },
          }}
          isPensjonsavtaleFlagVisible={false}
        />
      )
      expect(screen.queryByTestId('pensjonsavtaler-alert')).toBeVisible()
      expect(screen.getByTitle('Informasjon')).toBeInTheDocument()
      expect(
        screen.getByText(
          'Beregningen viser kanskje ikke alt. Du kan ha rett til offentlig tjenestepensjon.',
          {
            exact: false,
          }
        )
      ).toBeVisible()
    })

    it('Når private pensjonsavtaler har feilet viser riktig alert.', () => {
      render(
        <SimuleringPensjonsavtalerAlert
          pensjonsavtaler={{
            isLoading: false,
            isSuccess: false,
            isError: true,
          }}
          offentligTp={{
            isError: false,
            data: {
              simuleringsresultatStatus: 'TP_ORDNING_STOETTES_IKKE',
              muligeTpLeverandoerListe: ['KLP'],
            },
          }}
          isPensjonsavtaleFlagVisible={false}
        />
      )
      expect(screen.queryByTestId('pensjonsavtaler-alert')).toBeVisible()
      expect(screen.getByTitle('Advarsel')).toBeInTheDocument()
      expect(
        screen.getByText(
          'Beregningen viser kanskje ikke alt. Noe gikk galt ved henting av pensjonsavtaler i offentlig og privat sektor',
          {
            exact: false,
          }
        )
      ).toBeVisible()
    })

    it('Når private pensjonsavtaler gir delvis svar med 0 avtaler viser riktig alert.', () => {
      render(
        <SimuleringPensjonsavtalerAlert
          pensjonsavtaler={{
            isLoading: false,
            isSuccess: true,
            isError: false,
            data: {
              avtaler: [],
              partialResponse: true,
            },
          }}
          offentligTp={{
            isError: false,
            data: {
              simuleringsresultatStatus: 'TP_ORDNING_STOETTES_IKKE',
              muligeTpLeverandoerListe: ['KLP'],
            },
          }}
          isPensjonsavtaleFlagVisible={false}
        />
      )
      expect(screen.queryByTestId('pensjonsavtaler-alert')).toBeVisible()
      expect(screen.getByTitle('Advarsel')).toBeInTheDocument()
      expect(
        screen.getByText(
          'Beregningen viser kanskje ikke alt. Noe gikk galt ved henting av pensjonsavtaler i offentlig og privat sektor',
          {
            exact: false,
          }
        )
      ).toBeVisible()
    })
  })

  describe('Gitt at henting av offentlig-tp er "FEIL/UKOMPLETT", (dvs. feil, eller vellykket med status TOM_SIMULERING_FRA_TP_ORDNING eller TEKNISK_FEIL),', () => {
    it('Når kall til offentlig-tp feiler, og at private pensjonsavtaler har feilet, viser riktig alert.', () => {
      render(
        <SimuleringPensjonsavtalerAlert
          pensjonsavtaler={{
            isLoading: false,
            isSuccess: false,
            isError: true,
          }}
          offentligTp={{
            isError: true,
          }}
          isPensjonsavtaleFlagVisible={false}
        />
      )
      expect(screen.queryByTestId('pensjonsavtaler-alert')).toBeVisible()
      expect(screen.getByTitle('Advarsel')).toBeInTheDocument()
      expect(
        screen.getByText(
          'Beregningen viser kanskje ikke alt. Noe gikk galt ved henting av pensjonsavtaler i offentlig og privat sektor',
          {
            exact: false,
          }
        )
      ).toBeVisible()
    })

    it('Når kall til offentlig-tp er vellykket men at simuleringen førte til teknisk feil, og at private pensjonsavtaler har feilet, viser riktig alert.', () => {
      render(
        <SimuleringPensjonsavtalerAlert
          pensjonsavtaler={{
            isLoading: false,
            isSuccess: false,
            isError: true,
          }}
          offentligTp={{
            isError: false,
            data: {
              simuleringsresultatStatus: 'TEKNISK_FEIL',
              muligeTpLeverandoerListe: ['Statens pensjonskasse'],
            },
          }}
          isPensjonsavtaleFlagVisible={false}
        />
      )
      expect(screen.queryByTestId('pensjonsavtaler-alert')).toBeVisible()
      expect(screen.getByTitle('Advarsel')).toBeInTheDocument()
      expect(
        screen.getByText(
          'Beregningen viser kanskje ikke alt. Noe gikk galt ved henting av pensjonsavtaler i offentlig og privat sektor',
          {
            exact: false,
          }
        )
      ).toBeVisible()
    })

    it('Når kall til offentlig-tp er vellykket men at simuleringen er tom, og at private pensjonsavtaler har feilet, viser riktig alert.', () => {
      render(
        <SimuleringPensjonsavtalerAlert
          pensjonsavtaler={{
            isLoading: false,
            isSuccess: false,
            isError: true,
          }}
          offentligTp={{
            isError: false,
            data: {
              simuleringsresultatStatus: 'TOM_SIMULERING_FRA_TP_ORDNING',
              muligeTpLeverandoerListe: ['Statens pensjonskasse'],
            },
          }}
          isPensjonsavtaleFlagVisible={false}
        />
      )
      expect(screen.queryByTestId('pensjonsavtaler-alert')).toBeVisible()
      expect(screen.getByTitle('Advarsel')).toBeInTheDocument()
      expect(
        screen.getByText(
          'Beregningen viser kanskje ikke alt. Noe gikk galt ved henting av pensjonsavtaler i offentlig og privat sektor',
          {
            exact: false,
          }
        )
      ).toBeVisible()
    })

    it('Når kall til offentlig-tp feiler, og at private pensjonsavtaler gir delvis svar med 0 avtaler, viser riktig alert.', () => {
      render(
        <SimuleringPensjonsavtalerAlert
          pensjonsavtaler={{
            isLoading: false,
            isSuccess: true,
            isError: false,
            data: {
              avtaler: [],
              partialResponse: true,
            },
          }}
          offentligTp={{
            isError: true,
          }}
          isPensjonsavtaleFlagVisible={false}
        />
      )
      expect(screen.queryByTestId('pensjonsavtaler-alert')).toBeVisible()
      expect(screen.getByTitle('Advarsel')).toBeInTheDocument()
      expect(
        screen.getByText(
          'Beregningen viser kanskje ikke alt. Noe gikk galt ved henting av pensjonsavtaler i offentlig og privat sektor',
          {
            exact: false,
          }
        )
      ).toBeVisible()
    })

    it('Når kall til offentlig-tp er vellykket men at simuleringen førte til teknisk feil, og at private pensjonsavtaler gir delvis svar med 0 avtaler, viser riktig alert.', () => {
      render(
        <SimuleringPensjonsavtalerAlert
          pensjonsavtaler={{
            isLoading: false,
            isSuccess: true,
            isError: false,
            data: {
              avtaler: [],
              partialResponse: true,
            },
          }}
          offentligTp={{
            isError: false,
            data: {
              simuleringsresultatStatus: 'TEKNISK_FEIL',
              muligeTpLeverandoerListe: ['Statens pensjonskasse'],
            },
          }}
          isPensjonsavtaleFlagVisible={false}
        />
      )
      expect(screen.queryByTestId('pensjonsavtaler-alert')).toBeVisible()
      expect(screen.getByTitle('Advarsel')).toBeInTheDocument()
      expect(
        screen.getByText(
          'Beregningen viser kanskje ikke alt. Noe gikk galt ved henting av pensjonsavtaler i offentlig og privat sektor',
          {
            exact: false,
          }
        )
      ).toBeVisible()
    })

    it('Når kall til offentlig-tp er vellykket men at simuleringen er tom, og at private pensjonsavtaler gir delvis svar med 0 avtaler, viser riktig alert.', () => {
      render(
        <SimuleringPensjonsavtalerAlert
          pensjonsavtaler={{
            isLoading: false,
            isSuccess: true,
            isError: false,
            data: {
              avtaler: [],
              partialResponse: true,
            },
          }}
          offentligTp={{
            isError: false,
            data: {
              simuleringsresultatStatus: 'TOM_SIMULERING_FRA_TP_ORDNING',
              muligeTpLeverandoerListe: ['Statens pensjonskasse'],
            },
          }}
          isPensjonsavtaleFlagVisible={false}
        />
      )
      expect(screen.queryByTestId('pensjonsavtaler-alert')).toBeVisible()
      expect(screen.getByTitle('Advarsel')).toBeInTheDocument()
      expect(
        screen.getByText(
          'Beregningen viser kanskje ikke alt. Noe gikk galt ved henting av pensjonsavtaler i offentlig og privat sektor',
          {
            exact: false,
          }
        )
      ).toBeVisible()
    })

    it('Når kall til offentlig-tp feiler og henting av private pensjonsavtaler er vellykket, viser riktig alert.', () => {
      render(
        <SimuleringPensjonsavtalerAlert
          pensjonsavtaler={{
            isLoading: false,
            isSuccess: true,
            isError: false,
            data: {
              avtaler: avtalerWithKeys,
              partialResponse: false,
            },
          }}
          offentligTp={{
            isError: true,
          }}
          isPensjonsavtaleFlagVisible={false}
        />
      )
      expect(screen.queryByTestId('pensjonsavtaler-alert')).toBeVisible()
      expect(screen.getByTitle('Advarsel')).toBeInTheDocument()
      expect(
        screen.getByText(
          'Beregningen viser kanskje ikke alt. Noe gikk galt ved henting av pensjonsavtaler i offentlig sektor',
          {
            exact: false,
          }
        )
      ).toBeVisible()
    })

    it('Når kall til offentlig-tp er vellykket men at simuleringen førte til teknisk feil, og henting av private pensjonsavtaler er vellykket, viser riktig alert.', () => {
      render(
        <SimuleringPensjonsavtalerAlert
          pensjonsavtaler={{
            isLoading: false,
            isSuccess: true,
            isError: false,
            data: {
              avtaler: avtalerWithKeys,
              partialResponse: false,
            },
          }}
          offentligTp={{
            isError: false,
            data: {
              simuleringsresultatStatus: 'TEKNISK_FEIL',
              muligeTpLeverandoerListe: ['Statens pensjonskasse'],
            },
          }}
          isPensjonsavtaleFlagVisible={false}
        />
      )
      expect(screen.queryByTestId('pensjonsavtaler-alert')).toBeVisible()
      expect(screen.getByTitle('Advarsel')).toBeInTheDocument()
      expect(
        screen.getByText(
          'Beregningen viser kanskje ikke alt. Noe gikk galt ved henting av pensjonsavtaler i offentlig sektor',
          {
            exact: false,
          }
        )
      ).toBeVisible()
    })

    it('Når kall til offentlig-tp er vellykket men at simuleringen er tom, og henting av private pensjonsavtaler er vellykket, viser riktig alert.', () => {
      render(
        <SimuleringPensjonsavtalerAlert
          pensjonsavtaler={{
            isLoading: false,
            isSuccess: true,
            isError: false,
            data: {
              avtaler: avtalerWithKeys,
              partialResponse: false,
            },
          }}
          offentligTp={{
            isError: false,
            data: {
              simuleringsresultatStatus: 'TOM_SIMULERING_FRA_TP_ORDNING',
              muligeTpLeverandoerListe: ['Statens pensjonskasse'],
            },
          }}
          isPensjonsavtaleFlagVisible={false}
        />
      )
      expect(screen.queryByTestId('pensjonsavtaler-alert')).toBeVisible()
      expect(screen.getByTitle('Advarsel')).toBeInTheDocument()
      expect(
        screen.getByText(
          'Beregningen viser kanskje ikke alt. Noe gikk galt ved henting av pensjonsavtaler i offentlig sektor',
          {
            exact: false,
          }
        )
      ).toBeVisible()
    })

    it('Når henting av private pensjonsavtaler er vellykket og isPensjonsavtaleFlagVisible er true, viser riktig alert.', () => {
      render(
        <SimuleringPensjonsavtalerAlert
          pensjonsavtaler={{
            isLoading: false,
            isSuccess: true,
            isError: false,
            data: {
              avtaler: avtalerWithKeys,
              partialResponse: false,
            },
          }}
          offentligTp={{
            isError: false,
          }}
          isPensjonsavtaleFlagVisible={true}
        />
      )

      expect(screen.queryByTestId('pensjonsavtaler-alert')).toBeVisible()
      expect(screen.getByTitle('Informasjon')).toBeInTheDocument()

      expect(
        screen.getByText(
          'Du har pensjonsavtaler som starter før valgt alder.',
          {
            exact: false,
          }
        )
      ).toBeVisible()
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
        pensjonsavtaler={{
          isLoading: false,
          isSuccess: false,
          isError: true,
        }}
        offentligTp={{
          isError: false,
          data: offentligTpData as OffentligTp,
        }}
        isPensjonsavtaleFlagVisible={false}
      />
    )
    fireEvent.click(screen.getByTestId('pensjonsavtaler-alert-link'))

    expect(scrollToMock).toHaveBeenCalledWith({
      behavior: 'smooth',
      top: -15,
    })
  })

  it('ShowMore vises og scroller til Pensjonsavtaler når lenken klikkes i alert-boksen', () => {
    render(
      <BeregningContext.Provider value={contextMockedValues}>
        <SimuleringPensjonsavtalerAlert
          pensjonsavtaler={{
            isLoading: false,
            isSuccess: false,
            isError: true,
          }}
          offentligTp={{
            isError: false,
            data: offentligTpData as OffentligTp,
          }}
          isPensjonsavtaleFlagVisible={false}
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
})

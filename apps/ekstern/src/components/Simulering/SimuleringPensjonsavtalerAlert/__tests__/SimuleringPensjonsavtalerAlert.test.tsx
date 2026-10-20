import offentligTpData from '@pensjonskalkulator-frontend-monorepo/mocks/data/offentlig-tp.json' with { type: 'json' }
import pensjonsavtalerData from '@pensjonskalkulator-frontend-monorepo/mocks/data/pensjonsavtaler/67.json' with { type: 'json' }
import { vi } from 'vitest'

import { ShowMoreRef } from '@/components/common/ShowMore/ShowMore'
import { loependeVedtakLoependeAlderspensjonMock } from '@/mocks'
import {
  AvansertBeregningModus,
  BeregningContext,
} from '@/pages/Beregning/context'
import { fireEvent, render, screen, within } from '@/test-utils'
import * as loggerUtils from '@/utils/logging'

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
        offentligTp={{ isError: false }}
        isPensjonsavtaleFlagVisible={false}
      />,
      {
        preloadedApiState: {
          getLoependeVedtak: loependeVedtakLoependeAlderspensjonMock,
        },
      }
    )
    const alert = screen.getByTestId(
      'pensjonsavtaler.avtaler-ikke-med-i-beregning'
    )
    expect(alert).toBeVisible()
  })

  it('viser Sanity-alert når offentlig AFP-beregning ikke kunne hentes før 1963', () => {
    const loggerSpy = vi.spyOn(loggerUtils, 'logger')

    render(
      <SimuleringPensjonsavtalerAlert
        pensjonsavtaler={{
          isLoading: false,
          isSuccess: true,
          isError: false,
          data: { avtaler: avtalerWithKeys, partialResponse: false },
        }}
        offentligTp={{
          isError: false,
          data: {
            feilkode: 'OPPFYLLER_IKKE_INNGANGSVILKAAR',
          } as unknown as OffentligTp,
        }}
        isPensjonsavtaleFlagVisible={false}
        erOffentligTpFoer1963
      />
    )

    const alert = screen.getByTestId('afp.fikk-ikke-hentet-beregning-fra-spk')
    expect(alert).toBeVisible()
    expect(alert).toHaveTextContent(
      'Vi fikk ikke hentet beregning av AFP fra SPK'
    )
    expect(loggerSpy).toHaveBeenCalledWith('alert vist', {
      tekst:
        'Du har fått en foreløpig beregning av AFP fra Nav. Vi fikk ikke hentet beregning av AFP fra Statens pensjonskasse (SPK).',
      variant: 'warning',
    })
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
      expect(
        screen.getByTestId('pensjonsavtaler.starter-foer-valgt-alder')
      ).toBeVisible()
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
      expect(
        screen.getByTestId('pensjonsavtaler.noe-gikk-galt-ved-henting-privat')
      ).toBeVisible()
      expect(screen.getByLabelText('Advarsel')).toBeInTheDocument()
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

      expect(
        screen.getByTestId('pensjonsavtaler.starter-foer-valgt-alder')
      ).toBeVisible()
      expect(screen.getByLabelText('Advarsel')).toBeInTheDocument()

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
      expect(
        screen.getByTestId('pensjonsavtaler.noe-gikk-galt-ved-henting-privat')
      ).toBeVisible()
      expect(screen.getByLabelText('Advarsel')).toBeInTheDocument()
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
      expect(
        screen.getByTestId('pensjonsavtaler.noe-gikk-galt-ved-henting-privat')
      ).toBeVisible()
      expect(screen.getByLabelText('Advarsel')).toBeInTheDocument()
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
      expect(screen.getByLabelText('Advarsel')).toBeInTheDocument()
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
      expect(
        screen.getByTestId('pensjonsavtaler.kan-ha-rett-til-offentlig-tp')
      ).toBeInTheDocument()
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
      expect(
        screen.getByTestId(
          'pensjonsavtaler.noe-gikk-galt-ved-henting-offentlig-og-privat'
        )
      ).toBeVisible()
      expect(screen.getByLabelText('Advarsel')).toBeInTheDocument()
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
      expect(screen.getByLabelText('Advarsel')).toBeInTheDocument()
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
      expect(
        screen.getByTestId(
          'pensjonsavtaler.noe-gikk-galt-ved-henting-offentlig-og-privat'
        )
      ).toBeVisible()
      expect(screen.getByLabelText('Advarsel')).toBeInTheDocument()
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
      expect(screen.getByLabelText('Advarsel')).toBeInTheDocument()
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
      expect(screen.getByLabelText('Advarsel')).toBeInTheDocument()
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
      expect(screen.getByLabelText('Advarsel')).toBeInTheDocument()
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
      expect(screen.getByLabelText('Advarsel')).toBeInTheDocument()
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
      expect(screen.getByLabelText('Advarsel')).toBeInTheDocument()
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
      const alert = screen.getByTestId(
        'pensjonsavtaler.noe-gikk-galt-ved-henting-offentlig'
      )
      expect(alert).toBeVisible()
      expect(screen.getByLabelText('Advarsel')).toBeInTheDocument()
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
      const alert = screen.getByTestId(
        'pensjonsavtaler.noe-gikk-galt-ved-henting-offentlig'
      )
      expect(alert).toBeVisible()
      expect(screen.getByLabelText('Advarsel')).toBeInTheDocument()
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
      const alert = screen.getByTestId(
        'pensjonsavtaler.noe-gikk-galt-ved-henting-offentlig'
      )
      expect(alert).toBeVisible()
      expect(screen.getByLabelText('Advarsel')).toBeInTheDocument()
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
      expect(
        screen.getByTestId('pensjonsavtaler.starter-foer-valgt-alder')
      ).toBeVisible()

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
    const privateAlert = screen.getByTestId(
      'pensjonsavtaler.noe-gikk-galt-ved-henting-privat'
    )
    fireEvent.click(within(privateAlert).getByText('pensjon fra andre'))

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
    const privateAlert = screen.getByTestId(
      'pensjonsavtaler.noe-gikk-galt-ved-henting-privat'
    )
    fireEvent.click(within(privateAlert).getByText('pensjon fra andre'))
    if (!contextMockedValues.pensjonsavtalerShowMoreRef.current) {
      throw Error('pensjonsavtalerShowMoreRef.current should not be null')
    }
    expect(
      contextMockedValues.pensjonsavtalerShowMoreRef.current.focus
    ).toHaveBeenCalledTimes(1)
  })
})

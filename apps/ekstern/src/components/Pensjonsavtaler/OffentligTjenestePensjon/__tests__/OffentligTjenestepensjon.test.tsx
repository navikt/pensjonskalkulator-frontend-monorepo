import { describe, it } from 'vitest'

import offentligTpData from '../../../../mocks/data/offentlig-tp.json' with { type: 'json' }
import { OffentligTjenestepensjon } from '../OffentligTjenestepensjon'
import { mockErrorResponse } from '@/mocks/server'
import { userInputInitialState } from '@/state/userInput/userInputReducer'
import { render, screen, waitFor } from '@/test-utils'
import * as useIsMobileUtils from '@/utils/useIsMobile'

describe('OffentligTjenestepensjon', () => {
  it('viser loader mens info om tp-medlemskap hentes.', () => {
    render(
      <OffentligTjenestepensjon
        isLoading={true}
        isError={false}
        headingLevel="3"
      />
    )

    expect(screen.getByTestId('offentligtp-loader')).toBeVisible()
  })

  it('Når kall til tp-offentlig feiler, viser riktig heading på riktig level og riktig feilmelding.', () => {
    render(
      <OffentligTjenestepensjon
        isLoading={false}
        isError={true}
        headingLevel="3"
      />
    )

    expect(screen.queryByTestId('offentligtp-loader')).not.toBeInTheDocument()

    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
      'pensjonsavtaler.offentligtp.title'
    )
    expect(screen.getByText('pensjonsavtaler.offentligtp.error')).toBeVisible()
  })

  it('Når brukeren ikke er medlem av noe offentlig tp-ordning, viser riktig heading på riktig level og riktig infomelding.', () => {
    render(
      <OffentligTjenestepensjon
        isLoading={false}
        isError={false}
        offentligTp={{
          simuleringsresultatStatus: 'BRUKER_ER_IKKE_MEDLEM_AV_TP_ORDNING',
          muligeTpLeverandoerListe: [],
        }}
        headingLevel="3"
      />
    )

    expect(screen.queryByTestId('offentligtp-loader')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
      'pensjonsavtaler.offentligtp.title'
    )
    expect(screen.getByText('pensjonsavtaler.ingress.ingen')).toBeVisible()
  })

  describe('Gitt at feature-toggle for tp-offentlig er på, ', () => {
    it('Gitt at brukeren er medlem av en annen ordning enn SPK, viser riktig heading på riktig level og riktig infomelding.', async () => {
      render(
        <OffentligTjenestepensjon
          isLoading={false}
          isError={false}
          offentligTp={{
            simuleringsresultatStatus: 'TP_ORDNING_STOETTES_IKKE',
            muligeTpLeverandoerListe: ['KLP'],
          }}
          headingLevel="3"
        />
      )

      expect(screen.queryByTestId('offentligtp-loader')).not.toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
        'pensjonsavtaler.offentligtp.title'
      )
      await waitFor(() => {
        expect(
          screen.getByText(
            'Du er eller har vært ansatt i offentlig sektor, men vi kan dessverre ikke hente inn offentlige pensjonsavtaler. Sjekk tjenestepensjonsavtalene dine hos aktuell tjenestepensjonsordning',
            { exact: false }
          )
        ).toBeVisible()
      })
    })

    describe('Gitt at brukeren er medlem av SPK, ', async () => {
      it('Når simuleringen feiler hos SPK, viser riktig heading på riktig level og riktig infomelding.', async () => {
        render(
          <OffentligTjenestepensjon
            isLoading={false}
            isError={false}
            offentligTp={{
              simuleringsresultatStatus: 'TEKNISK_FEIL',
              muligeTpLeverandoerListe: ['SPK'],
            }}
            headingLevel="3"
          />
        )

        expect(
          screen.queryByTestId('offentligtp-loader')
        ).not.toBeInTheDocument()
        expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
          'pensjonsavtaler.offentligtp.title'
        )
        await waitFor(() => {
          expect(
            screen.getByText(
              'Vi klarte ikke å hente din offentlige tjenestepensjon. Prøv igjen senere eller kontakt',
              { exact: false }
            )
          ).toBeVisible()
        })
      })

      it('Når simuleringen er tom, viser riktig heading på riktig level og riktig infomelding.', async () => {
        render(
          <OffentligTjenestepensjon
            isLoading={false}
            isError={false}
            offentligTp={{
              simuleringsresultatStatus: 'TOM_SIMULERING_FRA_TP_ORDNING',
              muligeTpLeverandoerListe: ['SPK'],
            }}
            headingLevel="3"
          />
        )

        expect(
          screen.queryByTestId('offentligtp-loader')
        ).not.toBeInTheDocument()
        expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
          'pensjonsavtaler.offentligtp.title'
        )
        await waitFor(() => {
          expect(
            screen.getByText('pensjonsavtaler.offentligtp.spk_empty')
          ).toBeVisible()
        })
      })

      it('Når simuleringen er vellykket og at brukeren er på desktop, viser riktig informasjon og liste over offentlige avtaler.', async () => {
        vi.spyOn(useIsMobileUtils, 'useIsMobile').mockReturnValue(false)

        const { container } = render(
          <OffentligTjenestepensjon
            isLoading={false}
            isError={false}
            offentligTp={{
              simuleringsresultatStatus: 'OK',
              muligeTpLeverandoerListe: [
                'Statens pensjonskasse',
                'Kommunal Landspensjonskasse',
                'Oslo Pensjonsforsikring',
              ],
              simulertTjenestepensjon: offentligTpData.simulertTjenestepensjon,
            }}
            headingLevel="3"
          />
        )
        expect(
          await screen.findByTestId('offentlig-tjenestepensjon-desktop')
        ).toBeVisible()
        expect(
          await screen.findAllByRole('heading', { level: 3 })
        ).toHaveLength(1)
        expect(
          await screen.findByText('pensjonsavtaler.offentligtp.title')
        ).toBeVisible()
        expect(
          await screen.findByText('pensjonsavtaler.offentligtp.subtitle.spk')
        ).toBeVisible()

        expect(
          await screen.findByText('pensjonsavtaler.tabell.title.left')
        ).toBeVisible()
        expect(
          await screen.findByText('pensjonsavtaler.tabell.title.middle')
        ).toBeVisible()
        expect(
          await screen.findByText('pensjonsavtaler.tabell.title.right')
        ).toBeVisible()
        expect(
          await screen.findByText(
            'String.fra 67 alder.aar string.til 69 alder.aar'
          )
        ).toBeVisible()
        expect(await screen.findAllByText('64 340 kr')).toHaveLength(1)
        expect(
          await screen.findByText(
            'String.fra 70 alder.aar string.til 74 alder.aar'
          )
        ).toBeVisible()
        expect(await screen.findAllByText('53 670 kr')).toHaveLength(1)
        expect(
          await screen.findByText('alder.livsvarig 75 alder.aar')
        ).toBeVisible()
        expect(await screen.findAllByText('48 900 kr')).toHaveLength(1)
        const rows = container.querySelectorAll('tr')
        expect(rows?.length).toBe(4)
      })

      it('Når simuleringen er vellykket og at brukeren er på mobil, viser riktig informasjon og liste over private pensjonsavtaler.', async () => {
        vi.spyOn(useIsMobileUtils, 'useIsMobile').mockReturnValue(true)
        const { container } = render(
          <OffentligTjenestepensjon
            isLoading={false}
            isError={false}
            offentligTp={{
              simuleringsresultatStatus: 'OK',
              muligeTpLeverandoerListe: [
                'Statens pensjonskasse',
                'Kommunal Landspensjonskasse',
                'Oslo Pensjonsforsikring',
              ],
              simulertTjenestepensjon: offentligTpData.simulertTjenestepensjon,
            }}
            headingLevel="4"
          />
        )
        expect(
          await screen.findByTestId('offentlig-tjenestepensjon-mobile')
        ).toBeVisible()
        expect(
          await screen.findAllByRole('heading', { level: 4 })
        ).toHaveLength(1)
        expect(
          await screen.findByText('pensjonsavtaler.offentligtp.title')
        ).toBeVisible()
        expect(
          await screen.findAllByRole('heading', { level: 5 })
        ).toHaveLength(1)
        expect(
          await screen.findByText('pensjonsavtaler.offentligtp.subtitle.spk')
        ).toBeVisible()
        expect(
          await screen.findByText(
            'String.fra 67 alder.aar string.til 69 alder.aar:'
          )
        ).toBeVisible()
        expect(
          await screen.findAllByText('64 340 pensjonsavtaler.kr_pr_aar')
        ).toHaveLength(1)
        expect(
          await screen.findByText(
            'String.fra 70 alder.aar string.til 74 alder.aar:'
          )
        ).toBeVisible()
        expect(
          await screen.findAllByText('53 670 pensjonsavtaler.kr_pr_aar')
        ).toHaveLength(1)
        expect(
          await screen.findByText('alder.livsvarig 75 alder.aar:')
        ).toBeVisible()
        expect(
          await screen.findAllByText('48 900 pensjonsavtaler.kr_pr_aar')
        ).toHaveLength(1)
        const rows = container.querySelectorAll('tr')
        expect(rows?.length).toBe(3)
      })

      describe('Gitt at brukeren har svart på spørsmålet om AFP og fått simulert tjenestepensjon, ', () => {
        it('Når brukeren har svart AFP privat på AFP steget, viser riktig informasjon.', async () => {
          render(
            <OffentligTjenestepensjon
              isLoading={false}
              isError={false}
              offentligTp={{
                simuleringsresultatStatus: 'OK',
                muligeTpLeverandoerListe: ['Statens pensjonskasse'],
                simulertTjenestepensjon: {
                  tpLeverandoer: 'SPK',
                  simuleringsresultat: {
                    betingetTjenestepensjonErInkludert: false,
                    utbetalingsperioder: [],
                  },
                },
              }}
              headingLevel="3"
            />,
            {
              preloadedState: {
                userInput: {
                  ...userInputInitialState,
                  samtykke: true,
                  afp: 'ja_privat',
                },
              },
            }
          )

          expect(
            await screen.findByTestId('offentlig-tjenestepensjon-mobile')
          ).toBeVisible()
          expect(
            screen.getByText('Livsvarig AFP er ikke inkludert i beløpet', {
              exact: false,
            })
          ).toBeVisible()
        })

        it('Når brukeren har svart AFP offentlig på AFP steget, viser riktig informasjon.', async () => {
          render(
            <OffentligTjenestepensjon
              isLoading={false}
              isError={false}
              offentligTp={{
                simuleringsresultatStatus: 'OK',
                muligeTpLeverandoerListe: ['Statens pensjonskasse'],
                simulertTjenestepensjon: {
                  tpLeverandoer: 'SPK',
                  simuleringsresultat: {
                    betingetTjenestepensjonErInkludert: false,
                    utbetalingsperioder: [],
                  },
                },
              }}
              headingLevel="3"
            />,
            {
              preloadedState: {
                userInput: {
                  ...userInputInitialState,
                  samtykke: true,
                  afp: 'ja_offentlig',
                },
              },
            }
          )

          expect(
            await screen.findByTestId('offentlig-tjenestepensjon-mobile')
          ).toBeVisible()
          expect(
            screen.getByText('Livsvarig AFP er ikke inkludert i beløpet', {
              exact: false,
            })
          ).toBeVisible()
        })

        it('Når brukeren har svart Vet ikke på AFP steget, viser riktig informasjon.', async () => {
          render(
            <OffentligTjenestepensjon
              isLoading={false}
              isError={false}
              offentligTp={{
                simuleringsresultatStatus: 'OK',
                muligeTpLeverandoerListe: ['Statens pensjonskasse'],
                simulertTjenestepensjon: {
                  tpLeverandoer: 'SPK',
                  simuleringsresultat: {
                    betingetTjenestepensjonErInkludert: false,
                    utbetalingsperioder: [],
                  },
                },
              }}
              headingLevel="3"
            />,
            {
              preloadedState: {
                userInput: {
                  ...userInputInitialState,
                  samtykke: true,
                  afp: 'vet_ikke',
                },
              },
            }
          )

          expect(
            await screen.findByTestId('offentlig-tjenestepensjon-mobile')
          ).toBeVisible()
          expect(
            screen.getByText(
              'Du har oppgitt at du ikke vet om du har rett til livsvarig AFP. Beløpet kan derfor inkludere betinget tjenestepensjon.',
              {
                exact: false,
              }
            )
          ).toBeVisible()
        })

        it('Når brukeren har svart Nei på AFP steget og betingetTjenestepensjonErInkludert er false, viser riktig informasjon.', async () => {
          render(
            <OffentligTjenestepensjon
              isLoading={false}
              isError={false}
              offentligTp={{
                simuleringsresultatStatus: 'OK',
                muligeTpLeverandoerListe: ['Statens pensjonskasse'],
                simulertTjenestepensjon: {
                  tpLeverandoer: 'SPK',
                  simuleringsresultat: {
                    betingetTjenestepensjonErInkludert: false,
                    utbetalingsperioder: [],
                  },
                },
              }}
              headingLevel="3"
            />,
            {
              preloadedState: {
                userInput: {
                  ...userInputInitialState,
                  samtykke: true,
                  afp: 'nei',
                },
              },
            }
          )

          expect(
            await screen.findByTestId('offentlig-tjenestepensjon-mobile')
          ).toBeVisible()
          expect(
            screen.queryByText(
              'Du har oppgitt at du ikke har rett til livsvarig AFP. Betinget tjenestepensjon er derfor inkludert i beløpet.',
              {
                exact: false,
              }
            )
          ).not.toBeInTheDocument()
          expect(
            screen.getByText(
              'Du har oppgitt at du ikke har rett til livsvarig AFP.',
              {
                exact: false,
              }
            )
          ).toBeVisible()
        })

        it('Når brukeren har svart Nei på AFP steget og betingetTjenestepensjonErInkludert er true, viser riktig informasjon.', async () => {
          render(
            <OffentligTjenestepensjon
              isLoading={false}
              isError={false}
              offentligTp={{
                simuleringsresultatStatus: 'OK',
                muligeTpLeverandoerListe: ['Statens pensjonskasse'],
                simulertTjenestepensjon: {
                  tpLeverandoer: 'SPK',
                  simuleringsresultat: {
                    betingetTjenestepensjonErInkludert: true,
                    utbetalingsperioder: [],
                  },
                },
              }}
              headingLevel="3"
            />,
            {
              preloadedState: {
                userInput: {
                  ...userInputInitialState,
                  samtykke: true,
                  afp: 'nei',
                },
              },
            }
          )

          expect(
            await screen.findByTestId('offentlig-tjenestepensjon-mobile')
          ).toBeVisible()
          expect(
            screen.getByText(
              'Du har oppgitt at du ikke har rett til livsvarig AFP. Betinget tjenestepensjon er derfor inkludert i beløpet.',
              {
                exact: false,
              }
            )
          ).toBeVisible()
        })
      })
    })
  })

  describe('Gitt at feature-toggle for tp-offentlig er av, ', () => {
    beforeEach(() => {
      mockErrorResponse('/feature/pensjonskalkulator.enable-tpoffentlig')
    })

    it('Gitt at brukeren er medlem av en hvilken som helst ordning, viser riktig heading på riktig level og riktig infotekst med tp-leverandør', () => {
      render(
        <OffentligTjenestepensjon
          isLoading={false}
          isError={false}
          offentligTp={{
            simuleringsresultatStatus: 'OK',
            muligeTpLeverandoerListe: [
              'Statens pensjonskasse',
              'Kommunal Landspensjonskasse',
              'Oslo Pensjonsforsikring',
            ],
          }}
          headingLevel="3"
        />
      )

      expect(screen.queryByTestId('offentligtp-loader')).not.toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
        'pensjonsavtaler.offentligtp.title'
      )
      expect(
        screen.getByText(
          'Du er eller har vært ansatt i offentlig sektor, men vi kan dessverre ikke hente inn offentlige pensjonsavtaler. Sjekk tjenestepensjonsavtalene dine hos aktuell tjenestepensjonsordning (Statens pensjonskasse, Kommunal Landspensjonskasse, Oslo Pensjonsforsikring).'
        )
      ).toBeInTheDocument()
    })

    it('Når simuleringen feilet hos SPK, viser ikke noe infomelding.', async () => {
      render(
        <OffentligTjenestepensjon
          isLoading={false}
          isError={false}
          offentligTp={{
            simuleringsresultatStatus: 'TEKNISK_FEIL',
            muligeTpLeverandoerListe: ['SPK'],
          }}
          headingLevel="3"
        />
      )

      expect(screen.queryByTestId('offentligtp-loader')).not.toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
        'pensjonsavtaler.offentligtp.title'
      )
      await waitFor(() => {
        expect(
          screen.queryByText(
            'Vi klarte ikke å hente din offentlige tjenestepensjon. Prøv igjen senere eller kontakt',
            { exact: false }
          )
        ).not.toBeInTheDocument()
      })
    })

    it('Når simuleringen er tom, viser ikke noe infomelding.', async () => {
      render(
        <OffentligTjenestepensjon
          isLoading={false}
          isError={false}
          offentligTp={{
            simuleringsresultatStatus: 'TOM_SIMULERING_FRA_TP_ORDNING',
            muligeTpLeverandoerListe: ['SPK'],
          }}
          headingLevel="3"
        />
      )

      expect(screen.queryByTestId('offentligtp-loader')).not.toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
        'pensjonsavtaler.offentligtp.title'
      )
      await waitFor(() => {
        expect(
          screen.queryByText('pensjonsavtaler.offentligtp.spk_empty')
        ).not.toBeInTheDocument()
      })
    })
  })
})

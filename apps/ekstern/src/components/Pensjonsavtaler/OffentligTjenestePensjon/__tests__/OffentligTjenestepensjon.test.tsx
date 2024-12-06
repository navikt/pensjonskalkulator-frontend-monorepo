import { describe, it } from 'vitest'

import { OffentligTjenestepensjon } from '../OffentligTjenestepensjon'
import { mockErrorResponse } from '@/mocks/server'
import { userInputInitialState } from '@/state/userInput/userInputReducer'
import { render, screen } from '@/test-utils'
import * as useIsMobileUtils from '@/utils/useIsMobile'

describe('OffentligTjenestepensjon', () => {
  it('viser loader mens info om tp-medlemskap hentes', () => {
    render(
      <OffentligTjenestepensjon
        isLoading={true}
        isError={false}
        headingLevel="3"
      />
    )

    expect(screen.getByTestId('offentligtp-loader')).toBeVisible()
  })

  it('Når brukeren ikke har tp-medlemskap, viser ingenting ', () => {
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

    expect(
      screen.queryByText('pensjonsavtaler.offentligtp.title')
    ).not.toBeInTheDocument()
  })

  describe('Gitt at feature-toggle for tp-offentlig er av, ', () => {
    beforeEach(() => {
      mockErrorResponse('/feature/pensjonskalkulator.enable-tpoffentlig')
    })

    it('Når brukeren har tp-medlemskap, viser riktig heading på riktig level og riktig infotekst med tp-leverandør', () => {
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

    it('Når kall til tp-offentlig feiler, viser riktig heading på riktig level og riktig feilmelding', () => {
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
      expect(
        screen.getByText('pensjonsavtaler.offentligtp.error')
      ).toBeInTheDocument()
    })
  })

  describe('Gitt at feature-toggle for tp-offentlig er på, ', () => {
    describe('Gitt at offentlig tjenestepensjon er hentet og at brukeren er medlem med simulert tjenestepensjon fra SPK, ', async () => {
      it('Når brukeren er på desktop, viser riktig informasjon og liste over offentlige avtaler.', async () => {
        vi.spyOn(useIsMobileUtils, 'useIsMobile').mockReturnValue(false)

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
        expect(
          await screen.findByText('pensjonsavtaler.offentligtp.title')
        ).toBeVisible()
        expect(
          await screen.findByTestId('offentlig-tjenestepensjon-desktop')
        ).toBeVisible()
      })

      it('Når brukeren er på mobil, viser riktig informasjon og liste over private pensjonsavtaler.', async () => {
        vi.spyOn(useIsMobileUtils, 'useIsMobile').mockReturnValue(true)
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
        expect(
          await screen.findByText('pensjonsavtaler.offentligtp.title')
        ).toBeVisible()
        expect(
          await screen.findByTestId('offentlig-tjenestepensjon-mobile')
        ).toBeVisible()
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
})

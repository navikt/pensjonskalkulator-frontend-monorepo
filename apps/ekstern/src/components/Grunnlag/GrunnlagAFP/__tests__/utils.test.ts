import { IntlShape } from 'react-intl'

import { afpContentIntl, generateAfpContent } from '../utils'

const intl = {
  formatMessage: (data: { id: string }) => data.id,
} as unknown as IntlShape

const afpOutput = afpContentIntl(intl)

describe('afpContent', () => {
  describe('uten vedtak', () => {
    const loependeVedtak = {
      harLoependeVedtak: false,
      ufoeretrygd: {
        grad: 0,
      },
    }
    describe('født før 1963', () => {
      const foedselsdato = '1962-01-01'
      describe('afpValg', () => {
        it('AFP Valg: Ja, offentlig sektor - Beregn AFP og AP ', () => {
          const actual = generateAfpContent(intl)({
            erApoteker: false,
            afpValg: 'ja_offentlig',
            afpUtregning: 'AFP_ETTERFULGT_AV_ALDERSPENSJON',
            foedselsdato,
            loependeVedtak,
            samtykkeOffentligAFP: null,
            beregningsvalg: null,
          })

          expect(actual).toStrictEqual(afpOutput.afpOffentligOppgitt_2)
        })
        it('AFP Valg: Ja, offentlig sektor - Beregn kun AP ', () => {
          const actual = generateAfpContent(intl)({
            erApoteker: false,
            afpValg: 'ja_offentlig',
            afpUtregning: 'KUN_ALDERSPENSJON',
            foedselsdato,
            loependeVedtak,
            samtykkeOffentligAFP: null,
            beregningsvalg: null,
          })

          expect(actual).toStrictEqual(afpOutput.afpIkkeSvart_6)
        })
        it('AFP Valg: Ja, privat sektor', () => {
          const actual = generateAfpContent(intl)({
            erApoteker: false,
            afpValg: 'ja_privat',
            afpUtregning: null,
            foedselsdato,
            loependeVedtak,
            samtykkeOffentligAFP: null,
            beregningsvalg: null,
          })

          expect(actual).toStrictEqual(afpOutput.afpPrivat_4)
        })

        it('AFP Valg: Nei', () => {
          const actual = generateAfpContent(intl)({
            erApoteker: false,
            afpValg: 'nei',
            afpUtregning: null,
            foedselsdato,
            loependeVedtak,
            samtykkeOffentligAFP: null,
            beregningsvalg: null,
          })

          expect(actual).toStrictEqual(afpOutput.afpIkkeSvart_6)
        })

        it('AFP Valg: Vet ikke', () => {
          const actual = generateAfpContent(intl)({
            erApoteker: false,
            afpValg: 'vet_ikke',
            afpUtregning: null,
            foedselsdato,
            loependeVedtak,
            samtykkeOffentligAFP: null,
            beregningsvalg: null,
          })

          expect(actual).toStrictEqual(afpOutput.afpVetIkke_7)
        })
      })
    })
    describe('født 1963 eller senere', () => {
      const foedselsdato = '1963-01-01'
      describe('afpValg', () => {
        it('AFP Valg: Ja, offentlig sektor, ikke samtykket til beregning av AFP', () => {
          const actual = generateAfpContent(intl)({
            erApoteker: false,
            afpValg: 'ja_offentlig',
            afpUtregning: 'KUN_ALDERSPENSJON',
            // samtykke
            foedselsdato,
            loependeVedtak,
            samtykkeOffentligAFP: false,
            beregningsvalg: null,
          })

          expect(actual).toStrictEqual(afpOutput.offentligIkkeBeregnet_1)
        })
        it('AFP Valg: Ja, offentlig sektor, samtykket til beregning av AFP  ', () => {
          const actual = generateAfpContent(intl)({
            erApoteker: false,
            afpValg: 'ja_offentlig',
            afpUtregning: 'KUN_ALDERSPENSJON',
            foedselsdato,
            loependeVedtak,
            samtykkeOffentligAFP: true,
            beregningsvalg: null,
          })

          expect(actual).toStrictEqual(afpOutput.afpOffentligOppgitt_2)
        })
        it('AFP Valg: Ja, privat sektor', () => {
          const actual = generateAfpContent(intl)({
            erApoteker: false,
            afpValg: 'ja_privat',
            afpUtregning: null,
            foedselsdato,
            loependeVedtak,
            samtykkeOffentligAFP: null,
            beregningsvalg: null,
          })

          expect(actual).toStrictEqual(afpOutput.afpPrivat_4)
        })

        it('AFP Valg: Nei', () => {
          const actual = generateAfpContent(intl)({
            erApoteker: false,
            afpValg: 'nei',
            afpUtregning: null,
            foedselsdato,
            loependeVedtak,
            samtykkeOffentligAFP: null,
            beregningsvalg: null,
          })

          expect(actual).toStrictEqual(afpOutput.afpIkkeSvart_6)
        })

        it('AFP Valg: Vet ikke', () => {
          const actual = generateAfpContent(intl)({
            erApoteker: false,
            afpValg: 'vet_ikke',
            afpUtregning: null,
            foedselsdato,
            loependeVedtak,
            samtykkeOffentligAFP: null,
            beregningsvalg: null,
          })

          expect(actual).toStrictEqual(afpOutput.afpVetIkke_7)
        })
      })
    })
    describe('født før 1963 og fylt 67', () => {
      const foedselsdato = '1956-01-01'
      describe('afpValg', () => {
        it('AFP Valg: Ja, privat sektor', () => {
          const actual = generateAfpContent(intl)({
            erApoteker: false,
            afpValg: 'ja_privat',
            afpUtregning: null,
            foedselsdato,
            loependeVedtak,
            samtykkeOffentligAFP: null,
            beregningsvalg: null,
          })

          expect(actual).toStrictEqual(afpOutput.afpPrivat_4)
        })

        it('AFP Valg: Nei', () => {
          const actual = generateAfpContent(intl)({
            erApoteker: false,
            afpValg: 'nei',
            afpUtregning: null,
            foedselsdato,
            loependeVedtak,
            samtykkeOffentligAFP: null,
            beregningsvalg: null,
          })

          expect(actual).toStrictEqual(afpOutput.afpIkkeSvart_6)
        })
      })
    })
  })

  describe('med vedtak AP', () => {
    const loependeVedtak: LoependeVedtak = {
      harLoependeVedtak: true,
      ufoeretrygd: {
        grad: 0,
      },
      alderspensjon: {
        grad: 100,
        uttaksgradFom: '2022-01-01',
        fom: '2022-01-01',
        sivilstand: 'UGIFT',
      },
    }
    describe('født før 1963', () => {
      const foedselsdato = '1962-01-01'
      describe('afpValg', () => {
        it('AFP Valg: Ja, privat sektor', () => {
          const actual = generateAfpContent(intl)({
            erApoteker: false,
            afpValg: 'ja_privat',
            afpUtregning: null,
            foedselsdato,
            loependeVedtak,
            samtykkeOffentligAFP: null,
            beregningsvalg: null,
          })

          expect(actual).toStrictEqual(afpOutput.afpPrivat_4)
        })

        it('AFP Valg: Nei', () => {
          const actual = generateAfpContent(intl)({
            erApoteker: false,
            afpValg: 'nei',
            afpUtregning: null,
            foedselsdato,
            loependeVedtak,
            samtykkeOffentligAFP: null,
            beregningsvalg: null,
          })

          expect(actual).toStrictEqual(afpOutput.afpIkkeSvart_6)
        })
      })
    })

    describe('født etter 1963', () => {
      const foedselsdato = '1963-01-01'
      describe('afpValg', () => {
        it('AFP Valg: Ja, offentlig sektor, ikke samtykket', () => {
          const actual = generateAfpContent(intl)({
            erApoteker: false,
            afpValg: 'ja_offentlig',
            afpUtregning: null,
            foedselsdato,
            loependeVedtak,
            samtykkeOffentligAFP: false,
            beregningsvalg: null,
          })

          expect(actual).toStrictEqual(afpOutput.offentligIkkeBeregnet_1)
        })

        it('AFP Valg: Ja, offentlig sektor, har samtykket', () => {
          const actual = generateAfpContent(intl)({
            erApoteker: false,
            afpValg: 'ja_offentlig',
            afpUtregning: null,
            foedselsdato,
            loependeVedtak,
            samtykkeOffentligAFP: true,
            beregningsvalg: null,
          })

          expect(actual).toStrictEqual(afpOutput.afpOffentligOppgitt_2)
        })

        it('AFP Valg: Ja, privat sektor', () => {
          const actual = generateAfpContent(intl)({
            erApoteker: false,
            afpValg: 'ja_privat',
            afpUtregning: null,
            foedselsdato,
            loependeVedtak,
            samtykkeOffentligAFP: null,
            beregningsvalg: null,
          })

          expect(actual).toStrictEqual(afpOutput.afpPrivat_4)
        })

        it('AFP Valg: Nei', () => {
          const actual = generateAfpContent(intl)({
            erApoteker: false,
            afpValg: 'nei',
            afpUtregning: null,
            foedselsdato,
            loependeVedtak,
            samtykkeOffentligAFP: null,
            beregningsvalg: null,
          })

          expect(actual).toStrictEqual(afpOutput.afpIkkeSvart_6)
        })
        it('AFP Valg: Vet ikke', () => {
          const actual = generateAfpContent(intl)({
            erApoteker: false,
            afpValg: 'vet_ikke',
            afpUtregning: null,
            foedselsdato,
            loependeVedtak,
            samtykkeOffentligAFP: null,
            beregningsvalg: null,
          })

          expect(actual).toStrictEqual(afpOutput.afpVetIkke_7)
        })
      })
    })
  })

  describe('med gradert vedtak UT', () => {
    const loependeVedtak: LoependeVedtak = {
      harLoependeVedtak: true,
      ufoeretrygd: {
        grad: 50,
      },
    }

    it('født før 1963', () => {
      const foedselsdato = '1951-01-01'
      const actual = generateAfpContent(intl)({
        erApoteker: false,
        afpValg: null,
        afpUtregning: null,
        foedselsdato,
        loependeVedtak,
        samtykkeOffentligAFP: false,
        beregningsvalg: null,
      })

      expect(actual).toStrictEqual(afpOutput.afpUforetrygd_9)
    })

    describe('født etter 1963, ikke fylt 62 (59 år)', () => {
      const foedselsdato = '1966-01-01'
      describe('afpValg', () => {
        it('AFP Valg: Ja, offentlig sektor, ikke samtykket', () => {
          const actual = generateAfpContent(intl)({
            erApoteker: false,
            afpValg: 'ja_offentlig',
            afpUtregning: null,
            foedselsdato,
            loependeVedtak,
            samtykkeOffentligAFP: false,
            beregningsvalg: null,
          })

          expect(actual).toStrictEqual(afpOutput.offentligIkkeBeregnet_1)
        })

        it('AFP Valg: Ja, offentlig sektor, har samtykket, skal beregne AFP', () => {
          const actual = generateAfpContent(intl)({
            erApoteker: false,
            afpValg: 'ja_offentlig',
            afpUtregning: 'AFP_ETTERFULGT_AV_ALDERSPENSJON',
            foedselsdato,
            loependeVedtak,
            samtykkeOffentligAFP: true,
            beregningsvalg: 'med_afp',
          })

          expect(actual).toStrictEqual(afpOutput.afpOffentligOppgitt_2)
        })

        it('AFP Valg: Ja, offentlig sektor, har samtykket, skal IKKE beregne AFP', () => {
          const actual = generateAfpContent(intl)({
            erApoteker: false,
            afpValg: 'ja_offentlig',
            afpUtregning: 'AFP_ETTERFULGT_AV_ALDERSPENSJON',
            foedselsdato,
            loependeVedtak,
            samtykkeOffentligAFP: true,
            beregningsvalg: 'uten_afp',
          })

          expect(actual).toStrictEqual(
            afpOutput.offentligAfpOgUforeKanIkkeBeregnes_3
          )
        })

        it('AFP Valg: Ja, offentlig sektor, har samtykket, skal IKKE beregne AFP (beregningsvalg === null)', () => {
          const actual = generateAfpContent(intl)({
            erApoteker: false,
            afpValg: 'ja_offentlig',
            afpUtregning: 'AFP_ETTERFULGT_AV_ALDERSPENSJON',
            foedselsdato,
            loependeVedtak,
            samtykkeOffentligAFP: true,
            beregningsvalg: null,
          })

          expect(actual).toStrictEqual(
            afpOutput.offentligAfpOgUforeKanIkkeBeregnes_3
          )
        })

        it('AFP Valg: Ja, privat sektor, skal IKKE beregne AFP', () => {
          const actual = generateAfpContent(intl)({
            erApoteker: false,
            afpValg: 'ja_privat',
            afpUtregning: null,
            foedselsdato,
            loependeVedtak,
            samtykkeOffentligAFP: null,
            beregningsvalg: 'uten_afp',
          })

          expect(actual).toStrictEqual(afpOutput.afpPrivatIkkeBeregnet_5)
        })

        it('AFP Valg: Ja, privat sektor, skal IKKE beregne AFP (afpUtregning === null)', () => {
          const actual = generateAfpContent(intl)({
            erApoteker: false,
            afpValg: 'ja_privat',
            afpUtregning: null,
            foedselsdato,
            loependeVedtak,
            samtykkeOffentligAFP: null,
            beregningsvalg: null,
          })

          expect(actual).toStrictEqual(afpOutput.afpPrivatIkkeBeregnet_5)
        })

        it('AFP Valg: Ja, privat sektor, skal beregne AFP', () => {
          const actual = generateAfpContent(intl)({
            erApoteker: false,
            afpValg: 'ja_privat',
            afpUtregning: null,
            foedselsdato,
            loependeVedtak,
            samtykkeOffentligAFP: null,
            beregningsvalg: 'med_afp',
          })

          expect(actual).toStrictEqual(afpOutput.afpPrivat_4)
        })

        it('AFP Valg: Nei', () => {
          const actual = generateAfpContent(intl)({
            erApoteker: false,
            afpValg: 'nei',
            afpUtregning: null,
            foedselsdato,
            loependeVedtak,
            samtykkeOffentligAFP: null,
            beregningsvalg: null,
          })

          expect(actual).toStrictEqual(afpOutput.afpIkkeSvart_6)
        })
        it('AFP Valg: Vet ikke', () => {
          const actual = generateAfpContent(intl)({
            erApoteker: false,
            afpValg: 'vet_ikke',
            afpUtregning: null,
            foedselsdato,
            loependeVedtak,
            samtykkeOffentligAFP: null,
            beregningsvalg: null,
          })

          expect(actual).toStrictEqual(afpOutput.afpVetIkkeUforetrygd_8)
        })
      })
    })

    it('født etter 1963, fylt 62 (62 år)', () => {
      const foedselsdato = '1963-01-01'
      const actual = generateAfpContent(intl)({
        erApoteker: false,
        afpValg: null,
        afpUtregning: null,
        foedselsdato,
        loependeVedtak,
        samtykkeOffentligAFP: false,
        beregningsvalg: null,
      })

      expect(actual).toStrictEqual(afpOutput.afpUforetrygdNei_10)
    })
  })

  describe('med vedtak 100% UT', () => {
    const loependeVedtak: LoependeVedtak = {
      harLoependeVedtak: true,
      ufoeretrygd: {
        grad: 100,
      },
    }
    it('født før 1963', () => {
      const foedselsdato = '1962-01-01'
      const actual = generateAfpContent(intl)({
        erApoteker: false,
        afpValg: null,
        afpUtregning: null,
        foedselsdato,
        loependeVedtak,
        samtykkeOffentligAFP: true,
        beregningsvalg: null,
      })

      expect(actual).toStrictEqual(afpOutput.afpUforetrygd_9)
    })

    it('født etter 1963', () => {
      const foedselsdato = '1963-01-01'
      const actual = generateAfpContent(intl)({
        erApoteker: false,
        afpValg: null,
        afpUtregning: null,
        foedselsdato,
        loependeVedtak,
        samtykkeOffentligAFP: false,
        beregningsvalg: null,
      })

      expect(actual).toStrictEqual(afpOutput.afpUforetrygdNei_10)
    })
  })

  describe('med vedtak om gradert AP og gradert UT', () => {
    const loependeVedtak: LoependeVedtak = {
      harLoependeVedtak: true,
      ufoeretrygd: {
        grad: 50,
      },
    }
    describe('født etter 1963', () => {
      const foedselsdato = '1963-01-01'
      it('har fått AFP steg', () => {
        const actual = generateAfpContent(intl)({
          erApoteker: false,
          afpValg: null,
          afpUtregning: null,
          foedselsdato,
          loependeVedtak,
          samtykkeOffentligAFP: false,
          beregningsvalg: null,
        })

        expect(actual).toStrictEqual(afpOutput.afpUforetrygdNei_10)
      })
    })
  })

  describe('med vedtak om AP og UT', () => {
    describe('født før 1963', () => {
      const foedselsdato = '1962-01-01'
      it('vedtak om gradert AP og gradert UT', () => {
        const loependeVedtak: LoependeVedtak = {
          harLoependeVedtak: true,
          ufoeretrygd: {
            grad: 50,
          },
          alderspensjon: {
            uttaksgradFom: '2022-01-01',
            fom: '2022-01-01',
            grad: 50,
            sivilstand: 'GIFT',
          },
        }

        const actual = generateAfpContent(intl)({
          erApoteker: false,
          afpValg: null,
          afpUtregning: null,
          foedselsdato,
          loependeVedtak,
          samtykkeOffentligAFP: false,
          beregningsvalg: null,
        })

        expect(actual).toStrictEqual(afpOutput.afpUforetrygd_9)
      })

      it('vedtak om 0% AP og 100% UT', () => {
        const loependeVedtak: LoependeVedtak = {
          harLoependeVedtak: true,
          ufoeretrygd: {
            grad: 50,
          },
          alderspensjon: {
            uttaksgradFom: '2022-01-01',
            fom: '2022-01-01',
            grad: 50,
            sivilstand: 'GIFT',
          },
        }
        const actual = generateAfpContent(intl)({
          erApoteker: false,
          afpValg: null,
          afpUtregning: null,
          foedselsdato,
          loependeVedtak,
          samtykkeOffentligAFP: false,
          beregningsvalg: null,
        })

        expect(actual).toStrictEqual(afpOutput.afpUforetrygd_9)
      })
    })

    describe('født etter 1963', () => {
      const foedselsdato = '1963-01-01'
      it('vedtak om gradert AP og gradert UT', () => {
        const loependeVedtak: LoependeVedtak = {
          harLoependeVedtak: true,
          ufoeretrygd: {
            grad: 50,
          },
          alderspensjon: {
            uttaksgradFom: '2022-01-01',
            fom: '2022-01-01',
            grad: 50,
            sivilstand: 'GIFT',
          },
        }

        const actual = generateAfpContent(intl)({
          erApoteker: false,
          afpValg: null,
          afpUtregning: null,
          foedselsdato,
          loependeVedtak,
          samtykkeOffentligAFP: false,
          beregningsvalg: null,
        })

        expect(actual).toStrictEqual(afpOutput.afpUforetrygdNei_10)
      })

      it('vedtak om 0% AP og 100% UT', () => {
        const loependeVedtak: LoependeVedtak = {
          harLoependeVedtak: true,
          ufoeretrygd: {
            grad: 50,
          },
          alderspensjon: {
            uttaksgradFom: '2022-01-01',
            fom: '2022-01-01',
            grad: 50,
            sivilstand: 'GIFT',
          },
        }
        const actual = generateAfpContent(intl)({
          erApoteker: false,
          afpValg: null,
          afpUtregning: null,
          foedselsdato,
          loependeVedtak,
          samtykkeOffentligAFP: false,
          beregningsvalg: null,
        })

        expect(actual).toStrictEqual(afpOutput.afpUforetrygdNei_10)
      })
    })
    describe('vedtak om AFP', () => {
      describe('født før 1963', () => {
        const foedselsdato = '1962-01-01'

        it('vedtak om AP og AFP Privat', () => {
          const loependeVedtak: LoependeVedtak = {
            harLoependeVedtak: true,
            ufoeretrygd: {
              grad: 0,
            },
            afpPrivat: {
              fom: '2022-01-01',
            },
            alderspensjon: {
              uttaksgradFom: '2022-01-01',
              fom: '2022-01-01',
              grad: 50,
              sivilstand: 'GIFT',
            },
          }
          const actual = generateAfpContent(intl)({
            erApoteker: false,
            afpValg: null,
            afpUtregning: null,
            foedselsdato,
            loependeVedtak,
            samtykkeOffentligAFP: false,
            beregningsvalg: null,
          })

          expect(actual).toStrictEqual(afpOutput.afpPrivatUendret_11)
        })
        it('vedtak om gammel AFP offentlig, ikke samtykket', () => {
          const loependeVedtak: LoependeVedtak = {
            harLoependeVedtak: true,
            ufoeretrygd: {
              grad: 0,
            },
            pre2025OffentligAfp: {
              fom: '2022-01-01',
            },
          }
          const actual = generateAfpContent(intl)({
            erApoteker: false,
            afpValg: null,
            afpUtregning: null,
            foedselsdato,
            loependeVedtak,
            samtykkeOffentligAFP: false,
            beregningsvalg: null,
          })

          expect(actual).toStrictEqual(afpOutput.harAfpOffentlig_12)
        })
        it('vedtak om 0% AP og gammel AFP', () => {
          const loependeVedtak: LoependeVedtak = {
            harLoependeVedtak: true,
            ufoeretrygd: {
              grad: 0,
            },
            alderspensjon: {
              uttaksgradFom: '2022-01-01',
              fom: '2022-01-01',
              grad: 0,
              sivilstand: 'GIFT',
            },
            afpOffentlig: {
              fom: '2022-01-01',
            },
          }
          const actual = generateAfpContent(intl)({
            erApoteker: false,
            afpValg: null,
            afpUtregning: null,
            foedselsdato,
            loependeVedtak,
            samtykkeOffentligAFP: false,
            beregningsvalg: null,
          })

          expect(actual).toStrictEqual(afpOutput.harAfpOffentlig_12)
        })
      })
      describe('født etter 1963', () => {
        const foedselsdato = '1964-01-01'
        it('har ikke AFP', () => {
          const loependeVedtak: LoependeVedtak = {
            harLoependeVedtak: true,
            ufoeretrygd: {
              grad: 0,
            },
            alderspensjon: {
              uttaksgradFom: '2022-01-01',
              fom: '2022-01-01',
              grad: 100,
              sivilstand: 'GIFT',
            },
            afpPrivat: {
              fom: '2022-01-01',
            },
          }
          const actual = generateAfpContent(intl)({
            erApoteker: false,
            afpValg: null,
            afpUtregning: null,
            foedselsdato,
            loependeVedtak,
            samtykkeOffentligAFP: false,
            beregningsvalg: null,
          })

          expect(actual).toStrictEqual(afpOutput.afpPrivatUendret_11)
        })
      })
    })
  })
  describe('er apoteker', () => {
    const erApoteker = true

    // Samme tester for apotekere født før og etter 1963
    Object.entries({
      'født etter 1963': '1963-01-01',
      'født før 1963': '1962-01-01',
    }).forEach(([test, foedselsdato]) => {
      describe(test, () => {
        describe('uten vedtak', () => {
          const loependeVedtak = {
            harLoependeVedtak: false,
            ufoeretrygd: {
              grad: 0,
            },
          }
          describe('afpValg', () => {
            it('AFP: Offentlig, beregn AP og AFP', () => {
              const actual = generateAfpContent(intl)({
                erApoteker: erApoteker,
                afpValg: 'ja_offentlig',
                afpUtregning: 'AFP_ETTERFULGT_AV_ALDERSPENSJON',
                foedselsdato,
                loependeVedtak,
                samtykkeOffentligAFP: true,
                beregningsvalg: null,
              })

              expect(actual).toStrictEqual(afpOutput.afpOffentligOppgitt_2)
            })

            it('AFP: Offentlig, beregn kun AP ', () => {
              const actual = generateAfpContent(intl)({
                erApoteker: erApoteker,
                afpValg: 'ja_offentlig',
                afpUtregning: 'KUN_ALDERSPENSJON',
                foedselsdato,
                loependeVedtak,
                samtykkeOffentligAFP: true,
                beregningsvalg: null,
              })

              expect(actual).toStrictEqual(afpOutput.afpIkkeSvart_6)
            })

            it('AFP: Privat', () => {
              const actual = generateAfpContent(intl)({
                erApoteker: erApoteker,
                afpValg: 'ja_privat',
                afpUtregning: null,
                foedselsdato,
                loependeVedtak,
                samtykkeOffentligAFP: true,
                beregningsvalg: null,
              })

              expect(actual).toStrictEqual(afpOutput.afpPrivat_4)
            })
            it('AFP: Nei', () => {
              const actual = generateAfpContent(intl)({
                erApoteker: erApoteker,
                afpValg: 'nei',
                afpUtregning: null,
                foedselsdato,
                loependeVedtak,
                samtykkeOffentligAFP: true,
                beregningsvalg: null,
              })

              expect(actual).toStrictEqual(afpOutput.afpIkkeSvart_6)
            })
            it('AFP: Vet ikke', () => {
              const actual = generateAfpContent(intl)({
                erApoteker: erApoteker,
                afpValg: 'vet_ikke',
                afpUtregning: null,
                foedselsdato,
                loependeVedtak,
                samtykkeOffentligAFP: true,
                beregningsvalg: null,
              })

              expect(actual).toStrictEqual(afpOutput.afpVetIkke_7)
            })
          })
        })
        it('med vedtak om AP', () => {
          const loependeVedtak: LoependeVedtak = {
            harLoependeVedtak: false,
            alderspensjon: {
              uttaksgradFom: '2022-01-01',
              fom: '2022-01-01',
              sivilstand: 'GIFT',
              grad: 100,
            },
            ufoeretrygd: {
              grad: 0,
            },
          }

          const actual = generateAfpContent(intl)({
            erApoteker: erApoteker,
            afpValg: null,
            afpUtregning: null,
            foedselsdato,
            loependeVedtak,
            samtykkeOffentligAFP: true,
            beregningsvalg: null,
          })

          expect(actual).toStrictEqual(afpOutput.afpUforetrygd_9)
        })

        it('med vedtak om gradert UT', () => {
          const loependeVedtak: LoependeVedtak = {
            harLoependeVedtak: false,
            ufoeretrygd: {
              grad: 50,
            },
          }

          const actual = generateAfpContent(intl)({
            erApoteker: erApoteker,
            afpValg: null,
            afpUtregning: null,
            foedselsdato,
            loependeVedtak,
            samtykkeOffentligAFP: true,
            beregningsvalg: null,
          })

          expect(actual).toStrictEqual(afpOutput.afpUforetrygd_9)
        })

        it('med vedtak om gradert AP og gradert UT', () => {
          const loependeVedtak: LoependeVedtak = {
            harLoependeVedtak: false,
            alderspensjon: {
              uttaksgradFom: '2022-01-01',
              fom: '2022-01-01',
              sivilstand: 'GIFT',
              grad: 50,
            },
            ufoeretrygd: {
              grad: 50,
            },
          }

          const actual = generateAfpContent(intl)({
            erApoteker: erApoteker,
            afpValg: null,
            afpUtregning: null,
            foedselsdato,
            loependeVedtak,
            samtykkeOffentligAFP: true,
            beregningsvalg: null,
          })

          expect(actual).toStrictEqual(afpOutput.afpUforetrygd_9)
        })

        it('med vedtak 0% AP og 100% UT', () => {
          const loependeVedtak: LoependeVedtak = {
            harLoependeVedtak: false,
            alderspensjon: {
              fom: '2022-01-01',
              uttaksgradFom: '2022-01-01',
              sivilstand: 'GIFT',
              grad: 0,
            },
            ufoeretrygd: {
              grad: 50,
            },
          }

          const actual = generateAfpContent(intl)({
            erApoteker: erApoteker,
            afpValg: null,
            afpUtregning: null,
            foedselsdato,
            loependeVedtak,
            samtykkeOffentligAFP: true,
            beregningsvalg: null,
          })

          expect(actual).toStrictEqual(afpOutput.afpUforetrygd_9)
        })
        it('med vedtak 0% AP og gammel AFP offentlig', () => {
          const loependeVedtak: LoependeVedtak = {
            harLoependeVedtak: false,
            alderspensjon: {
              fom: '2022-01-01',
              uttaksgradFom: '2022-01-01',
              sivilstand: 'GIFT',
              grad: 0,
            },
            afpOffentlig: {
              fom: '2022-01-01',
            },
            ufoeretrygd: {
              grad: 0,
            },
          }

          const actual = generateAfpContent(intl)({
            erApoteker: erApoteker,
            afpValg: null,
            afpUtregning: null,
            foedselsdato,
            loependeVedtak,
            samtykkeOffentligAFP: true,
            beregningsvalg: null,
          })

          expect(actual).toStrictEqual(afpOutput.harAfpOffentlig_12)
        })

        it('med fremtidig vedtak', () => {
          const loependeVedtak: LoependeVedtak = {
            harLoependeVedtak: false,
            ufoeretrygd: {
              grad: 0,
            },
            fremtidigAlderspensjon: {
              fom: '2027-01-01',
              grad: 100,
            },
          }

          const actual = generateAfpContent(intl)({
            erApoteker: erApoteker,
            afpValg: null,
            afpUtregning: null,
            foedselsdato,
            loependeVedtak,
            samtykkeOffentligAFP: true,
            beregningsvalg: null,
          })

          expect(actual).toStrictEqual(afpOutput.afpUforetrygd_9)
        })
      })
    })
  })
})

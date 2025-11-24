import { apoteker, loependeVedtak, person, tidligsteUttaksalder } from './mocks'

export const presetStates = {
  async brukerUnder75() {
    return [
      await person({
        alder: { aar: 65, maaneder: 11, dager: 5 },
      }),
    ]
  },

  async brukerOver75() {
    return [
      await person({
        alder: { aar: 75, maaneder: 1, dager: 0 },
      }),
    ]
  },

  async brukerGift1963() {
    return [
      await person({
        navn: 'Aprikos',
        sivilstand: 'GIFT',
        foedselsdato: '1963-04-30',
        pensjoneringAldre: {
          normertPensjoneringsalder: { aar: 67, maaneder: 0 },
          nedreAldersgrense: { aar: 62, maaneder: 0 },
          oevreAldersgrense: { aar: 75, maaneder: 0 },
        },
      }),
    ]
  },

  async brukerEldreEnn67() {
    return [
      await person({
        navn: 'Aprikos',
        sivilstand: 'UGIFT',
        foedselsdato: '1956-04-30',
        pensjoneringAldre: {
          normertPensjoneringsalder: { aar: 67, maaneder: 0 },
          nedreAldersgrense: { aar: 62, maaneder: 0 },
          oevreAldersgrense: { aar: 75, maaneder: 0 },
        },
      }),
    ]
  },

  async apotekerMedlem() {
    return [
      await person({
        navn: 'Aprikos',
        sivilstand: 'UGIFT',
        foedselsdato: '1962-04-30',
        pensjoneringAldre: {
          normertPensjonsalder: { aar: 67, maaneder: 0 },
          nedreAldersgrense: { aar: 62, maaneder: 0 },
          oevreAldersgrense: { aar: 75, maaneder: 0 },
        },
      }),
      await apoteker({ apoteker: true, aarsak: 'ER_APOTEKER' }),
    ]
  },

  async medPre2025OffentligAfp(fom: string = '2023-01-01') {
    return [
      await loependeVedtak({
        pre2025OffentligAfp: { fom },
      }),
    ]
  },

  async medFremtidigAlderspensjonVedtak() {
    return [
      await loependeVedtak({
        fremtidigAlderspensjon: { grad: 100, fom: '2099-01-01' },
      }),
    ]
  },

  async medTidligsteUttaksalder(aar: number, maaneder: number) {
    return [await tidligsteUttaksalder({ aar, maaneder })]
  },

  async apotekerMedlemMedTidligsteUttak(aar: number, maaneder: number) {
    return [
      ...(await this.apotekerMedlem()),
      ...(await this.medTidligsteUttaksalder(aar, maaneder)),
    ]
  },

  async brukerUnder75MedPre2025OffentligAfpOgTidligsteUttak() {
    return [
      ...(await this.brukerUnder75()),
      ...(await this.medPre2025OffentligAfp()),
      ...(await this.medTidligsteUttaksalder(62, 10)),
    ]
  },
}

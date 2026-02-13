import {
  buildAfpSerie,
  buildAlderspensjonSerie,
  buildInntektSerie,
  buildTpSerie,
} from './series-builders'

describe('series-builders', () => {
  describe('buildInntektSerie', () => {
    it('returnerer tom array når uttaksalder er null', () => {
      const result = buildInntektSerie({
        uttaksalder: null,
        isEndring: false,
        aarligInntektFoerUttakBeloep: '300000',
      })

      expect(result).toEqual([])
    })

    it('beregner inntekt før uttak for førstegangssøknad', () => {
      const result = buildInntektSerie({
        uttaksalder: { aar: 67, maaneder: 0 },
        isEndring: false,
        aarligInntektFoerUttakBeloep: '300000',
      })

      // Starter 1 år før uttak (66), slutter ved 66 år 11 mnd (året før uttak)
      expect(result).toEqual([{ alder: 66, beloep: 300000 }])
    })

    it('beregner inntekt før uttak for endring', () => {
      const result = buildInntektSerie({
        uttaksalder: { aar: 67, maaneder: 0 },
        isEndring: true,
        alderspensjonListe: [{ alder: 65, beloep: 200000 }],
        aarligInntektFoerUttakBeloep: '300000',
      })

      // Ved endring starter inntekt fra pensjonsåret (65), slutter ved 66 år 11 mnd
      expect(result).toEqual([
        { alder: 65, beloep: 300000 },
        { alder: 66, beloep: 300000 },
      ])
    })

    it('beregner inntekt med gradert uttak', () => {
      const result = buildInntektSerie({
        uttaksalder: { aar: 70, maaneder: 0 },
        isEndring: false,
        gradertUttaksperiode: {
          grad: 50,
          uttaksalder: { aar: 67, maaneder: 0 },
          aarligInntektVsaPensjonBeloep: '250000',
        },
        aarligInntektFoerUttakBeloep: '300000',
      })

      // Periode 1: 66 (inntekt før uttak)
      // Periode 2: 67-69 (inntekt ved gradert uttak)
      expect(result).toEqual([
        { alder: 66, beloep: 300000 },
        { alder: 67, beloep: 250000 },
        { alder: 68, beloep: 250000 },
        { alder: 69, beloep: 250000 },
      ])
    })

    it('beregner inntekt med hel pensjon og sluttAlder', () => {
      const result = buildInntektSerie({
        uttaksalder: { aar: 67, maaneder: 0 },
        isEndring: false,
        aarligInntektFoerUttakBeloep: '300000',
        aarligInntektVsaHelPensjon: {
          beloep: '100000',
          sluttAlder: { aar: 75, maaneder: 0 },
        },
      })

      // Periode 1: 66 (inntekt før uttak)
      // Periode 3: 67-74 (inntekt ved hel pensjon)
      expect(result).toEqual([
        { alder: 66, beloep: 300000 },
        { alder: 67, beloep: 100000 },
        { alder: 68, beloep: 100000 },
        { alder: 69, beloep: 100000 },
        { alder: 70, beloep: 100000 },
        { alder: 71, beloep: 100000 },
        { alder: 72, beloep: 100000 },
        { alder: 73, beloep: 100000 },
        { alder: 74, beloep: 100000 },
      ])
    })

    it('beregner inntekt med gradert uttak, hel pensjon og sluttAlder', () => {
      const result = buildInntektSerie({
        uttaksalder: { aar: 70, maaneder: 0 },
        isEndring: false,
        gradertUttaksperiode: {
          grad: 50,
          uttaksalder: { aar: 67, maaneder: 0 },
          aarligInntektVsaPensjonBeloep: '250000',
        },
        aarligInntektFoerUttakBeloep: '300000',
        aarligInntektVsaHelPensjon: {
          beloep: '100000',
          sluttAlder: { aar: 75, maaneder: 0 },
        },
      })

      // Periode 1: 66 (inntekt før uttak)
      // Periode 2: 67-69 (inntekt ved gradert uttak)
      // Periode 3: 70-74 (inntekt ved hel pensjon)
      expect(result).toEqual([
        { alder: 66, beloep: 300000 },
        { alder: 67, beloep: 250000 },
        { alder: 68, beloep: 250000 },
        { alder: 69, beloep: 250000 },
        { alder: 70, beloep: 100000 },
        { alder: 71, beloep: 100000 },
        { alder: 72, beloep: 100000 },
        { alder: 73, beloep: 100000 },
        { alder: 74, beloep: 100000 },
      ])
    })

    it('håndterer uttaksalder med måneder forskjellig fra 0', () => {
      const result = buildInntektSerie({
        uttaksalder: { aar: 67, maaneder: 6 },
        isEndring: false,
        aarligInntektFoerUttakBeloep: '300000',
      })

      // Slutter ved 67 år 5 mnd (5/12 av året = 150000)
      expect(result).toEqual([
        { alder: 66, beloep: 300000 },
        { alder: 67, beloep: 150000 },
      ])
    })
  })

  describe('buildAfpSerie', () => {
    it('returnerer tom array når ingen AFP data', () => {
      const result = buildAfpSerie({
        uttaksalder: { aar: 67, maaneder: 0 },
        shouldShowAfpOffentlig: false,
      })

      expect(result).toEqual([])
    })

    it('beregner AFP privat livsvarig', () => {
      const result = buildAfpSerie({
        uttaksalder: { aar: 67, maaneder: 0 },
        shouldShowAfpOffentlig: false,
        afpPrivatListe: [
          {
            alder: 67,
            beloep: 20000,
            kompensasjonstillegg: 0,
            kronetillegg: 0,
            livsvarig: 20000,
          },
          {
            alder: 68,
            beloep: 80000,
            kompensasjonstillegg: 0,
            kronetillegg: 0,
            livsvarig: 80000,
          },
        ],
      })

      expect(result).toEqual([
        { alder: 67, beloep: 20000 },
        { alder: 68, beloep: 80000 },
        { alder: Infinity, beloep: 80000 },
      ])
    })

    it('beregner AFP offentlig med én periode (livsvarig)', () => {
      const result = buildAfpSerie({
        uttaksalder: { aar: 67, maaneder: 0 },
        shouldShowAfpOffentlig: true,
        afpOffentligListe: [{ alder: 67, beloep: 49059 }],
      })

      // Når startAlder er 0 måneder, returneres [startAlder, Infinity]
      expect(result).toEqual([
        { alder: 67, beloep: 49059 },
        { alder: Infinity, beloep: 49059 },
      ])
    })

    it('beregner AFP offentlig med to perioder', () => {
      const result = buildAfpSerie({
        uttaksalder: { aar: 67, maaneder: 0 },
        shouldShowAfpOffentlig: true,
        afpOffentligListe: [
          { alder: 67, beloep: 30000 },
          { alder: 68, beloep: 50000 },
        ],
      })

      expect(result).toEqual([
        { alder: 67, beloep: 30000 },
        { alder: Infinity, beloep: 50000 },
      ])
    })

    it('beregner pre2025 offentlig AFP uten SPK perioder', () => {
      const result = buildAfpSerie({
        uttaksalder: { aar: 62, maaneder: 0 },
        shouldShowAfpOffentlig: false,
        pre2025OffentligAfp: {
          alderAar: 62,
          totaltAfpBeloep: 5000,
        } as AfpEtterfulgtAvAlderspensjon,
      })

      // Fra 62 til 66 år 11 mnd = 62-66 (5 år)
      expect(result).toEqual([
        { alder: 62, beloep: 60000 }, // 5000 * 12
        { alder: 63, beloep: 60000 },
        { alder: 64, beloep: 60000 },
        { alder: 65, beloep: 60000 },
        { alder: 66, beloep: 60000 },
      ])
    })

    it('beregner pre2025 offentlig AFP med SPK perioder', () => {
      const result = buildAfpSerie({
        uttaksalder: { aar: 62, maaneder: 0 },
        shouldShowAfpOffentlig: false,
        pre2025OffentligAfp: {
          alderAar: 62,
          totaltAfpBeloep: 5000,
        } as AfpEtterfulgtAvAlderspensjon,
        afpPerioder: [
          {
            startAlder: { aar: 65, maaneder: 0 },
            sluttAlder: { aar: 67, maaneder: 0 },
            aarligUtbetaling: 30000,
            ytelsekode: 'AFP',
          },
        ],
      })

      // pre2025 AFP: 62-64 (fordi harSpkPerioder)
      // afpPerioder: 65-66 (fordi startAlder >= 65), plus 67 med 1 måned (sluttAlder 67 år 0 mnd)
      expect(result).toEqual([
        { alder: 62, beloep: 60000 },
        { alder: 63, beloep: 60000 },
        { alder: 64, beloep: 60000 },
        { alder: 65, beloep: 30000 },
        { alder: 66, beloep: 30000 },
        { alder: 67, beloep: 2500 }, // 1 måned (30000/12)
      ])
    })

    it('filtrerer ut afpPerioder før 65 år', () => {
      const result = buildAfpSerie({
        uttaksalder: { aar: 67, maaneder: 0 },
        shouldShowAfpOffentlig: false,
        afpPerioder: [
          {
            startAlder: { aar: 62, maaneder: 0 },
            sluttAlder: { aar: 65, maaneder: 0 },
            aarligUtbetaling: 20000,
            ytelsekode: 'AFP',
          },
          {
            startAlder: { aar: 65, maaneder: 0 },
            sluttAlder: { aar: 67, maaneder: 0 },
            aarligUtbetaling: 30000,
            ytelsekode: 'AFP',
          },
        ],
      })

      // Kun perioder fra 65 år inkluderes, inkludert 1 måned i år 67
      expect(result).toEqual([
        { alder: 65, beloep: 30000 },
        { alder: 66, beloep: 30000 },
        { alder: 67, beloep: 2500 }, // 1 måned (30000/12)
      ])
    })
  })

  describe('buildTpSerie', () => {
    it('returnerer tom array når ingen pensjonsavtaler', () => {
      const result = buildTpSerie({})

      expect(result).toEqual([])
    })

    it('beregner private pensjonsavtaler', () => {
      const result = buildTpSerie({
        pensjonsavtaler: [
          {
            produktbetegnelse: 'Test avtale',
            kategori: 'PRIVAT_TJENESTEPENSJON',
            startAar: 67,
            utbetalingsperioder: [
              {
                startAlder: { aar: 67, maaneder: 0 },
                sluttAlder: { aar: 77, maaneder: 0 },
                aarligUtbetaling: 50000,
                grad: 100,
              },
            ],
          },
        ],
      })

      // sluttAlder 77 år 0 mnd gir delvis utbetaling i siste år (1/12)
      expect(result).toEqual([
        { alder: 67, beloep: 50000 },
        { alder: 68, beloep: 50000 },
        { alder: 69, beloep: 50000 },
        { alder: 70, beloep: 50000 },
        { alder: 71, beloep: 50000 },
        { alder: 72, beloep: 50000 },
        { alder: 73, beloep: 50000 },
        { alder: 74, beloep: 50000 },
        { alder: 75, beloep: 50000 },
        { alder: 76, beloep: 50000 },
        { alder: 77, beloep: 4166.666666666666 }, // 1 måned (50000/12)
      ])
    })

    it('beregner offentlig tjenestepensjon', () => {
      const result = buildTpSerie({
        offentligTpUtbetalingsperioder: [
          {
            startAlder: { aar: 67, maaneder: 0 },
            sluttAlder: { aar: 70, maaneder: 0 },
            aarligUtbetaling: 30000,
          },
        ],
      })

      // sluttAlder 70 år 0 mnd gir delvis utbetaling i siste år (1/12)
      expect(result).toEqual([
        { alder: 67, beloep: 30000 },
        { alder: 68, beloep: 30000 },
        { alder: 69, beloep: 30000 },
        { alder: 70, beloep: 2500 }, // 30000 / 12 = 2500
      ])
    })

    it('merger private og offentlige pensjonsavtaler', () => {
      const result = buildTpSerie({
        pensjonsavtaler: [
          {
            produktbetegnelse: 'Test avtale',
            kategori: 'PRIVAT_TJENESTEPENSJON',
            startAar: 67,
            utbetalingsperioder: [
              {
                startAlder: { aar: 67, maaneder: 0 },
                sluttAlder: { aar: 70, maaneder: 0 },
                aarligUtbetaling: 20000,
                grad: 100,
              },
            ],
          },
        ],
        offentligTpUtbetalingsperioder: [
          {
            startAlder: { aar: 67, maaneder: 0 },
            sluttAlder: { aar: 70, maaneder: 0 },
            aarligUtbetaling: 30000,
          },
        ],
      })

      // Beløpene summeres for samme alder, begge har 1/12 i siste år
      expect(result).toEqual([
        { alder: 67, beloep: 50000 },
        { alder: 68, beloep: 50000 },
        { alder: 69, beloep: 50000 },
        { alder: 70, beloep: 4166.666666666666 }, // 1 måned (20000/12 + 30000/12)
      ])
    })

    it('håndterer livsvarig offentlig tjenestepensjon', () => {
      const result = buildTpSerie({
        offentligTpUtbetalingsperioder: [
          {
            startAlder: { aar: 67, maaneder: 0 },
            aarligUtbetaling: 30000,
          },
        ],
      })

      // Når ingen sluttAlder og startAlder er 0 måneder, returneres [startAlder, Infinity]
      expect(result).toEqual([
        { alder: 67, beloep: 30000 },
        { alder: Infinity, beloep: 30000 },
      ])
    })
  })

  describe('buildAlderspensjonSerie', () => {
    it('returnerer tom array når ingen alderspensjonListe', () => {
      const result = buildAlderspensjonSerie({})

      expect(result).toEqual([])
    })

    it('returnerer tom array når alderspensjonListe er tom', () => {
      const result = buildAlderspensjonSerie({ alderspensjonListe: [] })

      expect(result).toEqual([])
    })

    it('beregner alderspensjon med livsvarig utbetaling', () => {
      const result = buildAlderspensjonSerie({
        alderspensjonListe: [
          { alder: 67, beloep: 234518 },
          { alder: 68, beloep: 234722 },
          { alder: 69, beloep: 234756 },
        ],
      })

      expect(result).toEqual([
        { alder: 67, beloep: 234518 },
        { alder: 68, beloep: 234722 },
        { alder: 69, beloep: 234756 },
        { alder: Infinity, beloep: 234756 },
      ])
    })

    it('legger til Infinity med siste beløp', () => {
      const result = buildAlderspensjonSerie({
        alderspensjonListe: [{ alder: 70, beloep: 300000 }],
      })

      expect(result).toEqual([
        { alder: 70, beloep: 300000 },
        { alder: Infinity, beloep: 300000 },
      ])
    })
  })
})

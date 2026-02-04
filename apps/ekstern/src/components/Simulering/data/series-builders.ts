import { getAlderMinus1Maaned } from '@/utils/alder'
import { formatInntektToNumber } from '@/utils/inntekt'

import {
  type AarligUtbetaling,
  mergeAarligUtbetalinger,
  parseStartSluttUtbetaling,
} from './data'

export interface BuildInntektSerieParams {
  uttaksalder: Alder | null
  isEndring: boolean
  alderspensjonListe?: AlderspensjonPensjonsberegning[]
  gradertUttaksperiode?: GradertUttak | null
  aarligInntektFoerUttakBeloep: string
  aarligInntektVsaHelPensjon?: AarligInntektVsaPensjon
  pre2025OffentligAfp?: AfpEtterfulgtAvAlderspensjon
}

export const buildInntektSerie = (
  params: BuildInntektSerieParams
): AarligUtbetaling[] => {
  const {
    uttaksalder,
    isEndring,
    alderspensjonListe,
    gradertUttaksperiode,
    aarligInntektFoerUttakBeloep,
    aarligInntektVsaHelPensjon,
    pre2025OffentligAfp,
  } = params

  if (!uttaksalder) return []

  const pensjonStartAlder = isEndring
    ? {
        aar:
          alderspensjonListe && alderspensjonListe.length > 0
            ? alderspensjonListe[0].alder
            : uttaksalder.aar,
        maaneder: 0,
      }
    : gradertUttaksperiode?.uttaksalder || uttaksalder

  // Period 1: Income before withdrawal
  // Førstegangssøknad: starts 1 year before pension
  // Endring: starts from pension year
  // sluttAlder: ends just before the user's chosen uttaksalder (or gradual withdrawal start)
  const userChosenStartAlder = gradertUttaksperiode?.uttaksalder || uttaksalder

  const inntektFoerUttak = aarligInntektFoerUttakBeloep
    ? parseStartSluttUtbetaling({
        startAlder: {
          aar: isEndring ? pensjonStartAlder.aar : pensjonStartAlder.aar - 1,
          maaneder: 0,
        },
        sluttAlder:
          userChosenStartAlder.maaneder === 0
            ? {
                aar: userChosenStartAlder.aar - 1,
                maaneder: 11,
              }
            : {
                aar: userChosenStartAlder.aar,
                maaneder: userChosenStartAlder.maaneder - 1,
              },
        aarligUtbetaling: formatInntektToNumber(aarligInntektFoerUttakBeloep),
      })
    : []

  // Period 2: Income during gradual withdrawal (ends when full pension starts)
  const inntektVedGradertUttak =
    gradertUttaksperiode?.uttaksalder &&
    gradertUttaksperiode?.aarligInntektVsaPensjonBeloep
      ? parseStartSluttUtbetaling({
          startAlder: gradertUttaksperiode.uttaksalder,
          sluttAlder: pre2025OffentligAfp
            ? getAlderMinus1Maaned({ aar: 67, maaneder: 0 })
            : getAlderMinus1Maaned(uttaksalder),
          aarligUtbetaling: formatInntektToNumber(
            gradertUttaksperiode.aarligInntektVsaPensjonBeloep
          ),
        })
      : []

  // Period 3: Income during full pension (starts after gradual withdrawal ends, if any)
  const inntektVedHelPensjon = aarligInntektVsaHelPensjon?.beloep
    ? parseStartSluttUtbetaling({
        startAlder: uttaksalder,
        sluttAlder:
          aarligInntektVsaHelPensjon.sluttAlder.maaneder === 0
            ? {
                aar: aarligInntektVsaHelPensjon.sluttAlder.aar - 1,
                maaneder: 11,
              }
            : {
                aar: aarligInntektVsaHelPensjon.sluttAlder.aar,
                maaneder: aarligInntektVsaHelPensjon.sluttAlder.maaneder - 1,
              },
        aarligUtbetaling: formatInntektToNumber(
          aarligInntektVsaHelPensjon.beloep
        ),
      })
    : []

  return mergeAarligUtbetalinger([
    inntektFoerUttak,
    inntektVedGradertUttak,
    inntektVedHelPensjon,
  ])
}

export interface BuildAfpSerieParams {
  pre2025OffentligAfp?: AfpEtterfulgtAvAlderspensjon
  afpPerioder?: UtbetalingsperiodeFoer1963[]
  uttaksalder: Alder | null
  shouldShowAfpOffentlig: boolean
  afpOffentligListe?: AfpPensjonsberegning[]
  afpPrivatListe?: AfpPrivatPensjonsberegning[]
}

export const buildAfpSerie = (
  params: BuildAfpSerieParams
): AarligUtbetaling[] => {
  const {
    pre2025OffentligAfp,
    afpPerioder,
    uttaksalder,
    shouldShowAfpOffentlig,
    afpOffentligListe,
    afpPrivatListe,
  } = params

  const pre2025AfpData = (() => {
    if (pre2025OffentligAfp) {
      const harSpkPerioder = Boolean(afpPerioder?.length)
      if (harSpkPerioder) {
        return parseStartSluttUtbetaling({
          startAlder: uttaksalder!,
          sluttAlder: { aar: 64, maaneder: 11 },
          aarligUtbetaling: pre2025OffentligAfp.totaltAfpBeloep * 12,
        })
      }

      return parseStartSluttUtbetaling({
        startAlder: { aar: pre2025OffentligAfp.alderAar, maaneder: 0 },
        sluttAlder: { aar: 66, maaneder: 11 },
        aarligUtbetaling: pre2025OffentligAfp.totaltAfpBeloep * 12,
      })
    }

    if (
      shouldShowAfpOffentlig &&
      afpOffentligListe &&
      afpOffentligListe.length > 0
    ) {
      return afpOffentligListe.length === 1
        ? parseStartSluttUtbetaling({
            startAlder: {
              aar: afpOffentligListe[0].alder,
              maaneder: 0,
            },
            aarligUtbetaling: afpOffentligListe[0].beloep,
          })
        : [
            {
              alder: afpOffentligListe[0].alder,
              beloep: afpOffentligListe[0].beloep,
            },
            {
              alder: Infinity,
              beloep: afpOffentligListe[1].beloep,
            },
          ]
    }

    return []
  })()

  const afpPerioderData = afpPerioder
    ? afpPerioder.flatMap((periode) =>
        periode.startAlder.aar >= 65
          ? parseStartSluttUtbetaling({
              startAlder: periode.startAlder,
              sluttAlder: periode.sluttAlder
                ? periode.sluttAlder.maaneder === 0
                  ? {
                      aar: periode.sluttAlder.aar - 1,
                      maaneder: 11,
                    }
                  : {
                      aar: periode.sluttAlder.aar,
                      maaneder: periode.sluttAlder.maaneder - 1,
                    }
                : undefined,
              aarligUtbetaling: periode.aarligUtbetaling,
            })
          : []
      )
    : []

  const afpPrivatData = (() => {
    if (afpPrivatListe && afpPrivatListe.length > 0) {
      return [
        ...afpPrivatListe.map((it) => ({
          alder: it.alder,
          beloep: it.beloep,
        })),
        {
          alder: Infinity,
          beloep: afpPrivatListe[afpPrivatListe.length - 1].beloep,
        },
      ]
    }
    return []
  })()

  return mergeAarligUtbetalinger([
    pre2025AfpData,
    afpPerioderData,
    afpPrivatData,
  ])
}

export interface BuildTpSerieParams {
  pensjonsavtaler?: Pensjonsavtale[]
  offentligTpUtbetalingsperioder?: UtbetalingsperiodeOffentligTP[]
  uttaksalder?: Alder
}

export const buildTpSerie = (
  params: BuildTpSerieParams
): AarligUtbetaling[] => {
  const { pensjonsavtaler, offentligTpUtbetalingsperioder, uttaksalder } =
    params

  const privatTpParsed = (pensjonsavtaler ?? []).flatMap((avtale) =>
    avtale.utbetalingsperioder.map((periode) =>
      parseStartSluttUtbetaling({
        startAlder: periode.startAlder,
        sluttAlder: periode.sluttAlder,
        aarligUtbetaling: periode.aarligUtbetaling,
      })
    )
  )

  const offentligTpParsed = (offentligTpUtbetalingsperioder ?? []).map(
    (periode) =>
      parseStartSluttUtbetaling({
        startAlder: periode.startAlder,
        sluttAlder: periode.sluttAlder,
        aarligUtbetaling: periode.aarligUtbetaling,
      })
  )

  const allTpData = mergeAarligUtbetalinger([
    ...privatTpParsed,
    ...offentligTpParsed,
  ])

  // Filter to only show TP from year before uttaksalder onwards
  if (uttaksalder) {
    const minAlder = uttaksalder.aar - 1
    return allTpData.filter((item) => item.alder >= minAlder)
  }

  return allTpData
}

export interface BuildAlderspensjonSerieParams {
  alderspensjonListe?: AlderspensjonPensjonsberegning[]
}

export const buildAlderspensjonSerie = (
  params: BuildAlderspensjonSerieParams
): AarligUtbetaling[] => {
  const { alderspensjonListe } = params

  if (!alderspensjonListe || alderspensjonListe.length === 0) return []

  return [
    ...alderspensjonListe.map((it) => ({
      alder: it.alder,
      beloep: it.beloep,
    })),
    // Alderspensjon fra Nav er livsvarig
    {
      alder: Infinity,
      beloep: alderspensjonListe[alderspensjonListe.length - 1].beloep,
    },
  ]
}

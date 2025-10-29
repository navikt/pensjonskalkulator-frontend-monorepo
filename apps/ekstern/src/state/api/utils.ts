import { format, parse, parseISO } from 'date-fns'

import { DATE_BACKEND_FORMAT, DATE_ENDUSER_FORMAT } from '@/utils/dates'
import { formatInntektToNumber } from '@/utils/inntekt'
import { isLoependeVedtakEndring } from '@/utils/loependeVedtak'
import { checkHarSamboer } from '@/utils/sivilstand'

export const getSimuleringstypeFromRadioEllerVedtak = (
  loependeVedtak: LoependeVedtak,
  afp: AfpRadio | null,
  skalBeregneAfpKap19?: boolean | null,
  beregningsvalg?: Beregningsvalg | null
): AlderspensjonSimuleringstype => {
  const ufoeregrad = loependeVedtak.ufoeretrygd.grad

  if (isLoependeVedtakEndring(loependeVedtak)) {
    if (!ufoeregrad && (afp === 'ja_privat' || loependeVedtak.afpPrivat)) {
      return 'ENDRING_ALDERSPENSJON_MED_AFP_PRIVAT'
    } else if (
      !ufoeregrad &&
      (afp === 'ja_offentlig' || loependeVedtak.afpOffentlig)
    ) {
      return 'ENDRING_ALDERSPENSJON_MED_AFP_OFFENTLIG_LIVSVARIG'
    } else {
      return 'ENDRING_ALDERSPENSJON'
    }
  } else if (skalBeregneAfpKap19) {
    return 'PRE2025_OFFENTLIG_AFP_ETTERFULGT_AV_ALDERSPENSJON'
  } else {
    if (ufoeregrad && beregningsvalg !== 'med_afp') {
      return 'ALDERSPENSJON'
    } else if (!ufoeregrad && loependeVedtak.afpOffentlig) {
      return 'ENDRING_ALDERSPENSJON_MED_AFP_OFFENTLIG_LIVSVARIG'
    } else {
      switch (afp) {
        case 'ja_privat':
          return 'ALDERSPENSJON_MED_AFP_PRIVAT'
        case 'ja_offentlig':
          return 'ALDERSPENSJON_MED_AFP_OFFENTLIG_LIVSVARIG'
        default:
          return 'ALDERSPENSJON'
      }
    }
  }
}

export const transformUtenlandsperioderArray = (
  utenlandsperioder: Utenlandsperiode[]
) => {
  return utenlandsperioder.length > 0
    ? utenlandsperioder.map((utenlandsperiode) => ({
        landkode: utenlandsperiode.landkode,
        arbeidetUtenlands: !!utenlandsperiode.arbeidetUtenlands,
        fom: format(
          parse(utenlandsperiode.startdato, DATE_ENDUSER_FORMAT, new Date()),
          DATE_BACKEND_FORMAT
        ),
        tom: utenlandsperiode.sluttdato
          ? format(
              parse(
                utenlandsperiode.sluttdato,
                DATE_ENDUSER_FORMAT,
                new Date()
              ),
              DATE_BACKEND_FORMAT
            )
          : undefined,
      }))
    : []
}

export const generateTidligstMuligHeltUttakRequestBody = (args: {
  loependeVedtak: LoependeVedtak
  afp: AfpRadio | null
  sivilstand?: Sivilstand | null | undefined
  epsHarInntektOver2G: boolean | null
  epsHarPensjon: boolean | null
  aarligInntektFoerUttakBeloep: string
  aarligInntektVsaPensjon?: { beloep: string; sluttAlder: Alder }
  utenlandsperioder: Utenlandsperiode[]
}): TidligstMuligHeltUttakRequestBody => {
  const {
    loependeVedtak,
    afp,
    sivilstand,
    epsHarPensjon,
    epsHarInntektOver2G,
    aarligInntektFoerUttakBeloep,
    aarligInntektVsaPensjon,
    utenlandsperioder,
  } = args

  return {
    simuleringstype: getSimuleringstypeFromRadioEllerVedtak(
      loependeVedtak,
      afp
    ),
    epsHarInntektOver2G: epsHarInntektOver2G ?? checkHarSamboer(sivilstand),
    epsHarPensjon: !!epsHarPensjon,
    aarligInntektFoerUttakBeloep: formatInntektToNumber(
      aarligInntektFoerUttakBeloep
    ),
    sivilstand: sivilstand ?? 'UOPPGITT',
    aarligInntektVsaPensjon: aarligInntektVsaPensjon?.beloep
      ? {
          ...aarligInntektVsaPensjon,
          beloep: formatInntektToNumber(aarligInntektVsaPensjon.beloep),
        }
      : undefined,
    utenlandsperiodeListe: transformUtenlandsperioderArray(utenlandsperioder),
  }
}

export const generateAlderspensjonRequestBody = (args: {
  loependeVedtak: LoependeVedtak
  afp: AfpRadio | null
  skalBeregneAfpKap19?: boolean | null
  sivilstand?: Sivilstand | null | undefined
  epsHarInntektOver2G: boolean | null
  epsHarPensjon: boolean | null
  foedselsdato: string | null | undefined
  aarligInntektFoerUttakBeloep: string
  gradertUttak: GradertUttak | null
  heltUttak?: HeltUttak
  utenlandsperioder: Utenlandsperiode[]
  beregningsvalg?: Beregningsvalg | null
  afpInntektMaanedFoerUttak?: boolean | null
}): AlderspensjonRequestBody | undefined => {
  const {
    loependeVedtak,
    afp,
    skalBeregneAfpKap19,
    sivilstand,
    epsHarInntektOver2G,
    epsHarPensjon,
    foedselsdato,
    aarligInntektFoerUttakBeloep,
    gradertUttak,
    heltUttak,
    utenlandsperioder,
    beregningsvalg,
    afpInntektMaanedFoerUttak,
  } = args

  if (!foedselsdato || !heltUttak) {
    return undefined
  }

  return {
    simuleringstype: getSimuleringstypeFromRadioEllerVedtak(
      loependeVedtak,
      afp,
      skalBeregneAfpKap19,
      beregningsvalg
    ),
    foedselsdato: format(parseISO(foedselsdato), DATE_BACKEND_FORMAT),
    epsHarInntektOver2G: epsHarInntektOver2G ?? undefined,
    epsHarPensjon: epsHarPensjon ?? undefined,
    aarligInntektFoerUttakBeloep: formatInntektToNumber(
      aarligInntektFoerUttakBeloep
    ),
    sivilstand: sivilstand ?? 'UOPPGITT',
    gradertUttak: gradertUttak
      ? {
          ...gradertUttak,
          aarligInntektVsaPensjonBeloep: formatInntektToNumber(
            gradertUttak?.aarligInntektVsaPensjonBeloep
          ),
        }
      : undefined,
    heltUttak: {
      ...heltUttak,
      aarligInntektVsaPensjon: heltUttak.aarligInntektVsaPensjon
        ? {
            beloep: formatInntektToNumber(
              heltUttak.aarligInntektVsaPensjon?.beloep
            ),
            sluttAlder: heltUttak.aarligInntektVsaPensjon?.sluttAlder,
          }
        : undefined,
    },
    utenlandsperiodeListe: transformUtenlandsperioderArray(utenlandsperioder),
    afpInntektMaanedFoerUttak: afpInntektMaanedFoerUttak ?? undefined,
  }
}

export const generateAlderspensjonEnkelRequestBody = (args: {
  loependeVedtak: LoependeVedtak
  afp: AfpRadio | null
  sivilstand: Sivilstand
  epsHarInntektOver2G: boolean | null
  epsHarPensjon: boolean | null
  foedselsdato: string | null | undefined
  aarligInntektFoerUttakBeloep: string
  uttaksalder: Alder | null
  utenlandsperioder: Utenlandsperiode[]
}): AlderspensjonRequestBody | undefined => {
  const {
    loependeVedtak,
    afp,
    sivilstand,
    epsHarPensjon,
    epsHarInntektOver2G,
    foedselsdato,
    aarligInntektFoerUttakBeloep,
    uttaksalder,
    utenlandsperioder,
  } = args

  if (!foedselsdato || !uttaksalder) {
    return undefined
  }

  return {
    simuleringstype: getSimuleringstypeFromRadioEllerVedtak(
      loependeVedtak,
      afp
    ),
    foedselsdato: format(parseISO(foedselsdato), DATE_BACKEND_FORMAT),
    epsHarInntektOver2G: epsHarInntektOver2G ?? undefined,
    epsHarPensjon: epsHarPensjon ?? undefined,
    aarligInntektFoerUttakBeloep: formatInntektToNumber(
      aarligInntektFoerUttakBeloep
    ),
    sivilstand,
    heltUttak: {
      uttaksalder,
    },
    utenlandsperiodeListe: transformUtenlandsperioderArray(utenlandsperioder),
  }
}

export const generatePensjonsavtalerRequestBody = (args: {
  aarligInntektFoerUttakBeloep: string
  ufoeregrad: number
  afp: AfpRadio | null
  sivilstand?: Sivilstand
  epsHarInntektOver2G: boolean | null
  epsHarPensjon: boolean | null
  heltUttak: HeltUttak
  gradertUttak?: GradertUttak
  skalBeregneAfpKap19?: boolean | null
}): PensjonsavtalerRequestBody => {
  const {
    aarligInntektFoerUttakBeloep,
    ufoeregrad,
    afp,
    sivilstand,
    epsHarPensjon,
    epsHarInntektOver2G,
    heltUttak,
    gradertUttak,
    skalBeregneAfpKap19,
  } = args
  return {
    aarligInntektFoerUttakBeloep: formatInntektToNumber(
      aarligInntektFoerUttakBeloep
    ),
    uttaksperioder: [
      // * Case 1: User has chosen graded pension
      ...(gradertUttak
        ? [
            {
              startAlder: {
                aar: gradertUttak.uttaksalder.aar,
                maaneder:
                  gradertUttak.uttaksalder.maaneder > 0
                    ? gradertUttak.uttaksalder.maaneder
                    : 0,
              },
              grad: 100,
              aarligInntektVsaPensjon:
                gradertUttak.aarligInntektVsaPensjonBeloep
                  ? {
                      beloep: formatInntektToNumber(
                        gradertUttak.aarligInntektVsaPensjonBeloep
                      ),
                      sluttAlder: heltUttak.uttaksalder,
                    }
                  : undefined,
            },
          ]
        : []),

      // * Case 2: User has chosen full pension
      ...(!gradertUttak
        ? [
            {
              startAlder: {
                aar: skalBeregneAfpKap19
                  ? 67
                  : (heltUttak.uttaksalder.aar ?? 0),
                maaneder: skalBeregneAfpKap19
                  ? 0
                  : heltUttak.uttaksalder.maaneder > 0
                    ? heltUttak.uttaksalder.maaneder
                    : 0,
              },
              grad: 100,
              aarligInntektVsaPensjon: heltUttak.aarligInntektVsaPensjon
                ? {
                    beloep: formatInntektToNumber(
                      heltUttak.aarligInntektVsaPensjon.beloep
                    ),
                    sluttAlder: heltUttak.aarligInntektVsaPensjon.sluttAlder,
                  }
                : undefined,
            },
          ]
        : []),
    ],
    harAfp: !ufoeregrad && afp === 'ja_privat',
    epsHarInntektOver2G: epsHarInntektOver2G ?? checkHarSamboer(sivilstand),
    epsHarPensjon: !!epsHarPensjon,
    sivilstand,
  }
}

export const generateOffentligTpRequestBody = (args: {
  afp: AfpRadio | null
  foedselsdato: string | null | undefined
  sivilstand?: Sivilstand | null | undefined
  epsHarPensjon: boolean | null
  epsHarInntektOver2G: boolean | null
  aarligInntektFoerUttakBeloep: string
  gradertUttak?: GradertUttak
  heltUttak?: HeltUttak
  utenlandsperioder: Utenlandsperiode[]
  erApoteker?: boolean
}): OffentligTpRequestBody | undefined => {
  const {
    afp,
    foedselsdato,
    aarligInntektFoerUttakBeloep,
    sivilstand,
    epsHarPensjon,
    epsHarInntektOver2G,
    gradertUttak,
    heltUttak,
    utenlandsperioder,
    erApoteker,
  } = args

  if (!foedselsdato || !heltUttak) {
    return undefined
  }

  return {
    foedselsdato: format(parseISO(foedselsdato), DATE_BACKEND_FORMAT),
    gradertUttak: gradertUttak
      ? {
          uttaksalder: gradertUttak.uttaksalder,
          aarligInntektVsaPensjonBeloep: formatInntektToNumber(
            gradertUttak?.aarligInntektVsaPensjonBeloep
          ),
        }
      : undefined,
    heltUttak: {
      ...heltUttak,
      aarligInntektVsaPensjon: heltUttak.aarligInntektVsaPensjon
        ? {
            beloep: formatInntektToNumber(
              heltUttak.aarligInntektVsaPensjon?.beloep
            ),
            sluttAlder: heltUttak.aarligInntektVsaPensjon?.sluttAlder,
          }
        : undefined,
    },
    aarligInntektFoerUttakBeloep: formatInntektToNumber(
      aarligInntektFoerUttakBeloep
    ),
    utenlandsperiodeListe: transformUtenlandsperioderArray(utenlandsperioder),
    epsHarInntektOver2G: epsHarInntektOver2G ?? checkHarSamboer(sivilstand),
    epsHarPensjon: !!epsHarPensjon,
    brukerBaOmAfp: afp === 'ja_offentlig' || afp === 'ja_privat',
    erApoteker: erApoteker,
  }
}

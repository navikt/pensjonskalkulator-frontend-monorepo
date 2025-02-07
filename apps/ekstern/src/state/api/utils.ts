import { parse, format, parseISO } from 'date-fns'

import { DATE_BACKEND_FORMAT, DATE_ENDUSER_FORMAT } from '@/utils/dates'
import { formatInntektToNumber } from '@/utils/inntekt'
import { isLoependeVedtakEndring } from '@/utils/loependeVedtak'

export const getSimuleringstypeFromRadioEllerVedtak = (
  loependeVedtak: LoependeVedtak,
  afp: AfpRadio | null
): AlderspensjonSimuleringstype => {
  const isEndring = isLoependeVedtakEndring(loependeVedtak)

  if (isEndring) {
    if (
      !loependeVedtak.ufoeretrygd.grad &&
      (afp === 'ja_privat' || loependeVedtak.afpPrivat)
    ) {
      return 'ENDRING_ALDERSPENSJON_MED_AFP_PRIVAT'
    } else if (
      !loependeVedtak.ufoeretrygd.grad &&
      (afp === 'ja_offentlig' || loependeVedtak.afpOffentlig)
    ) {
      return 'ENDRING_ALDERSPENSJON_MED_AFP_OFFENTLIG_LIVSVARIG'
    } else {
      return 'ENDRING_ALDERSPENSJON'
    }
  } else {
    if (loependeVedtak.ufoeretrygd.grad) {
      return 'ALDERSPENSJON'
    } else if (
      !loependeVedtak.ufoeretrygd.grad &&
      loependeVedtak.afpOffentlig
    ) {
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
          parse(
            utenlandsperiode.startdato as string,
            DATE_ENDUSER_FORMAT,
            new Date()
          ),
          DATE_BACKEND_FORMAT
        ),
        tom: utenlandsperiode.sluttdato
          ? format(
              parse(
                utenlandsperiode.sluttdato as string,
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
    epsHarInntektOver2G: !!epsHarInntektOver2G,
    epsHarPensjon: !!epsHarPensjon,
    aarligInntektFoerUttakBeloep: formatInntektToNumber(
      aarligInntektFoerUttakBeloep
    ),
    sivilstand: sivilstand ?? 'UOPPGITT',
    aarligInntektVsaPensjon:
      aarligInntektVsaPensjon && aarligInntektVsaPensjon.beloep
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
  sivilstand?: Sivilstand | null | undefined
  epsHarInntektOver2G: boolean | null
  epsHarPensjon: boolean | null
  foedselsdato: string | null | undefined
  aarligInntektFoerUttakBeloep: string
  gradertUttak?: GradertUttak
  heltUttak?: HeltUttak
  utenlandsperioder: Utenlandsperiode[]
}): AlderspensjonRequestBody | undefined => {
  const {
    loependeVedtak,
    afp,
    sivilstand,
    epsHarInntektOver2G,
    epsHarPensjon,
    foedselsdato,
    aarligInntektFoerUttakBeloep,
    gradertUttak,
    heltUttak,
    utenlandsperioder,
  } = args

  if (!foedselsdato || !heltUttak) {
    return undefined
  }

  return {
    simuleringstype: getSimuleringstypeFromRadioEllerVedtak(
      loependeVedtak,
      afp
    ),
    foedselsdato: format(parseISO(foedselsdato), DATE_BACKEND_FORMAT),
    epsHarInntektOver2G: !!epsHarInntektOver2G,
    epsHarPensjon: !!epsHarPensjon,
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
  }
}

export const generateAlderspensjonEnkelRequestBody = (args: {
  loependeVedtak: LoependeVedtak
  afp: AfpRadio | null
  sivilstand: Sivilstand
  epsHarInntektOver2G: boolean | null
  epsHarPensjon: boolean | null // Støttes ikke i Pesys - defaultes til false
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
    epsHarInntektOver2G: !!epsHarInntektOver2G,
    epsHarPensjon: !!epsHarPensjon,
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
  } = args
  return {
    aarligInntektFoerUttakBeloep: formatInntektToNumber(
      aarligInntektFoerUttakBeloep
    ),
    uttaksperioder: [
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
              grad: gradertUttak.grad,
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

      {
        startAlder: {
          aar: heltUttak.uttaksalder.aar ?? 0,
          maaneder:
            heltUttak.uttaksalder.maaneder > 0
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
    ],
    harAfp: !ufoeregrad && afp === 'ja_privat',
    epsHarInntektOver2G: !!epsHarInntektOver2G,
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
}): OffentligTpRequestBody | undefined => {
  const {
    afp,
    foedselsdato,
    aarligInntektFoerUttakBeloep,
    epsHarPensjon,
    epsHarInntektOver2G,
    gradertUttak,
    heltUttak,
    utenlandsperioder,
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
    epsHarInntektOver2G: epsHarInntektOver2G ?? false,
    epsHarPensjon: epsHarPensjon ?? false,
    brukerBaOmAfp: afp === 'ja_offentlig' || afp === 'ja_privat',
  }
}

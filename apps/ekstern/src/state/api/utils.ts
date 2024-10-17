import { parse, format, parseISO } from 'date-fns'

import { DATE_BACKEND_FORMAT, DATE_ENDUSER_FORMAT } from '@/utils/dates'
import { formatInntektToNumber } from '@/utils/inntekt'
import { checkHarSamboer } from '@/utils/sivilstand'

export const getAfpSimuleringstypeFromRadio = (
  afp: AfpRadio | null
): AfpSimuleringstype => {
  switch (afp) {
    case 'ja_privat':
      return 'ALDERSPENSJON_MED_AFP_PRIVAT'
    case 'ja_offentlig':
      return 'ALDERSPENSJON_MED_AFP_OFFENTLIG_LIVSVARIG'
    default:
      return 'ALDERSPENSJON'
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
  afp: AfpRadio | null
  sivilstand?: Sivilstand | null | undefined
  harSamboer: boolean | null
  aarligInntektFoerUttakBeloep: string
  aarligInntektVsaPensjon?: { beloep: string; sluttAlder: Alder }
  utenlandsperioder: Utenlandsperiode[]
}): TidligstMuligHeltUttakRequestBody => {
  const {
    afp,
    sivilstand,
    harSamboer,
    aarligInntektFoerUttakBeloep,
    aarligInntektVsaPensjon,
    utenlandsperioder,
  } = args

  return {
    simuleringstype: getAfpSimuleringstypeFromRadio(afp),
    harEps: harSamboer !== null ? harSamboer : undefined,
    aarligInntektFoerUttakBeloep: formatInntektToNumber(
      aarligInntektFoerUttakBeloep
    ),
    sivilstand:
      sivilstand && checkHarSamboer(sivilstand)
        ? sivilstand
        : harSamboer
          ? 'SAMBOER'
          : 'UGIFT',
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
  harSamboer: boolean | null
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
    harSamboer,
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
    simuleringstype: loependeVedtak.ufoeretrygd.grad
      ? 'ALDERSPENSJON'
      : getAfpSimuleringstypeFromRadio(afp),
    foedselsdato: format(parseISO(foedselsdato), DATE_BACKEND_FORMAT),
    epsHarInntektOver2G: true, // Fast i MVP1 - Har ektefelle/partner/samboer inntekt over 2 ganger grunnbeløpet
    aarligInntektFoerUttakBeloep: formatInntektToNumber(
      aarligInntektFoerUttakBeloep
    ),
    sivilstand:
      sivilstand && checkHarSamboer(sivilstand)
        ? sivilstand
        : harSamboer
          ? 'SAMBOER'
          : 'UGIFT',
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
  ufoeregrad: number
  afp: AfpRadio | null
  sivilstand?: Sivilstand | null | undefined
  harSamboer: boolean | null
  foedselsdato: string | null | undefined
  aarligInntektFoerUttakBeloep: string
  uttaksalder: Alder | null
  utenlandsperioder: Utenlandsperiode[]
}): AlderspensjonRequestBody | undefined => {
  const {
    ufoeregrad,
    afp,
    sivilstand,
    harSamboer,
    foedselsdato,
    aarligInntektFoerUttakBeloep,
    uttaksalder,
    utenlandsperioder,
  } = args

  if (!foedselsdato || !uttaksalder) {
    return undefined
  }

  return {
    simuleringstype: ufoeregrad
      ? 'ALDERSPENSJON'
      : getAfpSimuleringstypeFromRadio(afp),
    foedselsdato: format(parseISO(foedselsdato), DATE_BACKEND_FORMAT),
    epsHarInntektOver2G: true, // Fast i MVP1 - Har ektefelle/partner/samboer inntekt over 2 ganger grunnbeløpet
    aarligInntektFoerUttakBeloep: formatInntektToNumber(
      aarligInntektFoerUttakBeloep
    ),
    sivilstand:
      sivilstand && checkHarSamboer(sivilstand)
        ? sivilstand
        : harSamboer
          ? 'SAMBOER'
          : 'UGIFT',
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
  heltUttak: HeltUttak
  gradertUttak?: GradertUttak
  utenlandsperioder: Utenlandsperiode[]
}): PensjonsavtalerRequestBody => {
  const {
    aarligInntektFoerUttakBeloep,
    ufoeregrad,
    afp,
    sivilstand,
    heltUttak,
    gradertUttak,
    utenlandsperioder,
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
    utenlandsperioder: transformUtenlandsperioderArray(utenlandsperioder),
    // harEpsPensjon: Bruker kan angi om E/P/S har pensjon (støttes i detaljert kalkulator) – her bruker backend hardkodet false i MVP
    // harEpsPensjonsgivendeInntektOver2G: Bruker kan angi om E/P/S har inntekt >2G (støttes i detaljert kalkulator) – her bruker backend true i MVP hvis samboer/gift
    sivilstand,
  }
}

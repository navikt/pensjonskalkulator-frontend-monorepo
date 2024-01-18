import { checkHarSamboer } from '@/utils/sivilstand'
import { format, parseISO } from 'date-fns'

// TODO skrive tester
export const generateTidligsteHelUttaksalderRequestBody = (args: {
  afp: AfpRadio | null
  sivilstand?: Sivilstand | null | undefined
  harSamboer: boolean | null
  aarligInntektFoerUttak: number
  gradertUttak?: Omit<GradertUttaksperiode, 'uttaksperiode'>
}): TidligsteUttaksalderRequestBody | undefined => {
  const { afp, sivilstand, harSamboer, aarligInntektFoerUttak, gradertUttak } =
    args

  return {
    simuleringstype:
      afp === 'ja_privat' ? 'ALDERSPENSJON_MED_AFP_PRIVAT' : 'ALDERSPENSJON',
    harEps: harSamboer !== null ? harSamboer : false, // TODO sjekke med Espen om det er riktig
    aarligInntekt: aarligInntektFoerUttak,
    sivilstand:
      sivilstand && checkHarSamboer(sivilstand)
        ? sivilstand
        : harSamboer
          ? 'SAMBOER'
          : 'UGIFT',
    gradertUttak,
  }
}

// TODO denne skal aktiveres ifbm tidligste uttaksalder for avansert fane
// export const generateTidligsteGradertUttaksalderRequestBody = (args: {
//   afp: AfpRadio | null
//   sivilstand?: Sivilstand | null | undefined
//   harSamboer: boolean | null
//   aarligInntektFoerUttak: number
//   gradertUttak: Omit<GradertUttaksperiode, 'uttaksperiode'>
// }): TidligsteUttaksalderRequestBody | undefined => {
//   const {
//     afp,
//     sivilstand,
//     harSamboer,
//     aarligInntektFoerUttak,
//     gradertUttak,
//   } = args

//   return {
//     simuleringstype:
//       afp === 'ja_privat' ? 'ALDERSPENSJON_MED_AFP_PRIVAT' : 'ALDERSPENSJON',
//     harEps: harSamboer !== null ? harSamboer : false, // TODO sjekke med Espen om det er riktig
//     aarligInntekt: aarligInntektFoerUttak,
//     sivilstand:
//       sivilstand && checkHarSamboer(sivilstand)
//         ? sivilstand
//         : harSamboer
//           ? 'SAMBOER'
//           : 'UGIFT',
//     gradertUttak,
//   }
// }

export const generateAlderspensjonRequestBody = (args: {
  afp: AfpRadio | null
  sivilstand?: Sivilstand | null | undefined
  harSamboer: boolean | null
  foedselsdato: string | null | undefined
  aarligInntektFoerUttak: number
  gradertUttak?: GradertUttaksperiode
  heltUttak?: HeltUttaksperiode
}): AlderspensjonRequestBody | undefined => {
  const {
    afp,
    sivilstand,
    harSamboer,
    foedselsdato,
    aarligInntektFoerUttak,
    gradertUttak,
    heltUttak,
  } = args

  if (!foedselsdato || !heltUttak) {
    return undefined
  }

  return {
    simuleringstype:
      afp === 'ja_privat' ? 'ALDERSPENSJON_MED_AFP_PRIVAT' : 'ALDERSPENSJON',
    foedselsdato: format(parseISO(foedselsdato), 'yyyy-MM-dd'),
    epsHarInntektOver2G: true, // Fast i MVP1 - Har ektefelle/partner/samboer inntekt over 2 ganger grunnbeløpet
    forventetInntekt: aarligInntektFoerUttak,
    sivilstand:
      sivilstand && checkHarSamboer(sivilstand)
        ? sivilstand
        : harSamboer
          ? 'SAMBOER'
          : 'UGIFT',
    gradertUttak,
    heltUttak: {
      ...heltUttak,
    },
  }
}

export const generateAlderspensjonEnkelRequestBody = (args: {
  afp: AfpRadio | null
  sivilstand?: Sivilstand | null | undefined
  harSamboer: boolean | null
  foedselsdato: string | null | undefined
  aarligInntektFoerUttak: number
  uttaksalder: Alder | null
}): AlderspensjonEnkelRequestBody | undefined => {
  const {
    afp,
    sivilstand,
    harSamboer,
    foedselsdato,
    aarligInntektFoerUttak,
    uttaksalder,
  } = args

  if (!foedselsdato || !uttaksalder) {
    return undefined
  }

  return {
    simuleringstype:
      afp === 'ja_privat' ? 'ALDERSPENSJON_MED_AFP_PRIVAT' : 'ALDERSPENSJON',

    uttaksgrad: 100, // Hardkodet til 100 - brukeren kan ikke velge gradert pensjon
    foersteUttaksalder: {
      ...uttaksalder,
    },
    foedselsdato: format(parseISO(foedselsdato), 'yyyy-MM-dd'),
    forventetInntekt: aarligInntektFoerUttak,
    epsHarInntektOver2G: true, // Fast i MVP1 - Har ektefelle/partner/samboer inntekt over 2 ganger grunnbeløpet
    sivilstand:
      sivilstand && checkHarSamboer(sivilstand)
        ? sivilstand
        : harSamboer
          ? 'SAMBOER'
          : 'UGIFT',
  }
}

export const generatePensjonsavtalerRequestBody = (args: {
  aarligInntektFoerUttak: number
  afp: AfpRadio | null
  sivilstand?: Sivilstand
  heltUttak: HeltUttaksperiode
  gradertUttak?: GradertUttaksperiode
}): PensjonsavtalerRequestBody => {
  const { aarligInntektFoerUttak, afp, sivilstand, heltUttak, gradertUttak } =
    args
  return {
    aarligInntektFoerUttak,
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
              aarligInntektVsaPensjon: gradertUttak.aarligInntekt
                ? {
                    beloep: gradertUttak.aarligInntekt,
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
        aarligInntektVsaPensjon: heltUttak.aarligInntektVsaPensjon,
      },
    ],
    harAfp: afp === 'ja_privat',
    // harEpsPensjon: Bruker kan angi om E/P/S har pensjon (støttes i detaljert kalkulator) – her bruker backend hardkodet false i MVP
    // harEpsPensjonsgivendeInntektOver2G: Bruker kan angi om E/P/S har inntekt >2G (støttes i detaljert kalkulator) – her bruker backend true i MVP hvis samboer/gift
    // antallAarIUtlandetEtter16: Bruker kan angi et antall (støttes i detaljert kalkulator) – her bruker backend hardkodet 0 i MVP
    sivilstand,
  }
}

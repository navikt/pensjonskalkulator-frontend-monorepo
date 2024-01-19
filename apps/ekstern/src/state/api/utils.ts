import { checkHarSamboer } from '@/utils/sivilstand'
import { format, parseISO } from 'date-fns'

export const generatePensjonsavtalerRequestBody = (
  aarligInntektFoerUttak: number,
  afp: AfpRadio | null,
  heltUttak: HeltUttaksperiode,
  sivilstand?: Sivilstand,
  gradertUttak?: GradertUttaksperiode
): PensjonsavtalerRequestBody => {
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
              aarligInntekt: gradertUttak.aarligInntektVsaPensjon
                ? gradertUttak.aarligInntektVsaPensjon
                : 0,
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
        aarligInntekt: heltUttak.aarligInntektVsaPensjon ?? 0,
      },
    ],
    antallInntektsaarEtterUttak: heltUttak.inntektTomAlder ? 0 : 0, // TODO PEK-247 legge til logikk for beregning av antall år etter uttak basert på heltUttak.inntektTomAlder
    harAfp: afp === 'ja_privat',
    // harEpsPensjon: Bruker kan angi om E/P/S har pensjon (støttes i detaljert kalkulator) – her bruker backend hardkodet false i MVP
    // harEpsPensjonsgivendeInntektOver2G: Bruker kan angi om E/P/S har inntekt >2G (støttes i detaljert kalkulator) – her bruker backend true i MVP hvis samboer/gift
    // antallAarIUtlandetEtter16: Bruker kan angi et antall (støttes i detaljert kalkulator) – her bruker backend hardkodet 0 i MVP
    sivilstand,
  }
}

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
    aarligInntektFoerUttakBeloep: aarligInntektFoerUttak,
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
}): AlderspensjonRequestBody | undefined => {
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
    foedselsdato: format(parseISO(foedselsdato), 'yyyy-MM-dd'),
    epsHarInntektOver2G: true, // Fast i MVP1 - Har ektefelle/partner/samboer inntekt over 2 ganger grunnbeløpet
    aarligInntektFoerUttakBeloep: aarligInntektFoerUttak,
    sivilstand:
      sivilstand && checkHarSamboer(sivilstand)
        ? sivilstand
        : harSamboer
          ? 'SAMBOER'
          : 'UGIFT',
    heltUttak: {
      uttaksalder,
      aarligInntektVsaPensjon: 0,
    },
  }
}

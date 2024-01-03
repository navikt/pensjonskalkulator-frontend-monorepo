import { checkHarSamboer } from '@/utils/sivilstand'
import { format, parseISO } from 'date-fns'

export const generatePensjonsavtalerRequestBody = (
  aarligInntektFoerUttak: number,
  afp: AfpRadio | null,
  uttaksalder: Alder | null,
  sivilstand?: Sivilstand
): PensjonsavtalerRequestBody => {
  return {
    aarligInntektFoerUttak,
    uttaksperioder: [
      {
        startAlder: {
          aar: uttaksalder?.aar ?? 0,
          maaneder:
            uttaksalder && uttaksalder.maaneder > 0 ? uttaksalder.maaneder : 0,
        },
        grad: 100, // Hardkodet til 100 for nå - brukeren kan ikke velge gradert pensjon
        aarligInntekt: 0, // Hardkodet til 0 for nå - brukeren kan ikke legge til inntekt vsa. pensjon
      },
    ],
    antallInntektsaarEtterUttak: 0,
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
  startAlder: number | null
  startMaaned: number | null
}): AlderspensjonRequestBody | undefined => {
  const {
    afp,
    sivilstand,
    harSamboer,
    foedselsdato,
    aarligInntektFoerUttak,
    startAlder,
    startMaaned,
  } = args

  if (!foedselsdato || !startAlder || startMaaned === null) {
    return undefined
  }

  return {
    simuleringstype:
      afp === 'ja_privat' ? 'ALDERSPENSJON_MED_AFP_PRIVAT' : 'ALDERSPENSJON',

    uttaksgrad: 100, // Hardkodet til 100 - brukeren kan ikke velge gradert pensjon
    foersteUttaksalder: {
      aar: startAlder,
      maaneder: startMaaned,
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

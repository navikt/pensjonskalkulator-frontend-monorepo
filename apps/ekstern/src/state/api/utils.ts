import {
  PensjonsavtalerRequestBody,
  AlderspensjonRequestBody,
} from '@/state/api/apiSlice.types'
import { checkHarSamboer } from '@/utils/sivilstand'

export const generatePensjonsavtalerRequestBody = (
  inntekt: number,
  afp: AfpRadio | null,
  uttaksalder: Alder,
  sivilstand?: Sivilstand
): PensjonsavtalerRequestBody => {
  return {
    aarligInntektFoerUttak: inntekt,
    uttaksperioder: [
      {
        startAlder: {
          aar: uttaksalder.aar,
          maaneder: uttaksalder.maaneder > 0 ? uttaksalder.maaneder : 0,
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

export const unformatUttaksalder = (alderChip: string): Alder => {
  const uttaksalder = alderChip.match(/[-+]?[0-9]*\.?[0-9]+/g)
  const aar = uttaksalder?.[0] ? parseInt(uttaksalder?.[0], 10) : 0
  const maaneder = uttaksalder?.[1] ? parseInt(uttaksalder?.[1], 10) : 0
  return { aar, maaneder }
}

export const generateAlderspensjonRequestBody = (args: {
  afp: AfpRadio | null
  sivilstand?: Sivilstand | null | undefined
  harSamboer: boolean | null
  foedselsdato: string | null | undefined
  inntekt?: Inntekt
  startAlder: number | null
  startMaaned: number | null
  uttaksgrad: number | null | undefined
}): AlderspensjonRequestBody | undefined => {
  const {
    afp,
    sivilstand,
    harSamboer,
    foedselsdato,
    inntekt,
    startAlder,
    startMaaned,
    uttaksgrad,
  } = args

  if (!foedselsdato || !startAlder || startMaaned === null || !uttaksgrad) {
    return undefined
  }

  return {
    simuleringstype:
      afp === 'ja_privat' ? 'ALDERSPENSJON_MED_AFP_PRIVAT' : 'ALDERSPENSJON',

    uttaksgrad,
    foersteUttaksalder: {
      aar: startAlder,
      maaneder: startMaaned,
    },
    foedselsdato,
    forventetInntekt: inntekt?.beloep, // hvis tomt, henter backend fra pensjonsopptjeningsregisteret POPP.
    epsHarInntektOver2G: true, // Fast i MVP1 - Har ektefelle/partner/samboer inntekt over 2 ganger grunnbeløpet
    sivilstand:
      sivilstand && checkHarSamboer(sivilstand)
        ? sivilstand
        : harSamboer
        ? 'SAMBOER'
        : 'UGIFT',
  }
}

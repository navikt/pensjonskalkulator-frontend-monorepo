import {
  PensjonsavtalerRequestBody,
  AlderspensjonRequestBody,
} from '@/state/api/apiSlice.types'
import { checkHarSamboer } from '@/utils/sivilstand'

export const generatePensjonsavtalerRequestBody = (
  uttaksalder: Omit<Uttaksalder, 'uttaksdato'>
): PensjonsavtalerRequestBody => {
  return {
    uttaksperioder: [
      {
        startAlder: uttaksalder.aar,
        startMaaned: uttaksalder.maaned > 0 ? uttaksalder.maaned : 0,
        grad: 100, // Hardkodet til 100 for nå - brukeren kan ikke velge gradert pensjon
        aarligInntekt: 0, // Hardkodet til 0 for nå - brukeren kan ikke legge til inntekt vsa. pensjon
      },
    ],
    antallInntektsaarEtterUttak: 0,
  }
}

export const unformatUttaksalder = (
  alderChip: string
): Omit<Uttaksalder, 'uttaksdato'> => {
  const uttaksalder = alderChip.match(/[-+]?[0-9]*\.?[0-9]+/g)
  const aar = uttaksalder?.[0] ? parseInt(uttaksalder?.[0], 10) : 0
  const maaned = uttaksalder?.[1] ? parseInt(uttaksalder?.[1], 10) : 0
  return { aar, maaned }
}

export const generateAlderspensjonRequestBody = (args: {
  afp: AfpRadio | null
  sivilstand?: Sivilstand | null | undefined
  harSamboer: boolean | null
  foedselsdato: string | null | undefined
  startAlder: number | null
  startMaaned: number | null
  uttaksgrad: number | null | undefined
}): AlderspensjonRequestBody | undefined => {
  const {
    afp,
    sivilstand,
    harSamboer,
    foedselsdato,
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
      maaned: startMaaned > 0 ? startMaaned : 0,
    },
    foedselsdato,
    sivilstand:
      sivilstand && checkHarSamboer(sivilstand)
        ? sivilstand
        : harSamboer
        ? 'SAMBOER'
        : 'UGIFT',
    epsHarInntektOver2G: true, // Fast i MVP1 - Har ektefelle/partner/samboer inntekt over 2 ganger grunnbeløpet
    // forventetInntekt?: number // Tomt i MVP1 - backend henter fra pensjonsopptjeningsregisteret POPP.
  }
}

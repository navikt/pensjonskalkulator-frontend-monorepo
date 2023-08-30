import { PensjonsavtalerRequestBody } from '@/state/api/apiSlice.types'

export const generatePensjonsavtalerRequestBody = (
  uttaksalder: Omit<Uttaksalder, 'uttaksdato'>
): PensjonsavtalerRequestBody => {
  return {
    uttaksperioder: [
      {
        startAlder: uttaksalder.aar,
        startMaaned:
          uttaksalder.maaned === 0
            ? uttaksalder.maaned + 1
            : uttaksalder.maaned,
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

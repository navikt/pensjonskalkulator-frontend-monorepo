export const finnAllePensjonsavtalerVedUttak = <
  T extends { startAlder: Alder; sluttAlder?: Alder },
>(
  utbetalingsperioder: T[],
  uttaksalder: Alder
) => {
  const utbetalingsperioderVedUttak = utbetalingsperioder.filter(
    (utbetalingsperiode) => {
      const { startAlder, sluttAlder } = utbetalingsperiode

      return (
        (uttaksalder.aar > startAlder.aar ||
          (uttaksalder.aar === startAlder.aar &&
            uttaksalder.maaneder >= startAlder.maaneder)) &&
        (!sluttAlder ||
          uttaksalder.aar < sluttAlder.aar ||
          (uttaksalder.aar === sluttAlder.aar &&
            uttaksalder.maaneder <= sluttAlder.maaneder))
      )
    }
  )
  return utbetalingsperioderVedUttak
}

export const hentSumPensjonsavtalerVedUttak = (
  pensjonsavtaler: Pensjonsavtale[],
  uttaksalder: Alder
) => {
  return finnAllePensjonsavtalerVedUttak(
    pensjonsavtaler.map((avtale) => avtale.utbetalingsperioder).flat(),
    uttaksalder
  )
    .flat()
    .reduce((acc, curr) => acc + Math.round(curr.aarligUtbetaling / 12), 0)
}

export const hentSumOffentligTjenestepensjonVedUttak = (
  simulertTjenestepensjon: SimulertTjenestepensjon,
  uttaksalder: Alder
) => {
  return finnAllePensjonsavtalerVedUttak(
    simulertTjenestepensjon?.simuleringsresultat.utbetalingsperioder.flat(),
    uttaksalder
  )
    .flat()
    .reduce((acc, curr) => acc + Math.round(curr.maanedligUtbetaling ?? 0), 0)
}

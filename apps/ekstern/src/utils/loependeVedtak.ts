export const isLoependeVedtakEndring = (loependeVedtak: LoependeVedtak) => {
  const { alderspensjon, ufoeretrygd } = loependeVedtak
  const har0AlderspensjonOg100Ufoeretrygd =
    alderspensjon?.grad === 0 && ufoeretrygd.grad === 100
  return !!alderspensjon && !har0AlderspensjonOg100Ufoeretrygd
}

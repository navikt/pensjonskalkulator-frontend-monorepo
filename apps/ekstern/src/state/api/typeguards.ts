export const isPensjonsberegning = (
  data?: unknown[]
): data is Pensjonsberegning[] => {
  return (
    Array.isArray(data) &&
    data.every(
      (beregning) =>
        typeof beregning.alder === 'number' &&
        typeof beregning.pensjonsaar === 'number' &&
        typeof beregning.pensjonsbeloep === 'number'
    )
  )
}

export const isTidligsteMuligeUttaksalder = (
  data?: any
): data is TidligsteMuligeUttaksalder => {
  return (
    typeof data === 'object' &&
    data !== null &&
    !Array.isArray(data) &&
    typeof data.aar === 'number' &&
    typeof data.maaned === 'number'
  )
}

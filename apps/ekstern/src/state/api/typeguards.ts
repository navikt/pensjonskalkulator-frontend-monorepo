export const isPensjonsberegning = (
  data?: any
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

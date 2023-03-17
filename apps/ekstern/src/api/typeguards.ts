export const isPensjonsberegning = (data?: any): data is Pensjonsberegning => {
  return (
    typeof data.alder === 'number' &&
    typeof data.pensjonsaar === 'number' &&
    typeof data.pensjonsbeloep === 'number'
  )
}

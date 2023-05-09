export const formatAsDecimal = (amount?: number | null): string => {
  if (amount === null || amount === undefined) return ''
  return Intl.NumberFormat('nb-NO', {
    style: 'decimal',
  }).format(amount)
}

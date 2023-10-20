export const formatWithoutDecimal = (amount?: number | null): string => {
  if (amount === null || amount === undefined) return ''
  return Intl.NumberFormat('nb-NO', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

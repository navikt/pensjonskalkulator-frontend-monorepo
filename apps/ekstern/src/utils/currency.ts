export const formatAsDecimal = (amount: number): string => {
  return Intl.NumberFormat('nb-NO', {
    style: 'decimal',
  }).format(amount)
}

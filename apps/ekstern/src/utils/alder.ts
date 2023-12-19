import { lastDayOfYear, isBefore, isSameDay } from 'date-fns'

export const isFoedtFoer1963 = (foedselsdato: string): boolean => {
  const LAST_DAY_1962 = lastDayOfYear(new Date(1962, 1, 1))
  return (
    isBefore(new Date(foedselsdato), LAST_DAY_1962) ||
    isSameDay(new Date(foedselsdato), LAST_DAY_1962)
  )
}

export const isFoedtFoer1964 = (foedselsdato: string): boolean => {
  const LAST_DAY_1963 = lastDayOfYear(new Date(1963, 1, 1))
  return (
    isBefore(new Date(foedselsdato), LAST_DAY_1963) ||
    isSameDay(new Date(foedselsdato), LAST_DAY_1963)
  )
}

import { isValid, parse } from 'date-fns'

export const DATE_BACKEND_FORMAT = 'yyyy-MM-dd'
export const DATE_ENDUSER_FORMAT = 'dd.MM.yyyy'

export const validateDateEndUserFormat = (
  d: string | null | undefined
): boolean => {
  if (!d) return false
  const date = parse(d, 'dd.MM.yyyy', new Date())
  return isValid(date)
}

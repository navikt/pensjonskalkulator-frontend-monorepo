import { endOfMonth, isBefore, isEqual, isValid, parse } from 'date-fns'

export const DATE_BACKEND_FORMAT = 'yyyy-MM-dd'
export const DATE_ENDUSER_FORMAT = 'dd.MM.yyyy'

export const validateDateEndUserFormat = (
  d: string | null | undefined
): boolean => {
  if (!d) return false
  const date = parse(d, 'dd.MM.yyyy', new Date())
  return isValid(date)
}

export const isVedtakBeforeNow = (vedtakDato: Date) => {
  return (
    isBefore(endOfMonth(vedtakDato), endOfMonth(new Date())) ||
    isEqual(endOfMonth(vedtakDato), endOfMonth(new Date()))
  )
}

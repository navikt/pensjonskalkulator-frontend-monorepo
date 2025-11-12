import { type RouteDefinition } from '../../base'
import { loadJSONMock } from '../mock'

type PersonMockOptions = {
  alder?: {
    aar: number
    maander?: number
    dager?: number
  }
  foedselsdato?: string
  sivilstand?: string
  navn?: string
  pensjoneringAldre?: Record<string, unknown>
}

const calculateFoedselsdato = (
  years: number = 0,
  months: number = 0,
  days: number = 0
): string => {
  const today = new Date()
  const birthDate = new Date(today)
  birthDate.setFullYear(today.getFullYear() - years)
  birthDate.setMonth(today.getMonth() - months)
  birthDate.setDate(today.getDate() - days)

  const year = birthDate.getFullYear()
  const month = String(birthDate.getMonth() + 1).padStart(2, '0')
  const day = String(birthDate.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export const person = async (
  options: PersonMockOptions = {}
): Promise<RouteDefinition> => {
  const personMock = (await loadJSONMock('person.json')) as Record<
    string,
    unknown
  >

  if (options.foedselsdato) {
    personMock.foedselsdato = options.foedselsdato
  } else if (options.alder) {
    personMock.foedselsdato = calculateFoedselsdato(
      options.alder.aar,
      options.alder.maander,
      options.alder.dager
    )
  }

  if (options.sivilstand) {
    personMock.sivilstand = options.sivilstand
  }

  if (options.navn) {
    personMock.navn = options.navn
  }

  if (options.pensjoneringAldre) {
    personMock.pensjoneringAldre = options.pensjoneringAldre
  }

  return {
    url: /\/pensjon\/kalkulator\/api\/v5\/person/,
    jsonResponse: personMock,
  }
}

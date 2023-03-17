import { Pensjonsberegning } from '../Pensjonsberegning'
import { isPensjonsberegning } from './typeguards'

export const fetchPensjonsberegning = (): Promise<Pensjonsberegning[]> => {
  return fetch('/pensjon/kalkulator/api/pensjonsberegning', {
    method: 'GET',
  })
    .then((response) => {
      if (response.ok) {
        return response.json()
      }
      throw new Error('Something went wrong')
    })
    .then((data) => {
      if (!data.some(isPensjonsberegning)) {
        throw new Error(`Mottok ugyldig pensjonsberegning fra backend: ${data}`)
      }
      return data
    })
}

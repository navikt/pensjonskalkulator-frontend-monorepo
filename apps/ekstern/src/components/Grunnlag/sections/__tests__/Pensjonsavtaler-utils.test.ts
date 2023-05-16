import { groupPensjonsavtalerByType } from '@/components/Grunnlag/sections/Pensjonsavtaler-utils'

const pensjonsavtaler: Pensjonsavtale[] = [
  {
    type: 'privat tjenestepensjon',
    fra: 'Nordea Liv',
    utbetalesFraAlder: 67,
    utbetalesTilAlder: 77,
    aarligUtbetaling: 231298,
  },
  {
    type: 'privat tjenestepensjon',
    fra: 'Storebrand',
    utbetalesFraAlder: 67,
    utbetalesTilAlder: 77,
    aarligUtbetaling: 39582,
  },
  {
    type: 'fripolise',
    fra: 'DNB',
    utbetalesFraAlder: 67,
    utbetalesTilAlder: 77,
    aarligUtbetaling: 37264,
  },
  {
    type: 'offentlig tjenestepensjon',
    fra: 'Oslo Pensjonsforsikring',
    utbetalesFraAlder: 67,
    aarligUtbetaling: 103264,
  },
  {
    type: 'egen sparing',
    fra: 'IPS',
    utbetalesFraAlder: 67,
    utbetalesTilAlder: 77,
    aarligUtbetaling: 241802,
  },
]

describe('groupPensjonsavtaler-utils', () => {
  describe('groupPensjonsavtalerByType', () => {
    it('grupperer pensjonsavtaler på avtaletype', () => {
      const grouped = groupPensjonsavtalerByType(pensjonsavtaler)

      expect(Object.keys(grouped)).toHaveLength(4)
      expect(grouped['privat tjenestepensjon']).toHaveLength(2)
      expect(grouped['offentlig tjenestepensjon']).toHaveLength(1)
      expect(grouped.fripolise).toHaveLength(1)
      expect(grouped['egen sparing']).toHaveLength(1)
    })
  })
})

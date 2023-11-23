import { describe, it } from 'vitest'

import { getNesteSide } from '../utils'
import { paths } from '@/router/constants'

describe('Step 4 - utils', () => {
  describe('getNesteSide', () => {
    it('returnerer path til uventet feil steget når harSamboer er null', () => {
      expect(getNesteSide(null)).toBe(paths.uventetFeil)
      expect(getNesteSide(null, false)).toBe(paths.uventetFeil)
    })
    it('returnerer path til uventet feil steget når inntekt har feilet', () => {
      expect(getNesteSide(false, true)).toBe(paths.uventetFeil)
      expect(getNesteSide(true, true)).toBe(paths.uventetFeil)
    })
    describe('gitt at henting av samboer og inntekt er vellykket', () => {
      it('returnerer path til sivilstand steget når brukeren ikke har samboer', () => {
        expect(getNesteSide(false)).toBe(paths.sivilstand)
        expect(getNesteSide(false, false)).toBe(paths.sivilstand)
      })
      it('returnerer path til beregning steget når brukeren har samboer', () => {
        expect(getNesteSide(true)).toBe(paths.beregning)
        expect(getNesteSide(true, false)).toBe(paths.beregning)
      })
    })
  })
})

import { describe, it } from 'vitest'

import { isUttaksalderOver62 } from '../utils'

describe('TidligstMuligUttaksalder-utils', () => {
  describe('isUttaksalderOver62', () => {
    it('returnerer false når alderen er 62 år, eller 62 år og 1 måned', () => {
      expect(
        isUttaksalderOver62({ aar: 62, maaneder: 1, uttaksdato: '2031-11-01' })
      ).toBeFalsy()
      expect(
        isUttaksalderOver62({ aar: 62, maaneder: 0, uttaksdato: '2031-11-01' })
      ).toBeFalsy()
    })

    it('returnerer true når alderen er over 62 år', () => {
      expect(
        isUttaksalderOver62({ aar: 62, maaneder: 2, uttaksdato: '2031-11-01' })
      ).toBeTruthy()
      expect(
        isUttaksalderOver62({ aar: 62, maaneder: 12, uttaksdato: '2031-11-01' })
      ).toBeTruthy()
      expect(
        isUttaksalderOver62({ aar: 63, maaneder: 1, uttaksdato: '2031-11-01' })
      ).toBeTruthy()
      expect(
        isUttaksalderOver62({ aar: 70, maaneder: 0, uttaksdato: '2031-11-01' })
      ).toBeTruthy()
    })
  })
})

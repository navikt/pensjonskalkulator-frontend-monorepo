import { describe, it } from 'vitest'

import { isUttaksalderOver62 } from '../utils'

describe('TidligstMuligUttaksalder-utils', () => {
  describe('isUttaksalderOver62', () => {
    it('returnerer false når alderen er lik eller under 62 år', () => {
      expect(isUttaksalderOver62({ aar: 61, maaneder: 11 })).toBeFalsy()
      expect(isUttaksalderOver62({ aar: 62, maaneder: 0 })).toBeFalsy()
    })

    it('returnerer true når alderen er over 62 år', () => {
      expect(isUttaksalderOver62({ aar: 62, maaneder: 1 })).toBeTruthy()

      expect(isUttaksalderOver62({ aar: 62, maaneder: 2 })).toBeTruthy()
      expect(isUttaksalderOver62({ aar: 63, maaneder: 0 })).toBeTruthy()
      expect(isUttaksalderOver62({ aar: 70, maaneder: 0 })).toBeTruthy()
    })
  })
})

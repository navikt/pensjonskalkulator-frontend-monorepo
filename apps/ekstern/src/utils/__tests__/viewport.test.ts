import { isViewPortMobile } from '@/utils/viewport'

describe('viewport-utils', () => {
  describe('isViewPortMobile', () => {
    it('returnerer true når viewport er mobil', () => {
      expect(isViewPortMobile(0)).toBeTruthy()
      expect(isViewPortMobile(400)).toBeTruthy()
      expect(isViewPortMobile(768)).toBeTruthy()
    })
    it('returnerer false når viewport er desktop', () => {
      expect(isViewPortMobile(769)).toBeFalsy()
      expect(isViewPortMobile(1000)).toBeFalsy()
    })
  })
})

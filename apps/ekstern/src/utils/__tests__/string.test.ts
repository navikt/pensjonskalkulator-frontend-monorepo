import { capitalize } from '@/utils/string'

describe('string-utils', () => {
  describe('capitalize', () => {
    it('capitalizes strings', () => {
      expect(capitalize('')).toEqual('')
      expect(capitalize('a')).toEqual('A')
      expect(capitalize('a123')).toEqual('A123')
      expect(capitalize('sephiroth')).toEqual('Sephiroth')
    })
  })
})

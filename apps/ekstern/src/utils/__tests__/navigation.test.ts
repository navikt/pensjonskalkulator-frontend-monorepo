import { redirect } from 'react-router'

import { skip } from '../navigation'

describe('navigation-utils', () => {
  describe('skip', () => {
    const stepArrays = ['step1', 'step2', 'step3', 'step4'] as const

    it('omdirigerer til neste step når man går fremover', () => {
      const currentPath = 'step2'
      const request = new Request('https://example.com/step2')

      const result = skip(stepArrays, currentPath, request)

      expect(result).toEqual(redirect('step3'))
    })

    it('omdirigerer til forrige step når man går bakover', () => {
      const currentPath = 'step3'
      const request = new Request('https://example.com/step3?back=true')

      const result = skip(stepArrays, currentPath, request)

      expect(result).toEqual(redirect('step2?back=true'))
    })

    it('omdirigerer til første step hvis gjeldende sti ikke er i step-arrayet', () => {
      const currentPath = 'unknown'
      const request = new Request('https://example.com/unknown')

      const result = skip(stepArrays, currentPath, request)

      expect(result).toEqual(redirect('step1'))
    })

    it('omdirigerer til første step hvis step-indeksen er utenfor rekkevidde', () => {
      const currentPath = 'step1'
      const request = new Request('https://example.com/step1?back=true')

      const result = skip(stepArrays, currentPath, request)

      expect(result).toEqual(redirect('step1'))
    })
  })
})

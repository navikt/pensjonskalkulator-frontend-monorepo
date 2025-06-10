import {
  stegvisningOrder,
  stegvisningOrderEndring,
  stegvisningOrderKap19,
} from '@/router/constants'

import { getStepArrays } from '../utils'

describe('getStepArrays', () => {
  it('skal returnere stegvisningOrderKap19 når isKap19 er true', () => {
    const resultat = getStepArrays(false, true)
    expect(resultat).toEqual(stegvisningOrderKap19)
  })

  it('skal returnere stegvisningOrderEndring når isKap19 er false og isEndring er true', () => {
    const resultat = getStepArrays(true, false)
    expect(resultat).toEqual(stegvisningOrderEndring)
  })

  it('skal returnere stegvisningOrder når både isKap19 og isEndring er false', () => {
    const resultat = getStepArrays(false, false)
    expect(resultat).toEqual(stegvisningOrder)
  })

  it('skal returnere stegvisningOrder når både isKap19 og isEndring er undefined', () => {
    const resultat = getStepArrays(undefined, undefined)
    expect(resultat).toEqual(stegvisningOrder)
  })

  it('skal prioritere isKap19 over isEndring når begge er true', () => {
    const resultat = getStepArrays(true, true)
    expect(resultat).toEqual(stegvisningOrderKap19)
  })
})

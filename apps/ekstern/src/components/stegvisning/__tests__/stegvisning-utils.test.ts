import { onStegvisningCancel, onStegvisningNext } from '../stegvisning-utils'
import { paths } from '@/router/constants'

describe('stegvisning - utils', () => {
  it('onStegvisningCancel', () => {
    const dispatchMock = vi.fn()
    const navigateMock = vi.fn()
    onStegvisningCancel(dispatchMock, navigateMock)
    expect(dispatchMock).toHaveBeenCalledWith({
      payload: undefined,
      type: 'userInputSlice/flush',
    })
    expect(navigateMock).toHaveBeenCalledWith(paths.login)
  })

  describe('onStegvisningNext', () => {
    it('kaller med riktig path fra start', () => {
      const navigateMock = vi.fn()
      onStegvisningNext(navigateMock, '/start')
      expect(navigateMock).toHaveBeenCalledWith(paths.sivilstand)
    })
    it('kaller med riktig path fra afp', () => {
      const navigateMock = vi.fn()
      onStegvisningNext(navigateMock, '/afp')
      expect(navigateMock).toHaveBeenCalledWith(paths.ufoeretrygdAFP)
    })
    it('kaller med riktig path fra samtykke', () => {
      const navigateMock = vi.fn()
      onStegvisningNext(navigateMock, '/samtykke')
      expect(navigateMock).toHaveBeenCalledWith(paths.beregningEnkel)
    })
  })
})

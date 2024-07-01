import { Provider } from 'react-redux'
import * as ReactRouterUtils from 'react-router'

import { setupStore } from '../../../state/store'
import { useStegvisningNavigation } from '../stegvisning-hooks'
import { paths } from '@/router/constants'
import * as userInputReducerUtils from '@/state/userInput/userInputReducer'
import { renderHook } from '@/test-utils'

describe('stegvisning - hooks', () => {
  it('useStegvisningNavigation - navigerer riktig fremover, bakover og ved kansellering', () => {
    const flushMock = vi.spyOn(userInputReducerUtils.userInputActions, 'flush')
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )

    const wrapper = ({ children }: { children: React.ReactNode }) => {
      const storeRef = setupStore(undefined, true)
      return <Provider store={storeRef}>{children}</Provider>
    }

    const { result } = renderHook(useStegvisningNavigation, {
      wrapper,
      initialProps: paths.start,
    })

    // onStegvisningNext
    result.current[0].onStegvisningNext()
    expect(navigateMock).toHaveBeenCalledWith(paths.sivilstand)

    // onStegvisningPrevious
    result.current[0].onStegvisningPrevious()
    expect(navigateMock).toHaveBeenCalledWith(-1)

    // onStegvisningCancel
    result.current[0].onStegvisningCancel()
    expect(navigateMock).toHaveBeenCalledWith(paths.login)
    expect(flushMock).toHaveBeenCalled()
  })
})

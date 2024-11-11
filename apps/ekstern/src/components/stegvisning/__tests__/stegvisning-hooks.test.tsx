import { Provider } from 'react-redux'
import * as ReactRouterUtils from 'react-router'

import { RootState, setupStore } from '../../../state/store'
import { useStegvisningNavigation } from '../stegvisning-hooks'
import {
  fulfilledGetLoependeVedtak0Ufoeregrad,
  fulfilledGetLoependeVedtakLoepende50Alderspensjon,
} from '@/mocks/mockedRTKQueryApiCalls'
import { paths } from '@/router/constants'
import { userInputInitialState } from '@/state/userInput/userInputReducer'
import * as userInputReducerUtils from '@/state/userInput/userInputReducer'
import { renderHook } from '@/test-utils'

describe('stegvisning - hooks', () => {
  describe('useStegvisningNavigation', () => {
    describe('Gitt at brukeren ikke har noe vedtak om alderspensjon eller AFP', () => {
      it('navigerer riktig fremover, bakover og ved kansellering', () => {
        const flushMock = vi.spyOn(
          userInputReducerUtils.userInputActions,
          'flush'
        )
        const navigateMock = vi.fn()
        vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
          () => navigateMock
        )

        const mockedState = {
          api: {
            // @ts-ignore
            queries: {
              ...fulfilledGetLoependeVedtak0Ufoeregrad,
            },
          },
          userInput: { ...userInputInitialState },
        }

        const wrapper = ({ children }: { children: React.ReactNode }) => {
          const storeRef = setupStore(mockedState as unknown as RootState, true)
          return <Provider store={storeRef}>{children}</Provider>
        }

        const { result } = renderHook(useStegvisningNavigation, {
          wrapper,
          initialProps: paths.start,
        })

        // onStegvisningNext
        if (result.current[0].onStegvisningNext) {
          result.current[0].onStegvisningNext()
        }
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

    describe('Gitt at brukeren har et vedtak om alderspensjon eller AFP', () => {
      it('navigerer riktig fremover, bakover og ved kansellering', () => {
        const flushMock = vi.spyOn(
          userInputReducerUtils.userInputActions,
          'flush'
        )
        const navigateMock = vi.fn()
        vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
          () => navigateMock
        )

        const mockedState = {
          api: {
            // @ts-ignore
            queries: {
              ...fulfilledGetLoependeVedtakLoepende50Alderspensjon,
            },
          },
          userInput: { ...userInputInitialState },
        }

        const wrapper = ({ children }: { children: React.ReactNode }) => {
          const storeRef = setupStore(mockedState as unknown as RootState, true)
          return <Provider store={storeRef}>{children}</Provider>
        }

        const { result } = renderHook(useStegvisningNavigation, {
          wrapper,
          initialProps: paths.start,
        })

        // onStegvisningNext
        if (result.current[0].onStegvisningNext) {
          result.current[0].onStegvisningNext()
        }
        expect(navigateMock).toHaveBeenCalledWith(paths.afp)

        // onStegvisningPrevious
        result.current[0].onStegvisningPrevious()
        expect(navigateMock).toHaveBeenCalledWith(-1)

        // onStegvisningCancel
        result.current[0].onStegvisningCancel()
        expect(navigateMock).toHaveBeenCalledWith(paths.login)
        expect(flushMock).toHaveBeenCalled()
      })
    })
  })
})

import { Provider } from 'react-redux'
import * as ReactRouterUtils from 'react-router'

import { RootState, setupStore } from '../../../state/store'
import { useStegvisningNavigation } from '../stegvisning-hooks'
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
            /* eslint-disable @typescript-eslint/ban-ts-comment */
            // @ts-ignore
            queries: {
              ['getLoependeVedtak(undefined)']: {
                status: 'fulfilled',
                endpointName: 'getLoependeVedtak',
                requestId: 't1wLPiRKrfe_vchftk8s8',
                data: {
                  alderspensjon: {
                    grad: 50,
                  },
                  ufoeretrygd: {
                    grad: 0,
                  },
                  afpPrivat: {
                    grad: 0,
                  },
                  afpOffentlig: {
                    grad: 0,
                  },
                },
                startedTimeStamp: 1714725797072,
                fulfilledTimeStamp: 1714725797669,
              },
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
        result.current[0].onStegvisningNext()
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

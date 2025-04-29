import { Provider } from 'react-redux'

import {
  fulfilledGetLoependeVedtak0Ufoeregrad,
  fulfilledGetLoependeVedtak75Ufoeregrad,
  fulfilledGetLoependeVedtak100Ufoeregrad,
  fulfilledGetLoependeVedtakLoepende50Alderspensjon,
  fulfilledGetLoependeVedtakLoependeAlderspensjon,
  fulfilledGetLoependeVedtakLoependeAlderspensjonOg40Ufoeretrygd,
  fulfilledGetPerson,
  fulfilledGetPersonEldreEnnAfpUfoereOppsigelsesalder,
  fulfilledGetPersonYngreEnnAfpUfoereOppsigelsesalder,
} from '@/mocks/mockedRTKQueryApiCalls'
import { paths } from '@/router/constants'
import { userInputInitialState } from '@/state/userInput/userInputSlice'
import * as userInputReducerUtils from '@/state/userInput/userInputSlice'
import { renderHook } from '@/test-utils'

import { RootState, setupStore } from '../../../state/store'
import { useStegvisningNavigation } from '../stegvisning-hooks'

const navigateMock = vi.fn()
vi.mock(import('react-router'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

describe('stegvisning - hooks', () => {
  describe('useStegvisningNavigation', () => {
    describe('Gitt at brukeren ikke har noe vedtak om alderspensjon eller AFP', () => {
      afterEach(() => {
        vi.resetAllMocks()
      })

      it('navigerer riktig fremover, bakover og ved kansellering.', () => {
        const flushMock = vi.spyOn(
          userInputReducerUtils.userInputActions,
          'flush'
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
        expect(navigateMock).toHaveBeenCalledWith(paths.login)

        // onStegvisningCancel
        result.current[0].onStegvisningCancel()
        expect(navigateMock).toHaveBeenCalledWith(paths.login)
        expect(flushMock).toHaveBeenCalled()
      })

      describe('Gitt at brukeren har 100 % uføretrygd', () => {
        const apiMock = {
          // @ts-ignore
          queries: {
            ...fulfilledGetLoependeVedtak100Ufoeregrad,
            ...fulfilledGetPerson,
          },
        }

        it('Når brukeren navigerer tilbake fra samtykke steget, er hen sendt tilbake til utenlandsopphold steget.', () => {
          const wrapper = ({ children }: { children: React.ReactNode }) => {
            const storeRef = setupStore(
              {
                // @ts-ignore
                api: {
                  ...apiMock,
                },
                userInput: { ...userInputInitialState },
              },
              true
            )
            return <Provider store={storeRef}>{children}</Provider>
          }

          const { result } = renderHook(useStegvisningNavigation, {
            wrapper,
            initialProps: paths.samtykke,
          })

          result.current[0].onStegvisningPrevious()
          expect(navigateMock).toHaveBeenCalledWith(paths.utenlandsopphold)
        })
      })

      describe('Gitt at brukeren har gradert uføretrygd og er eldre enn AFP-Uføre oppsigelsesalder,', () => {
        const apiMock = {
          // @ts-ignore
          queries: {
            ...fulfilledGetLoependeVedtak75Ufoeregrad,
            ...fulfilledGetPersonEldreEnnAfpUfoereOppsigelsesalder,
          },
        }

        it('Når brukeren navigerer tilbake fra samtykke steget, er hen sendt tilbake til utenlandsopphold steget.', () => {
          const wrapper = ({ children }: { children: React.ReactNode }) => {
            const storeRef = setupStore(
              {
                // @ts-ignore
                api: {
                  ...apiMock,
                },
                userInput: { ...userInputInitialState },
              },
              true
            )
            return <Provider store={storeRef}>{children}</Provider>
          }

          const { result } = renderHook(useStegvisningNavigation, {
            wrapper,
            initialProps: paths.samtykke,
          })

          // onStegvisningPrevious
          result.current[0].onStegvisningPrevious()
          expect(navigateMock).toHaveBeenCalledWith(paths.utenlandsopphold)
        })
      })

      describe('Gitt at brukeren har gradert uføretrygd og er yngre enn AFP-Uføre oppsigelsesalder,', () => {
        const apiMock = {
          // @ts-ignore
          queries: {
            ...fulfilledGetLoependeVedtak75Ufoeregrad,
            ...fulfilledGetPersonYngreEnnAfpUfoereOppsigelsesalder,
          },
        }

        it('Når brukeren har svart "nei" på AFP steget og navigerer tilbake fra samtykke steget, er hen sendt tilbake til afp steget.', () => {
          const wrapper = ({ children }: { children: React.ReactNode }) => {
            const storeRef = setupStore(
              {
                // @ts-ignore
                api: {
                  ...apiMock,
                },
                userInput: { ...userInputInitialState, afp: 'nei' },
              },
              true
            )
            return <Provider store={storeRef}>{children}</Provider>
          }

          const { result } = renderHook(useStegvisningNavigation, {
            wrapper,
            initialProps: paths.samtykke,
          })

          // onStegvisningPrevious
          result.current[0].onStegvisningPrevious()
          expect(navigateMock).toHaveBeenCalledWith(paths.afp)
        })

        it('Når brukeren har svart ja på AFP-steget og navigerer tilbake fra samtykke steget, er hen sendt tilbake til ufoeretrygdAFP steget.', () => {
          const wrapper = ({ children }: { children: React.ReactNode }) => {
            const storeRef = setupStore(
              {
                // @ts-ignore
                api: {
                  ...apiMock,
                },
                userInput: { ...userInputInitialState, afp: 'ja_offentlig' },
              },
              true
            )
            return <Provider store={storeRef}>{children}</Provider>
          }

          const { result } = renderHook(useStegvisningNavigation, {
            wrapper,
            initialProps: paths.samtykke,
          })

          // onStegvisningPrevious
          result.current[0].onStegvisningPrevious()
          expect(navigateMock).toHaveBeenCalledWith(paths.ufoeretrygdAFP)
        })

        it('Når brukeren navigerer tilbake fra ufoeretrygdAFP steget, er hen sendt tilbake til afp steget.', () => {
          const wrapper = ({ children }: { children: React.ReactNode }) => {
            const storeRef = setupStore(
              {
                // @ts-ignore
                api: {
                  ...apiMock,
                },
                userInput: { ...userInputInitialState, afp: 'ja_offentlig' },
              },
              true
            )
            return <Provider store={storeRef}>{children}</Provider>
          }

          const { result } = renderHook(useStegvisningNavigation, {
            wrapper,
            initialProps: paths.ufoeretrygdAFP,
          })

          // onStegvisningPrevious
          result.current[0].onStegvisningPrevious()
          expect(navigateMock).toHaveBeenCalledWith(paths.afp)
        })
      })

      describe('Gitt at brukeren ikke har uføretrygd og har svart noe annet enn "ja_offentlig" på AFP steget,', () => {
        const apiMock = {
          // @ts-ignore
          queries: {
            ...fulfilledGetLoependeVedtak0Ufoeregrad,
            ...fulfilledGetPerson,
          },
        }

        it('Når brukeren navigerer tilbake fra samtykke steget, er hen sendt tilbake til afp steget.', () => {
          const wrapper = ({ children }: { children: React.ReactNode }) => {
            const storeRef = setupStore(
              {
                // @ts-ignore
                api: {
                  ...apiMock,
                },
                userInput: { ...userInputInitialState, afp: 'ja_privat' },
              },
              true
            )
            return <Provider store={storeRef}>{children}</Provider>
          }

          const { result } = renderHook(useStegvisningNavigation, {
            wrapper,
            initialProps: paths.samtykke,
          })

          // onStegvisningPrevious
          result.current[0].onStegvisningPrevious()
          expect(navigateMock).toHaveBeenCalledWith(paths.afp)
        })
      })
    })

    describe('Gitt at brukeren har et vedtak om alderspensjon eller AFP', () => {
      afterEach(() => {
        vi.resetAllMocks()
      })

      // Andre case oppstår:
      // brukere med uføretrygd eldre enn AFP-Uføre oppsigelsesalder får ikke AFP steg og går da direkte til beregning (ingen tilbakeknapp der)
      // brukere med AFP vedtak får ikke AFP steg og går da direkte til beregning (ingen tilbakeknapp der)

      it('navigerer riktig fremover, bakover og ved kansellering.', () => {
        const flushMock = vi.spyOn(
          userInputReducerUtils.userInputActions,
          'flush'
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
        expect(navigateMock).toHaveBeenCalledWith(paths.login)

        // onStegvisningCancel
        result.current[0].onStegvisningCancel()
        expect(navigateMock).toHaveBeenCalledWith(paths.login)
        expect(flushMock).toHaveBeenCalled()
      })

      describe('Gitt at brukeren har uføretrygd og er yngre enn AFP-Uføre oppsigelsesalder,', () => {
        const apiMock = {
          // @ts-ignore
          queries: {
            ...fulfilledGetLoependeVedtakLoependeAlderspensjonOg40Ufoeretrygd,
            ...fulfilledGetPersonYngreEnnAfpUfoereOppsigelsesalder,
          },
        }

        it('Når brukeren navigerer tilbake fra ufoeretrygdAFP steget, er hen sendt tilbake til afp steget.', () => {
          const wrapper = ({ children }: { children: React.ReactNode }) => {
            const storeRef = setupStore(
              {
                // @ts-ignore
                api: {
                  ...apiMock,
                },
                userInput: { ...userInputInitialState, afp: 'ja_offentlig' },
              },
              true
            )
            return <Provider store={storeRef}>{children}</Provider>
          }

          const { result } = renderHook(useStegvisningNavigation, {
            wrapper,
            initialProps: paths.ufoeretrygdAFP,
          })

          // onStegvisningPrevious
          result.current[0].onStegvisningPrevious()
          expect(navigateMock).toHaveBeenCalledWith(paths.afp)
        })
      })

      describe('Gitt at brukeren ikke har uføretrygd,', () => {
        const apiMock = {
          // @ts-ignore
          queries: {
            ...fulfilledGetLoependeVedtakLoependeAlderspensjon,
            ...fulfilledGetPerson,
          },
        }

        it('Når brukeren har svart "ja_offentlig" og navigerer tilbake fra samtykkeOffentligAFP, er hen sendt tilbake til afp steget.', () => {
          const wrapper = ({ children }: { children: React.ReactNode }) => {
            const storeRef = setupStore(
              {
                // @ts-ignore
                api: {
                  ...apiMock,
                },
                userInput: { ...userInputInitialState, afp: 'ja_offentlig' },
              },
              true
            )
            return <Provider store={storeRef}>{children}</Provider>
          }

          const { result } = renderHook(useStegvisningNavigation, {
            wrapper,
            initialProps: paths.samtykkeOffentligAFP,
          })

          // onStegvisningPrevious
          result.current[0].onStegvisningPrevious()
          expect(navigateMock).toHaveBeenCalledWith(paths.afp)
        })
      })
    })
  })
})

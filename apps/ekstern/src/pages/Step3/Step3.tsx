import React from 'react'
import { useIntl } from 'react-intl'
import { useNavigate, Await } from 'react-router-dom'

import { Loader } from '@/components/common/Loader'
import { AFP } from '@/components/stegvisning/AFP'
import { paths } from '@/router/constants'
import { useStep3AccessData } from '@/router/loaders'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import { selectAfp, selectIsVeileder } from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputReducer'

export function Step3() {
  const intl = useIntl()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const loaderData = useStep3AccessData()

  const previousAfp = useAppSelector(selectAfp)

  const isVeileder = useAppSelector(selectIsVeileder)

  React.useEffect(() => {
    document.title = intl.formatMessage({
      id: 'application.title.stegvisning.step3',
    })
  }, [])

  // Fjern mulighet for avbryt hvis person er veileder
  const onCancel = isVeileder
    ? undefined
    : (): void => {
        dispatch(userInputActions.flush())
        navigate(paths.login)
      }

  const onPrevious = (): void => {
    return navigate(paths.utenlandsopphold)
  }

  const onNext = (afpData: AfpRadio): void => {
    dispatch(userInputActions.setAfp(afpData))
    navigate(paths.ufoeretrygdAFP)
  }

  return (
    <React.Suspense
      fallback={
        <div style={{ width: '100%' }}>
          <Loader
            data-testid="step3-loader"
            size="3xlarge"
            title={intl.formatMessage({ id: 'pageframework.loading' })}
            isCentered
          />
        </div>
      }
    >
      <Await resolve={loaderData.shouldRedirectTo}>
        {(shouldRedirectTo: string) => {
          return (
            <AFP
              shouldRedirectTo={shouldRedirectTo}
              afp={previousAfp}
              onCancel={onCancel}
              onPrevious={onPrevious}
              onNext={onNext}
            />
          )
        }}
      </Await>
    </React.Suspense>
  )
}

import React from 'react'
import { useIntl } from 'react-intl'
import { useNavigate, Await } from 'react-router-dom'

import { Loader } from '@/components/common/Loader'
import { AFP } from '@/components/stegvisning/AFP'
import {
  onStegvisningCancel,
  onStegvisningNext,
} from '@/components/stegvisning/stegvisning-utils'
import { paths } from '@/router/constants'
import { useStepAFPAccessData } from '@/router/loaders'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import { selectAfp, selectIsVeileder } from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputReducer'

export function StepAFP() {
  const intl = useIntl()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const loaderData = useStepAFPAccessData()
  const previousAfp = useAppSelector(selectAfp)
  const isVeileder = useAppSelector(selectIsVeileder)

  React.useEffect(() => {
    document.title = intl.formatMessage({
      id: 'application.title.stegvisning.afp',
    })
  }, [])

  const onNext = (afpData: AfpRadio): void => {
    dispatch(userInputActions.setAfp(afpData))
    onStegvisningNext(navigate, paths.afp)
  }

  const onPrevious = () => {
    navigate(-1)
  }

  const onCancel = () => {
    onStegvisningCancel(dispatch, navigate)
  }

  return (
    <React.Suspense
      fallback={
        <div style={{ width: '100%' }}>
          <Loader
            data-testid="afp-loader"
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
              onCancel={isVeileder ? undefined : onCancel}
              onPrevious={onPrevious}
              onNext={onNext}
            />
          )
        }}
      </Await>
    </React.Suspense>
  )
}

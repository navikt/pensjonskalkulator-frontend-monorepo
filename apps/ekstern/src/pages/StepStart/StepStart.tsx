import React from 'react'
import { useIntl } from 'react-intl'
import { useNavigate, Await } from 'react-router-dom'

import { Loader } from '@/components/common/Loader'
import { Start } from '@/components/stegvisning/Start'
import {
  onStegvisningCancel,
  onStegvisningNext,
} from '@/components/stegvisning/stegvisning-utils'
import { paths } from '@/router/constants'
import { useStepStartAccessData } from '@/router/loaders'
import { apiSlice } from '@/state/api/apiSlice'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import { selectIsVeileder } from '@/state/userInput/selectors'

export function StepStart() {
  const intl = useIntl()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const loaderData = useStepStartAccessData()

  React.useEffect(() => {
    document.title = intl.formatMessage({
      id: 'application.title.stegvisning.start',
    })
    dispatch(
      apiSlice.endpoints.getHighchartsAccessibilityPluginFeatureToggle.initiate()
    )
  }, [])

  const isVeileder = useAppSelector(selectIsVeileder)

  const onNext = (): void => {
    onStegvisningNext(navigate, paths.start)
  }

  const onCancel = () => {
    onStegvisningCancel(dispatch, navigate)
  }

  return (
    <React.Suspense
      fallback={
        <div style={{ width: '100%' }}>
          <Loader
            data-testid="start-loader"
            size="3xlarge"
            title={intl.formatMessage({ id: 'pageframework.loading' })}
            isCentered
          />
        </div>
      }
    >
      <Await
        resolve={Promise.all([
          loaderData.getPersonQuery,
          loaderData.shouldRedirectTo,
        ])}
      >
        {(queries: [GetPersonQuery, string]) => {
          const getPersonQuery = queries[0]
          const shouldRedirectTo = queries[1]

          return (
            <Start
              shouldRedirectTo={shouldRedirectTo}
              navn={
                getPersonQuery.isSuccess
                  ? (getPersonQuery.data as Person).navn
                  : ''
              }
              onCancel={isVeileder ? undefined : onCancel}
              onNext={onNext}
            />
          )
        }}
      </Await>
    </React.Suspense>
  )
}

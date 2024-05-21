import React from 'react'
import { useIntl } from 'react-intl'
import { useNavigate, Await } from 'react-router-dom'

import { Loader } from '@/components/common/Loader'
import { Start } from '@/components/stegvisning/Start'
import { henvisningUrlParams, paths } from '@/router/constants'
import { useStep0AccessData } from '@/router/loaders'
import { apiSlice } from '@/state/api/apiSlice'
import {
  useGetEkskludertStatusQuery,
  useGetUfoereFeatureToggleQuery,
} from '@/state/api/apiSlice'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import { selectIsVeileder } from '@/state/userInput/selectors'

export function Step0() {
  const intl = useIntl()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const loaderData = useStep0AccessData()

  const {
    isSuccess,
    isError,
    data: ufoereFeatureToggle,
  } = useGetUfoereFeatureToggleQuery()
  const { data: ekskludertStatus } = useGetEkskludertStatusQuery()

  React.useEffect(() => {
    document.title = intl.formatMessage({
      id: 'application.title.stegvisning.step0',
    })
    dispatch(
      apiSlice.endpoints.getHighchartsAccessibilityPluginFeatureToggle.initiate()
    )
  }, [])

  const isVeileder = useAppSelector(selectIsVeileder)

  React.useEffect(() => {
    /* c8 ignore next 8 - fases ut etter lansering av uføre */
    if (
      isSuccess &&
      !ufoereFeatureToggle?.enabled &&
      ekskludertStatus?.ekskludert &&
      ekskludertStatus.aarsak === 'HAR_LOEPENDE_UFOERETRYGD'
    ) {
      navigate(`${paths.henvisning}/${henvisningUrlParams.ufoeretrygd}`)
    }
    if (
      isError &&
      ekskludertStatus?.ekskludert &&
      ekskludertStatus.aarsak === 'HAR_LOEPENDE_UFOERETRYGD'
    ) {
      navigate(`${paths.henvisning}/${henvisningUrlParams.ufoeretrygd}`)
    }
  }, [isSuccess, isError, ekskludertStatus])

  // Fjern mulighet for avbryt hvis person er veileder
  const onCancel = isVeileder
    ? undefined
    : (): void => {
        navigate(paths.login)
      }

  const onNext = (): void => {
    navigate(paths.utenlandsopphold)
  }

  return (
    <React.Suspense
      fallback={
        <div style={{ width: '100%' }}>
          <Loader
            data-testid="step0-loader"
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
              onCancel={onCancel}
              onNext={onNext}
            />
          )
        }}
      </Await>
    </React.Suspense>
  )
}

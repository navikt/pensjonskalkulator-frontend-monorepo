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
import { useAppDispatch } from '@/state/hooks'

export function Step0() {
  const intl = useIntl()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const loaderData = useStep0AccessData()

  const { data: ufoereFeatureToggle } = useGetUfoereFeatureToggleQuery()

  const { data: ekskludertStatus } = useGetEkskludertStatusQuery()

  React.useEffect(() => {
    document.title = intl.formatMessage({
      id: 'application.title.stegvisning.step0',
    })
    dispatch(
      apiSlice.endpoints.getHighchartsAccessibilityPluginFeatureToggle.initiate()
    )
  }, [])

  React.useEffect(() => {
    // TODO Fases ut når feature for uføre er lansert
    if (ekskludertStatus?.ekskludert) {
      if (
        !ufoereFeatureToggle?.enabled &&
        ekskludertStatus.aarsak === 'HAR_LOEPENDE_UFOERETRYGD'
      ) {
        navigate(`${paths.henvisning}/${henvisningUrlParams.ufoeretrygd}`)
      }
    }
  }, [ekskludertStatus, navigate])

  const onCancel = (): void => {
    navigate(paths.login)
  }

  const onNext = (): void => {
    navigate(paths.utenlandsopphold)
  }

  return (
    <>
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
                fornavn={
                  getPersonQuery.isSuccess
                    ? (getPersonQuery.data as Person).fornavn
                    : ''
                }
                onCancel={onCancel}
                onNext={onNext}
              />
            )
          }}
        </Await>
      </React.Suspense>
    </>
  )
}

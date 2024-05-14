import React from 'react'
import { useIntl } from 'react-intl'
import { useNavigate, Await } from 'react-router-dom'

import { Loader } from '@/components/common/Loader'
import { AFP } from '@/components/stegvisning/AFP'
import { henvisningUrlParams, paths } from '@/router/constants'
import { useStep4AccessData } from '@/router/loaders'
import {
  useGetTpoMedlemskapQuery,
  useGetUfoereFeatureToggleQuery,
  useGetUfoeregradQuery,
  useGetEkskludertStatusQuery,
} from '@/state/api/apiSlice'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import {
  selectSamtykke,
  selectAfp,
  selectIsVeileder,
} from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputReducer'

export function Step4() {
  const intl = useIntl()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const loaderData = useStep4AccessData()
  const harSamtykket = useAppSelector(selectSamtykke)
  const previousAfp = useAppSelector(selectAfp)

  const {
    isSuccess,
    isError,
    data: ufoereFeatureToggle,
  } = useGetUfoereFeatureToggleQuery()
  const { data: ekskludertStatus } = useGetEkskludertStatusQuery()
  const { data: ufoeregrad } = useGetUfoeregradQuery()
  const { data: TpoMedlemskap, isSuccess: isTpoMedlemskapQuerySuccess } =
    useGetTpoMedlemskapQuery(undefined, { skip: !harSamtykket })

  const isVeileder = useAppSelector(selectIsVeileder)

  React.useEffect(() => {
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

  React.useEffect(() => {
    if (
      (!ufoereFeatureToggle || !ufoereFeatureToggle?.enabled) &&
      ufoeregrad?.ufoeregrad
    ) {
      navigate(`${paths.henvisning}/${henvisningUrlParams.ufoeretrygd}`)
    }
  }, [ufoeregrad, navigate])

  React.useEffect(() => {
    document.title = intl.formatMessage({
      id: 'application.title.stegvisning.step4',
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
    if (
      isTpoMedlemskapQuerySuccess &&
      TpoMedlemskap.harTjenestepensjonsforhold
    ) {
      return navigate(paths.offentligTp)
    } else {
      return navigate(paths.samtykke)
    }
  }

  const onNext = (afpData: AfpRadio): void => {
    dispatch(userInputActions.setAfp(afpData))
    navigate(paths.ufoeretrygd)
  }

  return (
    <React.Suspense
      fallback={
        <div style={{ width: '100%' }}>
          <Loader
            data-testid="step4-loader"
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

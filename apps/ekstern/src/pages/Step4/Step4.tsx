import React from 'react'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { Loader } from '@/components/common/Loader'
import { AFP } from '@/components/stegvisning/AFP'
import { paths } from '@/router/constants'
import {
  useGetInntektQuery,
  useGetPersonQuery,
  useGetTpoMedlemskapQuery,
} from '@/state/api/apiSlice'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import {
  selectSamtykke,
  selectAfp,
  selectSamboerFraSivilstand,
} from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputReducer'

import { getNesteSide } from './utils'

export function Step4() {
  const intl = useIntl()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const harSamtykket = useAppSelector(selectSamtykke)
  const harSamboer = useAppSelector(selectSamboerFraSivilstand)
  const previousAfp = useAppSelector(selectAfp)
  const { isLoading: isInntektLoading, isError: isInntektError } =
    useGetInntektQuery()
  const { isLoading: isPersonLoading } = useGetPersonQuery()
  const { data: TpoMedlemskap, isSuccess: isTpoMedlemskapQuerySuccess } =
    useGetTpoMedlemskapQuery(undefined, { skip: !harSamtykket })

  React.useEffect(() => {
    document.title = intl.formatMessage({
      id: 'application.title.stegvisning.step4',
    })
  }, [])

  const nesteSide = React.useMemo(
    () => getNesteSide(harSamboer, isInntektError),
    [harSamboer, isInntektError]
  )

  const onCancel = (): void => {
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
    navigate(nesteSide)
  }

  if (isPersonLoading || isInntektLoading) {
    return (
      <div style={{ width: '100%' }}>
        <Loader
          data-testid="step4-loader"
          size="3xlarge"
          title={intl.formatMessage({ id: 'pageframework.loading' })}
          isCentered
        />
      </div>
    )
  }

  return (
    <AFP
      isLastStep={nesteSide === paths.beregningEnkel}
      afp={previousAfp}
      onCancel={onCancel}
      onPrevious={onPrevious}
      onNext={onNext}
    />
  )
}

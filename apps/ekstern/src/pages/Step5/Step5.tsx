import React from 'react'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { getNesteSide } from '../Step4/utils'
import { Loader } from '@/components/common/Loader'
import { Ufoere } from '@/components/stegvisning/Ufoere'
import { paths } from '@/router/constants'
import { useGetInntektQuery } from '@/state/api/apiSlice'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import { selectSamboerFraSivilstand } from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputReducer'

export function Step5() {
  const intl = useIntl()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const harSamboer = useAppSelector(selectSamboerFraSivilstand)

  const { isLoading: isInntektLoading, isError: isInntektError } =
    useGetInntektQuery()

  React.useEffect(() => {
    document.title = intl.formatMessage({
      id: 'application.title.stegvisning.step5',
    })
  }, [])

  const nesteSide = React.useMemo(() => {
    return getNesteSide(harSamboer, isInntektError)
  }, [harSamboer, isInntektError])

  const onCancel = (): void => {
    dispatch(userInputActions.flush())
    navigate(paths.login)
  }

  const onPrevious = (): void => {
    return navigate(paths.afp)
  }

  const onNext = (): void => {
    navigate(nesteSide)
  }

  if (isInntektLoading) {
    return (
      <div style={{ width: '100%' }}>
        <Loader
          data-testid="step5-loader"
          size="3xlarge"
          title={intl.formatMessage({ id: 'pageframework.loading' })}
          isCentered
        />
      </div>
    )
  }

  return (
    <Ufoere
      isLastStep={nesteSide === paths.beregningEnkel}
      onCancel={onCancel}
      onPrevious={onPrevious}
      onNext={onNext}
    />
  )
}

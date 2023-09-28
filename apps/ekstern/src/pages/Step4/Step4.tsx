import React from 'react'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { AFP } from '@/components/stegvisning/AFP'
import { paths } from '@/router'
import {
  useGetInntektQuery,
  useGetTpoMedlemskapQuery,
} from '@/state/api/apiSlice'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import {
  selectSamtykke,
  selectAfp,
  selectSamboer,
} from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputReducer'

import { getNesteSide } from './utils'

export function Step4() {
  const intl = useIntl()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const harSamtykket = useAppSelector(selectSamtykke)
  const harSamboer = useAppSelector(selectSamboer)
  const previousAfp = useAppSelector(selectAfp)
  const { isError: isInntektError } = useGetInntektQuery()
  const { data: TpoMedlemskap, isSuccess: isTpoMedlemskapQuerySuccess } =
    useGetTpoMedlemskapQuery(undefined, { skip: !harSamtykket })

  React.useEffect(() => {
    document.title = intl.formatMessage({
      id: 'application.title.stegvisning.step4',
    })
  }, [])

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
    navigate(getNesteSide(harSamboer, isInntektError))
  }

  return (
    <AFP
      afp={previousAfp}
      onCancel={onCancel}
      onPrevious={onPrevious}
      onNext={onNext}
    />
  )
}

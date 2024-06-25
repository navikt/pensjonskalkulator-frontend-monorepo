import React from 'react'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { SamtykkeOffentligAFP } from '@/components/stegvisning/SamtykkeOffentligAFP'
import {
  onStegvisningCancel,
  onStegvisningNext,
} from '@/components/stegvisning/stegvisning-utils'
import { paths } from '@/router/constants'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import {
  selectSamtykkeOffentligAFP,
  selectIsVeileder,
} from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputReducer'

export function StepSamtykkeOffentligAFP() {
  const intl = useIntl()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const harSamtykketOffentligAFP = useAppSelector(selectSamtykkeOffentligAFP)
  const isVeileder = useAppSelector(selectIsVeileder)

  React.useEffect(() => {
    document.title = intl.formatMessage({
      id: 'application.title.stegvisning.samtykke_offentlig_AFP',
    })
  }, [])

  const onNext = (samtykkeData: BooleanRadio) => {
    const samtykke = samtykkeData === 'ja'
    dispatch(userInputActions.setSamtykkeOffentligAFP(samtykke))
    onStegvisningNext(navigate, paths.samtykkeOffentligAFP)
  }

  const onPrevious = () => {
    navigate(-1)
  }

  const onCancel = () => {
    onStegvisningCancel(dispatch, navigate)
  }

  return (
    <SamtykkeOffentligAFP
      harSamtykket={harSamtykketOffentligAFP}
      onCancel={isVeileder ? undefined : onCancel}
      onPrevious={onPrevious}
      onNext={onNext}
    />
  )
}

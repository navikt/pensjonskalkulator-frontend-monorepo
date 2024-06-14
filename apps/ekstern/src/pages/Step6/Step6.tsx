import React from 'react'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { SamtykkeOffentligAFP } from '@/components/stegvisning/SamtykkeOffentligAFP'
import { paths } from '@/router/constants'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import {
  selectSamtykkeOffentligAFP,
  selectIsVeileder,
} from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputReducer'

export function Step6() {
  const intl = useIntl()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const harSamtykketOffentligAFP = useAppSelector(selectSamtykkeOffentligAFP)
  const isVeileder = useAppSelector(selectIsVeileder)

  React.useEffect(() => {
    document.title = intl.formatMessage({
      id: 'application.title.stegvisning.step6',
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
    return navigate(paths.afp)
  }

  const onNext = (samtykkeData: BooleanRadio) => {
    const samtykke = samtykkeData === 'ja'
    dispatch(userInputActions.setSamtykkeOffentligAFP(samtykke))
    navigate(paths.sivilstand)
  }

  return (
    <SamtykkeOffentligAFP
      harSamtykket={harSamtykketOffentligAFP}
      onCancel={onCancel}
      onPrevious={onPrevious}
      onNext={onNext}
    />
  )
}

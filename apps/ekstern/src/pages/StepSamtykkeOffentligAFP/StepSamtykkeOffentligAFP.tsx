import React from 'react'
import { useIntl } from 'react-intl'

import { SamtykkeOffentligAFP } from '@/components/stegvisning/SamtykkeOffentligAFP'
import { useStegvisningNavigation } from '@/components/stegvisning/stegvisning-hooks'
import { paths } from '@/router/constants'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import {
  selectSamtykkeOffentligAFP,
  selectIsVeileder,
} from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputSlice'

export function StepSamtykkeOffentligAFP() {
  const intl = useIntl()
  const dispatch = useAppDispatch()
  const harSamtykketOffentligAFP = useAppSelector(selectSamtykkeOffentligAFP)
  const isVeileder = useAppSelector(selectIsVeileder)

  const [{ onStegvisningNext, onStegvisningPrevious, onStegvisningCancel }] =
    useStegvisningNavigation(paths.samtykkeOffentligAFP)

  React.useEffect(() => {
    document.title = intl.formatMessage({
      id: 'application.title.stegvisning.samtykke_offentlig_AFP',
    })
  }, [])

  const onNext = (samtykkeData: BooleanRadio) => {
    const samtykke = samtykkeData === 'ja'
    dispatch(userInputActions.setSamtykkeOffentligAFP(samtykke))
    if (onStegvisningNext) {
      onStegvisningNext()
    }
  }

  return (
    <SamtykkeOffentligAFP
      harSamtykket={harSamtykketOffentligAFP}
      onCancel={isVeileder ? undefined : onStegvisningCancel}
      onPrevious={onStegvisningPrevious}
      onNext={onNext}
    />
  )
}

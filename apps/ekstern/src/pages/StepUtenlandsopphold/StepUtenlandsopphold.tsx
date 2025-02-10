import React from 'react'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router'

import { useStegvisningNavigation } from '@/components/stegvisning/stegvisning-hooks'
import { Utenlandsopphold } from '@/components/stegvisning/Utenlandsopphold'
import { paths } from '@/router/constants'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import { selectHarUtenlandsopphold } from '@/state/userInput/selectors'
import { selectIsVeileder } from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputReducer'

export function StepUtenlandsopphold() {
  const intl = useIntl()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const harUtenlandsopphold = useAppSelector(selectHarUtenlandsopphold)
  const isVeileder = useAppSelector(selectIsVeileder)

  const [{ onStegvisningNext, onStegvisningCancel }] = useStegvisningNavigation(
    paths.utenlandsopphold
  )

  React.useEffect(() => {
    document.title = intl.formatMessage({
      id: 'application.title.stegvisning.utenlandsopphold',
    })
  }, [])

  const onNext = (utenlandsoppholdData: BooleanRadio) => {
    dispatch(
      userInputActions.setHarUtenlandsopphold(utenlandsoppholdData === 'ja')
    )

    if (utenlandsoppholdData === 'nei') {
      dispatch(userInputActions.deleteCurrentSimulationAlleUtenlandsperioder())
    }
    if (onStegvisningNext) {
      onStegvisningNext()
    }
  }

  const onPrevious = (): void => {
    navigate(-1)
  }

  return (
    <Utenlandsopphold
      harUtenlandsopphold={harUtenlandsopphold}
      onCancel={isVeileder ? undefined : onStegvisningCancel}
      onPrevious={onPrevious}
      onNext={onNext}
    />
  )
}

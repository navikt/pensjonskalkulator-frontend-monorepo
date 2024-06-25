import React from 'react'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import {
  onStegvisningCancel,
  onStegvisningNext,
} from '@/components/stegvisning/stegvisning-utils'
import { Utenlandsopphold } from '@/components/stegvisning/Utenlandsopphold'
import { paths, henvisningUrlParams } from '@/router/constants'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import { selectUtenlandsopphold } from '@/state/userInput/selectors'
import {
  selectIsVeileder,
  selectSamboerFraSivilstand,
} from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputReducer'

export function StepUtenlandsopphold() {
  const intl = useIntl()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const harUtenlandsopphold = useAppSelector(selectUtenlandsopphold)
  const harSamboerFraSivilstand = useAppSelector(selectSamboerFraSivilstand)
  const isVeileder = useAppSelector(selectIsVeileder)

  React.useEffect(() => {
    document.title = intl.formatMessage({
      id: 'application.title.stegvisning.utenlandsopphold',
    })
  }, [])

  const onNext = (utenlandsoppholdData: BooleanRadio) => {
    const utenlandsopphold = utenlandsoppholdData === 'ja'
    if (utenlandsopphold) {
      navigate(`${paths.henvisning}/${henvisningUrlParams.utland}`)
    } else {
      dispatch(userInputActions.setUtenlandsopphold(utenlandsopphold))
      onStegvisningNext(navigate, paths.utenlandsopphold)
    }
  }

  const onPrevious = (): void => {
    navigate(harSamboerFraSivilstand ? -2 : -1)
  }

  const onCancel = () => {
    onStegvisningCancel(dispatch, navigate)
  }

  return (
    <Utenlandsopphold
      harUtenlandsopphold={harUtenlandsopphold}
      onCancel={isVeileder ? undefined : onCancel}
      onPrevious={onPrevious}
      onNext={onNext}
    />
  )
}

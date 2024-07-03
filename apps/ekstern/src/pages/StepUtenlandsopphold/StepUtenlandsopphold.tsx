import React from 'react'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { Loader } from '@/components/common/Loader'
import { useStegvisningNavigation } from '@/components/stegvisning/stegvisning-hooks'
import { Utenlandsopphold } from '@/components/stegvisning/Utenlandsopphold'
import { UtenlandsoppholdMedHenvisning } from '@/components/stegvisning/UtenlandsoppholdMedHenvisning'
import { paths, henvisningUrlParams } from '@/router/constants'
import { useGetUtlandFeatureToggleQuery } from '@/state/api/apiSlice'
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

  const { data: utlandFeatureToggle, isLoading } =
    useGetUtlandFeatureToggleQuery()

  const [{ onStegvisningNext, onStegvisningCancel }] = useStegvisningNavigation(
    paths.utenlandsopphold
  )

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
      onStegvisningNext()
    }
  }

  const onPrevious = (): void => {
    navigate(harSamboerFraSivilstand ? -2 : -1)
  }

  if (isLoading) {
    return (
      <Loader
        data-testid="oppholdutenfornorge-loader"
        size="3xlarge"
        title={intl.formatMessage({
          id: 'beregning.loading',
        })}
      />
    )
  }

  return utlandFeatureToggle?.enabled ? (
    <Utenlandsopphold
      harUtenlandsopphold={harUtenlandsopphold}
      onCancel={isVeileder ? undefined : onStegvisningCancel}
      onPrevious={onPrevious}
      onNext={onNext}
    />
  ) : (
    <UtenlandsoppholdMedHenvisning
      harUtenlandsopphold={harUtenlandsopphold}
      onCancel={isVeileder ? undefined : onStegvisningCancel}
      onPrevious={onPrevious}
      onNext={onNext}
    />
  )
}

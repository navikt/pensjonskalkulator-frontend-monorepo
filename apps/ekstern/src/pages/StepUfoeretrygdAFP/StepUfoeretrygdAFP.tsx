import React from 'react'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import {
  onStegvisningCancel,
  onStegvisningNext,
} from '@/components/stegvisning/stegvisning-utils'
import { Ufoere } from '@/components/stegvisning/Ufoere'
import { paths } from '@/router/constants'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import { selectIsVeileder } from '@/state/userInput/selectors'

export function StepUfoeretrygdAFP() {
  const intl = useIntl()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const isVeileder = useAppSelector(selectIsVeileder)

  React.useEffect(() => {
    document.title = intl.formatMessage({
      id: 'application.title.stegvisning.ufoeretryg_AFP',
    })
  }, [])

  const onNext = (): void => {
    onStegvisningNext(navigate, paths.ufoeretrygdAFP)
  }

  const onPrevious = () => {
    navigate(-1)
  }

  const onCancel = () => {
    onStegvisningCancel(dispatch, navigate)
  }

  return (
    <Ufoere
      onCancel={isVeileder ? undefined : onCancel}
      onPrevious={onPrevious}
      onNext={onNext}
    />
  )
}

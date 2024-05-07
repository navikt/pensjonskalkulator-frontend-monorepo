import React from 'react'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { Ufoere } from '@/components/stegvisning/Ufoere'
import { paths } from '@/router/constants'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import { isVeilederSelector } from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputReducer'

export function Step5() {
  const intl = useIntl()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const isVeileder = useAppSelector(isVeilederSelector)

  React.useEffect(() => {
    document.title = intl.formatMessage({
      id: 'application.title.stegvisning.step5',
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

  const onNext = (): void => {
    navigate(paths.sivilstand)
  }

  return <Ufoere onCancel={onCancel} onPrevious={onPrevious} onNext={onNext} />
}

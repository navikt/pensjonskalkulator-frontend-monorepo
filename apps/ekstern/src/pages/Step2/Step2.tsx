import { useEffect } from 'react'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { Samtykke, SamtykkeRadio } from '@/components/stegvisning/Samtykke'
import { paths } from '@/router'
import { apiSlice } from '@/state/api/apiSlice'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import { selectSamtykke } from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputReducer'

export function Step2() {
  const intl = useIntl()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const harSamtykket = useAppSelector(selectSamtykke)

  useEffect(() => {
    document.title = intl.formatMessage({
      id: 'application.title.stegvisning.step2',
    })
  }, [])

  const onNext = (samtykkeData: SamtykkeRadio) => {
    const samtykke = samtykkeData === 'ja'
    dispatch(userInputActions.setSamtykke(samtykke))
    if (!samtykke) {
      dispatch(apiSlice.util.resetApiState())
    }
    navigate(paths.offentligTp)
  }

  const onCancel = (): void => {
    dispatch(userInputActions.flush())
    navigate(paths.login)
  }

  const onPrevious = (): void => {
    dispatch(userInputActions.flush())
    navigate(paths.utenlandsopphold)
  }

  return (
    <Samtykke
      harSamtykket={harSamtykket}
      onCancel={onCancel}
      onPrevious={onPrevious}
      onNext={onNext}
    />
  )
}

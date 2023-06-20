import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  Sivilstand,
  SivilstandRadio,
} from '@/components/stegvisning/Sivilstand'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import { selectSamboer, selectSamtykke } from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputReducer'

export function Step5() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const harSamtykket = useAppSelector(selectSamtykke)
  const harSamboer = useAppSelector(selectSamboer)

  useEffect(() => {
    // Dersom brukeren prøver å aksessere steget direkte uten å ha svart på samtykke spørsmålet sendes den til start steget
    if (harSamtykket === null) {
      return navigate('/start')
    }
  }, [])

  const onCancel = (): void => {
    dispatch(userInputActions.flush())
    navigate('/')
  }

  const onPrevious = (): void => {
    return navigate('/afp')
  }

  const onNext = (sivilstandData: SivilstandRadio): void => {
    dispatch(userInputActions.setSamboer(sivilstandData === 'ja'))
    navigate('/beregning')
  }

  return (
    <Sivilstand
      harSamboer={harSamboer}
      onCancel={onCancel}
      onPrevious={onPrevious}
      onNext={onNext}
    />
  )
}

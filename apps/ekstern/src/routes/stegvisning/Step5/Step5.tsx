import { useNavigate } from 'react-router-dom'

import {
  Sivilstand,
  SivilstandRadio,
} from '@/components/stegvisning/Sivilstand'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import { selectSamboer } from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputReducer'

export function Step5() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const harSamboer = useAppSelector(selectSamboer)

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

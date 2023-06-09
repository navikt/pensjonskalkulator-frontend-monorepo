import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { OffentligTP } from '@/components/stegvisning/OffentligTP'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import { selectSamtykke } from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputReducer'

export function Step3() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const harSamtykket = useAppSelector(selectSamtykke)

  useEffect(() => {
    // TODO legge til logikk for redirect ved TPO også
    if (!harSamtykket) {
      return navigate('/afp')
    }
  }, [])

  const onCancel = (): void => {
    dispatch(userInputActions.flush())
    navigate('/')
  }

  const onPrevious = (): void => {
    navigate('/samtykke')
  }

  const onNext = (): void => {
    navigate('/beregning')
  }

  return (
    <OffentligTP onCancel={onCancel} onPrevious={onPrevious} onNext={onNext} />
  )
}

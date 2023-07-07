import { useNavigate } from 'react-router-dom'

import {
  Sivilstand,
  SivilstandRadio,
} from '@/components/stegvisning/Sivilstand'
import { paths } from '@/routes'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import { selectSamboer } from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputReducer'

export function Step5() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const harSamboer = useAppSelector(selectSamboer)

  const onCancel = (): void => {
    dispatch(userInputActions.flush())
    navigate(paths.root)
  }

  const onPrevious = (): void => {
    return navigate(paths.afp)
  }

  const onNext = (sivilstandData: SivilstandRadio): void => {
    dispatch(userInputActions.setSamboer(sivilstandData === 'ja'))
    navigate(paths.beregning)
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

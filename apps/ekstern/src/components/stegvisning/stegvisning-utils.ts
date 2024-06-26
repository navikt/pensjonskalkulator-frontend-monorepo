import { NavigateFunction } from 'react-router-dom'

import { paths, stegvisningOrder } from '@/router/constants'
import { AppDispatch } from '@/state/store'
import { userInputActions } from '@/state/userInput/userInputReducer'

export const onStegvisningCancel = (
  dispatch: AppDispatch,
  navigate: NavigateFunction
) => {
  dispatch(userInputActions.flush())
  navigate(paths.login)
}

export const onStegvisningNext = (
  navigate: NavigateFunction,
  currentPath: Path
) => {
  navigate(stegvisningOrder[stegvisningOrder.indexOf(currentPath) + 1])
}

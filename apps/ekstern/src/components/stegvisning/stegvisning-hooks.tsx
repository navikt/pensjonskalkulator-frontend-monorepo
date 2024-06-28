import React from 'react'
import { useNavigate } from 'react-router-dom'

import { paths, stegvisningOrder } from '@/router/constants'
import { useAppDispatch } from '@/state/hooks'
import { userInputActions } from '@/state/userInput/userInputReducer'

export const useStegvisningNavigation = (currentPath: Path) => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const onStegvisningNext = () => {
    navigate(stegvisningOrder[stegvisningOrder.indexOf(currentPath) + 1])
  }
  const onStegvisningPrevious = () => {
    navigate(-1)
  }

  const onStegvisningCancel = () => {
    dispatch(userInputActions.flush())
    navigate(paths.login)
  }

  const handlers = React.useMemo(
    () => ({
      onStegvisningNext: onStegvisningNext,
      onStegvisningPrevious,
      onStegvisningCancel,
    }),
    []
  )

  return [handlers] as const
}

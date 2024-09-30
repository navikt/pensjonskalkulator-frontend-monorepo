import React from 'react'
import { useNavigate } from 'react-router-dom'

import {
  paths,
  stegvisningOrder,
  stegvisningOrderEndring,
} from '@/router/constants'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import { selectIsEndring } from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputReducer'

export const useStegvisningNavigation = (currentPath: Path) => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const isEndring = useAppSelector(selectIsEndring)

  const onStegvisningNext = () => {
    const stepArrays = isEndring ? stegvisningOrderEndring : stegvisningOrder
    navigate(stepArrays[stepArrays.indexOf(currentPath) + 1])
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
      onStegvisningNext,
      onStegvisningPrevious,
      onStegvisningCancel,
    }),
    []
  )

  return [handlers] as const
}

import React from 'react'
import { useNavigate } from 'react-router'

import {
  paths,
  stegvisningOrder,
  stegvisningOrderEndring,
} from '@/router/constants'
import { useGetLoependeVedtakQuery } from '@/state/api/apiSlice'
import { useAppDispatch } from '@/state/hooks'
import { userInputActions } from '@/state/userInput/userInputSlice'
import { isLoependeVedtakEndring } from '@/utils/loependeVedtak'

export const useStegvisningNavigation = (currentPath: Path) => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const { isFetching, data: loependeVedtak } = useGetLoependeVedtakQuery()

  const onStegvisningNext = () => {
    const stepArrays =
      loependeVedtak && isLoependeVedtakEndring(loependeVedtak)
        ? stegvisningOrderEndring
        : stegvisningOrder
    navigate(stepArrays[stepArrays.indexOf(currentPath) + 1])
  }

  const onStegvisningPrevious = () => {
    return navigate(-1)
  }

  const onStegvisningCancel = () => {
    dispatch(userInputActions.flush())
    navigate(paths.login)
  }

  const handlers = React.useMemo(
    () => ({
      onStegvisningNext: isFetching ? undefined : onStegvisningNext,
      onStegvisningPrevious,
      onStegvisningCancel,
    }),
    [isFetching]
  )

  return [handlers] as const
}

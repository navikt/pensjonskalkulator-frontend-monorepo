import React from 'react'
import { createSearchParams, useNavigate } from 'react-router'

import { paths } from '@/router/constants'
import { useGetLoependeVedtakQuery } from '@/state/api/apiSlice'
import { useAppDispatch } from '@/state/hooks'
import { userInputActions } from '@/state/userInput/userInputSlice'
import { isLoependeVedtakEndring } from '@/utils/loependeVedtak'

import { getStepArrays } from './utils'

type Path = (typeof paths)[keyof typeof paths]

export const useStegvisningNavigation = (currentPath: Path) => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const { isFetching, data: loependeVedtak } = useGetLoependeVedtakQuery()

  const isEndring = loependeVedtak && isLoependeVedtakEndring(loependeVedtak)

  const stepArrays = getStepArrays(isEndring)

  const onStegvisningNext = () => {
    const currentPathIndex = stepArrays.indexOf(currentPath)
    navigate(stepArrays[currentPathIndex + 1])
  }

  const onStegvisningPrevious = () => {
    const currentPathIndex = stepArrays.indexOf(currentPath)
    navigate({
      pathname: stepArrays[currentPathIndex - 1],
      search: createSearchParams({
        back: 'true',
      }).toString(),
    })
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

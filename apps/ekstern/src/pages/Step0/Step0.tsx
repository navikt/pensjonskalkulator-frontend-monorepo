import React from 'react'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { Start } from '@/components/stegvisning/Start'
import { paths } from '@/router'
import { apiSlice } from '@/state/api/apiSlice'
import { useGetInntektQuery, useGetPersonQuery } from '@/state/api/apiSlice'
import { useAppDispatch } from '@/state/hooks'

export function Step0() {
  const intl = useIntl()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const { isError: isInntektError } = useGetInntektQuery()
  const {
    data: person,
    isError: isPersonError,
    isSuccess: isPersonSuccess,
  } = useGetPersonQuery()

  React.useEffect(() => {
    document.title = intl.formatMessage({
      id: 'application.title.stegvisning.step0',
    })
  }, [])

  const onCancel = (): void => {
    navigate(paths.login)
  }

  const onNext = (): void => {
    if (isInntektError) {
      dispatch(apiSlice.util.invalidateTags(['Inntekt']))
    }
    if (isPersonError) {
      dispatch(apiSlice.util.invalidateTags(['Person']))
    }
    navigate(paths.utenlandsopphold)
  }

  return (
    <Start
      fornavn={isPersonSuccess ? (person as Person).fornavn : ''}
      onCancel={onCancel}
      onNext={onNext}
    />
  )
}

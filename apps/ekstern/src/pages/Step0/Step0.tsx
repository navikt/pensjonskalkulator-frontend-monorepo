import React from 'react'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { FetchBaseQueryError } from '@reduxjs/toolkit/query'

import { Start } from '@/components/stegvisning/Start'
import { paths } from '@/router'
import { apiSlice } from '@/state/api/apiSlice'
import { useGetInntektQuery, useGetPersonQuery } from '@/state/api/apiSlice'
import { useAppDispatch } from '@/state/hooks'

export function Step0() {
  const intl = useIntl()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const { isError: isInntektError, error } = useGetInntektQuery()
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

  React.useEffect(() => {
    // TODO PEK-134 invalidate tag i onNext og prøv igjen senere i stegvisningen
    if (isInntektError) {
      throw new Error((error as FetchBaseQueryError).data as string)
    }
  }, [isInntektError])

  const onCancel = (): void => {
    navigate(paths.login)
  }

  const onNext = (): void => {
    navigate(paths.utenlandsopphold)
    if (isPersonError) {
      dispatch(apiSlice.util.invalidateTags(['Person']))
    }
  }

  return (
    <Start
      fornavn={isPersonSuccess ? (person as Person).fornavn : ''}
      onCancel={onCancel}
      onNext={onNext}
    />
  )
}

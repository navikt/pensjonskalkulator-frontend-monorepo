import React from 'react'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { lastDayOfYear, isBefore } from 'date-fns'

import { Loader } from '@/components/common/Loader'
import { Start } from '@/components/stegvisning/Start'
import { paths } from '@/router'
import { apiSlice } from '@/state/api/apiSlice'
import {
  useGetInntektQuery,
  useGetPersonQuery,
  useGetSakStatusQuery,
} from '@/state/api/apiSlice'
import { useAppDispatch } from '@/state/hooks'

export function Step0() {
  const intl = useIntl()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const { isFetching: isSakFetching, data: sak } = useGetSakStatusQuery()

  const {
    isError: isInntektError,
    error,
    isFetching: isInntektFetching,
  } = useGetInntektQuery()
  const {
    data: person,
    isError: isPersonError,
    isSuccess: isPersonSuccess,
    isFetching: isPersonFetching,
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

  React.useEffect(() => {
    if (!isSakFetching && sak?.harUfoeretrygdEllerGjenlevendeytelse) {
      navigate(paths.henvisningUfoeretrygdGjenlevendepensjon)
    }
  }, [isSakFetching, sak, navigate])

  React.useEffect(() => {
    const LAST_DAY_1962 = lastDayOfYear(new Date(1962, 1, 1))
    if (
      isPersonSuccess &&
      isBefore(new Date(person.foedselsdato), LAST_DAY_1962)
    ) {
      navigate(paths.henvisning1963)
    }
  }, [isPersonSuccess, person, navigate])

  const onCancel = (): void => {
    navigate(paths.login)
  }

  const onNext = (): void => {
    navigate(paths.utenlandsopphold)
    if (isPersonError) {
      dispatch(apiSlice.util.invalidateTags(['Person']))
    }
  }

  if (isPersonFetching || isInntektFetching || isSakFetching) {
    return (
      <div style={{ width: '100%' }}>
        <Loader size="3xlarge" title="venter..." isCentered />
      </div>
    )
  }

  return (
    <Start
      fornavn={isPersonSuccess ? (person as Person).fornavn : ''}
      onCancel={onCancel}
      onNext={onNext}
    />
  )
}

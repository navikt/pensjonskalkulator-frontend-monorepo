import React from 'react'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { lastDayOfYear, isBefore } from 'date-fns'

import { Loader } from '@/components/common/Loader'
import { Start } from '@/components/stegvisning/Start'
import { paths } from '@/router'
import { apiSlice } from '@/state/api/apiSlice'
import {
  useGetPersonQuery,
  useGetSakStatusQuery,
  useGetInntektQuery,
} from '@/state/api/apiSlice'
import { useAppDispatch } from '@/state/hooks'

export function Step0() {
  const intl = useIntl()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const { isFetching: isSakFetching, data: sak } = useGetSakStatusQuery()

  const { isError: isInntektError, isFetching: isInntektFetching } =
    useGetInntektQuery()

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
    if (isInntektError) {
      dispatch(apiSlice.util.invalidateTags(['Inntekt']))
    }
    if (isPersonError) {
      dispatch(apiSlice.util.invalidateTags(['Person']))
    }
    navigate(paths.utenlandsopphold)
  }

  if (isPersonFetching || isInntektFetching || isSakFetching) {
    return (
      <div style={{ width: '100%' }}>
        <Loader
          data-testid="step0-loader"
          size="3xlarge"
          title={intl.formatMessage({ id: 'pageframework.loading' })}
          isCentered
        />
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

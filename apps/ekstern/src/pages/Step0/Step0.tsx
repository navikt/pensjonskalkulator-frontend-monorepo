import React from 'react'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { Loader } from '@/components/common/Loader'
import { Start } from '@/components/stegvisning/Start'
import { paths } from '@/router/constants'
import { apiSlice } from '@/state/api/apiSlice'
import {
  useGetPersonQuery,
  useGetSakStatusQuery,
  useGetInntektQuery,
} from '@/state/api/apiSlice'
import { useAppDispatch } from '@/state/hooks'
import { isFoedtFoer1963 } from '@/utils/alder'

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
    dispatch(
      apiSlice.endpoints.getHighchartsAccessibilityPluginFeatureToggle.initiate()
    )
    dispatch(apiSlice.endpoints.getDetaljertFaneFeatureToggle.initiate())
  }, [])

  React.useEffect(() => {
    if (!isSakFetching && sak?.harUfoeretrygdEllerGjenlevendeytelse) {
      navigate(paths.henvisningUfoeretrygdGjenlevendepensjon)
    }
  }, [isSakFetching, sak, navigate])

  React.useEffect(() => {
    if (isPersonSuccess && isFoedtFoer1963(person.foedselsdato)) {
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

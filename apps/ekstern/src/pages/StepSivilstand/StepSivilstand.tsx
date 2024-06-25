import React from 'react'
import { useIntl } from 'react-intl'
import { useNavigate, Await } from 'react-router-dom'

import { Loader } from '@/components/common/Loader'
import { Sivilstand } from '@/components/stegvisning/Sivilstand'
import {
  onStegvisningCancel,
  onStegvisningNext,
} from '@/components/stegvisning/stegvisning-utils'
import { paths } from '@/router/constants'
import { useStepSivilstandAccessData } from '@/router/loaders'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import {
  selectIsVeileder,
  selectSamboerFraBrukerInput,
} from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputReducer'

export function StepSivilstand() {
  const intl = useIntl()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const loaderData = useStepSivilstandAccessData()
  const isVeileder = useAppSelector(selectIsVeileder)
  const samboerSvar = useAppSelector(selectSamboerFraBrukerInput)

  React.useEffect(() => {
    document.title = intl.formatMessage({
      id: 'application.title.stegvisning.sivilstand',
    })
  }, [])

  const onNext = (sivilstandData: BooleanRadio): void => {
    dispatch(userInputActions.setSamboer(sivilstandData === 'ja'))
    onStegvisningNext(navigate, paths.sivilstand)
  }

  const onPrevious = (): void => {
    navigate(-1)
  }

  const onCancel = () => {
    onStegvisningCancel(dispatch, navigate)
  }

  return (
    <React.Suspense
      fallback={
        <div style={{ width: '100%' }}>
          <Loader
            data-testid="sivilstand-loader"
            size="3xlarge"
            title={intl.formatMessage({ id: 'pageframework.loading' })}
            isCentered
          />
        </div>
      }
    >
      <Await
        resolve={Promise.all([
          loaderData.getPersonQuery,
          loaderData.shouldRedirectTo,
        ])}
      >
        {(queries: [GetPersonQuery, string]) => {
          const getPersonQuery = queries[0]
          const shouldRedirectTo = queries[1]

          return (
            <Sivilstand
              shouldRedirectTo={shouldRedirectTo}
              sivilstand={
                getPersonQuery.isSuccess
                  ? (getPersonQuery.data as Person).sivilstand
                  : 'UNKNOWN'
              }
              harSamboer={samboerSvar}
              onCancel={isVeileder ? undefined : onCancel}
              onPrevious={onPrevious}
              onNext={onNext}
            />
          )
        }}
      </Await>
    </React.Suspense>
  )
}

import React from 'react'
import { useIntl } from 'react-intl'
import { useNavigate, Await } from 'react-router-dom'

import { Loader } from '@/components/common/Loader'
import { Sivilstand } from '@/components/stegvisning/Sivilstand'
import { paths } from '@/router/constants'
import { useStep1AccessData } from '@/router/loaders'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import { selectSamboerFraBrukerInput } from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputReducer'

export function Step1() {
  const intl = useIntl()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const loaderData = useStep1AccessData()

  const samboerSvar = useAppSelector(selectSamboerFraBrukerInput)

  React.useEffect(() => {
    document.title = intl.formatMessage({
      id: 'application.title.stegvisning.step1',
    })
  }, [])

  const onCancel = (): void => {
    dispatch(userInputActions.flush())
    navigate(paths.login)
  }

  const onPrevious = (): void => {
    navigate(paths.start)
  }

  const onNext = (sivilstandData: BooleanRadio): void => {
    dispatch(userInputActions.setSamboer(sivilstandData === 'ja'))
    navigate(paths.utenlandsopphold)
  }

  return (
    <React.Suspense
      fallback={
        <div style={{ width: '100%' }}>
          <Loader
            data-testid="step1-loader"
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
              onCancel={onCancel}
              onPrevious={onPrevious}
              onNext={onNext}
            />
          )
        }}
      </Await>
    </React.Suspense>
  )
}

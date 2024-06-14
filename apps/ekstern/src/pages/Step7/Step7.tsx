import React from 'react'
import { useIntl } from 'react-intl'
import { useNavigate, Await } from 'react-router-dom'

import { Loader } from '@/components/common/Loader'
import { Sivilstand } from '@/components/stegvisning/Sivilstand'
import { paths } from '@/router/constants'
import { useStep7AccessData } from '@/router/loaders'
import { useGetUfoeregradQuery } from '@/state/api/apiSlice'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import {
  selectAfp,
  selectSamboerFraBrukerInput,
} from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputReducer'

export function Step7() {
  const intl = useIntl()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const loaderData = useStep7AccessData()

  const afp = useAppSelector(selectAfp)
  const samboerSvar = useAppSelector(selectSamboerFraBrukerInput)

  const { data: ufoeregrad } = useGetUfoeregradQuery()

  React.useEffect(() => {
    document.title = intl.formatMessage({
      id: 'application.title.stegvisning.step7',
    })
  }, [])

  const onCancel = (): void => {
    dispatch(userInputActions.flush())
    navigate(paths.login)
  }

  // TODO PEK-388: skrive tester
  const onPrevious = (): void => {
    if (ufoeregrad?.ufoeregrad && afp && afp !== 'nei') {
      navigate(paths.ufoeretrygdAFP)
    } else if (ufoeregrad?.ufoeregrad === 0 && afp === 'ja_offentlig') {
      navigate(paths.samtykkeOffentligAFP)
    } else {
      navigate(paths.afp)
    }
  }

  const onNext = (sivilstandData: BooleanRadio): void => {
    dispatch(userInputActions.setSamboer(sivilstandData === 'ja'))
    navigate(paths.beregningEnkel)
  }

  return (
    <React.Suspense
      fallback={
        <div style={{ width: '100%' }}>
          <Loader
            data-testid="step7-loader"
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

import React from 'react'
import { useIntl } from 'react-intl'
import { Await, useLoaderData } from 'react-router'

import { Loader } from '@/components/common/Loader'
import { Start } from '@/components/stegvisning/Start'
import { useStegvisningNavigation } from '@/components/stegvisning/stegvisning-hooks'
import { paths } from '@/router/constants'
import { StepStartAccessGuardLoader } from '@/router/loaders'
import { useAppSelector } from '@/state/hooks'
import { selectIsVeileder } from '@/state/userInput/selectors'

export function StepStart() {
  const intl = useIntl()

  const { getPersonQuery, getLoependeVedtakQuery, shouldRedirectTo } =
    useLoaderData() as StepStartAccessGuardLoader

  const [{ onStegvisningNext, onStegvisningCancel }] = useStegvisningNavigation(
    paths.start
  )

  React.useEffect(() => {
    document.title = intl.formatMessage({
      id: 'application.title.stegvisning.start',
    })
  }, [])

  const isVeileder = useAppSelector(selectIsVeileder)

  return (
    <React.Suspense
      fallback={
        <div style={{ width: '100%' }}>
          <Loader
            data-testid="start-loader"
            size="3xlarge"
            title={intl.formatMessage({ id: 'pageframework.loading' })}
            isCentered
          />
        </div>
      }
    >
      <Await
        resolve={Promise.all([
          getPersonQuery,
          getLoependeVedtakQuery,
          shouldRedirectTo,
        ])}
      >
        {({
          0: getPersonQueryResponse,
          1: getLoependeVedtakQueryResponse,
          2: shouldRedirectToResponse,
        }: [GetPersonQuery, GetLoependeVedtakQuery, string, boolean]) => {
          return (
            <Start
              shouldRedirectTo={shouldRedirectToResponse}
              navn={
                getPersonQueryResponse.isSuccess
                  ? (getPersonQueryResponse.data as Person).navn
                  : ''
              }
              onCancel={isVeileder ? undefined : onStegvisningCancel}
              onNext={onStegvisningNext}
              loependeVedtak={getLoependeVedtakQueryResponse.data}
            />
          )
        }}
      </Await>
    </React.Suspense>
  )
}

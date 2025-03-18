import React from 'react'
import { useIntl } from 'react-intl'
import { Await, useLoaderData } from 'react-router'

import { Loader } from '@/components/common/Loader'
import {
  AFP,
  AFPOvergangskullUtenAP,
  AFPPrivat,
} from '@/components/stegvisning/AFP'
import { useStegvisningNavigation } from '@/components/stegvisning/stegvisning-hooks'
import { paths } from '@/router/constants'
import { StepAFPAccessGuardLoader } from '@/router/loaders'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import {
  selectAfp,
  selectIsVeileder,
  selectSkalBeregneAfp,
} from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputSlice'
import { isAlderOver67, isFoedtFoer1963, isOvergangskull } from '@/utils/alder'
import { isLoependeVedtakEndring } from '@/utils/loependeVedtak'

export function StepAFP() {
  const intl = useIntl()
  const dispatch = useAppDispatch()
  const stepAFPAccessGuard =
    useLoaderData() as Promise<StepAFPAccessGuardLoader>
  const previousAfp = useAppSelector(selectAfp)
  const previousSkalBeregneAfp = useAppSelector(selectSkalBeregneAfp)
  const isVeileder = useAppSelector(selectIsVeileder)

  const [{ onStegvisningNext, onStegvisningPrevious, onStegvisningCancel }] =
    useStegvisningNavigation(paths.afp)

  React.useEffect(() => {
    document.title = intl.formatMessage({
      id: 'application.title.stegvisning.afp',
    })
  }, [])

  const onNext = (afp: AfpRadio, skalBeregneAfp?: boolean | null): void => {
    dispatch(userInputActions.setAfp(afp))
    if (skalBeregneAfp && skalBeregneAfp !== null) {
      dispatch(userInputActions.setSkalBeregneAfp(skalBeregneAfp))
    }

    if (onStegvisningNext) {
      onStegvisningNext()
    }
  }

  return (
    <React.Suspense
      fallback={
        <div style={{ width: '100%' }}>
          <Loader
            data-testid="afp-loader"
            size="3xlarge"
            title={intl.formatMessage({ id: 'pageframework.loading' })}
            isCentered
          />
        </div>
      }
    >
      <Await resolve={stepAFPAccessGuard}>
        {({ person, loependeVedtak }) => {
          if (
            isFoedtFoer1963(person.foedselsdato) &&
            (isAlderOver67(person.foedselsdato) ||
              isLoependeVedtakEndring(loependeVedtak))
          ) {
            return (
              <AFPPrivat
                previousAfp={previousAfp}
                onCancel={isVeileder ? undefined : onStegvisningCancel}
                onPrevious={onStegvisningPrevious}
                onNext={onNext}
              />
            )
          } else if (
            isOvergangskull(person.foedselsdato) &&
            !isLoependeVedtakEndring(loependeVedtak)
          ) {
            return (
              <AFPOvergangskullUtenAP
                previousAfp={previousAfp}
                previousSkalBeregneAfp={previousSkalBeregneAfp}
                onCancel={isVeileder ? undefined : onStegvisningCancel}
                onPrevious={onStegvisningPrevious}
                onNext={onNext}
              />
            )
          } else {
            return (
              <AFP
                previousAfp={previousAfp}
                onCancel={isVeileder ? undefined : onStegvisningCancel}
                onPrevious={onStegvisningPrevious}
                onNext={onNext}
              />
            )
          }
        }}
      </Await>
    </React.Suspense>
  )
}

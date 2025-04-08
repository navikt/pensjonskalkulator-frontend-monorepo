import React from 'react'
import { useIntl } from 'react-intl'
import { Await, useLoaderData } from 'react-router'

import { Loader } from '@/components/common/Loader'
import { Sivilstand } from '@/components/stegvisning/Sivilstand'
import { useStegvisningNavigation } from '@/components/stegvisning/stegvisning-hooks'
import { paths } from '@/router/constants'
import { StepSivilstandAccessGuardLoader } from '@/router/loaders'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import {
  selectEpsHarInntektOver2G,
  selectEpsHarPensjon,
  selectIsVeileder,
  selectSivilstand,
} from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputSlice'

export function StepSivilstand() {
  const intl = useIntl()

  const dispatch = useAppDispatch()
  const isVeileder = useAppSelector(selectIsVeileder)
  const sivilstand = useAppSelector(selectSivilstand)
  const epsHarInntektOver2G = useAppSelector(selectEpsHarInntektOver2G)
  const epsHarPensjon = useAppSelector(selectEpsHarPensjon)

  const { getPersonQuery, getGrunnbelopQuery } =
    useLoaderData<StepSivilstandAccessGuardLoader>()

  const [{ onStegvisningNext, onStegvisningPrevious, onStegvisningCancel }] =
    useStegvisningNavigation(paths.sivilstand)

  React.useEffect(() => {
    document.title = intl.formatMessage({
      id: 'application.title.stegvisning.sivilstand',
    })
  }, [])

  const onNext = (sivilstandData: {
    sivilstand: Sivilstand
    epsHarPensjon: boolean | null
    epsHarInntektOver2G: boolean | null
  }): void => {
    dispatch(userInputActions.setSivilstand(sivilstandData))
    if (onStegvisningNext) {
      onStegvisningNext()
    }
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
      <Await resolve={Promise.all([getPersonQuery, getGrunnbelopQuery])}>
        {([personData, grunnbelopData]) => {
          return (
            <Sivilstand
              sivilstandFolkeregister={personData.sivilstand}
              grunnbelop={grunnbelopData}
              sivilstand={sivilstand!}
              epsHarInntektOver2G={epsHarInntektOver2G}
              epsHarPensjon={epsHarPensjon}
              onCancel={isVeileder ? undefined : onStegvisningCancel}
              onPrevious={onStegvisningPrevious}
              onNext={onNext}
            />
          )
        }}
      </Await>
    </React.Suspense>
  )
}

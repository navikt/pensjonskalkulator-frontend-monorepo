import React from 'react'
import { useIntl } from 'react-intl'
import { useLoaderData } from 'react-router'

import { Sivilstand } from '@/components/stegvisning/Sivilstand'
import { useStegvisningNavigation } from '@/components/stegvisning/stegvisning-hooks'
import { paths } from '@/router/constants'
import { stepSivilstandAccessGuard } from '@/router/loaders'
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

  const { person, grunnbelop } =
    useLoaderData<typeof stepSivilstandAccessGuard>()

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
    <Sivilstand
      sivilstandFolkeregister={person.sivilstand}
      grunnbelop={grunnbelop}
      sivilstand={sivilstand!}
      epsHarInntektOver2G={epsHarInntektOver2G}
      epsHarPensjon={epsHarPensjon}
      onCancel={isVeileder ? undefined : onStegvisningCancel}
      onPrevious={onStegvisningPrevious}
      onNext={onNext}
    />
  )
}

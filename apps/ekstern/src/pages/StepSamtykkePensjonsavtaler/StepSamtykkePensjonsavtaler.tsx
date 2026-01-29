import React from 'react'
import { useIntl } from 'react-intl'
import { useLoaderData } from 'react-router'

import { SamtykkePensjonsavtaler } from '@/components/stegvisning/SamtykkePensjonsavtaler'
import { useStegvisningNavigation } from '@/components/stegvisning/stegvisning-hooks'
import { paths } from '@/router/constants'
import { stepSamtykkePensjonsavtaler } from '@/router/loaders'
import { apiSlice } from '@/state/api/apiSlice'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import { selectIsVeileder, selectSamtykke } from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputSlice'

export function StepSamtykkePensjonsavtaler() {
  const intl = useIntl()
  const dispatch = useAppDispatch()
  const harSamtykket = useAppSelector(selectSamtykke)
  const isVeileder = useAppSelector(selectIsVeileder)

  const { erApoteker, isKap19 } =
    useLoaderData<typeof stepSamtykkePensjonsavtaler>()

  const [{ onStegvisningNext, onStegvisningPrevious, onStegvisningCancel }] =
    useStegvisningNavigation(paths.samtykke)

  React.useEffect(() => {
    document.title = intl.formatMessage({
      id: 'application.title.stegvisning.samtykke',
    })
  }, [])

  const onNext = (samtykkeData: BooleanRadio) => {
    const samtykke = samtykkeData === 'ja'
    dispatch(userInputActions.setSamtykke(samtykke))
    if (!samtykke) {
      dispatch(apiSlice.util.invalidateTags(['OffentligTp', 'Pensjonsavtaler']))
    }
    if (onStegvisningNext) {
      onStegvisningNext()
    }
  }

  return (
    <SamtykkePensjonsavtaler
      harSamtykket={harSamtykket}
      onCancel={isVeileder ? undefined : onStegvisningCancel}
      onPrevious={onStegvisningPrevious}
      onNext={onNext}
      erApoteker={erApoteker}
      isKap19={isKap19}
    />
  )
}

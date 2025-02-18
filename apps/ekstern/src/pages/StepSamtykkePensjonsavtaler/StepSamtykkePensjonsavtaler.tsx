import React from 'react'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router'

import { SamtykkePensjonsavtaler } from '@/components/stegvisning/SamtykkePensjonsavtaler'
import { useStegvisningNavigation } from '@/components/stegvisning/stegvisning-hooks'
import { paths } from '@/router/constants'
import { apiSlice } from '@/state/api/apiSlice'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import {
  selectFoedselsdato,
  selectUfoeregrad,
  selectSamtykke,
  selectHarHentetOffentligTp,
  selectIsVeileder,
} from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputReducer'
import {
  isAlderOverAnnenAlder,
  transformFoedselsdatoToAlderMinus1md,
  AFP_UFOERE_OPPSIGELSESALDER,
} from '@/utils/alder'

export function StepSamtykkePensjonsavtaler() {
  const intl = useIntl()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const foedselsdato = useAppSelector(selectFoedselsdato)
  const ufoeregrad = useAppSelector(selectUfoeregrad)
  const harSamtykket = useAppSelector(selectSamtykke)
  const shouldFlush = useAppSelector(selectHarHentetOffentligTp)
  const isVeileder = useAppSelector(selectIsVeileder)

  const [{ onStegvisningNext, onStegvisningCancel }] = useStegvisningNavigation(
    paths.samtykke
  )

  React.useEffect(() => {
    document.title = intl.formatMessage({
      id: 'application.title.stegvisning.samtykke',
    })
  }, [])

  const onNext = (samtykkeData: BooleanRadio) => {
    const samtykke = samtykkeData === 'ja'
    dispatch(userInputActions.setSamtykke(samtykke))
    if (shouldFlush && !samtykke) {
      apiSlice.util.invalidateTags(['OffentligTp', 'Pensjonsavtaler'])
    }
    if (onStegvisningNext) {
      onStegvisningNext()
    }
  }

  const onPrevious = (): void => {
    let navigateBackAntallStep = -1
    if (
      ufoeregrad &&
      foedselsdato &&
      isAlderOverAnnenAlder(
        transformFoedselsdatoToAlderMinus1md(foedselsdato),
        AFP_UFOERE_OPPSIGELSESALDER
      )
    ) {
      navigateBackAntallStep = -2
    }
    navigate(navigateBackAntallStep)
  }

  return (
    <SamtykkePensjonsavtaler
      harSamtykket={harSamtykket}
      onCancel={isVeileder ? undefined : onStegvisningCancel}
      onPrevious={onPrevious}
      onNext={onNext}
    />
  )
}

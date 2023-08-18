import { Unsubscribe } from '@reduxjs/toolkit'

import { apiSlice } from '@/state/api/apiSlice'
import {
  generatePensjonsavtalerRequestBody,
  unformatUttaksalder,
} from '@/state/api/utils'
import { AppListenerEffectAPI, AppStartListening } from '@/state/store'
import { selectSamtykke } from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputReducer'

// onSetFormatertUttaksalder
// 1. unformat uttaksalder
// 2. oppdater current simulation med riktig aar og maaned
// 3. Hvis samtykke er true: hent pensjonsavtaler
async function onSetFormatertUttaksalder(
  { payload }: ReturnType<typeof userInputActions.setFormatertUttaksalder>,
  { dispatch, getState /* getOriginalState, condition*/ }: AppListenerEffectAPI
) {
  const uttaksalder = unformatUttaksalder(payload)

  dispatch(
    userInputActions.updateCurrentSimulation({
      startAlder: uttaksalder.aar,
      startMaaned: uttaksalder.maaned,
    })
  )

  const samtykke = selectSamtykke(getState())
  if (samtykke) {
    const pensjonsavtalerRequestBody =
      generatePensjonsavtalerRequestBody(uttaksalder)
    dispatch(
      apiSlice.endpoints.pensjonsavtaler.initiate(pensjonsavtalerRequestBody)
    )
  }
}

// Vil kalle onSetFormatertUttaksalder hver gang setFormatertUttaksalder kjører
export function createUttaksalderListener(
  startListening: AppStartListening
): Unsubscribe {
  const subscriptions = [
    startListening({
      actionCreator: userInputActions.setFormatertUttaksalder,
      effect: onSetFormatertUttaksalder,
    }),
  ]

  return () => {
    subscriptions.forEach((unsubscribe) => unsubscribe())
  }
}

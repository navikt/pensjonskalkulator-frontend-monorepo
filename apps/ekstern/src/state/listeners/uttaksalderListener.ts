import { Unsubscribe } from '@reduxjs/toolkit'

import { apiSlice } from '@/state/api/apiSlice'
import {
  generatePensjonsavtalerRequestBody,
  unformatUttaksalder,
} from '@/state/api/utils'
import { AppListenerEffectAPI, AppStartListening } from '@/state/store'
import {
  selectInntekt,
  selectSamtykke,
  selectAfp,
  selectSivilstand,
} from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputReducer'

/**
 * onSetFormatertUttaksalder
 * 1. unformat uttaksalder
 * 2. oppdater current simulation med riktig aar og maaneder
 * 3. Hvis samtykke er true: hent pensjonsavtaler
 *
 * @param payload - formatertUttaksalder satt av setFormatertUttaksalder
 * @param { dispatch, getState getOriginalState, condition } - fra AppListenerEffectAPI
 */
async function onSetFormatertUttaksalder(
  { payload }: ReturnType<typeof userInputActions.setFormatertUttaksalder>,
  { dispatch, getState }: AppListenerEffectAPI
) {
  const uttaksalder = unformatUttaksalder(payload)

  dispatch(
    userInputActions.updateCurrentSimulation({
      startAar: uttaksalder.aar,
      startMaaned: uttaksalder.maaneder,
    })
  )

  const inntekt = selectInntekt(getState())
  const samtykke = selectSamtykke(getState())
  const afp = selectAfp(getState())
  const sivilstand = selectSivilstand(getState())

  if (samtykke && inntekt !== undefined) {
    dispatch(
      apiSlice.endpoints.pensjonsavtaler.initiate(
        generatePensjonsavtalerRequestBody(
          inntekt.beloep,
          afp,
          uttaksalder,
          sivilstand
        )
      )
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

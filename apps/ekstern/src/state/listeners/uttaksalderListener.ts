import { Unsubscribe } from '@reduxjs/toolkit'

import { unformatUttaksalder } from '@/state/api/utils'
import { AppListenerEffectAPI, AppStartListening } from '@/state/store'
import { userInputActions } from '@/state/userInput/userInputReducer'

/**
 * onSetFormatertUttaksalder
 * 1. unformat uttaksalder
 * 2. oppdater current simulation med riktig aar og maaneder
 *
 * @param payload - formatertUttaksalder satt av setFormatertUttaksalder
 * @param { dispatch, getState getOriginalState, condition } - fra AppListenerEffectAPI
 */
async function onSetFormatertUttaksalder(
  { payload }: ReturnType<typeof userInputActions.setFormatertUttaksalder>,
  { dispatch /* , getState*/ }: AppListenerEffectAPI
) {
  const uttaksalder = unformatUttaksalder(payload)

  dispatch(
    userInputActions.updateCurrentSimulation({
      startAar: uttaksalder.aar,
      startMaaned: uttaksalder.maaneder,
    })
  )
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

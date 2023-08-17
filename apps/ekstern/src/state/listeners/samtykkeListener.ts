import { Unsubscribe } from '@reduxjs/toolkit'

import { AppListenerEffectAPI, AppStartListening } from '@/state/store'
import { userInputActions } from '@/state/userInput/userInputReducer'

async function onSamtykkeUpdate(
  { payload }: ReturnType<typeof userInputActions.setSamtykke>,
  {
    dispatch /* , getState, getOriginalState, condition*/,
  }: AppListenerEffectAPI
) {
  dispatch(userInputActions.setAfp(payload === true ? 'vet_ikke' : 'nei'))
}

export function createSamtykkeListener(
  startListening: AppStartListening
): Unsubscribe {
  const subscriptions = [
    startListening({
      actionCreator: userInputActions.setSamtykke,
      effect: onSamtykkeUpdate,
    }),
  ]

  return () => {
    subscriptions.forEach((unsubscribe) => unsubscribe())
  }
}

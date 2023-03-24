import { Unsubscribe } from '@reduxjs/toolkit'

import { AppListenerEffectAPI, AppStartListening } from '../store'
import { userInputActions } from '../userInput/userInputReducer'

async function onSamtykkeUpdate(
  { payload }: ReturnType<typeof userInputActions.setSamtykke>,
  {
    dispatch /* , getState, getOriginalState, condition*/,
  }: AppListenerEffectAPI
) {
  dispatch(
    userInputActions.setSomething(
      `Brukeren har${!payload ? ' ikke' : ''} samtykket`
    )
  )
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

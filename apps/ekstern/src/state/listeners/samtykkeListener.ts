import { Unsubscribe } from '@reduxjs/toolkit'

import { AppStartListening, AppListenerEffectAPI } from '../store'
import { userInputActions } from '../userInput/userInputReducer'

async function onSamtykkeUpdate(
  { payload }: ReturnType<typeof userInputActions.setSamtykke>,
  {
    dispatch /* , getState, getOriginalState, condition*/,
  }: AppListenerEffectAPI
) {
  console.log('setSamtykke payload: ', payload)
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
    /* c8 ignore next */
    subscriptions.forEach((unsubscribe) => unsubscribe())
  }
}

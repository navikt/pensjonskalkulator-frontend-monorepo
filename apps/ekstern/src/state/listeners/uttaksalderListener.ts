import { Unsubscribe } from '@reduxjs/toolkit'
import { createIntl, createIntlCache } from 'react-intl'

import {
  getSelectedLanguage,
  getTranslations,
} from '@/context/LanguageProvider/utils'
import { AppListenerEffectAPI, AppStartListening } from '@/state/store'
import { userInputActions } from '@/state/userInput/userInputSlice'
import { formatUttaksalder } from '@/utils/alder'

/**
 * onSetCurrentSimulationStartAlder
 * 1. formaterer uttaksalder
 * 2. oppdaterer current simulation med formatert uttaksalder
 *
 * @param payload - alder satt av setCurrentSimulationUttaksalder
 * @param { dispatch, getState getOriginalState, condition } - fra AppListenerEffectAPI
 */
async function onSetCurrentSimulationStartAlder(
  {
    payload,
  }: ReturnType<typeof userInputActions.setCurrentSimulationUttaksalder>,
  { dispatch /* , getState*/ }: AppListenerEffectAPI
) {
  /* c8 ignore next 1 */
  const locale = getSelectedLanguage()
  const cache = createIntlCache()
  const intl = createIntl(
    {
      locale,
      messages: getTranslations(locale),
    },
    cache
  )
  const formatertUttaksalder = payload ? formatUttaksalder(intl, payload) : null

  dispatch(
    userInputActions.syncCurrentSimulationFormatertUttaksalderReadOnly(
      formatertUttaksalder
    )
  )
}

// Vil kalle onSetFormatertUttaksalder hver gang setCurrentSimulationFormatertUttaksalder kjører
export function createUttaksalderListener(
  startListening: AppStartListening
): Unsubscribe {
  const subscriptions = [
    startListening({
      actionCreator: userInputActions.setCurrentSimulationUttaksalder,
      effect: onSetCurrentSimulationStartAlder,
    }),
  ]

  return () => {
    subscriptions.forEach((unsubscribe) => unsubscribe())
  }
}

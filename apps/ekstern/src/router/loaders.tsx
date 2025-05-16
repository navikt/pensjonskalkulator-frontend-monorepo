import { SerializedError } from '@reduxjs/toolkit'
import { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { redirect } from 'react-router'

import { HOST_BASEURL } from '@/paths'
import {
  henvisningUrlParams,
  paths,
  stegvisningOrder,
  stegvisningOrderEndring,
} from '@/router/constants'
import { apiSlice } from '@/state/api/apiSlice'
import { store } from '@/state/store'
import { selectAfp, selectIsVeileder } from '@/state/userInput/selectors'
import {
  AFP_UFOERE_OPPSIGELSESALDER,
  isFoedselsdatoOverAlder,
} from '@/utils/alder'
import { isLoependeVedtakEndring } from '@/utils/loependeVedtak'
import { logger } from '@/utils/logging'

export type Reason =
  | 'INSUFFICIENT_LEVEL_OF_ASSURANCE'
  | 'INVALID_REPRESENTASJON'

interface ErrorData {
  reason?: Reason
}

const getErrorStatus = (
  error: FetchBaseQueryError | SerializedError | undefined
) => {
  if (!error) return undefined
  if (typeof error === 'string') return error
  if ('status' in error) return error.status
}

const getErrorData = (
  error: FetchBaseQueryError | SerializedError | undefined
): ErrorData | undefined => {
  if (!error) return undefined
  if ('data' in error) return error.data as ErrorData
}

export interface LoginContext {
  isLoggedIn: boolean
}

export async function authenticationGuard() {
  const authResponse = await fetch(`${HOST_BASEURL}/oauth2/session`)
  return { authResponse }
}

export const directAccessGuard = () => {
  const state = store.getState()
  // Dersom ingen kall er registrert i store betyr det at brukeren prøver å aksessere en url direkte
  if (
    state.api?.queries === undefined ||
    Object.keys(state.api.queries).length === 0
  ) {
    return redirect(paths.start)
  }
}

////////////////////////////////////////////////////////////////////////

export const landingPageAccessGuard = () => {
  const isVeileder = selectIsVeileder(store.getState())
  if (isVeileder) {
    return redirect(paths.start)
  }
}

////////////////////////////////////////////////////////////////////////

export const stepStartAccessGuard = async () => {
  const vedlikeholdsmodusFeatureToggleQuery = store.dispatch(
    apiSlice.endpoints.getVedlikeholdsmodusFeatureToggle.initiate()
  )
  const getPersonQuery = store.dispatch(apiSlice.endpoints.getPerson.initiate())
  const getEkskludertStatusQuery = store.dispatch(
    apiSlice.endpoints.getEkskludertStatus.initiate()
  )
  const getLoependeVedtakQuery = store.dispatch(
    apiSlice.endpoints.getLoependeVedtak.initiate()
  )

  // Henter data til senere i bakgrunnen (Unngår å vise spinner unødvendig og sparer tid for brukeren)
  store.dispatch(apiSlice.endpoints.getInntekt.initiate())
  store.dispatch(
    apiSlice.endpoints.getOmstillingsstoenadOgGjenlevende.initiate()
  )
  store.dispatch(apiSlice.endpoints.getGrunnbelop.initiate())
  store.dispatch(apiSlice.endpoints.getGradertUfoereAfpFeatureToggle.initiate())

  const [
    vedlikeholdsmodusFeatureToggle,
    getLoependeVedtakRes,
    getPersonRes,
    getEkskludertStatusRes,
  ] = await Promise.all([
    vedlikeholdsmodusFeatureToggleQuery,
    getLoependeVedtakQuery,
    getPersonQuery,
    getEkskludertStatusQuery,
  ])

  if (vedlikeholdsmodusFeatureToggle.data?.enabled) {
    return redirect(paths.kalkulatorVirkerIkke)
  }

  if (
    getEkskludertStatusRes.data?.ekskludert &&
    getEkskludertStatusRes.data?.aarsak === 'ER_APOTEKER'
  ) {
    return redirect(`${paths.henvisning}/${henvisningUrlParams.apotekerne}`)
  }

  if (!getPersonRes.isSuccess) {
    if (getErrorStatus(getPersonRes.error) === 403) {
      if (
        getErrorData(getPersonRes.error)?.reason === 'INVALID_REPRESENTASJON'
      ) {
        return redirect(paths.ingenTilgang)
      }
      if (
        getErrorData(getPersonRes.error)?.reason ===
        'INSUFFICIENT_LEVEL_OF_ASSURANCE'
      ) {
        return redirect(paths.lavtSikkerhetsnivaa)
      }
    }

    logger('info', {
      tekst: 'Redirect til /uventet-feil',
      data: `fra Step Start Loader pga. feil med getPerson med status: ${getErrorStatus(getPersonRes.error)}`,
    })
    return redirect(paths.uventetFeil)
  }

  if (!getLoependeVedtakRes.isSuccess) {
    if (getErrorStatus(getPersonRes.error) === 403) {
      if (
        getErrorData(getPersonRes.error)?.reason === 'INVALID_REPRESENTASJON'
      ) {
        return redirect(paths.ingenTilgang)
      }
      if (
        getErrorData(getPersonRes.error)?.reason ===
        'INSUFFICIENT_LEVEL_OF_ASSURANCE'
      ) {
        return redirect(paths.lavtSikkerhetsnivaa)
      }
    }

    logger('info', {
      tekst: 'Redirect til /uventet-feil',
      data: `fra Step Start Loader pga. feil med getLoependeVedtak med status: ${getErrorStatus(getLoependeVedtakRes.error)}`,
    })
    return redirect(paths.uventetFeil)
  }

  logger('info', {
    tekst: 'hent uføregrad',
    data:
      getLoependeVedtakRes.data.ufoeretrygd.grad === 0
        ? 'Ingen uføretrygd'
        : getLoependeVedtakRes.data.ufoeretrygd.grad === 100
          ? 'Hel uføretrygd'
          : `Gradert uføretrygd`,
  })

  if (getLoependeVedtakRes.data.alderspensjon) {
    logger('info', {
      tekst: 'Vedtak alderspensjon',
      data: getLoependeVedtakRes.data.alderspensjon.grad,
    })
  }

  if (getLoependeVedtakRes.data.afpPrivat) {
    logger('info', {
      tekst: 'Vedtak AFP Privat',
    })
  }

  if (getLoependeVedtakRes.data.afpOffentlig) {
    logger('info', {
      tekst: 'Vedtak AFP Offentlig',
    })
  }

  if (getLoependeVedtakRes.data.fremtidigAlderspensjon) {
    logger('info', {
      tekst: 'Fremtidig vedtak',
    })
  }

  return {
    person: getPersonRes.data,
    loependeVedtak: getLoependeVedtakRes.data,
  }
}

////////////////////////////////////////////////////////////////////////

export const stepSivilstandAccessGuard = async () => {
  if (directAccessGuard()) {
    return redirect(paths.start)
  }
  const getPersonQuery = store
    .dispatch(apiSlice.endpoints.getPerson.initiate())
    .unwrap()

  const getGrunnbelopQuery = store
    .dispatch(apiSlice.endpoints.getGrunnbelop.initiate())
    .unwrap()
    .then((grunnbelopRes) => grunnbelopRes)
    .catch(() => undefined)

  const [person, grunnbelop] = await Promise.all([
    getPersonQuery,
    getGrunnbelopQuery,
  ])

  return { person, grunnbelop }
}

////////////////////////////////////////////////////////////////////////

export const stepAFPAccessGuard = async () => {
  if (directAccessGuard()) {
    return redirect(paths.start)
  }

  // TODO: Flytte disse til der inntekt og omstillingstønad brukes
  await store.dispatch(apiSlice.endpoints.getInntekt.initiate()).unwrap()
  await store
    .dispatch(apiSlice.endpoints.getOmstillingsstoenadOgGjenlevende.initiate())
    .unwrap()

  const ekskludertStatus = await store
    .dispatch(apiSlice.endpoints.getEkskludertStatus.initiate())
    .unwrap()

  if (
    // TODO: Hva skjer om man _bare_ er eksludert, men ikke apoteker
    ekskludertStatus.ekskludert &&
    ekskludertStatus.aarsak === 'ER_APOTEKER'
  ) {
    return redirect(`${paths.henvisning}/${henvisningUrlParams.apotekerne}`)
  }

  const person = await store
    .dispatch(apiSlice.endpoints.getPerson.initiate())
    .unwrap()

  const loependeVedtak = await store
    .dispatch(apiSlice.endpoints.getLoependeVedtak.initiate())
    .unwrap()

  const stepArrays = isLoependeVedtakEndring(loependeVedtak)
    ? stegvisningOrderEndring
    : stegvisningOrder

  // Hvis brukeren mottar AFP skal hen ikke se AFP-steget
  // Hvis brukeren har 100% uføretrygd skal hen ikke se AFP-steget
  // Hvis brukeren har gradert uføretrygd og er eldre enn AFP-Uføre oppsigelsesalder skal hen ikke se AFP-steget
  if (
    loependeVedtak.afpPrivat ||
    loependeVedtak.afpOffentlig ||
    loependeVedtak.ufoeretrygd.grad === 100 ||
    (loependeVedtak.ufoeretrygd.grad &&
      person.foedselsdato &&
      isFoedselsdatoOverAlder(person.foedselsdato, AFP_UFOERE_OPPSIGELSESALDER))
  ) {
    return redirect(stepArrays[stepArrays.indexOf(paths.afp) + 1])
  } else {
    return {
      person,
      loependeVedtak,
    }
  }
}

////////////////////////////////////////////////////////////////////////

export const stepUfoeretrygdAFPAccessGuard = async () => {
  if (directAccessGuard()) {
    return redirect(paths.start)
  }

  const state = store.getState()
  const afp = selectAfp(state)
  const loependeVedtak = await store
    .dispatch(apiSlice.endpoints.getLoependeVedtak.initiate())
    .unwrap()

  const stepArrays = isLoependeVedtakEndring(loependeVedtak)
    ? stegvisningOrderEndring
    : stegvisningOrder

  // Brukere med uføretrygd som har svart ja eller vet_ikke til AFP kan se steget
  if (loependeVedtak.ufoeretrygd.grad && afp && afp !== 'nei') {
    return
  }
  return redirect(stepArrays[stepArrays.indexOf(paths.ufoeretrygdAFP) + 1])
}

////////////////////////////////////////////////////////////////////////

export const stepSamtykkeOffentligAFPAccessGuard = async () => {
  if (directAccessGuard()) {
    return redirect(paths.start)
  }

  const state = store.getState()
  const afp = selectAfp(state)
  const loependeVedtak = await store
    .dispatch(apiSlice.endpoints.getLoependeVedtak.initiate())
    .unwrap()
  const gradertUfoereAfpToggleEnabled = await store
    .dispatch(apiSlice.endpoints.getGradertUfoereAfpFeatureToggle.initiate())
    .unwrap()
    .then((result) => result.enabled)
    .catch(() => false)

  const showStep = gradertUfoereAfpToggleEnabled
    ? afp === 'ja_offentlig'
    : loependeVedtak.ufoeretrygd.grad === 0 && afp === 'ja_offentlig'

  // Bruker uten uføretrygd som svarer ja_offentlig til AFP kan se steget
  if (showStep) {
    return
  }

  const stepArrays = isLoependeVedtakEndring(loependeVedtak)
    ? stegvisningOrderEndring
    : stegvisningOrder

  return redirect(
    stepArrays[stepArrays.indexOf(paths.samtykkeOffentligAFP) + 1]
  )
}

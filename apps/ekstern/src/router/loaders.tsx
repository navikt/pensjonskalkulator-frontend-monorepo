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

export interface LoginContext {
  isLoggedIn: boolean
}

export type AuthenticationGuardLoader = { authResponse: Promise<Response> }

export async function authenticationGuard(): Promise<AuthenticationGuardLoader> {
  const authResponse = fetch(`${HOST_BASEURL}/oauth2/session`)
  return { authResponse }
}

export const directAccessGuard = async () => {
  const state = store.getState()
  // Dersom ingen kall er registrert i store betyr det at brukeren prøver å aksessere en url direkte
  if (
    state.api?.queries === undefined ||
    Object.keys(state.api.queries).length === 0
  ) {
    return redirect(paths.start)
  }
  return null
}

// ////////////////////////////////////////

export type LandingPageAccessGuardLoader = { shouldRedirectTo: Promise<string> }

export const landingPageAccessGuard = async () => {
  const isVeileder = selectIsVeileder(store.getState())
  if (isVeileder) {
    return redirect(paths.start)
  }
}

/// ////////////////////////////////////////////////////////////////////////

export type StepStartAccessGuardLoader = {
  getPersonQuery: GetPersonQuery
  getLoependeVedtakQuery: GetLoependeVedtakQuery
  shouldRedirectTo: Promise<string>
}

export const stepStartAccessGuard = async (): Promise<
  Response | StepStartAccessGuardLoader
> => {
  const featureToggle = await store
    .dispatch(apiSlice.endpoints.getVedlikeholdsmodusFeatureToggle.initiate())
    .unwrap()
    .then((result) => result.enabled)
    .catch(() => false)

  if (featureToggle) {
    return redirect(paths.kalkulatorVirkerIkke)
  }

  // Sørger for at brukeren er redirigert til henvisningsside iht. fødselsdato
  const getPersonQuery = store.dispatch(apiSlice.endpoints.getPerson.initiate())
  // Sørger for at brukeren er redirigert til henvisningsside iht. ekskludertStatus
  const getEkskludertStatusQuery = store.dispatch(
    apiSlice.endpoints.getEkskludertStatus.initiate()
  )
  // Henter løpende vedtak for endring
  const getLoependeVedtakQuery = store.dispatch(
    apiSlice.endpoints.getLoependeVedtak.initiate()
  )

  // Henter inntekt til senere
  store.dispatch(apiSlice.endpoints.getInntekt.initiate())
  // Henter omstillingsstønad-og-gjenlevende til senere
  store.dispatch(
    apiSlice.endpoints.getOmstillingsstoenadOgGjenlevende.initiate()
  )

  const shouldRedirectTo = Promise.all([
    getLoependeVedtakQuery,
    getPersonQuery,
    getEkskludertStatusQuery,
  ]).then(([getLoependeVedtakRes, getPersonRes, getEkskludertStatusRes]) => {
    if (
      getEkskludertStatusRes?.data?.ekskludert &&
      getEkskludertStatusRes?.data?.aarsak === 'ER_APOTEKER'
    ) {
      return `${paths.henvisning}/${henvisningUrlParams.apotekerne}`
    }

    if (getLoependeVedtakRes.isError) {
      logger('info', {
        tekst: 'Redirect til /uventet-feil',
        data: `fra Step Start Loader pga. feil med getLoependeVedtak med status: ${(getLoependeVedtakRes.error as FetchBaseQueryError).status}`,
      })
      return paths.uventetFeil
    }
    if (getLoependeVedtakRes.isSuccess) {
      logger('info', {
        tekst: 'hent uføregrad',
        data:
          getLoependeVedtakRes.data?.ufoeretrygd.grad === 0
            ? 'Ingen uføretrygd'
            : getLoependeVedtakRes.data?.ufoeretrygd.grad === 100
              ? 'Hel uføretrygd'
              : `Gradert uføretrygd`,
      })

      if (getLoependeVedtakRes.data?.alderspensjon) {
        logger('info', {
          tekst: 'Vedtak alderspensjon',
          data: getLoependeVedtakRes.data?.alderspensjon.grad,
        })
      }
      if (getLoependeVedtakRes.data?.afpPrivat) {
        logger('info', {
          tekst: 'Vedtak AFP Privat',
        })
      }
      if (getLoependeVedtakRes.data?.afpOffentlig) {
        logger('info', {
          tekst: 'Vedtak AFP Offentlig',
        })
      }
      if (getLoependeVedtakRes.data?.fremtidigAlderspensjon) {
        logger('info', {
          tekst: 'Fremtidig vedtak',
        })
      }
    }

    if (getPersonRes.isError) {
      if ((getPersonRes.error as FetchBaseQueryError).status === 403) {
        return paths.ingenTilgang
      } else {
        logger('info', {
          tekst: 'Redirect til /uventet-feil',
          data: `fra Step Start Loader pga. feil med getPerson med status: ${(getPersonRes.error as FetchBaseQueryError).status}`,
        })
        return paths.uventetFeil
      }
    }
    return ''
  })

  return {
    getPersonQuery,
    getLoependeVedtakQuery,
    shouldRedirectTo,
  }
}

// ///////////////////////////////////////////

export type StepSivilstandAccessGuardLoader = {
  getPersonQuery: Promise<Person>
  getGrunnbelopQuery: Promise<number | undefined>
}

export const stepSivilstandAccessGuard = async (): Promise<
  Response | StepSivilstandAccessGuardLoader
> => {
  if (await directAccessGuard()) {
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

  return {
    getPersonQuery,
    getGrunnbelopQuery,
  }
}

/// ////////////////////////////////////////////////////////////////////////

export type StepAFPAccessGuardLoader = {
  person: Person
  loependeVedtak: LoependeVedtak
}

export const stepAFPAccessGuard = async (): Promise<
  Response | StepAFPAccessGuardLoader
> => {
  if (await directAccessGuard()) {
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

/// ////////////////////////////////////////////////////////////////////////

export const stepUfoeretrygdAFPAccessGuard =
  async (): Promise<Response | null> => {
    if (await directAccessGuard()) {
      return redirect(paths.start)
    }

    const state = store.getState()
    const afp = selectAfp(state)
    const loependeVedtak =
      apiSlice.endpoints.getLoependeVedtak.select()(state).data
    if (!loependeVedtak) throw new Error('Missing loependeVedtak')

    const stepArrays = isLoependeVedtakEndring(loependeVedtak)
      ? stegvisningOrderEndring
      : stegvisningOrder

    // Brukere med uføretrygd som har svart ja eller vet_ikke til AFP kan se steget
    if (loependeVedtak.ufoeretrygd.grad && afp && afp !== 'nei') {
      return null
    }
    return redirect(stepArrays[stepArrays.indexOf(paths.ufoeretrygdAFP) + 1])
  }

/// ////////////////////////////////////////////////////////////////////////

export const stepSamtykkeOffentligAFPAccessGuard =
  async (): Promise<Response | null> => {
    if (await directAccessGuard()) {
      return redirect(paths.start)
    }

    const state = store.getState()
    const afp = selectAfp(state)
    const getLoependeVedtakResponse =
      apiSlice.endpoints.getLoependeVedtak.select(undefined)(state)

    const stepArrays = isLoependeVedtakEndring(
      getLoependeVedtakResponse.data as LoependeVedtak
    )
      ? stegvisningOrderEndring
      : stegvisningOrder

    const getGradertUfoereAfpFeatureTogglequery = store.dispatch(
      apiSlice.endpoints.getGradertUfoereAfpFeatureToggle.initiate()
    )

    // Wait for the feature toggle query to resolve
    const toggleShowGradertUfoereAfp =
      await getGradertUfoereAfpFeatureTogglequery
        .unwrap()
        .then((result) => result.enabled)
        .catch(() => false)

    const showStep = toggleShowGradertUfoereAfp
      ? afp === 'ja_offentlig'
      : (getLoependeVedtakResponse.data as LoependeVedtak).ufoeretrygd.grad ===
          0 && afp === 'ja_offentlig'

    // Bruker uten uføretrygd som svarer ja_offentlig til AFP kan se steget
    if (showStep) {
      return null
    }

    return redirect(
      stepArrays[stepArrays.indexOf(paths.samtykkeOffentligAFP) + 1]
    )
  }

// ////////////////////////////////////////

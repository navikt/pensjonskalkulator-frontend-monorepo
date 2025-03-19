import { redirect } from 'react-router'

import { FetchBaseQueryError } from '@reduxjs/toolkit/query'

import { HOST_BASEURL } from '@/paths'
import {
  externalUrls,
  henvisningUrlParams,
  paths,
  stegvisningOrder,
  stegvisningOrderEndring,
} from '@/router/constants'
import { apiSlice } from '@/state/api/apiSlice'
import { store } from '@/state/store'
import { selectIsVeileder, selectAfp } from '@/state/userInput/selectors'
import {
  isFoedselsdatoOverAlder,
  isFoedtFoer1963,
  AFP_UFOERE_OPPSIGELSESALDER,
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

export const landingPageAccessGuard =
  async (): Promise<LandingPageAccessGuardLoader> => {
    const getRedirect1963FeatureToggleQuery = store.dispatch(
      apiSlice.endpoints.getRedirect1963FeatureToggle.initiate()
    )

    const getPersonQuery = store.dispatch(
      apiSlice.endpoints.getPerson.initiate()
    )
    const shouldRedirectTo = Promise.all([
      getRedirect1963FeatureToggleQuery,
      getPersonQuery,
    ])
      .then(([getRedirect1963FeatureToggleRes, getPersonRes]) => {
        if (
          getRedirect1963FeatureToggleRes.data?.enabled &&
          getPersonRes?.isSuccess &&
          isFoedtFoer1963(getPersonRes?.data?.foedselsdato as string)
        ) {
          // Håndterer når bruker kommer tilbake på siden etter redirect - bfcache - https://web.dev/articles/bfcache
          window.addEventListener('pageshow', (event: PageTransitionEvent) => {
            if (event.persisted) {
              window.open(externalUrls.detaljertKalkulator, '_self')
            }
          })
          window.open(externalUrls.detaljertKalkulator, '_self')
          return ''
        } else {
          if (selectIsVeileder(store.getState())) {
            return paths.start
          } else {
            return ''
          }
        }
      })
      .catch(() => {
        return ''
      })
    return { shouldRedirectTo }
  }

/// ////////////////////////////////////////////////////////////////////////

export type StepStartAccessGuardLoader = {
  getPersonQuery: GetPersonQuery
  getLoependeVedtakQuery: GetLoependeVedtakQuery
  shouldRedirectTo: Promise<string>
}

export const stepStartAccessGuard =
  async (): Promise<StepStartAccessGuardLoader> => {
    const getRedirect1963FeatureToggleQuery = store.dispatch(
      apiSlice.endpoints.getRedirect1963FeatureToggle.initiate()
    )
    // Sørger for at brukeren er redirigert til henvisningsside iht. fødselsdato
    const getPersonQuery = store.dispatch(
      apiSlice.endpoints.getPerson.initiate()
    )
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
      getRedirect1963FeatureToggleQuery,
      getPersonQuery,
      getEkskludertStatusQuery,
    ]).then(
      ([
        getLoependeVedtakRes,
        getRedirect1963FeatureToggleRes,
        getPersonRes,
        getEkskludertStatusRes,
      ]) => {
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
        if (getPersonRes.isSuccess) {
          if (
            getRedirect1963FeatureToggleRes?.data?.enabled &&
            isFoedtFoer1963(getPersonRes?.data?.foedselsdato as string)
          ) {
            window.addEventListener(
              'pageshow',
              (event: PageTransitionEvent) => {
                if (event.persisted) {
                  window.open(externalUrls.detaljertKalkulator, '_self')
                }
              }
            )
            window.open(externalUrls.detaljertKalkulator, '_self')
            return ''
          }
          return ''
        }
        return ''
      }
    )

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

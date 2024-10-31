import { redirect } from 'react-router'
import { defer, LoaderFunctionArgs, useLoaderData } from 'react-router-dom'

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
import {
  selectIsVeileder,
  selectAfp,
  selectFoedselsdato,
} from '@/state/userInput/selectors'
import {
  isFoedselsdatoOverEllerLikMinUttaksalder,
  isFoedtFoer1963,
} from '@/utils/alder'
import { isLoependeVedtakEndring } from '@/utils/loependeVedtak'
import { logger } from '@/utils/logging'
import { checkHarSamboer } from '@/utils/sivilstand'

export interface LoginContext {
  isLoggedIn: boolean
}
{
  /* c8 ignore next 17 - Dette er kun for typing */
}
export function useDeferAuthenticationAccessData<
  TReturnedValue extends ReturnType<typeof authenticationDeferredLoader>,
>() {
  return useLoaderData() as ReturnType<TReturnedValue>['data']
}

export function authenticationDeferredLoader<
  TData extends {
    oauth2Query: Response
  },
>(dataFunc: (args?: LoaderFunctionArgs) => TData) {
  return (args?: LoaderFunctionArgs) =>
    defer(dataFunc(args)) as Omit<ReturnType<typeof defer>, 'data'> & {
      data: TData
    }
}

export const authenticationGuard = async () => {
  const res = fetch(`${HOST_BASEURL}/oauth2/session`)
  return defer({
    oauth2Query: res,
  })
}

export const directAccessGuard = async () => {
  // Dersom ingen kall er registrert i store betyr det at brukeren prøver å aksessere en url direkte
  if (
    store.getState().api?.queries === undefined ||
    Object.keys(store.getState().api.queries).length === 0
  ) {
    return redirect(paths.start)
  }
  return null
}

// ////////////////////////////////////////

{
  /* c8 ignore next 17 - Dette er kun for typing */
}
export function useLandingPageAccessData<
  TReturnedValue extends ReturnType<typeof landingPageDeferredLoader>,
>() {
  return useLoaderData() as ReturnType<TReturnedValue>['data']
}

export function landingPageDeferredLoader<
  TData extends {
    shouldRedirectTo: string | undefined
  },
>(dataFunc: (args?: LoaderFunctionArgs) => TData) {
  return (args?: LoaderFunctionArgs) =>
    defer(dataFunc(args)) as Omit<ReturnType<typeof defer>, 'data'> & {
      data: TData
    }
}

export const landingPageAccessGuard = async () => {
  const getRedirect1963FeatureToggleQuery = store.dispatch(
    apiSlice.endpoints.getRedirect1963FeatureToggle.initiate()
  )

  const getPersonQuery = store.dispatch(apiSlice.endpoints.getPerson.initiate())
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

  return defer({
    shouldRedirectTo,
  })
}

/// ////////////////////////////////////////////////////////////////////////
{
  /* c8 ignore next 17 - Dette er kun for typing */
}
export function useStepStartAccessData<
  TReturnedValue extends ReturnType<typeof stepStartDeferredLoader>,
>() {
  return useLoaderData() as ReturnType<TReturnedValue>['data']
}

export function stepStartDeferredLoader<
  TData extends {
    getPersonQuery: GetPersonQuery
    getLoependeVedtakQuery: GetLoependeVedtakQuery
    shouldRedirectTo: string | undefined
  },
>(dataFunc: (args?: LoaderFunctionArgs) => TData) {
  return (args?: LoaderFunctionArgs) =>
    defer(dataFunc(args)) as Omit<ReturnType<typeof defer>, 'data'> & {
      data: TData
    }
}

export const stepStartAccessGuard = async () => {
  const getRedirect1963FeatureToggleQuery = store.dispatch(
    apiSlice.endpoints.getRedirect1963FeatureToggle.initiate()
  )
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
        return paths.uventetFeil
      }

      if (getPersonRes.isError) {
        if ((getPersonRes.error as FetchBaseQueryError).status === 403) {
          return paths.ingenTilgang
        } else {
          return paths.uventetFeil
        }
      }
      if (getPersonRes.isSuccess) {
        if (
          getRedirect1963FeatureToggleRes?.data?.enabled &&
          isFoedtFoer1963(getPersonRes?.data?.foedselsdato as string)
        ) {
          window.addEventListener('pageshow', (event: PageTransitionEvent) => {
            if (event.persisted) {
              window.open(externalUrls.detaljertKalkulator, '_self')
            }
          })
          window.open(externalUrls.detaljertKalkulator, '_self')
        }
        return ''
      }
    }
  )

  return defer({
    getPersonQuery,
    getLoependeVedtakQuery,
    shouldRedirectTo,
  })
}

// ///////////////////////////////////////////
{
  /* c8 ignore next 17 - Dette er kun for typing */
}
export function useStepSivilstandAccessData<
  TReturnedValue extends ReturnType<typeof stepSivilstandDeferredLoader>,
>() {
  return useLoaderData() as ReturnType<TReturnedValue>['data']
}

export function stepSivilstandDeferredLoader<
  TData extends {
    getPersonQuery: GetPersonQuery
    shouldRedirectTo: string | undefined
  },
>(dataFunc: (args?: LoaderFunctionArgs) => TData) {
  return (args?: LoaderFunctionArgs) =>
    defer(dataFunc(args)) as Omit<ReturnType<typeof defer>, 'data'> & {
      data: TData
    }
}

export const stepSivilstandAccessGuard = async () => {
  if (await directAccessGuard()) {
    return redirect(paths.start)
  }
  let resolveRedirectUrl: (
    value: string | PromiseLike<string>
  ) => void = () => {}
  const resolveGetPerson: (
    value: null | GetPersonQuery | PromiseLike<GetPersonQuery>
  ) => void = () => {}

  const shouldRedirectTo: Promise<string> = new Promise((resolve) => {
    resolveRedirectUrl = resolve
  })

  const getPersonResponse = apiSlice.endpoints.getPerson.select(undefined)(
    store.getState()
  )
  if (
    getPersonResponse?.data?.sivilstand &&
    checkHarSamboer(getPersonResponse.data.sivilstand)
  ) {
    resolveRedirectUrl(paths.utenlandsopphold)
    resolveGetPerson(getPersonResponse)
  } else {
    resolveRedirectUrl('')
    resolveGetPerson(getPersonResponse)
  }

  return defer({
    getPersonQuery: getPersonResponse,
    shouldRedirectTo,
  })
}

/// ////////////////////////////////////////////////////////////////////////

{
  /* c8 ignore next 17 - Dette er kun for typing */
}
export function useStepAFPAccessData<
  TReturnedValue extends ReturnType<typeof stepAFPDeferredLoader>,
>() {
  return useLoaderData() as ReturnType<TReturnedValue>['data']
}

export function stepAFPDeferredLoader<
  TData extends {
    shouldRedirectTo: string | undefined
  },
>(dataFunc: (args?: LoaderFunctionArgs) => TData) {
  return (args?: LoaderFunctionArgs) =>
    defer(dataFunc(args)) as Omit<ReturnType<typeof defer>, 'data'> & {
      data: TData
    }
}

export const stepAFPAccessGuard = async () => {
  if (await directAccessGuard()) {
    return redirect(paths.start)
  }

  let resolveRedirectUrl: (
    value: string | PromiseLike<string>
  ) => void = () => {}

  const shouldRedirectTo: Promise<string> = new Promise((resolve) => {
    resolveRedirectUrl = resolve
  })

  const foedselsdato = selectFoedselsdato(store.getState())

  const hasInntektPreviouslyFailed = apiSlice.endpoints.getInntekt.select(
    undefined
  )(store.getState()).isError

  const hasOmstillingsstoenadOgGjenlevendePreviouslyFailed =
    apiSlice.endpoints.getOmstillingsstoenadOgGjenlevende.select(undefined)(
      store.getState()
    ).isError

  const hasEkskludertStatusPreviouslyFailed =
    apiSlice.endpoints.getEkskludertStatus.select(undefined)(
      store.getState()
    ).isError

  const getLoependeVedtakResponse = apiSlice.endpoints.getLoependeVedtak.select(
    undefined
  )(store.getState())

  const { ufoeretrygd, afpPrivat, afpOffentlig } =
    getLoependeVedtakResponse.data as LoependeVedtak
  const stepArrays = isLoependeVedtakEndring(
    getLoependeVedtakResponse.data as LoependeVedtak
  )
    ? stegvisningOrderEndring
    : stegvisningOrder

  // Hvis brukeren mottar AFP skal hen ikke se AFP steget
  // Hvis brukeren har uføretrygd og er eldre enn min uttaksalder skal hen ikke se AFP steget
  if (
    afpPrivat ||
    afpOffentlig ||
    (ufoeretrygd.grad &&
      foedselsdato &&
      isFoedselsdatoOverEllerLikMinUttaksalder(foedselsdato))
  ) {
    resolveRedirectUrl(stepArrays[stepArrays.indexOf(paths.afp) + 1])
  }

  // Hvis alle kallene er vellykket, resolve
  if (
    !hasInntektPreviouslyFailed &&
    !hasOmstillingsstoenadOgGjenlevendePreviouslyFailed &&
    !hasEkskludertStatusPreviouslyFailed
  ) {
    resolveRedirectUrl('')
  }
  // Hvis inntekt har feilet tidligere, prøv igjen og redirect til uventet feil ved ny feil
  if (hasInntektPreviouslyFailed) {
    store
      .dispatch(apiSlice.endpoints.getInntekt.initiate())
      .then((inntektRes) => {
        if (inntektRes.isError) {
          resolveRedirectUrl(paths.uventetFeil)
        } else if (
          apiSlice.endpoints.getOmstillingsstoenadOgGjenlevende.select(
            undefined
          )(store.getState()).isSuccess &&
          apiSlice.endpoints.getEkskludertStatus.select(undefined)(
            store.getState()
          ).isSuccess
        ) {
          resolveRedirectUrl('')
        }
      })
  }

  // Hvis omstillingsstønad-og-gjenlevende har feilet tidligere, prøv igjen og redirect til uventet feil ved ny feil
  if (hasOmstillingsstoenadOgGjenlevendePreviouslyFailed) {
    store
      .dispatch(
        apiSlice.endpoints.getOmstillingsstoenadOgGjenlevende.initiate()
      )
      .then((omstillingsstoenadOgGjenlevendeRes) => {
        if (omstillingsstoenadOgGjenlevendeRes.isError) {
          logger('info', {
            tekst: 'omstillingsstønad og gjenlevende feilet',
          })
          resolveRedirectUrl(paths.uventetFeil)
        } else if (
          apiSlice.endpoints.getInntekt.select(undefined)(store.getState())
            .isSuccess &&
          apiSlice.endpoints.getEkskludertStatus.select(undefined)(
            store.getState()
          ).isSuccess
        ) {
          resolveRedirectUrl('')
        }
      })
  }

  // Hvis ekskludertStatus har feilet tidligere, prøv igjen og redirect til uventet feil ved ny feil
  if (hasEkskludertStatusPreviouslyFailed) {
    store
      .dispatch(apiSlice.endpoints.getEkskludertStatus.initiate())
      .then((ekskludertStatusRes) => {
        if (ekskludertStatusRes.isError) {
          logger('info', {
            tekst: 'ekskludert feilet',
          })
          resolveRedirectUrl(paths.uventetFeil)
        }
        if (ekskludertStatusRes.isSuccess) {
          if (
            ekskludertStatusRes?.data?.ekskludert &&
            ekskludertStatusRes?.data?.aarsak === 'ER_APOTEKER'
          ) {
            resolveRedirectUrl(
              `${paths.henvisning}/${henvisningUrlParams.apotekerne}`
            )
          } else if (
            apiSlice.endpoints.getInntekt.select(undefined)(store.getState())
              .isSuccess &&
            apiSlice.endpoints.getOmstillingsstoenadOgGjenlevende.select(
              undefined
            )(store.getState()).isSuccess
          ) {
            resolveRedirectUrl('')
          }
        }
      })
  }

  return defer({
    shouldRedirectTo,
  })
}

/// ////////////////////////////////////////////////////////////////////////

export const stepUfoeretrygdAFPAccessGuard = async () => {
  if (await directAccessGuard()) {
    return redirect(paths.start)
  }

  const afp = selectAfp(store.getState())
  const foedselsdato = selectFoedselsdato(store.getState())
  const getLoependeVedtakResponse = apiSlice.endpoints.getLoependeVedtak.select(
    undefined
  )(store.getState())

  const stepArrays = isLoependeVedtakEndring(
    getLoependeVedtakResponse.data as LoependeVedtak
  )
    ? stegvisningOrderEndring
    : stegvisningOrder

  // Bruker med uføretrygd, som svarer ja til afp, og som er under 62 kan se steget
  if (
    (getLoependeVedtakResponse.data as LoependeVedtak).ufoeretrygd.grad &&
    afp !== 'nei' &&
    !isFoedselsdatoOverEllerLikMinUttaksalder(foedselsdato as string)
  ) {
    return null
  }
  return redirect(stepArrays[stepArrays.indexOf(paths.ufoeretrygdAFP) + 1])
}

/// ////////////////////////////////////////////////////////////////////////

export const stepSamtykkeOffentligAFPAccessGuard = async () => {
  if (await directAccessGuard()) {
    return redirect(paths.start)
  }

  const afp = selectAfp(store.getState())
  const getLoependeVedtakResponse = apiSlice.endpoints.getLoependeVedtak.select(
    undefined
  )(store.getState())

  const stepArrays = isLoependeVedtakEndring(
    getLoependeVedtakResponse.data as LoependeVedtak
  )
    ? stegvisningOrderEndring
    : stegvisningOrder
  if (
    (getLoependeVedtakResponse.data as LoependeVedtak).ufoeretrygd.grad === 0 &&
    afp === 'ja_offentlig'
  ) {
    return null
  }
  return redirect(
    stepArrays[stepArrays.indexOf(paths.samtykkeOffentligAFP) + 1]
  )
}

// ////////////////////////////////////////

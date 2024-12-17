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
import {
  selectIsVeileder,
  selectAfp,
  selectFoedselsdato,
  selectUbetingetUttaksalder,
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

export type AuthenticationGuardLoader = { authResponse: Promise<Response> }

export async function authenticationGuard(): Promise<AuthenticationGuardLoader> {
  const authResponse = fetch(`${HOST_BASEURL}/oauth2/session`)
  return { authResponse }
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
              tekst: 'Vedtak AFP Offentlig',
            })
          }
          if (getLoependeVedtakRes.data?.afpOffentlig) {
            logger('info', {
              tekst: 'Vedtak AFP Privat',
            })
          }
          if (getLoependeVedtakRes.data?.harFremtidigLoependeVedtak) {
            logger('info', {
              tekst: 'Fremtidig vedtak',
            })
          }
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
  getPersonQuery: GetPersonQuery
  shouldRedirectTo: Promise<string>
}

export const stepSivilstandAccessGuard = async (): Promise<
  Response | StepSivilstandAccessGuardLoader
> => {
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

  return {
    getPersonQuery: getPersonResponse,
    shouldRedirectTo,
  }
}

/// ////////////////////////////////////////////////////////////////////////

export type StepAFPAccessGuardLoader = {
  shouldRedirectTo: Promise<string>
}

export const stepAFPAccessGuard = async (): Promise<
  Response | StepAFPAccessGuardLoader
> => {
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
  const ubetingetUttaksalder = selectUbetingetUttaksalder(store.getState())

  // Hvis brukeren mottar AFP skal hen ikke se AFP steget
  // Hvis brukeren har uføretrygd og er eldre enn min uttaksalder skal hen ikke se AFP steget
  const redirectFromAFPSteg = (): string => {
    if (
      afpPrivat ||
      afpOffentlig ||
      (ufoeretrygd.grad &&
        foedselsdato &&
        isFoedselsdatoOverEllerLikMinUttaksalder(
          foedselsdato,
          ubetingetUttaksalder
        ))
    ) {
      return stepArrays[stepArrays.indexOf(paths.afp) + 1]
    } else {
      return ''
    }
  }

  // Hvis alle kallene er vellykket, resolve
  if (
    !hasInntektPreviouslyFailed &&
    !hasOmstillingsstoenadOgGjenlevendePreviouslyFailed &&
    !hasEkskludertStatusPreviouslyFailed
  ) {
    resolveRedirectUrl(redirectFromAFPSteg())
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
          resolveRedirectUrl(redirectFromAFPSteg())
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
          resolveRedirectUrl(redirectFromAFPSteg())
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
            resolveRedirectUrl(redirectFromAFPSteg())
          }
        }
      })
  }

  return {
    shouldRedirectTo,
  }
}

/// ////////////////////////////////////////////////////////////////////////

export const stepUfoeretrygdAFPAccessGuard =
  async (): Promise<Response | null> => {
    if (await directAccessGuard()) {
      return redirect(paths.start)
    }

    const afp = selectAfp(store.getState())
    const foedselsdato = selectFoedselsdato(store.getState())
    const getLoependeVedtakResponse =
      apiSlice.endpoints.getLoependeVedtak.select(undefined)(store.getState())
    const ubetingetUttaksalder = selectUbetingetUttaksalder(store.getState())

    const stepArrays = isLoependeVedtakEndring(
      getLoependeVedtakResponse.data as LoependeVedtak
    )
      ? stegvisningOrderEndring
      : stegvisningOrder

    // Bruker med uføretrygd, som svarer ja til afp, og som er under 62 kan se steget
    if (
      (getLoependeVedtakResponse.data as LoependeVedtak).ufoeretrygd.grad &&
      afp !== 'nei' &&
      !isFoedselsdatoOverEllerLikMinUttaksalder(
        foedselsdato as string,
        ubetingetUttaksalder
      )
    ) {
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

    const afp = selectAfp(store.getState())
    const getLoependeVedtakResponse =
      apiSlice.endpoints.getLoependeVedtak.select(undefined)(store.getState())

    const stepArrays = isLoependeVedtakEndring(
      getLoependeVedtakResponse.data as LoependeVedtak
    )
      ? stegvisningOrderEndring
      : stegvisningOrder
    if (
      (getLoependeVedtakResponse.data as LoependeVedtak).ufoeretrygd.grad ===
        0 &&
      afp === 'ja_offentlig'
    ) {
      return null
    }
    return redirect(
      stepArrays[stepArrays.indexOf(paths.samtykkeOffentligAFP) + 1]
    )
  }

// ////////////////////////////////////////

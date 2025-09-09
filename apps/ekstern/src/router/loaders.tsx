import { SerializedError } from '@reduxjs/toolkit'
import { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { LoaderFunctionArgs, redirect } from 'react-router'

import { getStepArrays } from '@/components/stegvisning/utils'
import { HOST_BASEURL } from '@/paths'
import { paths } from '@/router/constants'
import { apiSlice } from '@/state/api/apiSlice'
import { selectIsLoggedIn } from '@/state/session/selectors'
import { sessionActions } from '@/state/session/sessionSlice'
import { store } from '@/state/store'
import {
  selectAfp,
  selectIsVeileder,
  selectSkalBeregneAfpKap19,
} from '@/state/userInput/selectors'
import {
  AFP_UFOERE_OPPSIGELSESALDER,
  isFoedselsdatoOverAlder,
  isFoedtFoer1963,
} from '@/utils/alder'
import { isLoependeVedtakEndring } from '@/utils/loependeVedtak'
import { logger } from '@/utils/logging'
import { skip } from '@/utils/navigation'

export type SafeLoaderFunction<T> = (
  args: LoaderFunctionArgs
) => Promise<T | Response>

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

export const authenticationGuard = async () => {
  const response = await fetch(`${HOST_BASEURL}/oauth2/session`)
  store.dispatch(sessionActions.setLoggedIn(response.ok))
}

export const directAccessGuard = (): Response | undefined => {
  const state = store.getState()
  // Dersom ingen kall er registrert i store betyr det at brukeren prøver å aksessere en url direkte
  if (
    state.api?.queries === undefined ||
    Object.keys(state.api.queries).length === 0
  ) {
    return redirect(paths.start)
  }
  return undefined
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
  const getLoependeVedtakQuery = store.dispatch(
    apiSlice.endpoints.getLoependeVedtak.initiate()
  )

  // Henter data til senere i bakgrunnen (Unngår å vise spinner unødvendig og sparer tid for brukeren)
  store.dispatch(apiSlice.endpoints.getInntekt.initiate())
  store.dispatch(
    apiSlice.endpoints.getOmstillingsstoenadOgGjenlevende.initiate()
  )
  store.dispatch(apiSlice.endpoints.getGrunnbeloep.initiate())
  const getErApotekerQuery = store.dispatch(
    apiSlice.endpoints.getErApoteker.initiate()
  )

  const [
    vedlikeholdsmodusFeatureToggle,
    getLoependeVedtakRes,
    getPersonRes,
    getErApotekerRes,
  ] = await Promise.all([
    vedlikeholdsmodusFeatureToggleQuery,
    getLoependeVedtakQuery,
    getPersonQuery,
    getErApotekerQuery,
  ])

  if (vedlikeholdsmodusFeatureToggle.data?.enabled) {
    return redirect(paths.kalkulatorVirkerIkke)
  }

  const state = store.getState()
  const isLoggedIn = selectIsLoggedIn(state)

  if (isLoggedIn) {
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
      if (getErrorStatus(getLoependeVedtakRes.error) === 403) {
        if (
          getErrorData(getLoependeVedtakRes.error)?.reason ===
          'INVALID_REPRESENTASJON'
        ) {
          return redirect(paths.ingenTilgang)
        }
        if (
          getErrorData(getLoependeVedtakRes.error)?.reason ===
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

    const isKap19 = isFoedtFoer1963(getPersonRes.data.foedselsdato)

    logger('info', {
      tekst: 'Født før 1963',
      data: isKap19 ? 'Ja' : 'Nei',
    })

    if (getErApotekerRes.isSuccess) {
      logger('info', {
        tekst: 'Er apoteker',
        data: getErApotekerRes.data ? 'Ja' : 'Nei',
      })
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

    if (getLoependeVedtakRes.data.pre2025OffentligAfp) {
      logger('info', {
        tekst: 'Vedtak om offentlig AFP pre 2025',
      })
    }
  }

  return {
    person: getPersonRes.data,
    loependeVedtak: getLoependeVedtakRes.data,
  }
}

////////////////////////////////////////////////////////////////////////

export const stepSivilstandAccessGuard = async ({
  request,
}: LoaderFunctionArgs) => {
  if (directAccessGuard()) {
    return redirect(paths.start)
  }
  const getPersonQuery = store
    .dispatch(apiSlice.endpoints.getPerson.initiate())
    .unwrap()

  const getGrunnbeloepQuery = store
    .dispatch(apiSlice.endpoints.getGrunnbeloep.initiate())
    .unwrap()
    .then((grunnbeloepRes) => grunnbeloepRes)
    .catch(() => undefined)

  const loependeVedtak = await store
    .dispatch(apiSlice.endpoints.getLoependeVedtak.initiate())
    .unwrap()

  const erApoteker = await store
    .dispatch(apiSlice.endpoints.getErApoteker.initiate())
    .unwrap()

  const [person, grunnbeloep] = await Promise.all([
    getPersonQuery,
    getGrunnbeloepQuery,
  ])

  const isEndring = isLoependeVedtakEndring(loependeVedtak)
  const isKap19 = isFoedtFoer1963(person.foedselsdato)

  const stepArrays = getStepArrays(isEndring, isKap19 || erApoteker)

  if (isEndring && (isKap19 || erApoteker)) {
    return skip(stepArrays, paths.sivilstand, request)
  }

  return { person, grunnbeloep }
}

////////////////////////////////////////////////////////////////////////

export const stepUtenlandsoppholdAccessGuard = async ({
  request,
}: LoaderFunctionArgs) => {
  if (directAccessGuard()) {
    return redirect(paths.start)
  }

  const person = await store
    .dispatch(apiSlice.endpoints.getPerson.initiate())
    .unwrap()

  const loependeVedtak = await store
    .dispatch(apiSlice.endpoints.getLoependeVedtak.initiate())
    .unwrap()

  const erApoteker = await store
    .dispatch(apiSlice.endpoints.getErApoteker.initiate())
    .unwrap()

  const isEndring = isLoependeVedtakEndring(loependeVedtak)
  const isKap19 = isFoedtFoer1963(person.foedselsdato)

  const stepArrays = getStepArrays(isEndring, isKap19 || erApoteker)

  if (isEndring && (isKap19 || erApoteker)) {
    return skip(stepArrays, paths.utenlandsopphold, request)
  }
}

////////////////////////////////////////////////////////////////////////

export const stepAFPAccessGuard = async ({ request }: LoaderFunctionArgs) => {
  if (directAccessGuard()) {
    return redirect(paths.start)
  }

  // TODO: Flytte disse til der inntekt og omstillingstønad brukes
  await store.dispatch(apiSlice.endpoints.getInntekt.initiate()).unwrap()
  await store
    .dispatch(apiSlice.endpoints.getOmstillingsstoenadOgGjenlevende.initiate())
    .unwrap()

  const person = await store
    .dispatch(apiSlice.endpoints.getPerson.initiate())
    .unwrap()

  const loependeVedtak = await store
    .dispatch(apiSlice.endpoints.getLoependeVedtak.initiate())
    .unwrap()

  const erApoteker = await store
    .dispatch(apiSlice.endpoints.getErApoteker.initiate())
    .unwrap()

  const isEndring = isLoependeVedtakEndring(loependeVedtak)
  const isKap19 = isFoedtFoer1963(person.foedselsdato)

  const stepArrays = getStepArrays(isEndring, isKap19 || erApoteker)

  // Hvis brukeren mottar AFP skal hen ikke se AFP-steget
  // Hvis brukeren har 100% uføretrygd skal hen ikke se AFP-steget
  // Hvis brukeren har gradert uføretrygd og er eldre enn AFP-Uføre oppsigelsesalder skal hen ikke se AFP-steget
  if (
    loependeVedtak.afpPrivat ||
    loependeVedtak.afpOffentlig ||
    loependeVedtak.ufoeretrygd.grad === 100 ||
    loependeVedtak.pre2025OffentligAfp ||
    (loependeVedtak.ufoeretrygd.grad > 0 && erApoteker) ||
    (loependeVedtak.ufoeretrygd.grad &&
      person.foedselsdato &&
      isFoedselsdatoOverAlder(person.foedselsdato, AFP_UFOERE_OPPSIGELSESALDER))
  ) {
    return skip(stepArrays, paths.afp, request)
  } else if (
    (erApoteker || isKap19) &&
    loependeVedtak.fremtidigAlderspensjon &&
    !loependeVedtak.alderspensjon
  ) {
    return skip(stepArrays, paths.afp, request)
  } else if (erApoteker && isEndring) {
    return skip(stepArrays, paths.afp, request)
  } else {
    return {
      person,
      loependeVedtak,
      erApoteker,
    }
  }
}

///////////////////////////////////////////////////////////////////////////

export const stepUfoeretrygdAFPAccessGuard = async ({
  request,
}: LoaderFunctionArgs) => {
  if (directAccessGuard()) {
    return redirect(paths.start)
  }

  const state = store.getState()
  const afp = selectAfp(state)
  const loependeVedtak = await store
    .dispatch(apiSlice.endpoints.getLoependeVedtak.initiate())
    .unwrap()
  const showStep = loependeVedtak.ufoeretrygd.grad && afp && afp !== 'nei'

  const isEndring = isLoependeVedtakEndring(loependeVedtak)

  //Gjelder ikke for kap19
  const stepArrays = getStepArrays(isEndring, false)

  // Brukere med uføretrygd som har svart ja eller vet_ikke til AFP kan se steget
  if (showStep) {
    return
  }
  return skip(stepArrays, paths.ufoeretrygdAFP, request)
}

////////////////////////////////////////////////////////////////////////

export const stepSamtykkeOffentligAFPAccessGuard = async ({
  request,
}: LoaderFunctionArgs) => {
  if (directAccessGuard()) {
    return redirect(paths.start)
  }

  const appState = store.getState()
  const afp = selectAfp(appState)
  const loependeVedtak = await store
    .dispatch(apiSlice.endpoints.getLoependeVedtak.initiate())
    .unwrap()
  const showStep = afp === 'ja_offentlig'

  // Bruker uten uføretrygd som svarer ja_offentlig til AFP kan se steget
  if (showStep) {
    return
  }

  const isEndring = isLoependeVedtakEndring(loependeVedtak)

  //Gjelder ikke for kap19
  const stepArrays = getStepArrays(isEndring, false)

  return skip(stepArrays, paths.samtykkeOffentligAFP, request)
}

////////////////////////////////////////////////////////////////////////

export const stepSamtykkePensjonsavtaler = async ({
  request,
}: LoaderFunctionArgs) => {
  if (directAccessGuard()) {
    return redirect(paths.start)
  }

  const loependeVedtak = await store
    .dispatch(apiSlice.endpoints.getLoependeVedtak.initiate())
    .unwrap()

  const person = await store
    .dispatch(apiSlice.endpoints.getPerson.initiate())
    .unwrap()

  const erApoteker = await store
    .dispatch(apiSlice.endpoints.getErApoteker.initiate())
    .unwrap()

  const isEndring = isLoependeVedtakEndring(loependeVedtak)
  const isKap19 = isFoedtFoer1963(person.foedselsdato)

  const stepArrays = getStepArrays(isEndring, isKap19 || erApoteker)

  if (isEndring && (isKap19 || erApoteker)) {
    return skip(stepArrays, paths.samtykke, request)
  }

  return {
    erApoteker,
    isKap19,
  }
}

export const beregningEnkelAccessGuard = async () => {
  if (directAccessGuard()) {
    return redirect(paths.start)
  }
  const state = store.getState()
  const skalBeregneAfpKap19 = selectSkalBeregneAfpKap19(state)
  const loependeVedtak = await store
    .dispatch(apiSlice.endpoints.getLoependeVedtak.initiate())
    .unwrap()

  if (skalBeregneAfpKap19 || loependeVedtak.alderspensjon) {
    return redirect(paths.beregningAvansert)
  }
}

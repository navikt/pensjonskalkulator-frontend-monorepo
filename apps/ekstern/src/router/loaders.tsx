import { redirect } from 'react-router'
import { defer, LoaderFunctionArgs, useLoaderData } from 'react-router-dom'

import {
  BaseQueryFn,
  TypedUseQueryStateResult,
} from '@reduxjs/toolkit/query/react'

import { HOST_BASEURL } from '@/paths'
import { paths } from '@/router'
import { apiSlice } from '@/state/api/apiSlice'
import { store } from '@/state/store'

export function useDeferAuthenticationAccessData<
  TReturnedValue extends ReturnType<typeof authenticationDeferredLoader>,
>() {
  return useLoaderData() as ReturnType<TReturnedValue>['data']
}

{
  /* c8 ignore next 11 - Dette er kun for typing */
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
  try {
    const res = fetch(`${HOST_BASEURL}/oauth2/session`)

    return defer({
      oauth2Query: res,
    })
  } catch (error) {
    window.open(
      `${HOST_BASEURL}/oauth2/login?redirect=${encodeURIComponent(
        window.location.pathname
      )}`,
      '_self'
    )
  }
}

export const directAccessGuard = async () => {
  // Dersom ingen kall er registrert i store betyr det at brukeren prøver å aksessere en url direkte
  if (
    store.getState().api.queries === undefined ||
    Object.keys(store.getState().api.queries).length === 0
  ) {
    return redirect(paths.start)
  }
  return null
}

export type TpoMedlemskapQuery = TypedUseQueryStateResult<
  TpoMedlemskap,
  void,
  BaseQueryFn<Record<string, unknown>, TpoMedlemskap>
>

export function useTpoMedlemskapAccessData<
  TReturnedValue extends ReturnType<typeof tpoMedlemskapDeferredLoader>,
>() {
  return useLoaderData() as ReturnType<TReturnedValue>['data']
}

{
  /* c8 ignore next 11 - Dette er kun for typing */
}
export function tpoMedlemskapDeferredLoader<
  TData extends {
    getTpoMedlemskapQuery: TpoMedlemskapQuery
  },
>(dataFunc: (args?: LoaderFunctionArgs) => TData) {
  return (args?: LoaderFunctionArgs) =>
    defer(dataFunc(args)) as Omit<ReturnType<typeof defer>, 'data'> & {
      data: TData
    }
}

export const tpoMedlemskapAccessGuard = async () => {
  const harSamtykket = store.getState().userInput.samtykke

  // Dersom brukeren prøver å aksessere steget direkte uten å ha svart på samtykke spørsmålet sendes den til start steget
  if (harSamtykket === null) {
    return redirect(paths.start)
  }

  // Dersom brukeren samtykker kaller vi tp-registret
  if (harSamtykket) {
    const getTpoMedlemskapQuery = store.dispatch(
      apiSlice.endpoints.getTpoMedlemskap.initiate()
    )
    return defer({
      getTpoMedlemskapQuery,
    })
  } else {
    // Dersom brukeren ikke samtykker til henting av tpo behøver ikke dette steget å vises
    return redirect(paths.afp)
  }
}

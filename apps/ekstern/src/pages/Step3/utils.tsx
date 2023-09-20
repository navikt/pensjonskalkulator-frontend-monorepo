import { redirect } from 'react-router'
import { defer, LoaderFunctionArgs, useLoaderData } from 'react-router-dom'

import {
  BaseQueryFn,
  TypedUseQueryStateResult,
} from '@reduxjs/toolkit/query/react'

import { paths } from '@/router'
import { apiSlice } from '@/state/api/apiSlice'
import { store } from '@/state/store'

export const step3loader = async () => {
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

export type TpoMedlemskapQuery = TypedUseQueryStateResult<
  TpoMedlemskap,
  void,
  BaseQueryFn<Record<string, unknown>, TpoMedlemskap>
>

export function useStep3LoaderData<
  TReturnedValue extends ReturnType<typeof deferredLoader>,
>() {
  return useLoaderData() as ReturnType<TReturnedValue>['data']
}

{
  /* v8 ignore next 11 - Dette er kun for typing */
}
export function deferredLoader<
  TData extends {
    getTpoMedlemskapQuery: TpoMedlemskapQuery
  },
>(dataFunc: (args?: LoaderFunctionArgs) => TData) {
  return (args?: LoaderFunctionArgs) =>
    defer(dataFunc(args)) as Omit<ReturnType<typeof defer>, 'data'> & {
      data: TData
    }
}

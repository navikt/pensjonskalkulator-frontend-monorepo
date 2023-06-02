import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import {
  isPensjonsberegning,
  isPerson,
  isUnleashToggle,
  isUttaksalder,
} from './typeguards'
import { API_BASEURL } from '@/api/paths'

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASEURL,
  }),

  endpoints: (builder) => ({
    // Full request url med baseQuery: '${env.VITE_MSW_BASEURL}/pensjon/kalkulator/api/pensjonsberegning'
    tidligsteUttaksalder: builder.query<Uttaksalder, void>({
      query: (body) => ({
        url: '/tidligste-uttaksalder',
        method: 'POST',
        body,
      }),
      transformResponse: (response: Uttaksalder) => {
        if (!isUttaksalder(response)) {
          throw new Error(`Mottok ugyldig uttaksalder: ${response}`)
        }
        return response
      },
    }),
    getPensjonsberegning: builder.query<Pensjonsberegning[], void>({
      query: () => '/pensjonsberegning',
      transformResponse: (response: Pensjonsberegning[]) => {
        if (!isPensjonsberegning(response)) {
          throw new Error(`Mottok ugyldig pensjonsberegning: ${response}`)
        }
        return response
      },
    }),
    getPerson: builder.query<Person, void>({
      query: () => '/person',
      transformResponse: (response) => {
        if (!isPerson(response)) {
          throw new Error(`Mottok ugyldig person: ${response}`)
        }
        return response
      },
    }),
    getSpraakvelgerFeatureToggle: builder.query<UnleashToggle, void>({
      query: () => '/feature/pensjonskalkulator.disable-spraakvelger',
      transformResponse: (response: UnleashToggle) => {
        if (!isUnleashToggle(response)) {
          throw new Error(`Mottok ugyldig unleash response: ${response}`)
        }
        return response
      },
    }),
  }),
})

export const {
  useTidligsteUttaksalderQuery,
  useGetPensjonsberegningQuery,
  useGetPersonQuery,
  useGetSpraakvelgerFeatureToggleQuery,
} = apiSlice

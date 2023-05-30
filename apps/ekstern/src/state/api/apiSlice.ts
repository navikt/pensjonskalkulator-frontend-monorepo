import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import {
  isPensjonsberegning,
  isPerson,
  isTidligsteMuligeUttaksalder,
  isUnleashToggle,
} from './typeguards'
import { API_BASEURL } from '@/api/paths'

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASEURL,
  }),

  endpoints: (builder) => ({
    // Full request url med baseQuery: '${env.VITE_MSW_BASEURL}/pensjon/kalkulator/api/pensjonsberegning'
    getTidligsteMuligeUttaksalder: builder.query<Uttaksalder, void>({
      query: () => '/tidligste-uttaksalder',
      transformResponse: (response: Uttaksalder) => {
        if (!isTidligsteMuligeUttaksalder(response)) {
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
    getFeatureToggle: builder.query<UnleashToggle, { toggleName: string }>({
      query: ({ toggleName }) => ({
        url: '/unleash',
        params: { toggle: toggleName },
      }),
      transformResponse: (response: UnleashToggle) => {
        if (!isUnleashToggle(response)) {
          throw new Error(`Mottok ugyldig uttaksalder: ${response}`)
        }
        return response
      },
    }),
  }),
})

export const {
  useGetTidligsteMuligeUttaksalderQuery,
  useGetPensjonsberegningQuery,
  useGetPersonQuery,
  useGetFeatureToggleQuery,
} = apiSlice

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import {
  isInntekt,
  isPensjonsberegningArray,
  isAfpOffentlig,
  isPerson,
  isPensjonsavtale,
  isTpoMedlemskap,
  isUnleashToggle,
  isAlder,
  isEkskludertStatus,
  isUfoeregrad,
} from './typeguards'
import { API_BASEURL } from '@/paths'
import { selectVeilederBorgerFnr } from '@/state/userInput/selectors'
import { RootState } from '@/state/store'

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASEURL,
    prepareHeaders: (headers, { getState }) => {
      const veilederBorgerFnr = selectVeilederBorgerFnr(getState() as RootState)
      if (veilederBorgerFnr) {
        headers.set('fnr', veilederBorgerFnr)
      }
    },
  }),
  tagTypes: [
    'Person',
    'Inntekt',
    'EkskludertStatus',
    'Alderspensjon',
    'TidligstMuligHeltUttak',
  ],
  keepUnusedDataFor: 3600,
  endpoints: (builder) => ({
    getInntekt: builder.query<Inntekt, void>({
      query: () => '/inntekt',
      providesTags: ['Inntekt'],
      transformResponse: (response) => {
        if (!isInntekt(response)) {
          throw new Error(`Mottok ugyldig inntekt: ${response}`)
        }
        return response
      },
    }),
    getPerson: builder.query<Person, void>({
      query: () => '/v2/person',
      providesTags: ['Person'],
      transformResponse: (response) => {
        if (!isPerson(response)) {
          throw new Error(`Mottok ugyldig person: ${response}`)
        }
        return {
          ...response,
          foedselsdato: response.foedselsdato,
        }
      },
    }),
    getEkskludertStatus: builder.query<EkskludertStatus, void>({
      query: () => '/v1/ekskludert',
      providesTags: ['EkskludertStatus'],
      transformResponse: (response: any) => {
        if (!isEkskludertStatus(response)) {
          throw new Error(`Mottok ugyldig ekskludert response:`, response)
        }
        return response
      },
    }),
    getUfoeregrad: builder.query<Ufoeregrad, void>({
      query: () => '/v1/ufoeregrad',
      transformResponse: (response: any) => {
        if (!isUfoeregrad(response)) {
          throw new Error(`Mottok ugyldig ufoeregrad response:`, response)
        }
        return response
      },
    }),
    getTpoMedlemskap: builder.query<TpoMedlemskap, void>({
      query: () => '/tpo-medlemskap',
      transformResponse: (response: TpoMedlemskap) => {
        if (!isTpoMedlemskap(response)) {
          throw new Error(`Mottok ugyldig tpo-medlemskap:`, response)
        }
        return response
      },
    }),
    tidligstMuligHeltUttak: builder.query<
      Alder,
      TidligstMuligHeltUttakRequestBody | void
    >({
      query: (body) => ({
        url: '/v1/tidligste-hel-uttaksalder',
        method: 'POST',
        body,
      }),
      providesTags: ['TidligstMuligHeltUttak'],
      transformResponse: (response: Alder) => {
        if (!isAlder(response)) {
          throw new Error(`Mottok ugyldig uttaksalder: ${response}`)
        }
        return response
      },
    }),
    pensjonsavtaler: builder.query<
      { avtaler: Pensjonsavtale[]; partialResponse: boolean },
      PensjonsavtalerRequestBody
    >({
      query: (body) => ({
        url: '/v2/pensjonsavtaler',
        method: 'POST',
        body,
      }),
      transformResponse: (response: PensjonsavtalerResponseBody) => {
        if (
          !response.avtaler ||
          !Array.isArray(response.avtaler) ||
          response.avtaler.some((avtale) => !isPensjonsavtale(avtale))
        ) {
          throw new Error(`Mottok ugyldig pensjonsavtale: ${response}`)
        }
        const avtalerWithKeys = response.avtaler.map((avtale, index) => ({
          ...avtale,
          key: index,
        }))

        return {
          avtaler: avtalerWithKeys,
          partialResponse: response.utilgjengeligeSelskap.length > 0,
        }
      },
    }),

    alderspensjon: builder.query<
      AlderspensjonResponseBody,
      AlderspensjonRequestBody
    >({
      query: (body) => ({
        url: '/v5/alderspensjon/simulering',
        method: 'POST',
        body,
      }),
      providesTags: ['Alderspensjon'],
      transformResponse: (response: AlderspensjonResponseBody) => {
        if (
          !isPensjonsberegningArray(response?.alderspensjon) ||
          (response.afpPrivat &&
            !isPensjonsberegningArray(response?.afpPrivat?.afpPrivatListe)) ||
          (response.afpOffentlig && !isAfpOffentlig(response?.afpOffentlig))
        ) {
          throw new Error(
            `Mottok ugyldig alderspensjon: ${response?.alderspensjon}`
          )
        }
        return response
      },
    }),

    getSpraakvelgerFeatureToggle: builder.query<UnleashToggle, void>({
      query: () => '/feature/pensjonskalkulator.disable-spraakvelger',
      transformResponse: (response: UnleashToggle) => {
        if (!isUnleashToggle(response)) {
          throw new Error(`Mottok ugyldig unleash response:`, response)
        }
        return response
      },
    }),
    getHighchartsAccessibilityPluginFeatureToggle: builder.query<
      UnleashToggle,
      void
    >({
      query: () =>
        '/feature/pensjonskalkulator.enable-highcharts-accessibility-plugin',
      transformResponse: (response: UnleashToggle) => {
        if (!isUnleashToggle(response)) {
          throw new Error(`Mottok ugyldig unleash response:`, response)
        }
        return response
      },
    }),
    getDetaljertFaneFeatureToggle: builder.query<UnleashToggle, void>({
      query: () => '/feature/pensjonskalkulator.enable-detaljert-fane',
    }),
    getAfpOffentligFeatureToggle: builder.query<UnleashToggle, void>({
      query: () => '/feature/pensjonskalkulator.enable-afp-offentlig',
      transformResponse: (response: UnleashToggle) => {
        if (!isUnleashToggle(response)) {
          throw new Error(`Mottok ugyldig unleash response:`, response)
        }
        return response
      },
    }),
    getAnsattId: builder.query<Ansatt, void>({
      query: () => '/v1/ansatt-id',
    }),
    getUfoereFeatureToggle: builder.query<UnleashToggle, void>({
      query: () => '/feature/pensjonskalkulator.enable-ufoere',
      transformResponse: (response: UnleashToggle) => {
        if (!isUnleashToggle(response)) {
          throw new Error(`Mottok ugyldig unleash response:`, response)
        }
        return response
      },
    }),
  }),
})

export const {
  useGetAnsattIdQuery,
  useGetInntektQuery,
  useGetPersonQuery,
  useGetEkskludertStatusQuery,
  useGetTpoMedlemskapQuery,
  useTidligstMuligHeltUttakQuery,
  useAlderspensjonQuery,
  usePensjonsavtalerQuery,
  useGetSpraakvelgerFeatureToggleQuery,
  useGetHighchartsAccessibilityPluginFeatureToggleQuery,
  useGetAfpOffentligFeatureToggleQuery,
  useGetUfoereFeatureToggleQuery,
} = apiSlice

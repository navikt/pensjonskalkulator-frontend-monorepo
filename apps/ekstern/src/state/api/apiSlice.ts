import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import { API_BASEURL } from '@/paths'
import { RootState } from '@/state/store'
import {
  selectVeilederBorgerFnr,
  selectVeilederBorgerEncryptedFnr,
} from '@/state/userInput/selectors'

import {
  isInntekt,
  isAlderspensjonSimulering,
  isPerson,
  isPensjonsavtale,
  isTpoMedlemskap,
  isUnleashToggle,
  isAlder,
  isEkskludertStatus,
  isOmstillingsstoenadOgGjenlevende,
  isLoependeVedtak,
} from './typeguards'

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASEURL,
    prepareHeaders: (headers, { getState }) => {
      const veilederBorgerFnr = selectVeilederBorgerFnr(getState() as RootState)
      const veilederBorgerEncryptedFnr = selectVeilederBorgerEncryptedFnr(
        getState() as RootState
      )

      if (veilederBorgerFnr && veilederBorgerEncryptedFnr) {
        headers.set('fnr', veilederBorgerEncryptedFnr)
      }
    },
  }),
  tagTypes: ['Person', 'TpoMedlemskap', 'Alderspensjon', 'Pensjonsavtaler'],
  keepUnusedDataFor: 3600,
  endpoints: (builder) => ({
    getInntekt: builder.query<Inntekt, void>({
      query: () => '/inntekt',
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
      query: () => '/v2/ekskludert',
      transformResponse: (response) => {
        if (!isEkskludertStatus(response)) {
          throw new Error(
            `Mottok ugyldig ekskludert response:`,
            response as ErrorOptions
          )
        }
        return response
      },
    }),
    getOmstillingsstoenadOgGjenlevende: builder.query<
      OmstillingsstoenadOgGjenlevende,
      void
    >({
      query: () => '/v1/loepende-omstillingsstoenad-eller-gjenlevendeytelse',
      transformResponse: (response) => {
        if (!isOmstillingsstoenadOgGjenlevende(response)) {
          throw new Error(
            `Mottok ugyldig omstillingsstoenad og gjenlevende response:`,
            response as ErrorOptions
          )
        }
        return response
      },
    }),
    getTpoMedlemskap: builder.query<TpoMedlemskap, void>({
      query: () => '/v1/tpo-medlemskap',
      providesTags: ['TpoMedlemskap'],
      transformResponse: (response: TpoMedlemskap) => {
        if (!isTpoMedlemskap(response)) {
          throw new Error(`Mottok ugyldig tpo-medlemskap:`, response)
        }
        return response
      },
    }),
    getLoependeVedtak: builder.query<LoependeVedtak, void>({
      query: () => '/v1/vedtak/loepende-vedtak',
      transformResponse: (response) => {
        if (!isLoependeVedtak(response)) {
          throw new Error(
            `Mottok ugyldig løpende vedtak response:`,
            response as ErrorOptions
          )
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
      providesTags: ['Pensjonsavtaler'],
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
        url: '/v6/alderspensjon/simulering',
        method: 'POST',
        body,
      }),
      providesTags: ['Alderspensjon'],
      transformResponse: (response: AlderspensjonResponseBody) => {
        if (!isAlderspensjonSimulering(response)) {
          throw new Error(`Mottok ugyldig alderspensjon: ${response}`)
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
    getUtlandFeatureToggle: builder.query<UnleashToggle, void>({
      query: () => '/feature/pensjonskalkulator.enable-utland',
      transformResponse: (response: UnleashToggle) => {
        if (!isUnleashToggle(response)) {
          throw new Error(`Mottok ugyldig unleash response:`, response)
        }
        return response
      },
    }),
    getEndringFeatureToggle: builder.query<UnleashToggle, void>({
      query: () => '/feature/pensjonskalkulator.enable-endring',
      transformResponse: (response: UnleashToggle) => {
        if (!isUnleashToggle(response)) {
          throw new Error(`Mottok ugyldig unleash response:`, response)
        }
        return response
      },
    }),
    getUtvidetSimuleringsresultatFeatureToggle: builder.query<
      UnleashToggle,
      void
    >({
      query: () => '/feature/utvidet-simuleringsresultat',
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
  }),
})

export const {
  useGetAnsattIdQuery,
  useGetInntektQuery,
  useGetPersonQuery,
  useGetEkskludertStatusQuery,
  useGetOmstillingsstoenadOgGjenlevendeQuery,
  useGetLoependeVedtakQuery,
  useGetTpoMedlemskapQuery,
  useTidligstMuligHeltUttakQuery,
  useAlderspensjonQuery,
  usePensjonsavtalerQuery,
  useGetSpraakvelgerFeatureToggleQuery,
  useGetUtlandFeatureToggleQuery,
  useGetEndringFeatureToggleQuery,
  useGetUtvidetSimuleringsresultatFeatureToggleQuery,
} = apiSlice

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import { API_BASEURL } from '@/paths'
import { RootState } from '@/state/store'

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASEURL,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState
      const { veilederBorgerFnr, veilederBorgerEncryptedFnr } = state.userInput

      if (veilederBorgerFnr && veilederBorgerEncryptedFnr) {
        headers.set('fnr', veilederBorgerEncryptedFnr)
      }
    },
  }),
  tagTypes: ['Person', 'OffentligTp', 'Alderspensjon', 'Pensjonsavtaler'],
  keepUnusedDataFor: 3600,
  endpoints: (builder) => ({
    getInntekt: builder.query<Inntekt, void>({
      query: () => '/inntekt',
    }),
    getPerson: builder.query<Person, void>({
      query: () => '/v5/person',
      providesTags: ['Person'],
      transformResponse: (response: Person) => {
        return {
          ...response,
          foedselsdato: response.foedselsdato,
        }
      },
    }),
    getGrunnbeloep: builder.query<number, void>({
      query: () => 'https://g.nav.no/api/v1/grunnbel%C3%B8p',
      transformResponse: (response: { grunnbeløp: number }) => {
        if (!response.grunnbeløp) {
          throw new Error(
            `Mottok ugyldig grunnbeløp: ${JSON.stringify(response)}`
          )
        }
        return response.grunnbeløp
      },
    }),
    getErApoteker: builder.query<boolean, void>({
      query: () => '/v1/er-apoteker',
      transformResponse: (response: ApotekerStatusV1) => {
        //TODO: Endre til response.apoteker nar backend er klar
        return response.apoteker && response.aarsak === 'ER_APOTEKER'
      },
    }),
    getOmstillingsstoenadOgGjenlevende: builder.query<
      OmstillingsstoenadOgGjenlevende,
      void
    >({
      query: () => '/v1/loepende-omstillingsstoenad-eller-gjenlevendeytelse',
    }),
    getLoependeVedtak: builder.query<LoependeVedtak, void>({
      query: () => '/v4/vedtak/loepende-vedtak',
    }),

    offentligTp: builder.query<OffentligTp, OffentligTpRequestBody | void>({
      query: (body) => ({
        url: '/v2/simuler-oftp',
        method: 'POST',
        body,
      }),
      providesTags: ['OffentligTp'],
    }),

    getAfpOffentligLivsvarig: builder.query<AfpOffentligLivsvarig, void>({
      query: () => '/v1/afp-offentlig-livsvarig',
      transformResponse: (response: AfpOffentligLivsvarig) => {
        return response
      },
    }),

    tidligstMuligHeltUttak: builder.query<
      Alder,
      TidligstMuligHeltUttakRequestBody | void
    >({
      query: (body) => ({
        url: '/v2/tidligste-hel-uttaksalder',
        method: 'POST',
        body,
      }),
    }),
    pensjonsavtaler: builder.query<
      { avtaler: Pensjonsavtale[]; partialResponse: boolean },
      PensjonsavtalerRequestBody,
      PensjonsavtalerResponseBody
    >({
      query: (body) => ({
        url: '/v3/pensjonsavtaler',
        method: 'POST',
        body,
      }),
      providesTags: ['Pensjonsavtaler'],
      transformResponse: (response: PensjonsavtalerResponseBody) => {
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
        url: '/v8/alderspensjon/simulering',
        method: 'POST',
        body,
      }),
      providesTags: ['Alderspensjon'],
    }),
    getSpraakvelgerFeatureToggle: builder.query<UnleashToggle, void>({
      query: () => '/feature/pensjonskalkulator.disable-spraakvelger',
    }),
    getUtvidetSimuleringsresultatFeatureToggle: builder.query<
      UnleashToggle,
      void
    >({
      query: () => '/feature/utvidet-simuleringsresultat',
    }),
    getVedlikeholdsmodusFeatureToggle: builder.query<UnleashToggle, void>({
      query: () => '/feature/pensjonskalkulator.vedlikeholdsmodus',
    }),
    getShowDownloadPdfFeatureToggle: builder.query<UnleashToggle, void>({
      query: () => '/feature/pensjonskalkulator.show-download-pdf',
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
  useGetGrunnbeloepQuery,
  useGetErApotekerQuery,
  useGetOmstillingsstoenadOgGjenlevendeQuery,
  useGetLoependeVedtakQuery,
  useOffentligTpQuery,
  useGetAfpOffentligLivsvarigQuery,
  useTidligstMuligHeltUttakQuery,
  useAlderspensjonQuery,
  usePensjonsavtalerQuery,
  useGetSpraakvelgerFeatureToggleQuery,
  useGetVedlikeholdsmodusFeatureToggleQuery,
  useGetShowDownloadPdfFeatureToggleQuery,
  useGetUtvidetSimuleringsresultatFeatureToggleQuery,
} = apiSlice

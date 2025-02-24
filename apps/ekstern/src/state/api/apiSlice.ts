import {
  createApi,
  fetchBaseQuery,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react'

import { tpNummerTilNavn } from '@/components/Pensjonsavtaler/OffentligTjenestePensjon/utils'
import { API_BASEURL } from '@/paths'
import { RootState } from '@/state/store'

import {
  isInntekt,
  isAlderspensjonSimulering,
  isPerson,
  isPensjonsavtale,
  isOffentligTp,
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
      transformResponse: (response) => {
        if (!isInntekt(response)) {
          throw new Error(`Mottok ugyldig inntekt: ${response}`)
        }
        return response
      },
    }),
    getPerson: builder.query<Person, void>({
      query: () => '/v4/person',
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
    getGrunnbelop: builder.query<number, void>({
      query: () => 'https://g.nav.no/api/v1/grunnbel%C3%B8p',
      transformResponse: (response: { grunnbeløp: number }) => {
        if (!response.grunnbeløp) {
          throw new Error(`Mottok ugyldig grunnbeløp: ${response}`)
        }
        return response.grunnbeløp
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
    getLoependeVedtak: builder.query<LoependeVedtak, void>({
      query: () => '/v3/vedtak/loepende-vedtak',
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

    offentligTp: builder.query<OffentligTp, OffentligTpRequestBody | void>({
      queryFn: async (body, queryApi, _extraOptions, fetchWithBQ) => {
        const otpQuery = fetchWithBQ({
          url: '/v2/simuler-oftp',
          method: 'POST',
          body,
        })
        const featureToggleQuery = queryApi.dispatch(
          apiSlice.endpoints.getOtpKlpFeatureToggle.initiate()
        ) as Promise<{ data?: UnleashToggle }>

        const results = await Promise.all([otpQuery, featureToggleQuery])
        const otpResult = results[0]
        const featureToggleResult = results[1]

        if (otpResult.error) {
          return { error: otpResult.error as FetchBaseQueryError }
        }

        const data = otpResult.data
        if (!isOffentligTp(data)) {
          throw new Error(
            `Mottok ugyldig offentlig-tp: ${JSON.stringify(data)}`
          )
        }

        if (
          tpNummerTilNavn[data.simulertTjenestepensjon?.tpNummer || ''] ===
            'klp' &&
          !featureToggleResult.data?.enabled
        ) {
          data.simuleringsresultatStatus = 'TP_ORDNING_STOETTES_IKKE'
          delete data.simulertTjenestepensjon
        }

        return { data }
      },
      providesTags: ['OffentligTp'],
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
        url: '/v3/pensjonsavtaler',
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
        url: '/v8/alderspensjon/simulering',
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
    getRedirect1963FeatureToggle: builder.query<UnleashToggle, void>({
      query: () => '/feature/pensjonskalkulator.enable-redirect-1963',
      transformResponse: (response: UnleashToggle) => {
        if (!isUnleashToggle(response)) {
          throw new Error(`Mottok ugyldig unleash response:`, response)
        }
        return response
      },
    }),
    getSanityFeatureToggle: builder.query<UnleashToggle, void>({
      query: () => '/feature/pensjonskalkulator.hent-tekster-fra-sanity',
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
    getOtpKlpFeatureToggle: builder.query<UnleashToggle, void>({
      query: () => '/feature/pensjonskalkulator.vis-otp-fra-klp',
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
  useGetGrunnbelopQuery,
  useGetEkskludertStatusQuery,
  useGetOmstillingsstoenadOgGjenlevendeQuery,
  useGetLoependeVedtakQuery,
  useOffentligTpQuery,
  useTidligstMuligHeltUttakQuery,
  useAlderspensjonQuery,
  usePensjonsavtalerQuery,
  useGetSpraakvelgerFeatureToggleQuery,
  useGetRedirect1963FeatureToggleQuery,
  useGetSanityFeatureToggleQuery,
  useGetOtpKlpFeatureToggleQuery,
  useGetUtvidetSimuleringsresultatFeatureToggleQuery,
} = apiSlice

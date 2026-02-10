# RTK Query Endpoint Skill

Step-by-step guide for adding a new API endpoint to the pensjonskalkulator frontend.

All paths below are relative to `apps/ekstern/src/`.

## Files Involved

| File                              | Purpose                                        |
| --------------------------------- | ---------------------------------------------- |
| `state/api/apiSlice.ts`           | Endpoint definition (createApi)                |
| `state/api/typeguards.ts`         | Runtime response validation                    |
| `state/api/utils.ts`              | Request body builders (POST endpoints)         |
| `mocks/handlers.ts`               | MSW mock handlers                              |
| `mocks/data/`                     | Fixture JSON files                             |
| `mocks/mockedRTKQueryApiCalls.ts` | Prebuilt RTK Query cache state for unit tests  |
| `test-utils.tsx`                  | `renderWithProviders` with `preloadedApiState` |

---

## Existing Endpoints Reference

### apiSlice.ts — createApi Config

```typescript
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
      // Caseworker mode: send encrypted FNR as header
      if (veilederBorgerFnr && veilederBorgerEncryptedFnr) {
        headers.set('fnr', veilederBorgerEncryptedFnr)
      }
    },
  }),
  tagTypes: ['Person', 'OffentligTp', 'Alderspensjon', 'Pensjonsavtaler'],
  keepUnusedDataFor: 3600,
  endpoints: (builder) => ({ ... }),
})
```

### All 17 Endpoints

| #   | Name                                         | Method | URL                                                            | Request → Response                                             | Tags                  | Transform                                                                                        |
| --- | -------------------------------------------- | ------ | -------------------------------------------------------------- | -------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------ |
| 1   | `getInntekt`                                 | GET    | `/inntekt`                                                     | `void → Inntekt`                                               | —                     | —                                                                                                |
| 2   | `getPerson`                                  | GET    | `/v6/person`                                                   | `void → Person`                                                | `['Person']`          | Identity (spreads response, keeps `foedselsdato` as-is)                                          |
| 3   | `getGrunnbeloep`                             | GET    | `https://g.nav.no/api/v1/grunnbel%C3%B8p` (absolute, external) | `void → number`                                                | —                     | Extracts `response.grunnbeløp`; throws if falsy                                                  |
| 4   | `getErApoteker`                              | GET    | `/v1/er-apoteker`                                              | `void → boolean`                                               | —                     | `response.apoteker && response.aarsak === 'ER_APOTEKER'`                                         |
| 5   | `getOmstillingsstoenadOgGjenlevende`         | GET    | `/v1/loepende-omstillingsstoenad-eller-gjenlevendeytelse`      | `void → OmstillingsstoenadOgGjenlevende`                       | —                     | —                                                                                                |
| 6   | `getLoependeVedtak`                          | GET    | `/v4/vedtak/loepende-vedtak`                                   | `void → LoependeVedtak`                                        | —                     | —                                                                                                |
| 7   | `offentligTp`                                | POST   | `/v2/simuler-oftp/fra-1963`                                    | `OffentligTpRequestBody \| void → OffentligTp`                 | `['OffentligTp']`     | —                                                                                                |
| 8   | `offentligTpFoer1963`                        | POST   | `/v2/simuler-oftp/foer-1963`                                   | `OffentligTpFoer1963RequestBody \| void → OffentligTpFoer1963` | `['OffentligTp']`     | —                                                                                                |
| 9   | `getAfpOffentligLivsvarig`                   | GET    | `/v2/tpo-livsvarig-offentlig-afp`                              | `void → AfpOffentligLivsvarig`                                 | —                     | —                                                                                                |
| 10  | `tidligstMuligHeltUttak`                     | POST   | `/v3/tidligste-hel-uttaksalder`                                | `TidligstMuligHeltUttakRequestBody \| void → Alder`            | —                     | —                                                                                                |
| 11  | `pensjonsavtaler`                            | POST   | `/v3/pensjonsavtaler`                                          | `PensjonsavtalerRequestBody → { avtaler, partialResponse }`    | `['Pensjonsavtaler']` | Adds `key: index` to each avtale; sets `partialResponse` from `utilgjengeligeSelskap.length > 0` |
| 12  | `alderspensjon`                              | POST   | `/v9/alderspensjon/simulering`                                 | `AlderspensjonRequestBody → AlderspensjonResponseBody`         | `['Alderspensjon']`   | —                                                                                                |
| 13  | `getSpraakvelgerFeatureToggle`               | GET    | `/feature/pensjonskalkulator.disable-spraakvelger`             | `void → UnleashToggle`                                         | —                     | —                                                                                                |
| 14  | `getUtvidetSimuleringsresultatFeatureToggle` | GET    | `/feature/utvidet-simuleringsresultat`                         | `void → UnleashToggle`                                         | —                     | —                                                                                                |
| 15  | `getVedlikeholdsmodusFeatureToggle`          | GET    | `/feature/pensjonskalkulator.vedlikeholdsmodus`                | `void → UnleashToggle`                                         | —                     | —                                                                                                |
| 16  | `getShowDownloadPdfFeatureToggle`            | GET    | `/feature/pensjonskalkulator.show-download-pdf`                | `void → UnleashToggle`                                         | —                     | —                                                                                                |
| 17  | `getAnsattId`                                | GET    | `/v1/ansatt-id`                                                | `void → Ansatt`                                                | —                     | —                                                                                                |

### Exported Hooks

```
useGetInntektQuery, useGetPersonQuery, useGetGrunnbeloepQuery, useGetErApotekerQuery,
useGetOmstillingsstoenadOgGjenlevendeQuery, useGetLoependeVedtakQuery,
useOffentligTpQuery, useOffentligTpFoer1963Query, useGetAfpOffentligLivsvarigQuery,
useTidligstMuligHeltUttakQuery, useAlderspensjonQuery, usePensjonsavtalerQuery,
useGetSpraakvelgerFeatureToggleQuery, useGetVedlikeholdsmodusFeatureToggleQuery,
useGetShowDownloadPdfFeatureToggleQuery, useGetUtvidetSimuleringsresultatFeatureToggleQuery,
useGetAnsattIdQuery
```

---

## Step 1: Define the Endpoint

### GET Endpoint (actual pattern)

```typescript
// apiSlice.ts — inside endpoints: (builder) => ({
getInntekt: builder.query<Inntekt, void>({
  query: () => '/inntekt',
}),

// With tags:
getPerson: builder.query<Person, void>({
  query: () => '/v6/person',
  providesTags: ['Person'],
  transformResponse: (response: Person) => {
    return {
      ...response,
      foedselsdato: response.foedselsdato,
    }
  },
}),
```

### POST Endpoint (actual pattern)

```typescript
alderspensjon: builder.query<AlderspensjonResponseBody, AlderspensjonRequestBody>({
  query: (body) => ({
    url: '/v9/alderspensjon/simulering',
    method: 'POST',
    body,
  }),
  providesTags: ['Alderspensjon'],
}),
```

### transformResponse (actual patterns)

```typescript
// Extract a scalar from the response
getGrunnbeloep: builder.query<number, void>({
  query: () => 'https://g.nav.no/api/v1/grunnbel%C3%B8p',
  transformResponse: (response: { grunnbeløp: number }) => {
    if (!response.grunnbeløp) throw new Error(...)
    return response.grunnbeløp
  },
}),

// Boolean derivation from response
getErApoteker: builder.query<boolean, void>({
  query: () => '/v1/er-apoteker',
  transformResponse: (response: ApotekerStatusV1) =>
    response.apoteker && response.aarsak === 'ER_APOTEKER',
}),

// With 3 generic type params (raw response type as 3rd)
pensjonsavtaler: builder.query<
  { avtaler: Pensjonsavtale[]; partialResponse: boolean },
  PensjonsavtalerRequestBody,
  PensjonsavtalerResponseBody
>({
  query: (body) => ({ url: '/v3/pensjonsavtaler', method: 'POST', body }),
  providesTags: ['Pensjonsavtaler'],
  transformResponse: (response) => ({
    avtaler: response.avtaler.map((avtale, index) => ({ ...avtale, key: index })),
    partialResponse: response.utilgjengeligeSelskap.length > 0,
  }),
}),
```

### Tag Types

Only 4 tags exist: `'Person'`, `'OffentligTp'`, `'Alderspensjon'`, `'Pensjonsavtaler'`. Add a new tag to the `tagTypes` array only if cache invalidation is needed.

---

## Step 2: Add Type Guard

All typeguards are in `typeguards.ts`. They use `any` input with eslint-disable at the top.

### Actual patterns from the codebase

```typescript
// Simple object check
export const isInntekt = (data?: any): data is Inntekt => {
  if (data === null || data === undefined) return false
  return typeof data.beloep === 'number' && data.beloep >= 0
    && typeof data.aar === 'number' && data.aar >= 0
}

// Boolean field check
export const isOmstillingsstoenadOgGjenlevende = (
  data?: any
): data is OmstillingsstoenadOgGjenlevende => {
  return typeof data === 'object' && typeof data.harLoependeSak === 'boolean'
}

// Object with boolean
export const isUnleashToggle = (data?: any): data is UnleashToggle => {
  return typeof data === 'object' && data !== null && !Array.isArray(data)
    && typeof data.enabled === 'boolean'
}

// Complex nested validation
export const isLoependeVedtak = (data?: any): data is LoependeVedtak => {
  if (data === null || data === undefined) return false
  if (data.ufoeretrygd === null || data.ufoeretrygd === undefined) return false
  if (typeof data.ufoeretrygd !== 'object' || typeof data.ufoeretrygd.grad !== 'number')
    return false
  // Optional nested objects validated individually...
  return true
}

// Enum-like validation using higher-order function
export const isSomeEnumKey = <T extends Record<string, unknown>>(e: T) =>
  (token: unknown): token is T[keyof T] => Object.keys(e).includes(token as string)

// Array validation with element checks
export const isPensjonsberegningArray = (data?: any): data is AfpPensjonsberegning[] => {
  return Array.isArray(data) && data.every(
    (item: any) => typeof item.alder === 'number' && typeof item.beloep === 'number'
  )
}

// Nested with isAlder reuse
export const isAlder = (data?: any): data is Alder => {
  return typeof data === 'object' && data !== null && !Array.isArray(data)
    && typeof data.aar === 'number' && typeof data.maaneder === 'number'
}

export const isPerson = (data?: any): data is Person => {
  // sivilstand allows null in the valid values list
  // pensjoneringAldre validated with isAlder for nested fields
  ...
}
```

**Note:** `isAlderspensjonMaanedligVedEndring` and `isSimulertOffentligTp` return `boolean`, NOT type predicates.

---

## Step 3: Request Body Builder (POST Endpoints)

All builders are in `utils.ts`. They follow these patterns:

### Common utilities used inside builders

- `formatInntektToNumber(str)` — converts formatted string `'521 338'` → number `521338`
- `transformUtenlandsperioderArray(periods)` — converts `DD.MM.YYYY` → `YYYY-MM-DD` format
- `getSimuleringstypeFromRadioEllerVedtak(loependeVedtak, afp, skalBeregneAfpKap19?, beregningsvalg?)` — determines `AlderspensjonSimuleringstype`
- `checkHarSamboer(sivilstand)` — fallback for `epsHarInntektOver2G` when null

### `generateTidligstMuligHeltUttakRequestBody`

```typescript
export const generateTidligstMuligHeltUttakRequestBody = (args: {
  loependeVedtak: LoependeVedtak
  afp: AfpRadio | null
  sivilstand?: Sivilstand | null
  epsHarInntektOver2G: boolean | null
  epsHarPensjon: boolean | null
  aarligInntektFoerUttakBeloep: string | null
  aarligInntektVsaPensjon?: AarligInntektVsaPensjon
  utenlandsperioder: Utenlandsperiode[]
  loependeLivsvarigAfpOffentlig: AfpOffentligLivsvarig | undefined
}): TidligstMuligHeltUttakRequestBody => {
  // - simuleringstype from getSimuleringstypeFromRadioEllerVedtak (2 params: loependeVedtak + afp)
  // - epsHarInntektOver2G: falls back to checkHarSamboer(sivilstand) if null
  // - aarligInntektFoerUttakBeloep: parsed via formatInntektToNumber
  // - sivilstand: defaults to 'UOPPGITT' if null
  // - utenlandsperiodeListe: transformUtenlandsperioderArray(utenlandsperioder)
  // - innvilgetLivsvarigOffentligAfp: if all 3 fields truthy → [{ aarligBruttoBeloep: maanedligBeloep * 12, ... }]
  ...
}
```

### `generateAlderspensjonRequestBody`

```typescript
export const generateAlderspensjonRequestBody = (args: {
  loependeVedtak: LoependeVedtak
  afp: AfpRadio | null
  skalBeregneAfpKap19?: boolean | null
  sivilstand?: Sivilstand | null
  epsHarInntektOver2G: boolean | null
  epsHarPensjon: boolean | null
  foedselsdato: string | undefined
  aarligInntektFoerUttakBeloep: string | null
  gradertUttak: GradertUttak | null
  heltUttak?: HeltUttak
  utenlandsperioder: Utenlandsperiode[]
  beregningsvalg?: Beregningsvalg | null
  afpInntektMaanedFoerUttak?: boolean | null
  loependeLivsvarigAfpOffentlig: AfpOffentligLivsvarig | undefined
}): AlderspensjonRequestBody | undefined => {
  // Returns undefined if !foedselsdato || !heltUttak
  // Uses all 4 params for getSimuleringstypeFromRadioEllerVedtak
  // foedselsdato parsed from ISO → DATE_BACKEND_FORMAT
  // epsHarInntektOver2G: null → undefined (NOT checkHarSamboer like tidligstMulig)
  // gradertUttak: formats aarligInntektVsaPensjonBeloep to number
  // Same innvilgetLivsvarigOffentligAfp pattern
  ...
}
```

### `generatePensjonsavtalerRequestBody`

```typescript
export const generatePensjonsavtalerRequestBody = (args: {
  aarligInntektFoerUttakBeloep: string | null
  ufoeregrad: number | undefined
  afp: AfpRadio | null
  sivilstand?: Sivilstand | null
  epsHarInntektOver2G: boolean | null
  epsHarPensjon: boolean | null
  heltUttak: HeltUttak
  gradertUttak?: GradertUttak | null
  skalBeregneAfpKap19?: boolean | null
}): PensjonsavtalerRequestBody => {
  // harAfp: !ufoeregrad && afp === 'ja_privat' (only private AFP)
  // Always sends grad: 100 (private pensjonsavtaler don't support graded)
  // skalBeregneAfpKap19 overrides uttaksalder to { aar: 67, maaneder: 0 }
  // epsHarInntektOver2G: falls back to checkHarSamboer(sivilstand)
  ...
}
```

### `generateOffentligTpRequestBody`

```typescript
export const generateOffentligTpRequestBody = (args: {
  afp: AfpRadio | null
  foedselsdato: string | undefined
  sivilstand?: Sivilstand | null
  epsHarPensjon: boolean | null
  epsHarInntektOver2G: boolean | null
  aarligInntektFoerUttakBeloep: string | null
  gradertUttak?: GradertUttak | null
  heltUttak?: HeltUttak
  utenlandsperioder: Utenlandsperiode[]
  erApoteker?: boolean
}): OffentligTpRequestBody | undefined => {
  // Returns undefined if !foedselsdato || !heltUttak
  // brukerBaOmAfp: afp === 'ja_offentlig' || afp === 'ja_privat'
  // gradertUttak: only sends uttaksalder and aarligInntektVsaPensjonBeloep (strips grad)
  // erApoteker: passed through directly
  ...
}
```

### `generateOffentligTpFoer1963RequestBody`

```typescript
// Returns undefined if !foedselsdato || !heltUttak
// simuleringstype: skalBeregneAfpKap19 ? 'PRE2025_OFFENTLIG_AFP_ETTERFULGT_AV_ALDERSPENSJON' : 'ALDERSPENSJON'
// stillingsprosentOffHeltUttak: converted to String, defaults to '0'
// afpOrdning: 'AFPSTAT' if skalBeregneAfpKap19, else undefined
```

### `generateAlderspensjonEnkelRequestBody`

```typescript
// Simpler version — no gradertUttak, no beregningsvalg, no skalBeregneAfpKap19
// heltUttak is built as { uttaksalder } only (no income alongside)
// Uses only 2 params for simuleringstype (loependeVedtak + afp)
```

---

## Step 4: MSW Mock Handler

File: `mocks/handlers.ts`. The `getHandlers(baseUrl)` function exports all handlers. `delay(30)` in browser, `delay(0)` in test.

### GET handler (actual pattern)

```typescript
http.get(`${baseUrl}/inntekt`, async () => {
  const data = await import('./data/inntekt.json', { with: { type: 'json' } })
  await delay(TEST_DELAY)
  return HttpResponse.json(data.default)
}),
```

### GET with conditional error responses (actual pattern — getPerson)

```typescript
http.get(`${baseUrl}/v6/person`, async ({ request }) => {
  // Reads fnr header for veileder mode error simulation:
  // '40100000000' → 401, '40300000001' → 403 INVALID_REPRESENTASJON,
  // '40300000002' → 403 INSUFFICIENT_LEVEL, '40400000000' → 404
  const data = await import('./data/person.json', { with: { type: 'json' } })
  await delay(TEST_DELAY)
  return HttpResponse.json(data.default)
}),
```

### POST with dynamic fixture loading (actual pattern — alderspensjon)

```typescript
http.post(`${baseUrl}/v9/alderspensjon/simulering`, async ({ request }) => {
  const body = (await request.json()) as AlderspensjonRequestBody
  const aar = body.heltUttak.uttaksalder.aar
  const data = await import(`./data/alderspensjon/${aar}.json`, { with: { type: 'json' } })
  await delay(TEST_DELAY)
  // Merges AFP data based on simuleringstype:
  // 'ALDERSPENSJON_MED_AFP_PRIVAT' → loads afp-privat/{aar}.json
  // 'ALDERSPENSJON_MED_AFP_OFFENTLIG_LIVSVARIG' → loads afp-offentlig.json
  // 'PRE2025_OFFENTLIG_AFP_ETTERFULGT_AV_ALDERSPENSJON' → returns afp-etterfulgt-alderspensjon.json directly
  // ENDRING_ variants handled similarly
  return HttpResponse.json({ ...data.default, ...afpData })
}),
```

### POST with body-based fixture (actual pattern — pensjonsavtaler)

```typescript
http.post(`${baseUrl}/v3/pensjonsavtaler`, async ({ request }) => {
  const body = (await request.json()) as PensjonsavtalerRequestBody
  const aar = body.uttaksperioder[0].startAlder.aar
  const data = await import(`./data/pensjonsavtaler/${aar}.json`, { with: { type: 'json' } })
  await delay(TEST_DELAY)
  return HttpResponse.json(data.default)
}),
```

### External URL handler (actual pattern — grunnbeløp)

```typescript
http.get('https://g.nav.no/api/v1/grunnbel%C3%B8p', async () => {
  await delay(TEST_DELAY)
  return HttpResponse.json({ grunnbeløp: 100000, ... })
}),
// Also handle the non-encoded version
http.get('https://g.nav.no/api/v1/grunnbeløp', async () => { ... }),
```

### Feature toggle handler (actual pattern)

```typescript
http.get(`${baseUrl}/feature/pensjonskalkulator.disable-spraakvelger`, async () => {
  const data = await import('./data/unleash-disable-spraakvelger.json', { with: { type: 'json' } })
  await delay(TEST_DELAY)
  return HttpResponse.json(data.default)
}),
```

### Test server override helpers (`mocks/server.ts`)

```typescript
// Override a handler at test runtime:
mockResponse('/v6/person', { json: { ... }, status: 200 })
mockErrorResponse('/v6/person', { status: 500 })
// These call server.use(http[method](...)) to add a runtime handler
```

---

## Step 5: Fixture Data

### Fixture file structures (actual data)

**`data/inntekt.json`**

```json
{ "beloep": 521338, "aar": 2021 }
```

**`data/person.json`**

```json
{
	"navn": "Aprikos Nordmann",
	"fornavn": "Aprikos",
	"sivilstand": "UGIFT",
	"foedselsdato": "1964-04-30",
	"pensjoneringAldre": {
		"normertPensjoneringsalder": { "aar": 67, "maaneder": 0 },
		"nedreAldersgrense": { "aar": 62, "maaneder": 0 },
		"oevreAldersgrense": { "aar": 75, "maaneder": 0 }
	}
}
```

**`data/loepende-vedtak.json`**

```json
{ "harLoependeVedtak": false, "ufoeretrygd": { "grad": 0 } }
```

**`data/tidligstMuligHeltUttak.json`**

```json
{ "aar": 65, "maaneder": 3 }
```

**`data/er-apoteker.json`**

```json
{ "apoteker": false, "aarsak": "NONE" }
```

**`data/omstillingsstoenad-og-gjenlevende.json`**

```json
{ "harLoependeSak": true }
```

**`data/afp-offentlig-livsvarig.json`**

```json
{
	"afpStatus": true,
	"maanedligBeloep": 25000,
	"virkningFom": "2023-01-01",
	"sistBenyttetGrunnbeloep": 118620
}
```

**`data/ansatt-id.json`**

```json
{ "id": "ABC123" }
```

**`data/unleash-*.json`** (feature toggles)

```json
{ "enabled": false }
```

**`data/alderspensjon/{62-75}.json`** — one file per start age, each containing:

```json
{
  "alderspensjon": [
    { "alder": 62, "beloep": 200000, "inntektspensjonBeloep": ..., "garantipensjonBeloep": ..., "delingstall": ..., ... }
  ],
  "vilkaarsproeving": { "vilkaarErOppfylt": true },
  "harForLiteTrygdetid": false,
  "trygdetid": 40,
  "opptjeningGrunnlagListe": [...]
}
```

**`data/pensjonsavtaler/{62-75}.json`** — one file per start age:

```json
{
	"avtaler": [
		{
			"produktbetegnelse": "Egen pensjonskonto",
			"kategori": "PRIVAT_TJENESTEPENSJON",
			"startAar": 62,
			"sluttAar": 77,
			"utbetalingsperioder": [
				{
					"startAlder": { "aar": 62, "maaneder": 0 },
					"sluttAlder": { "aar": 77, "maaneder": 0 },
					"aarligUtbetaling": 41802,
					"grad": 100
				}
			]
		}
	],
	"utilgjengeligeSelskap": []
}
```

**`data/afp-privat/{62-75}.json`**

```json
{ "afpPrivat": [{ "alder": 62, "beloep": 49059 }, ...] }
```

**`data/offentlig-tp.json`**

```json
{
	"simuleringsresultatStatus": "OK",
	"muligeTpLeverandoerListe": ["SPK", "KLP", "OPF"],
	"simulertTjenestepensjon": {
		"tpLeverandoer": "SPK",
		"tpNummer": "3010",
		"simuleringsresultat": {
			"utbetalingsperioder": [
				{
					"startAlder": { "aar": 67, "maaneder": 0 },
					"sluttAlder": { "aar": 69, "maaneder": 11 },
					"aarligUtbetaling": 64340
				}
			],
			"betingetTjenestepensjonErInkludert": true
		}
	}
}
```

---

## Step 6: Use in Components

```typescript
// Auto-generated hook
const { data, isLoading, error } = useGetInntektQuery()

// Selector pattern (used in selectors.ts)
const selectPersonResponse = apiSlice.endpoints.getPerson.select()
const selectFoedselsdato = createSelector(
	selectPersonResponse,
	(personResponse) => personResponse.data?.foedselsdato
)

// Dispatch initiate (used in loaders)
const result = await store
	.dispatch(apiSlice.endpoints.getPerson.initiate())
	.unwrap()
```

---

## Step 7: Test with Preloaded API State

### How `preloadedApiState` works

In `test-utils.tsx`, `renderWithProviders` accepts `preloadedApiState` — a map of endpoint names to their response data. It uses `apiSlice.util.upsertQueryEntries` to inject cache state:

```typescript
// Type definition:
preloadedApiState?: {
  [Key in QueryKeys]?: Parameters<typeof apiSlice.util.upsertQueryData<Key>>[2]
}

// Internal implementation:
store.dispatch(
  apiSlice.util.upsertQueryEntries(
    Object.entries(preloadedApiState).map(([key, value]) => ({
      endpointName: key as QueryKeys,
      arg: undefined,
      value,
    }))
  )
)
```

### Usage in tests

```typescript
import { render, screen } from '@/test-utils'

it('renders with preloaded data', () => {
  render(<MyComponent />, {
    preloadedApiState: {
      getPerson: {
        navn: 'Aprikos Nordmann',
        fornavn: 'Aprikos',
        sivilstand: 'UGIFT',
        foedselsdato: '1963-04-30',
        pensjoneringAldre: {
          normertPensjoneringsalder: { aar: 67, maaneder: 0 },
          nedreAldersgrense: { aar: 62, maaneder: 0 },
          oevreAldersgrense: { aar: 75, maaneder: 0 },
        },
      },
      getInntekt: { beloep: 521338, aar: 2021 },
      getLoependeVedtak: { harLoependeVedtak: false, ufoeretrygd: { grad: 0 } },
    },
  })
})
```

### Prebuilt cache objects (`mockedRTKQueryApiCalls.ts`)

For older-style tests that use `preloadedState` directly (injecting into the `api` reducer), prebuilt objects exist. The key format is `'endpointName(undefined)'`:

```typescript
export const fulfilledGetPerson = {
  ['getPerson(undefined)']: {
    status: 'fulfilled',
    endpointName: 'getPerson',
    requestId: 'xTaE6mOydr5ZI75UXq4Wi',
    startedTimeStamp: 1688046411971,
    data: personMock,
    fulfilledTimeStamp: 1688046412103,
  },
}

// Usage in tests with preloadedState:
render(<MyComponent />, {
  preloadedState: {
    api: { queries: { ...fulfilledGetPerson, ...fulfilledGetInntekt } },
  },
})
```

**Prefer `preloadedApiState` (simpler) over `preloadedState` with raw cache objects.**

### Available prebuilt mocks

| Export                                               | Data                                |
| ---------------------------------------------------- | ----------------------------------- |
| `personMock` / `fulfilledGetPerson`                  | Standard person (1963-04-30, UGIFT) |
| `fulfilledPre1963GetPerson`                          | Person born 1960-04-30              |
| `fulfilledGetGrunnbeloep`                            | Grunnbeløp number                   |
| `fulfilledGetInntekt`                                | `{ beloep: 521338, aar: 2021 }`     |
| `fulfilledGetErApoteker`                             | Apoteker status                     |
| `fulfilledGetOmstillingsstoenadOgGjenlevendeUtenSak` | `{ harLoependeSak: false }`         |
| `fulfilledGetLoependeVedtak0Ufoeregrad`              | No uføretrygd                       |
| `fulfilledGetLoependeVedtak100Ufoeregrad`            | 100% uføretrygd                     |
| `fulfilledGetLoependeVedtak75Ufoeregrad`             | 75% uføretrygd                      |
| `fulfilledGetLoependeVedtakLoependeAlderspensjon`    | Existing alderspensjon vedtak       |
| `fulfilledGetLoependeVedtakAfpPrivat`                | AFP privat vedtak                   |
| `fulfilledGetLoependeVedtakAfpOffentlig`             | AFP offentlig vedtak                |
| `fulfilledsimulerOffentligTp`                        | OffentligTp simulation result       |
| `fulfilledPensjonsavtaler`                           | Pensjonsavtaler result              |
| `fulfilledAlderspensjonForLiteTrygdetid`             | For lite trygdetid result           |
| `fulfilledGetAfpOffentligLivsvarigFalse`             | AFP offentlig livsvarig (false)     |

---

## Step 8: Tag Invalidation

Tags control cache invalidation. Current tag usage:

| Tag                 | Provided by                          | Purpose                              |
| ------------------- | ------------------------------------ | ------------------------------------ |
| `'Person'`          | `getPerson`                          | Person data cache                    |
| `'OffentligTp'`     | `offentligTp`, `offentligTpFoer1963` | Offentlig tjenestepensjon simulation |
| `'Alderspensjon'`   | `alderspensjon`                      | Alderspensjon simulation             |
| `'Pensjonsavtaler'` | `pensjonsavtaler`                    | Pensjonsavtaler lookup               |

There are currently **no mutation endpoints** and **no `invalidatesTags`** in the codebase. All endpoints are queries. Cache lasts `keepUnusedDataFor: 3600` (1 hour).

---

## Types

Types are generated from the backend OpenAPI spec:

```bash
cd apps/ekstern
pnpm fetch-dev-types
```

This generates `src/types/schema.d.ts` — **never hand-edit this file**.

Types like `Inntekt`, `Person`, `LoependeVedtak`, `Alder`, `Sivilstand`, `AlderspensjonRequestBody`, `AlderspensjonResponseBody`, etc. come from this generated file.

---

## Checklist

- [ ] Endpoint defined in `apiSlice.ts` with correct types, URL, method
- [ ] Hook exported (auto-generated by RTK Query from endpoint name)
- [ ] Type guard in `typeguards.ts` using `any` input, validating all fields
- [ ] Request body builder in `utils.ts` (POST endpoints) using `formatInntektToNumber`, `transformUtenlandsperioderArray`, etc.
- [ ] MSW handler in `handlers.ts` inside `getHandlers()` with `await delay(TEST_DELAY)` and dynamic `import()`
- [ ] Fixture JSON in `mocks/data/` matching actual backend response shape
- [ ] Prebuilt cache mock in `mockedRTKQueryApiCalls.ts` if endpoint will be commonly used in tests
- [ ] Tests written using `preloadedApiState` in `renderWithProviders`
- [ ] Tag type added to `tagTypes` array if cache invalidation needed
- [ ] Types generated via `pnpm fetch-dev-types` or manually defined

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

## Step 1: Define the Endpoint

The API slice is in `apiSlice.ts` using `createApi` with `fetchBaseQuery` at `API_BASEURL`. Veileder mode sends encrypted FNR via `prepareHeaders`. Tags: `'Person'`, `'OffentligTp'`, `'Alderspensjon'`, `'Pensjonsavtaler'`. Cache TTL: `keepUnusedDataFor: 3600`.

### GET Endpoint

```typescript
getMyData: builder.query<MyType, void>({
  query: () => '/v1/my-endpoint',
  providesTags: ['MyTag'],  // only if cache invalidation needed
}),
```

### POST Endpoint

```typescript
myMutation: builder.query<ResponseType, RequestBody>({
  query: (body) => ({
    url: '/v1/my-endpoint',
    method: 'POST',
    body,
  }),
  providesTags: ['MyTag'],
}),
```

### transformResponse

```typescript
// Extract a scalar
getGrunnbeloep: builder.query<number, void>({
  query: () => 'https://g.nav.no/api/v1/grunnbel%C3%B8p',
  transformResponse: (response: { grunnbeløp: number }) => {
    if (!response.grunnbeløp) throw new Error(...)
    return response.grunnbeløp
  },
}),

// Boolean derivation
getErApoteker: builder.query<boolean, void>({
  query: () => '/v1/er-apoteker',
  transformResponse: (response: ApotekerStatusV1) =>
    response.apoteker && response.aarsak === 'ER_APOTEKER',
}),
```

> Search `apiSlice.ts` for all 17 endpoints and their hooks (auto-generated from endpoint names).

---

## Step 2: Add Type Guard

All typeguards are in `typeguards.ts`. They use `any` input with eslint-disable.

```typescript
// Simple object check
export const isInntekt = (data?: any): data is Inntekt => {
	if (data === null || data === undefined) return false
	return (
		typeof data.beloep === 'number' &&
		data.beloep >= 0 &&
		typeof data.aar === 'number' &&
		data.aar >= 0
	)
}

// Nested validation with reuse
export const isAlder = (data?: any): data is Alder => {
	return (
		typeof data === 'object' &&
		data !== null &&
		!Array.isArray(data) &&
		typeof data.aar === 'number' &&
		typeof data.maaneder === 'number'
	)
}
```

**Note:** Some guards (like `isAlderspensjonMaanedligVedEndring`) return `boolean`, NOT type predicates.

> See `typeguards.ts` for the full set including `isPerson`, `isLoependeVedtak`, `isPensjonsberegningArray`, `isSomeEnumKey`.

---

## Step 3: Request Body Builder (POST Endpoints)

All builders are in `utils.ts`. Common utilities:

- `formatInntektToNumber(str)` — `'521 338'` → `521338`
- `transformUtenlandsperioderArray(periods)` — `DD.MM.YYYY` → `YYYY-MM-DD`
- `getSimuleringstypeFromRadioEllerVedtak(loependeVedtak, afp, skalBeregneAfpKap19?, beregningsvalg?)` — determines `AlderspensjonSimuleringstype`
- `checkHarSamboer(sivilstand)` — fallback for `epsHarInntektOver2G` when null

### Available builders

| Builder                                     | Key behavior                                                                         |
| ------------------------------------------- | ------------------------------------------------------------------------------------ |
| `generateTidligstMuligHeltUttakRequestBody` | Uses 2-param simuleringstype; `epsHarInntektOver2G` falls back to `checkHarSamboer`  |
| `generateAlderspensjonRequestBody`          | Returns `undefined` if `!foedselsdato \|\| !heltUttak`; uses 4-param simuleringstype |
| `generateAlderspensjonEnkelRequestBody`     | Simpler — no gradertUttak, no beregningsvalg                                         |
| `generatePensjonsavtalerRequestBody`        | `harAfp: !ufoeregrad && afp === 'ja_privat'`; always sends `grad: 100`               |
| `generateOffentligTpRequestBody`            | `brukerBaOmAfp: afp === 'ja_offentlig' \|\| 'ja_privat'`                             |
| `generateOffentligTpFoer1963RequestBody`    | Uses `skalBeregneAfpKap19` for simuleringstype + `afpOrdning`                        |

> Search `utils.ts` for full function signatures and implementation details.

---

## Step 4: MSW Mock Handler

File: `mocks/handlers.ts`. The `getHandlers(baseUrl)` function exports all handlers. `delay(30)` in browser, `delay(0)` in test.

### GET handler

```typescript
http.get(`${baseUrl}/v1/my-endpoint`, async () => {
  const data = await import('./data/my-endpoint.json', { with: { type: 'json' } })
  await delay(TEST_DELAY)
  return HttpResponse.json(data.default)
}),
```

### POST with dynamic fixture

```typescript
http.post(`${baseUrl}/v9/alderspensjon/simulering`, async ({ request }) => {
  const body = (await request.json()) as AlderspensjonRequestBody
  const aar = body.heltUttak.uttaksalder.aar
  const data = await import(`./data/alderspensjon/${aar}.json`, { with: { type: 'json' } })
  await delay(TEST_DELAY)
  return HttpResponse.json(data.default)
}),
```

### Test server override helpers (`mocks/server.ts`)

```typescript
mockResponse('/v6/person', { json: { ... }, status: 200 })
mockErrorResponse('/v6/person', { status: 500 })
```

---

## Step 5: Fixture Data

Place JSON fixtures in `mocks/data/`. Key shapes:

```json
// data/inntekt.json
{ "beloep": 521338, "aar": 2021 }

// data/person.json
{ "navn": "Aprikos Nordmann", "fornavn": "Aprikos", "sivilstand": "UGIFT",
  "foedselsdato": "1964-04-30", "pensjoneringAldre": {
    "normertPensjoneringsalder": { "aar": 67, "maaneder": 0 },
    "nedreAldersgrense": { "aar": 62, "maaneder": 0 },
    "oevreAldersgrense": { "aar": 75, "maaneder": 0 } } }

// data/loepende-vedtak.json
{ "harLoependeVedtak": false, "ufoeretrygd": { "grad": 0 } }
```

Dynamic fixtures use age-based directories: `data/alderspensjon/{62-75}.json`, `data/pensjonsavtaler/{62-75}.json`, `data/afp-privat/{62-75}.json`.

> Browse `mocks/data/` for all fixture files and their shapes.

---

## Step 6: Use in Components

```typescript
// Auto-generated hook
const { data, isLoading, error } = useGetMyDataQuery()

// Selector pattern (used in selectors.ts)
const selectMyResponse = apiSlice.endpoints.getMyData.select()

// Dispatch initiate (used in loaders)
const result = await store
	.dispatch(apiSlice.endpoints.getMyData.initiate())
	.unwrap()
```

---

## Step 7: Test with Preloaded API State

Use `preloadedApiState` in `render()` — each key is an endpoint name, value is the response data:

```typescript
render(<MyComponent />, {
  preloadedApiState: {
    getPerson: { navn: 'Aprikos Nordmann', fornavn: 'Aprikos', sivilstand: 'UGIFT',
      foedselsdato: '1963-04-30', pensjoneringAldre: { ... } },
    getInntekt: { beloep: 521338, aar: 2021 },
    getLoependeVedtak: { harLoependeVedtak: false, ufoeretrygd: { grad: 0 } },
  },
})
```

Reusable mock objects are also available: `personMock`, `loependeVedtak0UfoeregradMock` from `@/mocks/mockedRTKQueryApiCalls`.

**Prefer `preloadedApiState` over raw `preloadedState` with cache objects.** Raw cache entries (`fulfilledGetPerson`, etc.) are for guard tests that mock `store.getState()`.

> See the **vitest-testing** skill for full test patterns and the list of all prefab cache entries.

---

## Types

Types are generated from the backend OpenAPI spec:

```bash
cd apps/ekstern && pnpm fetch-dev-types
```

This generates `src/types/schema.d.ts` — **never hand-edit this file**.

---

## Checklist

- [ ] Endpoint defined in `apiSlice.ts` with correct types, URL, method
- [ ] Hook exported (auto-generated by RTK Query)
- [ ] Type guard in `typeguards.ts`
- [ ] Request body builder in `utils.ts` (POST endpoints)
- [ ] MSW handler in `handlers.ts` with `await delay(TEST_DELAY)` and dynamic `import()`
- [ ] Fixture JSON in `mocks/data/`
- [ ] Tests with `preloadedApiState`
- [ ] Tag type added to `tagTypes` array if cache invalidation needed

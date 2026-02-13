# Step Flow Skill

Guide for adding a new step to the pensjonskalkulator wizard in `apps/ekstern`.

## Architecture Overview

The wizard uses React Router loaders as guards. Each step has:

1. A **path constant** in `src/router/constants.ts`
2. A position in one or more **step order arrays** (also in `constants.ts`)
3. A **guard/loader** in `src/router/loaders.tsx` that fetches data and decides skip/redirect
4. A **route entry** in `src/router/routes.tsx`
5. A **page component** in `src/pages/Step*/` that wires Redux ↔ navigation ↔ form component
6. A **stegvisning form component** in `src/components/stegvisning/*/` that renders the UI

---

## Step 1: Add Path Constant

File: `src/router/constants.ts`

The `paths` object contains every route path. Existing paths:

```typescript
export const paths = {
	root: '/',
	login: '/login',
	start: '/start',
	samtykke: '/samtykke',
	utenlandsopphold: '/utenlandsopphold',
	afp: '/afp',
	samtykkeOffentligAFP: '/samtykke-offentlig-afp',
	ufoeretrygdAFP: '/ufoeretrygd-afp',
	sivilstand: '/sivilstand',
	uventetFeil: '/uventet-feil',
	ingenTilgang: '/ingen-tilgang',
	beregningEnkel: '/beregning',
	beregningAvansert: '/beregning-detaljert',
	forbehold: '/forbehold',
	kalkulatorVirkerIkke: '/kalkulatoren-virker-ikke',
	lavtSikkerhetsnivaa: '/for-lavt-sikkerhetsnivaa',
} as const
```

Add your new path:

```typescript
export const paths = {
	// ... existing paths
	myNewStep: '/my-new-step',
} as const
```

---

## Step 2: Add to Step Order Array(s)

There are 3 step order arrays in `src/router/constants.ts`. You must decide which flow(s) your step belongs to.

### Default flow (`stegvisningOrder`)

```typescript
export const stegvisningOrder = [
	paths.login,
	paths.start,
	paths.sivilstand,
	paths.utenlandsopphold,
	paths.afp,
	paths.ufoeretrygdAFP,
	paths.samtykkeOffentligAFP,
	paths.samtykke,
	paths.beregningEnkel,
] as const
```

### Endring flow (`stegvisningOrderEndring`) — for users amending existing pension

Skips sivilstand, utenlandsopphold, samtykke. Ends at avansert beregning.

```typescript
export const stegvisningOrderEndring = [
	paths.login,
	paths.start,
	paths.afp,
	paths.ufoeretrygdAFP,
	paths.samtykkeOffentligAFP,
	paths.beregningAvansert,
] as const
```

### Kap19 flow (`stegvisningOrderKap19`) — for users born before 1963 or apoteker

Skips ufoeretrygdAFP and samtykkeOffentligAFP.

```typescript
export const stegvisningOrderKap19 = [
	paths.login,
	paths.start,
	paths.sivilstand,
	paths.utenlandsopphold,
	paths.afp,
	paths.samtykke,
	paths.beregningEnkel,
] as const
```

Insert your path at the correct position in each relevant array.

### How the correct array is selected at runtime

`src/components/stegvisning/utils.ts` has `getStepArrays`:

```typescript
export const getStepArrays = (
	isEndring: boolean | undefined,
	isKap19: string | boolean | undefined
): (typeof paths)[keyof typeof paths][] => {
	return [
		...(isKap19
			? stegvisningOrderKap19
			: isEndring
				? stegvisningOrderEndring
				: stegvisningOrder),
	]
}
```

Priority: `isKap19` > `isEndring` > default.

---

## Step 3: Create Guard/Loader

File: `src/router/loaders.tsx`

Every step guard follows this pattern:

1. Call `directAccessGuard()` — redirects to `/start` if user has no API state
2. Fetch required data via `store.dispatch(apiSlice.endpoints.X.initiate())`
3. Compute `isEndring` and `isKap19`, build `stepArrays` via `getStepArrays`
4. Check skip conditions — call `skip(stepArrays, paths.currentStep, request)` to skip
5. Return loader data (or `undefined`)

### `directAccessGuard` — how it works

Prevents direct URL access. If the Redux store has no registered API queries (meaning the user hasn't gone through the flow), redirects to `/start`. The `?sanity-timeout` query param bypasses this check.

```typescript
export const directAccessGuard = (): Response | undefined => {
	if (typeof window !== 'undefined') {
		const url = new URL(window.location.href)
		if (url.searchParams.has('sanity-timeout')) {
			return undefined
		}
	}
	const state = store.getState()
	if (
		state.api?.queries === undefined ||
		Object.keys(state.api.queries).length === 0
	) {
		return redirect(paths.start)
	}
	return undefined
}
```

### `skip()` function — how it works

Imported from `@/utils/navigation`. Called as `skip(stepArrays, currentPath, request)`. Finds the current path in the step array and redirects to the next (or previous, based on the `request` direction via `?back=true` search param). Used when a guard determines its step should be bypassed.

### Real guard example — `stepSivilstandAccessGuard`

```typescript
export const stepSivilstandAccessGuard = async ({
	request,
}: LoaderFunctionArgs) => {
	if (directAccessGuard()) {
		return redirect(paths.start)
	}

	const getPersonQuery = store
		.dispatch(apiSlice.endpoints.getPerson.initiate())
		.unwrap()

	const getGrunnbeloepQuery = store
		.dispatch(apiSlice.endpoints.getGrunnbeloep.initiate())
		.unwrap()
		.then((grunnbeloepRes) => grunnbeloepRes)
		.catch(() => undefined)

	const loependeVedtak = await store
		.dispatch(apiSlice.endpoints.getLoependeVedtak.initiate())
		.unwrap()

	const erApoteker = await store.dispatch(
		apiSlice.endpoints.getErApoteker.initiate()
	)

	const [person, grunnbeloep] = await Promise.all([
		getPersonQuery,
		getGrunnbeloepQuery,
	])

	const isEndring = isLoependeVedtakEndring(loependeVedtak)
	const isKap19 = isFoedtFoer1963(person.foedselsdato)

	const stepArrays = getStepArrays(
		isEndring,
		isKap19 || (erApoteker.isSuccess ? erApoteker.data : false)
	)

	if (
		isEndring &&
		(isKap19 || (erApoteker.isSuccess ? erApoteker.data : false))
	) {
		return skip(stepArrays, paths.sivilstand, request)
	}

	return { person, grunnbeloep }
}
```

### Template for your new guard

```typescript
export const stepMyNewStepAccessGuard = async ({
	request,
}: LoaderFunctionArgs) => {
	if (directAccessGuard()) {
		return redirect(paths.start)
	}

	const loependeVedtak = await store
		.dispatch(apiSlice.endpoints.getLoependeVedtak.initiate())
		.unwrap()
	const person = await store
		.dispatch(apiSlice.endpoints.getPerson.initiate())
		.unwrap()
	const erApoteker = await store.dispatch(
		apiSlice.endpoints.getErApoteker.initiate()
	)

	const isEndring = isLoependeVedtakEndring(loependeVedtak)
	const isKap19 = isFoedtFoer1963(person.foedselsdato)
	const stepArrays = getStepArrays(
		isEndring,
		isKap19 || (erApoteker.isSuccess ? erApoteker.data : false)
	)

	if (shouldSkipMyStep(person, loependeVedtak)) {
		return skip(stepArrays, paths.myNewStep, request)
	}

	return { person, loependeVedtak }
}
```

---

## Step 4: Add Route

File: `src/router/routes.tsx`

Routes are grouped into 4 layout groups. Steps go in the third group (default `PageFramework`):

```tsx
{
  loader: authenticationGuard,
  hydrateFallbackElement: fallback,
  element: (
    <PageFramework>
      <Outlet />
    </PageFramework>
  ),
  ErrorBoundary: RouteErrorBoundary,
  children: [
    // ... existing step routes
    {
      loader: stepMyNewStepAccessGuard,
      path: paths.myNewStep,
      element: <StepMyNewStep />,
    },
  ],
},
```

Add the import at the top:

```typescript
import { StepMyNewStep } from '@/pages/StepMyNewStep'
```

And import your guard from `./loaders`.

---

## Step 5: Create Page Component

File: `src/pages/StepMyNewStep/StepMyNewStep.tsx`

Page components wire together: loader data, Redux state, navigation hooks, and the stegvisning form component.

### Real example — `StepSivilstand`

```tsx
import React from 'react'
import { useIntl } from 'react-intl'
import { useLoaderData } from 'react-router'

import { Sivilstand } from '@/components/stegvisning/Sivilstand'
import { useStegvisningNavigation } from '@/components/stegvisning/stegvisning-hooks'
import { paths } from '@/router/constants'
import { stepSivilstandAccessGuard } from '@/router/loaders'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import {
	selectEpsHarInntektOver2G,
	selectEpsHarPensjon,
	selectIsVeileder,
	selectSivilstand,
} from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputSlice'

export function StepSivilstand() {
	const intl = useIntl()

	const dispatch = useAppDispatch()
	const isVeileder = useAppSelector(selectIsVeileder)
	const sivilstand = useAppSelector(selectSivilstand)
	const epsHarInntektOver2G = useAppSelector(selectEpsHarInntektOver2G)
	const epsHarPensjon = useAppSelector(selectEpsHarPensjon)

	const { person, grunnbeloep } =
		useLoaderData<typeof stepSivilstandAccessGuard>()

	const [{ onStegvisningNext, onStegvisningPrevious, onStegvisningCancel }] =
		useStegvisningNavigation(paths.sivilstand)

	React.useEffect(() => {
		document.title = intl.formatMessage({
			id: 'application.title.stegvisning.sivilstand',
		})
	}, [])

	const onNext = (sivilstandData: {
		sivilstand: Sivilstand
		epsHarPensjon: boolean | null
		epsHarInntektOver2G: boolean | null
	}): void => {
		dispatch(userInputActions.setSivilstand(sivilstandData))
		if (onStegvisningNext) {
			onStegvisningNext()
		}
	}

	return (
		<Sivilstand
			sivilstandFolkeregister={person.sivilstand}
			grunnbeloep={grunnbeloep}
			sivilstand={sivilstand!}
			epsHarInntektOver2G={epsHarInntektOver2G}
			epsHarPensjon={epsHarPensjon}
			onCancel={isVeileder ? undefined : onStegvisningCancel}
			onPrevious={onStegvisningPrevious}
			onNext={onNext}
		/>
	)
}
```

### Key patterns to follow

- **Typed loader data**: `useLoaderData<typeof stepMyGuard>()`
- **Navigation hook**: `useStegvisningNavigation(paths.myNewStep)` returns `[{ onStegvisningNext, onStegvisningPrevious, onStegvisningCancel }]`
- **`onStegvisningNext` can be `undefined`** while API data is fetching — always check before calling
- **Veileder check**: `onCancel={isVeileder ? undefined : onStegvisningCancel}` — veileder users get no cancel button
- **Document title**: Set via `useEffect` with `intl.formatMessage({ id: 'application.title.stegvisning.myStep' })`
- **Dispatch on next**: Call `dispatch(userInputActions.setX(data))` then `onStegvisningNext()`

### Barrel export

```typescript
// src/pages/StepMyNewStep/index.ts
export { StepMyNewStep } from './StepMyNewStep'
```

---

## Step 6: Create Stegvisning Form Component

File: `src/components/stegvisning/MyNewStep/MyNewStep.tsx`

### `useStegvisningNavigation` hook — exact behavior

```typescript
// src/components/stegvisning/stegvisning-hooks.tsx
export const useStegvisningNavigation = (currentPath: Path) => {
	const navigate = useNavigate()
	const dispatch = useAppDispatch()
	const foedselsdato = useAppSelector(selectFoedselsdato)
	const erApoteker = useAppSelector(selectErApoteker)
	const { isFetching, data: loependeVedtak } = useGetLoependeVedtakQuery()

	const isEndring = loependeVedtak && isLoependeVedtakEndring(loependeVedtak)
	const isKap19 = (foedselsdato && isOvergangskull(foedselsdato)) || erApoteker
	const stepArrays = getStepArrays(isEndring, isKap19)

	// onStegvisningNext: navigates to stepArrays[currentIndex + 1]
	// onStegvisningPrevious: navigates to stepArrays[currentIndex - 1] with ?back=true
	// onStegvisningCancel: dispatches userInputActions.flush() and navigates to paths.login
	// onStegvisningNext is undefined while isFetching
	return [handlers] as const
}
```

### `Navigation` component — exact interface

```tsx
// src/components/stegvisning/Navigation/Navigation.tsx
export default function Navigation({
	onPrevious,
	onCancel,
	form,
	className,
}: {
	onPrevious: () => void
	onCancel: (() => void) | undefined
	form?: string
	className?: string
})
```

Renders 3 buttons in an `HStack gap="4" marginBlock="4 0"`:

- **Neste**: `type="submit"`, optional `form` attribute. `data-testid="stegvisning-neste-button"`
- **Tilbake**: `type="button"`, `variant="secondary"`. `data-testid="stegvisning-tilbake-button"`
- **Avbryt**: `type="button"`, `variant="tertiary"`, only rendered when `onCancel` is defined. `data-testid="stegvisning-avbryt-button"`

Button labels use `<FormattedMessage>`: `stegvisning.neste`, `stegvisning.tilbake`, `stegvisning.avbryt`.

### Form name constants

```typescript
// src/components/stegvisning/utils.ts
export const STEGVISNING_FORM_NAMES = {
	afp: 'stegvisning-afp',
	samtykkeOffentligAFP: 'stegvisning-samtykke-offentlig-afp',
	samtykkePensjonsavtaler: 'stegvisning-samtykke-pensjonsavtaler',
	sivilstand: 'stegvisning-sivilstand',
	utenlandsopphold: 'stegvisning-utenlandsopphold',
}
```

### Template for your new stegvisning component

```tsx
// src/components/stegvisning/MyNewStep/MyNewStep.tsx
import { useState } from 'react'
import { useIntl } from 'react-intl'

import { BodyLong, Heading, Radio, RadioGroup } from '@navikt/ds-react'

import { Card } from '@/components/common/Card'
import Navigation from '@/components/stegvisning/Navigation/Navigation'
import { logger } from '@/utils/logging'

interface Props {
	previousValue: string | null
	onNext: (value: string) => void
	onPrevious: () => void
	onCancel?: () => void
}

export function MyNewStep({
	previousValue,
	onNext,
	onPrevious,
	onCancel,
}: Props) {
	const intl = useIntl()
	const [validationError, setValidationError] = useState<string>('')
	const [localValue, setLocalValue] = useState<string | null>(previousValue)

	const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		if (!localValue) {
			const tekst = intl.formatMessage({
				id: 'stegvisning.mynewstep.validation_error',
			})
			setValidationError(tekst)
			logger('skjemavalidering feilet', {
				data: 'stegvisning-my-new-step',
				tekst,
			})
			return
		}
		logger('radiogroup valgt', { tekst: `MyNewStep: ${localValue}` })
		logger('button klikk', { tekst: 'Neste fra MyNewStep' })
		onNext(localValue)
	}

	return (
		<Card hasLargePadding hasMargin>
			<form onSubmit={onSubmit}>
				<Heading size="large" level="2">
					{intl.formatMessage({ id: 'stegvisning.mynewstep.title' })}
				</Heading>
				<BodyLong>
					{intl.formatMessage({ id: 'stegvisning.mynewstep.ingress' })}
				</BodyLong>
				<RadioGroup
					legend={intl.formatMessage({
						id: 'stegvisning.mynewstep.radio_label',
					})}
					error={validationError}
					value={localValue ?? ''}
					onChange={(value) => {
						setValidationError('')
						setLocalValue(value)
					}}
				>
					<Radio value="option_a">
						{intl.formatMessage({ id: 'stegvisning.mynewstep.radio_option_a' })}
					</Radio>
					<Radio value="option_b">
						{intl.formatMessage({ id: 'stegvisning.mynewstep.radio_option_b' })}
					</Radio>
				</RadioGroup>
				<Navigation onPrevious={onPrevious} onCancel={onCancel} />
			</form>
		</Card>
	)
}
```

### Barrel export

```typescript
// src/components/stegvisning/MyNewStep/index.ts
export { MyNewStep } from './MyNewStep'
```

### SCSS module (if needed)

```scss
// src/components/stegvisning/MyNewStep/MyNewStep.module.scss
@use '../../../scss/variables';

.radiogroup {
	margin-top: var(--a-spacing-6);
	margin-bottom: var(--a-spacing-2);
}

.alert {
	margin-left: var(--a-spacing-8);
}
```

### Form patterns used across the codebase

- **Standard form**: `<form onSubmit={...}>` wraps fields + `<Navigation />`. Neste button is `type="submit"`.
- **Detached form**: Used by Utenlandsopphold. `<form id="name" onSubmit={...} />` is self-closing, radio inputs use `form="name"` attribute, `Navigation` receives `form="name"` so submit targets the detached form.
- **Validation**: On submit, `e.preventDefault()`, extract data, validate. On failure: `setValidationError(tekst)` + `logger('skjemavalidering feilet', ...)`. On success: `logger('radiogroup valgt', ...)` + `onNext(data)`.
- **Error clearing**: On radio/select change, clear relevant validation error.

---

## Step 7: Add Translations

Translation key pattern: `stegvisning.<stepname>.<field>`

```typescript
// src/translations/nb.ts
'stegvisning.mynewstep.title': 'Tittel for nytt steg',
'stegvisning.mynewstep.ingress': 'Beskrivelse...',
'stegvisning.mynewstep.radio_label': 'Velg et alternativ',
'stegvisning.mynewstep.radio_option_a': 'Alternativ A',
'stegvisning.mynewstep.radio_option_b': 'Alternativ B',
'stegvisning.mynewstep.validation_error': 'Du må velge et alternativ',
```

Also add document title key:

```typescript
'application.title.stegvisning.mynewstep': 'Mitt nye steg - Pensjonskalkulator',
```

Add to `nn.ts` (Nynorsk) and `en.ts` (English) as well.

---

## Step 8: Add Redux State (if needed)

```typescript
// src/state/userInput/userInputSlice.ts
// Add to initialState:
myNewStepData: null as string | null,

// Add reducer:
setMyNewStepData: (state, action: PayloadAction<string>) => {
  state.myNewStepData = action.payload
},
```

Add a selector in `src/state/userInput/selectors.ts`:

```typescript
export const selectMyNewStepData = (state: RootState) =>
	state.userInput.myNewStepData
```

---

## Step 9: Tests

### Guard test

File: `src/router/__tests__/loaders.test.tsx`

The test file uses a shared `createMockRequest` helper and `expectRedirectResponse` assertion:

```typescript
import { describe, it, vi } from 'vitest'

import {
	fulfilledGetLoependeVedtak0Ufoeregrad,
	fulfilledGetPerson,
} from '@/mocks/mockedRTKQueryApiCalls'
import { mockErrorResponse, mockResponse } from '@/mocks/server'
import { paths } from '@/router/constants'
import * as apiSliceUtils from '@/state/api/apiSlice'
import { store } from '@/state/store'

// Add inside the existing describe('Loaders', () => { ... }) block:

describe('stepMyNewStepAccessGuard', () => {
	it('kaller redirect til /start når ingen API-kall er registrert', async () => {
		const result = await stepMyNewStepAccessGuard(
			createMockRequest('https://example.com')
		)
		expectRedirectResponse(result, paths.start)
	})

	it('returnerer loader-data når bruker har gyldig tilstand', async () => {
		const mockedState = {
			api: {
				queries: {
					...fulfilledGetPerson,
					...fulfilledGetLoependeVedtak0Ufoeregrad,
				},
			},
			userInput: { ...userInputInitialState },
		}
		store.getState = vi.fn().mockImplementation(() => mockedState)

		const result = await stepMyNewStepAccessGuard(
			createMockRequest('https://example.com')
		)
		expect(result).toHaveProperty('person')
	})

	it('skipper steget når vilkår for skip er oppfylt', async () => {
		// Set up mocked state that triggers your skip condition
		const result = await stepMyNewStepAccessGuard(
			createMockRequest('https://example.com')
		)
		expectRedirectResponse(result)
	})
})
```

### Stegvisning component test

File: `src/components/stegvisning/MyNewStep/__tests__/MyNewStep.test.tsx`

```typescript
import { describe, it, vi } from 'vitest'

import { render, screen, userEvent, waitFor } from '@/test-utils'

import { MyNewStep } from '..'

describe('stegvisning - MyNewStep', () => {
  const onCancelMock = vi.fn()
  const onPreviousMock = vi.fn()
  const onNextMock = vi.fn()

  it('rendrer slik den skal når verdi ikke er oppgitt', async () => {
    render(
      <MyNewStep
        previousValue={null}
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'stegvisning.mynewstep.title'
    )
    const radioButtons = await screen.findAllByRole('radio')
    await waitFor(() => {
      expect(radioButtons).toHaveLength(2)
      expect(radioButtons[0]).not.toBeChecked()
      expect(radioButtons[1]).not.toBeChecked()
    })
  })

  it('rendrer slik den skal når verdi er oppgitt', async () => {
    render(
      <MyNewStep
        previousValue="option_a"
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )
    const radioButtons = screen.getAllByRole('radio')
    await waitFor(() => {
      expect(radioButtons[0]).toBeChecked()
    })
  })

  it('viser validering feil når man klikker neste uten valg', async () => {
    const user = userEvent.setup()
    render(
      <MyNewStep
        previousValue={null}
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )
    await user.click(screen.getByTestId('stegvisning-neste-button'))
    expect(screen.getByText('stegvisning.mynewstep.validation_error')).toBeVisible()
    expect(onNextMock).not.toHaveBeenCalled()
  })

  it('kaller onNext med valgt verdi ved submit', async () => {
    const user = userEvent.setup()
    render(
      <MyNewStep
        previousValue={null}
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )
    const radioButtons = screen.getAllByRole('radio')
    await user.click(radioButtons[0])
    await user.click(screen.getByTestId('stegvisning-neste-button'))
    expect(onNextMock).toHaveBeenCalledWith('option_a')
  })

  it('kaller onPrevious ved tilbake-klikk', async () => {
    const user = userEvent.setup()
    render(
      <MyNewStep
        previousValue={null}
        onCancel={onCancelMock}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )
    await user.click(screen.getByTestId('stegvisning-tilbake-button'))
    expect(onPreviousMock).toHaveBeenCalled()
  })

  it('viser ikke avbryt-knapp når onCancel er undefined', () => {
    render(
      <MyNewStep
        previousValue={null}
        onPrevious={onPreviousMock}
        onNext={onNextMock}
      />
    )
    expect(screen.queryByTestId('stegvisning-avbryt-button')).not.toBeInTheDocument()
  })
})
```

---

## Checklist

- [ ] Path added to `src/router/constants.ts` `paths` object
- [ ] Step inserted in correct position in relevant flow array(s) (`stegvisningOrder`, `stegvisningOrderEndring`, `stegvisningOrderKap19`)
- [ ] Guard created in `src/router/loaders.tsx` with `directAccessGuard` + skip logic
- [ ] Guard imported and route added in `src/router/routes.tsx` (third route group)
- [ ] Page component created in `src/pages/StepMyNewStep/` with `useStegvisningNavigation`, `useLoaderData`, veileder check
- [ ] Stegvisning form component created in `src/components/stegvisning/MyNewStep/` with `Card`, `Navigation`, validation, logging
- [ ] SCSS module created (if needed) using `@use '../../../scss/variables'` and Aksel spacing tokens
- [ ] Translations added to `nb.ts`, `nn.ts`, `en.ts` — both `stegvisning.*` and `application.title.stegvisning.*` keys
- [ ] Redux state + selector added in `src/state/userInput/` (if step collects data)
- [ ] Guard test added in `src/router/__tests__/loaders.test.tsx`
- [ ] Stegvisning component test added in `src/components/stegvisning/MyNewStep/__tests__/`
- [ ] MSW handlers updated in `src/mocks/` (if new API calls needed)

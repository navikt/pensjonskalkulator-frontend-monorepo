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

Add your new path to the `paths` object:

```typescript
export const paths = {
	// ... existing paths (root, login, start, samtykke, utenlandsopphold, afp, etc.)
	myNewStep: '/my-new-step',
} as const
```

---

## Step 2: Add to Step Order Array(s)

Three step order arrays exist in `src/router/constants.ts`:

- **`stegvisningOrder`** — default flow (login → start → sivilstand → utenlandsopphold → afp → ufoeretrygdAFP → samtykkeOffentligAFP → samtykke → beregningEnkel)
- **`stegvisningOrderEndring`** — for users amending existing pension (skips sivilstand, utenlandsopphold, samtykke; ends at avansert beregning)
- **`stegvisningOrderKap19`** — for users born before 1963 or apoteker (skips ufoeretrygdAFP and samtykkeOffentligAFP)

Insert your path at the correct position in each relevant array.

### How the correct array is selected at runtime

`src/components/stegvisning/utils.ts` has `getStepArrays(isEndring, isKap19)`. Priority: `isKap19` > `isEndring` > default.

---

## Step 3: Create Guard/Loader

File: `src/router/loaders.tsx`

Every step guard follows this pattern:

1. Call `directAccessGuard()` — redirects to `/start` if user has no API state (bypassed by `?sanity-timeout` query param)
2. Fetch required data via `store.dispatch(apiSlice.endpoints.X.initiate())`
3. Compute `isEndring` and `isKap19`, build `stepArrays` via `getStepArrays`
4. Check skip conditions — call `skip(stepArrays, paths.currentStep, request)` to skip
5. Return loader data (or `undefined`)

The `skip()` function (from `@/utils/navigation`) finds the current path in the step array and redirects to the next (or previous, based on `?back=true` search param).

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

> See `stepSivilstandAccessGuard` in `loaders.tsx` for a real example with parallel data fetching.

---

## Step 4: Add Route

File: `src/router/routes.tsx`

Steps go in the third route group (default `PageFramework`):

```tsx
{
  loader: stepMyNewStepAccessGuard,
  path: paths.myNewStep,
  element: <StepMyNewStep />,
},
```

Import the page component and guard at the top of the file.

---

## Step 5: Create Page Component

File: `src/pages/StepMyNewStep/StepMyNewStep.tsx`

Page components wire together: loader data, Redux state, navigation hooks, and the stegvisning form component.

### Key patterns

- **Typed loader data**: `useLoaderData<typeof stepMyGuard>()`
- **Navigation hook**: `useStegvisningNavigation(paths.myNewStep)` returns `[{ onStegvisningNext, onStegvisningPrevious, onStegvisningCancel }]`
- **`onStegvisningNext` can be `undefined`** while API data is fetching — always check before calling
- **Veileder check**: `onCancel={isVeileder ? undefined : onStegvisningCancel}` — veileder users get no cancel button
- **Document title**: Set via `useEffect` with `intl.formatMessage({ id: 'application.title.stegvisning.myStep' })`
- **Dispatch on next**: Call `dispatch(userInputActions.setX(data))` then `onStegvisningNext()`

```typescript
// src/pages/StepMyNewStep/index.ts
export { StepMyNewStep } from './StepMyNewStep'
```

> See `src/pages/StepSivilstand/StepSivilstand.tsx` for a real page component example.

---

## Step 6: Create Stegvisning Form Component

File: `src/components/stegvisning/MyNewStep/MyNewStep.tsx`

### Template

```tsx
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

### Form patterns

- **Standard form**: `<form onSubmit={...}>` wraps fields + `<Navigation />`. Neste button is `type="submit"`.
- **Detached form**: Used by Utenlandsopphold — `<form id="name" />` is self-closing, inputs use `form="name"` attribute.
- **Validation**: On submit → `e.preventDefault()` → validate → `setValidationError(tekst)` + `logger(...)` on failure.
- **Navigation buttons**: `data-testid="stegvisning-neste-button"`, `stegvisning-tilbake-button`, `stegvisning-avbryt-button`.

> See `src/components/stegvisning/utils.ts` for `STEGVISNING_FORM_NAMES` and `getStepArrays`.

---

## Step 7: Add Translations

Translation key pattern: `stegvisning.<stepname>.<field>`

```typescript
// src/translations/nb.ts (also nn.ts and en.ts)
'stegvisning.mynewstep.title': 'Tittel for nytt steg',
'stegvisning.mynewstep.ingress': 'Beskrivelse...',
'stegvisning.mynewstep.radio_label': 'Velg et alternativ',
'stegvisning.mynewstep.validation_error': 'Du må velge et alternativ',
'application.title.stegvisning.mynewstep': 'Mitt nye steg - Pensjonskalkulator',
```

---

## Step 8: Add Redux State (if needed)

```typescript
// src/state/userInput/userInputSlice.ts — add to initialState + reducer:
myNewStepData: null as string | null,
setMyNewStepData: (state, action: PayloadAction<string>) => {
  state.myNewStepData = action.payload
},

// src/state/userInput/selectors.ts:
export const selectMyNewStepData = (state: RootState) => state.userInput.myNewStepData
```

---

## Step 9: Tests

Guard tests go in `src/router/__tests__/loaders.test.tsx`. Stegvisning component tests go in `src/components/stegvisning/MyNewStep/__tests__/MyNewStep.test.tsx`.

> See the **vitest-testing** skill for test patterns (preloadedApiState, mockErrorResponse, fulfilledGetPerson cache entries, swallowErrors).

---

## Checklist

- [ ] Path added to `paths` object in `src/router/constants.ts`
- [ ] Step inserted in relevant flow array(s) (`stegvisningOrder`, `stegvisningOrderEndring`, `stegvisningOrderKap19`)
- [ ] Guard created in `src/router/loaders.tsx` with `directAccessGuard` + skip logic
- [ ] Route added in `src/router/routes.tsx` (third route group)
- [ ] Page component in `src/pages/StepMyNewStep/` with `useStegvisningNavigation`, `useLoaderData`, veileder check
- [ ] Stegvisning form component in `src/components/stegvisning/MyNewStep/` with `Card`, `Navigation`, validation, logging
- [ ] Translations in `nb.ts`, `nn.ts`, `en.ts` — both `stegvisning.*` and `application.title.stegvisning.*` keys
- [ ] Redux state + selector in `src/state/userInput/` (if step collects data)
- [ ] Guard + stegvisning component tests

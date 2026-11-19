import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { defaultBeregningFormData } from '../../api/beregningTypes'
import { useFormValidation } from './useFormValidation'

describe('AFP validation', () => {
	it.each([
		{
			hideAfpSporsmaal: true,
			manglerLivsvarigAfpBeloep: true,
			expectedError: undefined,
		},
		{
			hideAfpSporsmaal: true,
			manglerLivsvarigAfpBeloep: false,
			expectedError: undefined,
		},
		{
			hideAfpSporsmaal: false,
			manglerLivsvarigAfpBeloep: true,
			expectedError: 'Velg om AFP-beløp skal hentes i beregningen.',
		},
		{
			hideAfpSporsmaal: false,
			manglerLivsvarigAfpBeloep: false,
			expectedError: 'Velg om AFP skal inkluderes.',
		},
	])(
		'hidden=$hideAfpSporsmaal, missing amount=$manglerLivsvarigAfpBeloep',
		({ hideAfpSporsmaal, manglerLivsvarigAfpBeloep, expectedError }) => {
			const { result } = renderHook(() => useFormValidation())

			act(() => {
				const errors = result.current.validate(
					{ ...defaultBeregningFormData, afp: undefined },
					{
						erApoteker: false,
						hideAfpSporsmaal,
						manglerLivsvarigAfpBeloep,
					}
				)

				expect(errors.afp).toBe(expectedError)
			})
		}
	)
})

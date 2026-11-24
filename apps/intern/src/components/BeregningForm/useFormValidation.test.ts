import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { defaultBeregningFormData } from '../../api/beregningTypes'
import { useFormValidation } from './useFormValidation'

describe('AFP validation', () => {
	it.each([
		{
			hideAfpSporsmaal: true,
			harVedtakLivsvarigAfp: true,
			expectedError: undefined,
		},
		{
			hideAfpSporsmaal: true,
			harVedtakLivsvarigAfp: false,
			expectedError: undefined,
		},
		{
			hideAfpSporsmaal: false,
			harVedtakLivsvarigAfp: true,
			expectedError: 'Velg om AFP-beløp skal hentes i beregningen.',
		},
		{
			hideAfpSporsmaal: false,
			harVedtakLivsvarigAfp: false,
			expectedError: 'Velg om AFP skal inkluderes.',
		},
	])(
		'hidden=$hideAfpSporsmaal, existing AFP=$harVedtakLivsvarigAfp',
		({ hideAfpSporsmaal, harVedtakLivsvarigAfp, expectedError }) => {
			const { result } = renderHook(() => useFormValidation())

			act(() => {
				const errors = result.current.validate(
					{ ...defaultBeregningFormData, afp: undefined },
					{
						erApoteker: false,
						hideAfpSporsmaal,
						harVedtakLivsvarigAfp,
					}
				)

				expect(errors.afp).toBe(expectedError)
			})
		}
	)
})

import { useCallback, useEffect, useMemo, useState } from 'react'

import type {
	BeregningFormData,
	ValidationErrors,
} from '../../api/beregningTypes'

interface UseFormValidationResult {
	validationErrors: ValidationErrors
	validate: (formData: BeregningFormData) => boolean
	clearError: (field: keyof BeregningFormData) => void
	resetValidationErrors: () => void
}

export function useFormValidation(): UseFormValidationResult {
	const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})

	useEffect(() => {
		const ariaInvalidElements = document.querySelectorAll(
			'input[aria-invalid]:not([aria-invalid="false"]), select[aria-invalid]:not([aria-invalid="false"])'
		)

		if (
			document.activeElement?.tagName === 'BUTTON' &&
			ariaInvalidElements.length > 0
		) {
			;(ariaInvalidElements[0] as HTMLElement).focus()
			;(ariaInvalidElements[0] as HTMLElement).scrollIntoView({
				behavior: 'smooth',
				block: 'nearest',
			})
		}
	}, [validationErrors])

	const validate = useCallback((formData: BeregningFormData): boolean => {
		const errors: ValidationErrors = {}

		if (!formData.pensjonsgivendeInntektFremTilUttak) {
			errors.pensjonsgivendeInntektFremTilUttak =
				'Pensjonsgivende inntekt frem til uttak er påkrevd'
		} else if (
			Number.isNaN(Number(formData.pensjonsgivendeInntektFremTilUttak))
		) {
			errors.pensjonsgivendeInntektFremTilUttak =
				'Pensjonsgivende inntekt må være et tall'
		}

		if (!formData.alderAarUttak) {
			errors.alderAarUttak = 'Alder (år) for uttak er påkrevd'
		}

		if (!formData.alderMdUttak) {
			errors.alderMdUttak = 'Alder (md.) for uttak er påkrevd'
		}

		if (formData.harInntektVedSidenAvUttak === 'ja') {
			if (!formData.pensjonsgivendeInntektVedSidenAvUttak) {
				errors.pensjonsgivendeInntektVedSidenAvUttak =
					'Pensjonsgivende inntekt ved siden av uttak er påkrevd'
			} else if (
				Number.isNaN(Number(formData.pensjonsgivendeInntektVedSidenAvUttak))
			) {
				errors.pensjonsgivendeInntektVedSidenAvUttak =
					'Pensjonsgivende inntekt må være et tall'
			}

			if (!formData.alderAarInntektSlutter) {
				errors.alderAarInntektSlutter = 'Alder (år) inntekt slutter er påkrevd'
			}

			if (!formData.alderMdInntektSlutter) {
				errors.alderMdInntektSlutter = 'Alder (md.) inntekt slutter er påkrevd'
			}
		}

		setValidationErrors(errors)
		return Object.keys(errors).length === 0
	}, [])

	const clearError = useCallback((field: keyof BeregningFormData) => {
		setValidationErrors((prev) => {
			const next = { ...prev }
			delete next[field]
			return next
		})
	}, [])

	const resetValidationErrors = useCallback(() => {
		setValidationErrors({})
	}, [])

	return useMemo(
		() => ({ validationErrors, validate, clearError, resetValidationErrors }),
		[validationErrors, validate, clearError, resetValidationErrors]
	)
}

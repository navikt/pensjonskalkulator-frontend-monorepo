import { useCallback, useEffect, useState } from 'react'

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

		if (formData.aarligInntektFoerUttakBeloep === null) {
			errors.aarligInntektFoerUttakBeloep =
				'Pensjonsgivende inntekt frem til uttak er påkrevd'
		}

		const harPartner =
			formData.sivilstand !== null &&
			['GIFT', 'REGISTRERT_PARTNER', 'SAMBOER'].includes(formData.sivilstand)

		if (harPartner && formData.epsHarPensjon === null) {
			errors.epsHarPensjon =
				'Du må velge om ektefelle/partner/samboer mottar pensjon'
		}

		if (
			harPartner &&
			formData.epsHarPensjon === false &&
			formData.epsHarInntektOver2G === null
		) {
			errors.epsHarInntektOver2G =
				'Du må velge om ektefelle/partner/samboer har inntekt over 2G'
		}

		if (formData.alderAarUttak === null) {
			errors.alderAarUttak = 'Alder (år) for uttak er påkrevd'
		}

		if (formData.alderMdUttak === null) {
			errors.alderMdUttak = 'Alder (md.) for uttak er påkrevd'
		}

		if (formData.uttaksgrad !== null && formData.uttaksgrad !== 100) {
			if (formData.alderAarHeltUttak === null) {
				errors.alderAarHeltUttak = 'Alder (år) for 100 % uttak er påkrevd'
			}

			if (formData.alderMdHeltUttak === null) {
				errors.alderMdHeltUttak = 'Alder (md.) for 100 % uttak er påkrevd'
			}
		}

		if (formData.harInntektVedSidenAvUttak === null) {
			errors.harInntektVedSidenAvUttak =
				'Du må velge om bruker har inntekt ved siden av 100 % uttak'
		}

		if (formData.harInntektVedSidenAvUttak === true) {
			if (formData.pensjonsgivendeInntektVedSidenAvUttak === null) {
				errors.pensjonsgivendeInntektVedSidenAvUttak =
					'Pensjonsgivende inntekt ved siden av uttak er påkrevd'
			}

			if (formData.alderAarInntektSlutter === null) {
				errors.alderAarInntektSlutter = 'Alder (år) inntekt slutter er påkrevd'
			}

			if (formData.alderMdInntektSlutter === null) {
				errors.alderMdInntektSlutter = 'Alder (md.) inntekt slutter er påkrevd'
			}
		}

		if (
			formData.uttaksgrad !== null &&
			formData.uttaksgrad !== 100 &&
			formData.harInntektVedSidenAvGradertUttak === true
		) {
			if (formData.pensjonsgivendeInntektVedSidenAvGradertUttak === null) {
				errors.pensjonsgivendeInntektVedSidenAvGradertUttak =
					'Pensjonsgivende inntekt ved siden av gradert uttak er påkrevd'
			}

			if (formData.alderAarInntektGradertSlutter === null) {
				errors.alderAarInntektGradertSlutter =
					'Alder (år) inntekt slutter er påkrevd'
			}

			if (formData.alderMdInntektGradertSlutter === null) {
				errors.alderMdInntektGradertSlutter =
					'Alder (md.) inntekt slutter er påkrevd'
			}
		}

		if (formData.uttaksgrad !== null && formData.uttaksgrad !== 100) {
			if (
				formData.aarligInntektVsaPensjonGradertUttak !== null &&
				Number.isNaN(formData.aarligInntektVsaPensjonGradertUttak)
			) {
				errors.aarligInntektVsaPensjonGradertUttak =
					'Pensjonsgivende inntekt må være et tall'
			}

			if (
				formData.alderAarHeltUttak !== null &&
				formData.alderMdHeltUttak !== null &&
				formData.alderAarUttak !== null &&
				formData.alderMdUttak !== null
			) {
				const heltUttakAar = formData.alderAarHeltUttak
				const heltUttakMd = formData.alderMdHeltUttak
				const gradertUttakAar = formData.alderAarUttak
				const gradertUttakMd = formData.alderMdUttak

				if (
					heltUttakAar < gradertUttakAar ||
					(heltUttakAar === gradertUttakAar && heltUttakMd < gradertUttakMd)
				) {
					errors.alderAarHeltUttak =
						'Alder for 100 % uttak kan ikke være før alder for uttak'
				}
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

	return {
		validationErrors,
		validate,
		clearError,
		resetValidationErrors,
	}
}

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

function validateSivilstand(
	formData: BeregningFormData,
	errors: ValidationErrors
) {
	if (formData.sivilstand === null) {
		errors.sivilstand = 'Velg sivilstand.'
	}

	const harPartner =
		formData.sivilstand !== null &&
		['GIFT', 'REGISTRERT_PARTNER', 'SAMBOER'].includes(formData.sivilstand)

	const partnerLabel =
		formData.sivilstand === 'GIFT'
			? 'ektefelle'
			: (formData.sivilstand?.toLowerCase() ?? 'partner')

	if (harPartner && formData.epsHarPensjon === null) {
		errors.epsHarPensjon = `Fyll ut om ${partnerLabel} mottar pensjon, uføretrygd eller AFP.`
	}

	if (
		harPartner &&
		formData.epsHarPensjon === false &&
		formData.epsHarInntektOver2G === null
	) {
		errors.epsHarInntektOver2G = `Fyll ut om ${partnerLabel} har inntekt over 2G.`
	}
}

function validateInntektFoerUttak(
	formData: BeregningFormData,
	errors: ValidationErrors
) {
	const inntektFoerUttak = formData.aarligInntektFoerUttakBeloep
	if (inntektFoerUttak === '') {
		errors.aarligInntektFoerUttakBeloep = 'Fyll ut inntekt.'
	} else if (!/^\d+$/.test(inntektFoerUttak)) {
		errors.aarligInntektFoerUttakBeloep = 'Skriv hele tall for å oppgi inntekt.'
	} else if (Number(inntektFoerUttak) > 100_000_000) {
		errors.aarligInntektFoerUttakBeloep =
			'Inntekten kan ikke overstige 100 000 000 kr.'
	}
}

function validateUttaksalder(
	formData: BeregningFormData,
	errors: ValidationErrors
) {
	if (formData.alderAarUttak === null || formData.alderMdUttak === null) {
		errors.alderAarUttak = 'Velg år og måned for uttak.'
	}
}

function validateUttaksgrad(
	formData: BeregningFormData,
	errors: ValidationErrors
) {
	if (formData.uttaksgrad === null) {
		errors.uttaksgrad = 'Velg uttaksgrad.'
	}

	if (
		formData.uttaksgrad !== null &&
		(formData.alderAarHeltUttak === null || formData.alderMdHeltUttak === null)
	) {
		errors.alderAarHeltUttak = 'Velg år og måned for 100 % uttak.'
	}
}

function validateInntektVsaHeltUttak(
	formData: BeregningFormData,
	errors: ValidationErrors
) {
	const harInntektVedSiden = formData.harInntektVedSidenAvUttak
	if (harInntektVedSiden === null) {
		errors.harInntektVedSidenAvUttak =
			'Velg ja/nei om bruker har inntekt ved siden av 100 % uttak.'
	}

	if (harInntektVedSiden === true) {
		const pensjonsgivendeInntekt =
			formData.pensjonsgivendeInntektVedSidenAvUttak
		if (pensjonsgivendeInntekt === '') {
			errors.pensjonsgivendeInntektVedSidenAvUttak = 'Fyll ut inntekt.'
		} else if (!/^\d+$/.test(pensjonsgivendeInntekt)) {
			errors.pensjonsgivendeInntektVedSidenAvUttak =
				'Skriv hele tall for å oppgi inntekt.'
		} else if (Number(pensjonsgivendeInntekt) > 100_000_000) {
			errors.pensjonsgivendeInntektVedSidenAvUttak =
				'Inntekten kan ikke overstige 100 000 000 kr.'
		}

		if (
			formData.alderAarInntektSlutter === null ||
			formData.alderMdInntektSlutter === null
		) {
			errors.alderAarInntektSlutter =
				'Velg år og måned for når inntekt slutter.'
		}
	}
}

function validateInntektVsaGradertUttak(
	formData: BeregningFormData,
	errors: ValidationErrors
) {
	if (
		formData.uttaksgrad !== null &&
		formData.uttaksgrad !== 100 &&
		formData.harInntektVedSidenAvGradertUttak === null
	) {
		errors.harInntektVedSidenAvGradertUttak = `Velg ja/nei om bruker har inntekt ved siden av ${formData.uttaksgrad} % uttak.`
	}

	if (
		formData.uttaksgrad !== null &&
		formData.uttaksgrad !== 100 &&
		formData.harInntektVedSidenAvGradertUttak === true
	) {
		const pensjonsgivendeInntekt =
			formData.pensjonsgivendeInntektVedSidenAvGradertUttak
		if (pensjonsgivendeInntekt === '') {
			errors.pensjonsgivendeInntektVedSidenAvGradertUttak = 'Fyll ut inntekt.'
		} else if (!/^\d+$/.test(pensjonsgivendeInntekt)) {
			errors.pensjonsgivendeInntektVedSidenAvGradertUttak =
				'Skriv hele tall for å oppgi inntekt.'
		} else if (Number(pensjonsgivendeInntekt) > 100_000_000) {
			errors.pensjonsgivendeInntektVedSidenAvGradertUttak =
				'Inntekten kan ikke overstige 100 000 000 kr.'
		}

		if (
			formData.alderAarInntektGradertSlutter === null ||
			formData.alderMdInntektGradertSlutter === null
		) {
			errors.alderAarInntektGradertSlutter =
				'Velg år og måned for når inntekt slutter.'
		}
	}
}

function validateAlderHeltMotGradert(
	formData: BeregningFormData,
	errors: ValidationErrors
) {
	if (
		formData.uttaksgrad !== null &&
		formData.uttaksgrad !== 100 &&
		formData.alderAarHeltUttak !== null &&
		formData.alderMdHeltUttak !== null &&
		formData.alderAarUttak !== null &&
		formData.alderMdUttak !== null
	) {
		if (
			formData.aarligInntektVsaPensjonGradertUttak !== null &&
			Number.isNaN(formData.aarligInntektVsaPensjonGradertUttak)
		) {
			errors.aarligInntektVsaPensjonGradertUttak =
				'Skriv hele tall for å oppgi inntekt.'
		}

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

		validateSivilstand(formData, errors)
		validateInntektFoerUttak(formData, errors)
		validateUttaksalder(formData, errors)
		validateUttaksgrad(formData, errors)
		validateInntektVsaHeltUttak(formData, errors)
		validateInntektVsaGradertUttak(formData, errors)
		validateAlderHeltMotGradert(formData, errors)

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

import { useCallback, useEffect, useState } from 'react'

import type {
	BeregningFormData,
	ValidationErrors,
} from '../../api/beregningTypes'
import {
	harPartner,
	shouldShowEpsHarInntektOver2G,
	shouldShowGradertUttakFields,
	shouldShowInntektGradertFields,
	shouldShowInntektHeltFields,
} from '../../api/formConditions'

function validateSivilstand(
	formData: BeregningFormData,
	errors: ValidationErrors
) {
	if (formData.sivilstatus === 'UOPPGITT') {
		errors.sivilstatus = 'Velg sivilstatus.'
	}

	const isHarPartner = harPartner(formData.sivilstatus)

	let partnerLabel = 'partner'
	if (formData.sivilstatus === 'GIFT') {
		partnerLabel = 'ektefelle'
	} else if (formData.sivilstatus === 'SAMBOER') {
		partnerLabel = 'samboer'
	}

	if (isHarPartner && formData.epsHarPensjon === null) {
		errors.epsHarPensjon = `Fyll ut om ${partnerLabel} mottar pensjon, uføretrygd eller AFP.`
	}

	if (
		shouldShowEpsHarInntektOver2G(
			formData.sivilstatus,
			formData.epsHarPensjon
		) &&
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
			'Inntekten kan ikke overskride 100 000 000 kr.'
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
		shouldShowGradertUttakFields(formData.uttaksgrad) &&
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

	if (shouldShowInntektHeltFields(harInntektVedSiden)) {
		const pensjonsgivendeInntekt =
			formData.pensjonsgivendeInntektVedSidenAvUttak
		if (pensjonsgivendeInntekt === '') {
			errors.pensjonsgivendeInntektVedSidenAvUttak = 'Fyll ut inntekt.'
		} else if (!/^\d+$/.test(pensjonsgivendeInntekt)) {
			errors.pensjonsgivendeInntektVedSidenAvUttak =
				'Skriv hele tall for å oppgi inntekt.'
		} else if (Number(pensjonsgivendeInntekt) > 100_000_000) {
			errors.pensjonsgivendeInntektVedSidenAvUttak =
				'Inntekten kan ikke overskride 100 000 000 kr.'
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
		shouldShowGradertUttakFields(formData.uttaksgrad) &&
		formData.harInntektVedSidenAvGradertUttak === null
	) {
		errors.harInntektVedSidenAvGradertUttak = `Velg ja/nei om bruker har inntekt ved siden av ${formData.uttaksgrad} % uttak.`
	}

	if (
		shouldShowInntektGradertFields(
			formData.uttaksgrad,
			formData.harInntektVedSidenAvGradertUttak
		)
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
				'Inntekten kan ikke overskride 100 000 000 kr.'
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
		shouldShowGradertUttakFields(formData.uttaksgrad) &&
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
				'Uttaksalder for 100 % alderspensjon må være senere enn alder for gradert pensjon.'
		}
	}
}

export function useFormValidation() {
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

	const validate = useCallback(
		(formData: BeregningFormData): ValidationErrors => {
			const errors: ValidationErrors = {}

			validateSivilstand(formData, errors)
			validateInntektFoerUttak(formData, errors)
			validateUttaksalder(formData, errors)
			validateUttaksgrad(formData, errors)
			validateInntektVsaHeltUttak(formData, errors)
			validateInntektVsaGradertUttak(formData, errors)
			validateAlderHeltMotGradert(formData, errors)
			if (
				formData.beregnMedGjenlevenderett &&
				formData.bakgrunnForBrukAvOpplysningerOmEPS === null
			) {
				errors.bakgrunnForBrukAvOpplysningerOmEPS =
					'Velg bakgrunn for bruk av opplysninger om EPS.'
			}

			if (
				formData.beregnMedGjenlevenderett &&
				formData.bakgrunnForBrukAvOpplysningerOmEPS !== null &&
				!formData.harHentetEPSOpplysninger
			) {
				errors.harHentetEPSOpplysninger =
					'Hent opplysninger om EPS eller beregn alderspensjon uten gjenlevenderett.'
			}

			if (
				formData.beregnMedGjenlevenderett &&
				formData.harHentetEPSOpplysninger
			) {
				if (formData.epsAntallUtenlandsOppholdAar === null) {
					errors.epsAntallUtenlandsOppholdAar =
						'Fyll ut år bodd/jobbet i utlandet etter fylte 16 år.'
				}

				if (
					formData.epsAntallUtenlandsOppholdAar !== null &&
					Number(formData.epsAntallUtenlandsOppholdAar) > 39
				) {
					errors.epsAntallUtenlandsOppholdAar =
						'Antall år i utlandet kan ikke være større enn 39 år.'
				}

				if (formData.epsPensjonsgivendeInntektFoerDoedsDato === null) {
					errors.epsPensjonsgivendeInntektFoerDoedsDato =
						'Fyll ut inntekt året før dødsdato.'
				}

				if (formData.epsMinstePensjonsgivendeInntektFoerDoedsfall === null) {
					errors.epsMinstePensjonsgivendeInntektFoerDoedsfall =
						'Velg ja/nei om inntekt ved dødsdato var minst 1G.'
				}

				if (formData.epsMedlemAvFolketrygdenVedDoedsDato === null) {
					errors.epsMedlemAvFolketrygdenVedDoedsDato =
						'Velg ja/nei om avdøde var medlem av folketrygden.'
				}

				if (formData.epsRegistretSomFlykting === null) {
					errors.epsRegistretSomFlykting =
						'Velg ja/nei om avdøde var registrert som flyktning.'
				}
			}

			if (formData.sivilstatus === 'UOPPGITT') {
				errors.sivilstatus = 'Velg sivilstatus.'
			}

			if (formData.aarligInntektFoerUttakBeloep === null) {
				errors.aarligInntektFoerUttakBeloep =
					'Pensjonsgivende inntekt frem til uttak er påkrevd.'
			}

			if (harPartner(formData.sivilstatus) && formData.epsHarPensjon === null) {
				errors.epsHarPensjon =
					'Du må velge om ektefelle/partner/samboer mottar pensjon'
			}

			if (
				shouldShowEpsHarInntektOver2G(
					formData.sivilstatus,
					formData.epsHarPensjon
				) &&
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

			if (formData.uttaksgrad === null) {
				errors.uttaksgrad = 'Uttaksgrad er påkrevd'
			}

			if (shouldShowGradertUttakFields(formData.uttaksgrad)) {
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

			if (shouldShowInntektHeltFields(formData.harInntektVedSidenAvUttak)) {
				if (formData.pensjonsgivendeInntektVedSidenAvUttak === null) {
					errors.pensjonsgivendeInntektVedSidenAvUttak =
						'Pensjonsgivende inntekt ved siden av uttak er påkrevd'
				}

				if (formData.alderAarInntektSlutter === null) {
					errors.alderAarInntektSlutter =
						'Alder (år) inntekt slutter er påkrevd'
				}

				if (formData.alderMdInntektSlutter === null) {
					errors.alderMdInntektSlutter =
						'Alder (md.) inntekt slutter er påkrevd'
				}
			}

			if (
				shouldShowInntektGradertFields(
					formData.uttaksgrad,
					formData.harInntektVedSidenAvGradertUttak
				)
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

			if (shouldShowGradertUttakFields(formData.uttaksgrad)) {
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
			return errors
		},
		[]
	)

	const validatebakgrunnForBrukAvOpplysningerOmEPS = useCallback(
		(formData: BeregningFormData): ValidationErrors => {
			const errors: ValidationErrors = {}

			if (formData.bakgrunnForBrukAvOpplysningerOmEPS === null) {
				errors.bakgrunnForBrukAvOpplysningerOmEPS =
					'Velg bakgrunn for bruk av opplysninger om EPS.'
			}

			setValidationErrors(errors)
			return errors
		},
		[]
	)

	const clearError = useCallback((field: keyof ValidationErrors) => {
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
		validatebakgrunnForBrukAvOpplysningerOmEPS,
	}
}

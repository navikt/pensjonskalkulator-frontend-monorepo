import { calculateUttaksalderAsDate } from '@pensjonskalkulator-frontend-monorepo/utils/alder'
import { useCallback, useEffect, useState } from 'react'

import type {
	BeregningFormData,
	ValidationErrors,
} from '../../api/beregningTypes'
import {
	harPartner,
	isUttakNesteKalenderaar,
	showAfpOffentligFields,
	showEpsHarInntektOver2G,
	showGradertUttakFields,
	showInntektGradertFields,
	showInntektHeltFields,
} from '../../api/formConditions'
import { isEpsUnder67EllerDoedsdatoFoer67aar } from './utils'

interface ValidateFormOptions {
	foedselsdato?: string
	erEndring?: boolean
	hideAfpSporsmaal?: boolean
	initialInntektAar?: number
}

function validateEPSOpplysninger(
	formData: BeregningFormData,
	errors: ValidationErrors
) {
	if (
		formData.epsAntallUtenlandsOppholdAar === undefined ||
		formData.epsAntallUtenlandsOppholdAar === null
	) {
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

	const epsFoedselsdato =
		formData.epsOpplysninger?.relasjonPersondata?.foedselsdato
	const epsDoedsdato = formData.epsOpplysninger?.relasjonPersondata?.doedsdato

	if (
		epsFoedselsdato &&
		isEpsUnder67EllerDoedsdatoFoer67aar({
			epsFoedselsdato,
			epsDoedsdato,
		}) &&
		formData.epsMinstePensjonsgivendeInntektFoerDoedsfall === null
	) {
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

function validateGjenlevenderett(
	formData: BeregningFormData,
	errors: ValidationErrors
) {
	if (!formData.beregnMedGjenlevenderett) {
		return
	}

	if (formData.bakgrunnForBrukAvOpplysningerOmEPS === null) {
		errors.bakgrunnForBrukAvOpplysningerOmEPS =
			'Velg grunnlag for å hente opplysninger om EPS.'
	}

	if (
		formData.bakgrunnForBrukAvOpplysningerOmEPS !== null &&
		!formData.harHentetEPSOpplysninger
	) {
		errors.harHentetEPSOpplysninger =
			'Hent opplysninger om EPS eller beregn alderspensjon uten gjenlevenderett.'
	}

	if (formData.harHentetEPSOpplysninger) {
		validateEPSOpplysninger(formData, errors)
	}
}

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

	if (
		isHarPartner &&
		formData.epsHarPensjon === null &&
		!formData.beregnMedGjenlevenderett
	) {
		errors.epsHarPensjon = `Fyll ut om ${partnerLabel} mottar pensjon, uføretrygd eller AFP.`
	}

	if (
		showEpsHarInntektOver2G({
			sivilstatus: formData.sivilstatus,
			epsHarPensjon: formData.epsHarPensjon,
			beregnMedGjenlevenderett: formData.beregnMedGjenlevenderett,
			erEndring: false,
		}) &&
		formData.epsHarInntektOver2G === null
	) {
		errors.epsHarInntektOver2G = `Fyll ut om ${partnerLabel} har inntekt over 2G.`
	}
}

function validateAfp(
	formData: BeregningFormData,
	errors: ValidationErrors,
	options?: { foedselsdato?: string; initialInntektAar?: number }
) {
	if (formData.beregnMedGjenlevenderett) {
		return
	}
	if (!formData.afp) {
		errors.afp = 'Velg om AFP skal inkluderes.'
	}

	if (formData.afp === 'serviceberegning') {
		if (
			isUttakNesteKalenderaar({
				foedselsdato: options?.foedselsdato,
				alderAarUttak: formData.alderAarUttak,
				alderMdUttak: formData.alderMdUttak,
			})
		) {
			validateInntektField({
				formData,
				errors,
				field: 'pensjonsgivendeInntektFremTilUttak',
			})
		}

		const forrigeAar = new Date().getFullYear() - 1
		const uttaksAar =
			options?.foedselsdato &&
			formData.alderAarUttak !== null &&
			formData.alderMdUttak !== null
				? calculateUttaksalderAsDate(
						{
							aar: formData.alderAarUttak,
							maaneder: formData.alderMdUttak,
						},
						options.foedselsdato
					).getFullYear()
				: null

		const harUttakIForrigeAarEllerTidligere =
			uttaksAar !== null && uttaksAar <= forrigeAar
		const skalViseForrigeAarInntektfelt =
			options?.initialInntektAar !== forrigeAar &&
			!harUttakIForrigeAarEllerTidligere

		if (skalViseForrigeAarInntektfelt) {
			validateInntektField({
				formData,
				errors,
				field: 'pensjonsgivendeInntektForrigeAar',
			})
		}
	}
}

function validateInntektField({
	formData,
	errors,
	field,
}: {
	formData: BeregningFormData
	errors: ValidationErrors
	field: keyof BeregningFormData & keyof ValidationErrors
}) {
	const value = formData[field]
	if (typeof value !== 'number') {
		errors[field] = 'Du må skrive hele tall for å oppgi inntekt.'
	}
	if (value === null) {
		errors[field] = 'Fyll ut inntekt.'
	} else if (typeof value === 'number' && value > 100_000_000) {
		errors[field] = 'Inntekten kan ikke overskride 100 000 000 kr.'
	}
}

function validateInntektFoerUttak(
	formData: BeregningFormData,
	errors: ValidationErrors
) {
	validateInntektField({
		formData,
		errors,
		field: 'aarligInntektFoerUttakBeloep',
	})
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
		showGradertUttakFields(formData.uttaksgrad) &&
		(formData.alderAarHeltUttak === null || formData.alderMdHeltUttak === null)
	) {
		errors.alderAarHeltUttak = 'Velg år og måned for 100 % uttak.'
	}
}

function validateInntektVsaGradertUttak(
	formData: BeregningFormData,
	errors: ValidationErrors
) {
	if (showInntektGradertFields(formData.uttaksgrad)) {
		validateInntektField({
			formData,
			errors,
			field: 'pensjonsgivendeInntektVedSidenAvGradertUttak',
		})
	}
}

function validateAlderHeltMotGradert(
	formData: BeregningFormData,
	errors: ValidationErrors
) {
	if (
		showGradertUttakFields(formData.uttaksgrad) &&
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

function validateInntektVsaHeltUttak(
	formData: BeregningFormData,
	errors: ValidationErrors
) {
	const harInntektVedSiden = formData.harInntektVedSidenAvUttak
	if (harInntektVedSiden === null) {
		errors.harInntektVedSidenAvUttak =
			'Velg ja/nei om bruker har inntekt ved siden av 100 % uttak.'
	}

	if (showInntektHeltFields(harInntektVedSiden)) {
		validateInntektField({
			formData,
			errors,
			field: 'pensjonsgivendeInntektVedSidenAvUttak',
		})

		if (
			formData.alderAarInntektSlutter === null ||
			formData.alderMdInntektSlutter === null
		) {
			errors.alderAarInntektSlutter =
				'Velg år og måned for når inntekt slutter.'
		}
	}
}

function validateTidsbegrensetOffentligAfp(
	formData: BeregningFormData,
	errors: ValidationErrors
) {
	validateInntektField({
		formData,
		errors,
		field: 'inntektSisteMaanedFoerUttak',
	})
	validateInntektField({
		formData,
		errors,
		field: 'aarsinntektSamtidigMedAfp',
	})
}

function validateUtenlandsOpphold(
	formData: BeregningFormData,
	errors: ValidationErrors
) {
	if (formData.harOppholdUtenforNorge === null) {
		errors.harOppholdUtenforNorge =
			'Velg ja/nei om bruker har opphold utenfor Norge.'
	}
}

export function useFormValidation() {
	const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})

	useEffect(() => {
		const ariaInvalidElements = document.querySelectorAll(
			'input[aria-invalid]:not([aria-invalid="false"]), select[aria-invalid]:not([aria-invalid="false"]), input[data-feil="true"], select[data-feil="true"], fieldset[data-feil="true"] input'
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
		(
			formData: BeregningFormData,
			{
				foedselsdato,
				erEndring = false,
				hideAfpSporsmaal = false,
				initialInntektAar,
			}: ValidateFormOptions = {}
		): ValidationErrors => {
			const errors: ValidationErrors = {}

			const erAfpOffentlig = showAfpOffentligFields({
				afp: formData.afp,
				foedselsdato,
			})

			validateGjenlevenderett(formData, errors)
			if (!erEndring) {
				validateSivilstand(formData, errors)
			}
			if (!hideAfpSporsmaal) {
				validateAfp(formData, errors, { foedselsdato, initialInntektAar })
			}
			validateInntektFoerUttak(formData, errors)
			validateUttaksalder(formData, errors)

			if (erAfpOffentlig) {
				validateTidsbegrensetOffentligAfp(formData, errors)
			} else {
				validateUttaksgrad(formData, errors)
				validateInntektVsaGradertUttak(formData, errors)
				validateAlderHeltMotGradert(formData, errors)
				validateInntektVsaHeltUttak(formData, errors)
			}
			if (!erEndring) {
				validateUtenlandsOpphold(formData, errors)
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
					'Velg grunnlag for å hente opplysninger om EPS.'
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

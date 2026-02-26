import type { AlderspensjonRequestBody } from '@pensjonskalkulator-frontend-monorepo/types'

import type { BeregningFormData } from './beregningTypes'

export function mapBeregningParamsToRequest(
	formData: BeregningFormData,
	foedselsdato: string
): AlderspensjonRequestBody {
	const uttaksalder = {
		aar: formData.alderAarUttak ?? 0,
		maaneder: formData.alderMdUttak ?? 0,
	}

	const harInntektVedSiden = formData.harInntektVedSidenAvUttak === true
	const inntektVsaBeloep = harInntektVedSiden
		? formData.pensjonsgivendeInntektVedSidenAvUttak
			? Number(formData.pensjonsgivendeInntektVedSidenAvUttak)
			: undefined
		: undefined
	const inntektSluttAar = harInntektVedSiden
		? (formData.alderAarInntektSlutter ?? undefined)
		: undefined
	const inntektSluttMd = harInntektVedSiden
		? (formData.alderMdInntektSlutter ?? undefined)
		: undefined

	const aarligInntektFoerUttak = formData.aarligInntektFoerUttakBeloep
		? Number(formData.aarligInntektFoerUttakBeloep)
		: undefined

	const grad = formData.uttaksgrad ?? 0
	const erGradert = grad < 100

	const aarligInntektVsaPensjonGradert =
		erGradert && formData.aarligInntektVsaPensjonGradertUttak
			? formData.aarligInntektVsaPensjonGradertUttak
			: undefined

	const heltUttaksalder = erGradert
		? {
				aar: formData.alderAarHeltUttak ?? 0,
				maaneder: formData.alderMdHeltUttak ?? 0,
			}
		: uttaksalder

	return {
		simuleringstype: 'ALDERSPENSJON',
		foedselsdato,
		aarligInntektFoerUttakBeloep: aarligInntektFoerUttak,
		gradertUttak: erGradert
			? {
					grad,
					uttaksalder,
					aarligInntektVsaPensjonBeloep: aarligInntektVsaPensjonGradert,
				}
			: undefined,
		heltUttak: {
			uttaksalder: heltUttaksalder,
			aarligInntektVsaPensjon:
				inntektVsaBeloep !== undefined &&
				inntektSluttAar !== undefined &&
				inntektSluttMd !== undefined
					? {
							beloep: inntektVsaBeloep,
							sluttAlder: {
								aar: inntektSluttAar,
								maaneder: inntektSluttMd,
							},
						}
					: undefined,
		},
		sivilstand: formData.sivilstand ?? 'UGIFT',
		epsHarPensjon: formData.epsHarPensjon ?? undefined,
		epsHarInntektOver2G: formData.epsHarInntektOver2G ?? undefined,
	}
}

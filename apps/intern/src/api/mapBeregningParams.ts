import type { SimuleringRequestBody } from '@pensjonskalkulator-frontend-monorepo/types'

import type { BeregningFormData } from './beregningTypes'

export function mapBeregningParamsToRequest(
	formData: BeregningFormData
): SimuleringRequestBody {
	const uttaksalder = {
		aar: formData.alderAarUttak ?? 0,
		maaneder: formData.alderMdUttak ?? 0,
	}

	const harInntektVedSiden = formData.harInntektVedSidenAvUttak === true
	const inntektVsaBeloep = harInntektVedSiden
		? (formData.pensjonsgivendeInntektVedSidenAvUttak ?? undefined)
		: undefined
	const inntektSluttAar = harInntektVedSiden
		? (formData.alderAarInntektSlutter ?? undefined)
		: undefined
	const inntektSluttMd = harInntektVedSiden
		? (formData.alderMdInntektSlutter ?? undefined)
		: undefined

	const aarligInntektFoerUttak =
		formData.aarligInntektFoerUttakBeloep ?? undefined

	const grad = formData.uttaksgrad ?? 0
	const erGradert = grad < 100

	const aarligInntektVsaPensjonGradert =
		erGradert && formData.pensjonsgivendeInntektVedSidenAvGradertUttak
			? formData.pensjonsgivendeInntektVedSidenAvGradertUttak
			: undefined

	const heltUttaksalder = erGradert
		? {
				aar: formData.alderAarHeltUttak ?? 0,
				maaneder: formData.alderMdHeltUttak ?? 0,
			}
		: uttaksalder

	return {
		simuleringstype: 'ALDERSPENSJON',
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
		sivilstatus: formData.sivilstatus,
		eps: {
			levende: {
				harInntektOver2G: Boolean(formData.epsHarInntektOver2G),
				harPensjon: Boolean(formData.epsHarPensjon),
			},
			avdoed:
				formData.epsOpplysninger?.pid &&
				formData.epsOpplysninger?.relasjonPersondata?.doedsdato
					? {
							pid: formData.epsOpplysninger?.pid,
							doedsdato:
								formData.epsOpplysninger?.relasjonPersondata?.doedsdato,
							medlemAvFolketrygden: Boolean(
								formData.epsMedlemAvFolketrygdenVedDoedsDato
							),
							inntektFoerDoedBeloep:
								formData.epsPensjonsgivendeInntektFoerDoedsDato ?? undefined,
							inntektErOverGrunnbeloepet: Boolean(
								formData.epsMinstePensjonsgivendeInntektFoerDoedsfall
							),
							antallAarUtenlands: formData.epsAntallUtenlandsOppholdAar,
						}
					: undefined,
		},
	}
}

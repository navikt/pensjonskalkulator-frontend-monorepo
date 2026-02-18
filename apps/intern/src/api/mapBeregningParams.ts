import type { AlderspensjonRequestBody } from '@pensjonskalkulator-frontend-monorepo/types'

import type { BeregningFormData } from './beregningTypes'

export function mapBeregningParamsToRequest(
	formData: BeregningFormData,
	foedselsdato: string
): AlderspensjonRequestBody {
	const uttaksalder = {
		aar: parseInt(formData.alderAarUttak, 10),
		maaneder: parseInt(formData.alderMdUttak, 10),
	}

	const harInntektVedSiden = formData.harInntektVedSidenAvUttak === 'ja'
	const inntektVsaBeloep = harInntektVedSiden
		? parseInt(formData.pensjonsgivendeInntektVedSidenAvUttak, 10)
		: undefined
	const inntektSluttAar = harInntektVedSiden
		? parseInt(formData.alderAarInntektSlutter, 10)
		: undefined
	const inntektSluttMd = harInntektVedSiden
		? parseInt(formData.alderMdInntektSlutter, 10)
		: undefined

	const aarligInntektFoerUttak = formData.pensjonsgivendeInntektFremTilUttak
		? parseInt(formData.pensjonsgivendeInntektFremTilUttak, 10)
		: undefined

	return {
		simuleringstype: 'ALDERSPENSJON',
		foedselsdato,
		aarligInntektFoerUttakBeloep: aarligInntektFoerUttak,
		heltUttak: {
			uttaksalder,
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
		sivilstand: formData.sivilstand,
		epsHarPensjon:
			formData.ektefelleMottarPensjon === ''
				? undefined
				: formData.ektefelleMottarPensjon === 'ja',
		epsHarInntektOver2G:
			formData.ektefelleInntektOver2G === ''
				? undefined
				: formData.ektefelleInntektOver2G === 'ja',
	}
}

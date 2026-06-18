import type { Opptjening } from '@pensjonskalkulator-frontend-monorepo/types'
import { calculateUttaksalderAsDate } from '@pensjonskalkulator-frontend-monorepo/utils/alder'

import type { BeregningFormData } from '../api/beregningTypes'

function appendRow(
	base: Opptjening,
	aar: number,
	inntekt: number,
	merknad: string
): Opptjening {
	return [
		...base,
		{
			aar,
			pensjonsgivendeInntekt: inntekt,
			pensjonspoeng: 0,
			omsorgspoeng: null,
			beholdning: null,
			pensjonspoengType: merknad,
		},
	]
}

export function augmentOpptjening(
	opptjening: Opptjening,
	aktivBeregning: BeregningFormData,
	foedselsdato: string
): Opptjening {
	const hasUttak =
		aktivBeregning.alderAarUttak != null && aktivBeregning.alderMdUttak != null
	const uttakYear = hasUttak
		? calculateUttaksalderAsDate(
				{
					aar: aktivBeregning.alderAarUttak!,
					maaneder: aktivBeregning.alderMdUttak!,
				},
				foedselsdato
			).getFullYear()
		: null

	let result = opptjening

	if (
		uttakYear != null &&
		aktivBeregning.aarligInntektFoerUttakBeloep != null
	) {
		result = appendRow(
			result,
			uttakYear,
			aktivBeregning.aarligInntektFoerUttakBeloep,
			'Oppgitt inntekt'
		)
	}

	if (
		uttakYear != null &&
		aktivBeregning.pensjonsgivendeInntektVedSidenAvGradertUttak != null
	) {
		result = appendRow(
			result,
			uttakYear,
			aktivBeregning.pensjonsgivendeInntektVedSidenAvGradertUttak,
			`Alderspensjon ${aktivBeregning.uttaksgrad}%`
		)
	}

	return result
}

export function augmentOpptjeningAvdoed(
	opptjening: Opptjening,
	aktivBeregning: BeregningFormData
): Opptjening {
	const epsDoedsdato =
		aktivBeregning.epsOpplysninger?.relasjonPersondata?.doedsdato

	if (
		aktivBeregning.epsPensjonsgivendeInntektFoerDoedsDato != null &&
		epsDoedsdato
	) {
		const yearBeforeDeath = new Date(epsDoedsdato).getFullYear() - 1
		return appendRow(
			opptjening,
			yearBeforeDeath,
			aktivBeregning.epsPensjonsgivendeInntektFoerDoedsDato,
			'Oppgitt inntekt'
		)
	}

	return opptjening
}

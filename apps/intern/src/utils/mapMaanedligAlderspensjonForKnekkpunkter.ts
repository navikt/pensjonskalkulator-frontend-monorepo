import type {
	LagreMaanedligAlderspensjonForKnekkpunkterDto,
	SimuleringResponseBody,
} from '@pensjonskalkulator-frontend-monorepo/types'

import type { InternAfpRadio } from '../api/beregningTypes'
import { mapLagreMaanedligAlderspensjon } from './mapLagreMaanedligAlderspensjon'

type ResultKnekkpunkter =
	SimuleringResponseBody['maanedligAlderspensjonForKnekkpunkter']

export function mapMaanedligAlderspensjonForKnekkpunkter(
	knekkpunkter: ResultKnekkpunkter,
	grunnbeloep?: number | null,
	kull?: Kull | null,
	afpType?: InternAfpRadio,
	simulererMedGjenlevenderett?: boolean,
	harGjenlevenderett?: boolean,
	removeNormertPensjonsalder?: boolean
): LagreMaanedligAlderspensjonForKnekkpunkterDto | null {
	if (!knekkpunkter) return null

	const vedNormertPensjonsalder = removeNormertPensjonsalder
		? null
		: mapLagreMaanedligAlderspensjon(
				knekkpunkter.vedNormertPensjonsalder,
				grunnbeloep,
				kull
			)

	if (afpType === 'ja_offentlig') {
		if (!vedNormertPensjonsalder) return null

		return {
			vedHeltUttak: vedNormertPensjonsalder,
		}
	}

	const vedHeltUttak = mapLagreMaanedligAlderspensjon(
		knekkpunkter.vedHeltUttak,
		grunnbeloep,
		kull
	)

	if (!vedHeltUttak) return null

	const vedGradertUttak = mapLagreMaanedligAlderspensjon(
		knekkpunkter.vedGradertUttak,
		grunnbeloep,
		kull,
		simulererMedGjenlevenderett,
		harGjenlevenderett
	)

	return {
		vedGradertUttak,
		vedHeltUttak,
		vedNormertPensjonsalder,
	}
}

import type {
	SimuleringResponseBody,
	components,
} from '@pensjonskalkulator-frontend-monorepo/types'

import { mapLagreMaanedligAlderspensjon } from './mapLagreMaanedligAlderspensjon'

type ResultKnekkpunkter =
	SimuleringResponseBody['maanedligAlderspensjonForKnekkpunkter']
type LagreMaanedligAlderspensjonForKnekkpunkterDto =
	components['schemas']['LagreMaanedligAlderspensjonForKnekkpunkterDto']

type Kull = 'KAP19' | 'KAP20' | 'OVERGANG'

export function mapMaanedligAlderspensjonForKnekkpunkter(
	knekkpunkter: ResultKnekkpunkter,
	grunnbeloep?: number | null,
	kull?: Kull | null
): LagreMaanedligAlderspensjonForKnekkpunkterDto | null {
	if (!knekkpunkter) {
		return null
	}

	const vedHeltUttak = mapLagreMaanedligAlderspensjon(
		knekkpunkter.vedHeltUttak,
		grunnbeloep,
		kull
	)
	const vedNormertPensjonsalder = mapLagreMaanedligAlderspensjon(
		knekkpunkter.vedNormertPensjonsalder,
		grunnbeloep,
		kull
	)

	if (!vedHeltUttak || !vedNormertPensjonsalder) {
		return null
	}

	return {
		vedGradertUttak: mapLagreMaanedligAlderspensjon(
			knekkpunkter.vedGradertUttak,
			grunnbeloep,
			kull
		),
		vedHeltUttak,
		vedNormertPensjonsalder,
	}
}

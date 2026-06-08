import type {
	SimuleringResponseBody,
	components,
} from '@pensjonskalkulator-frontend-monorepo/types'

import type { InternAfpRadio } from '../api/beregningTypes'
import { mapLagreMaanedligAlderspensjon } from './mapLagreMaanedligAlderspensjon'

type ResultKnekkpunkter =
	SimuleringResponseBody['maanedligAlderspensjonForKnekkpunkter']
type LagreMaanedligAlderspensjonForKnekkpunkterDto =
	components['schemas']['LagreMaanedligAlderspensjonForKnekkpunkterDto']

type Kull = 'KAP19' | 'KAP20' | 'OVERGANG'

export function mapMaanedligAlderspensjonForKnekkpunkter(
	knekkpunkter: ResultKnekkpunkter,
	grunnbeloep?: number | null,
	kull?: Kull | null,
	afpType?: InternAfpRadio
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

	if (afpType === 'ja_offentlig') {
		if (!vedNormertPensjonsalder) {
			return null
		}

		return {
			vedHeltUttak: vedNormertPensjonsalder,
		}
	}

	if (!vedHeltUttak) {
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

import type { Alder } from '@pensjonskalkulator-frontend-monorepo/types'

import type { BeregningParams } from '../api/beregningTypes'

export function getUttakInfo(aktivBeregning: BeregningParams | null) {
	const erGradert =
		aktivBeregning !== null &&
		aktivBeregning.uttaksgrad !== null &&
		aktivBeregning.uttaksgrad < 100 &&
		aktivBeregning.uttaksgrad !== 0

	const heltUttakAar = erGradert
		? aktivBeregning.alderAarHeltUttak
		: aktivBeregning?.alderAarUttak

	const heltUttakMaaned = erGradert
		? aktivBeregning.alderMdHeltUttak
		: aktivBeregning?.alderMdUttak

	const heltUttakAlder: Alder = {
		aar: heltUttakAar ?? 0,
		maaneder: heltUttakMaaned ?? 0,
	}

	const gradertUttakAar = erGradert ? aktivBeregning?.alderAarUttak : undefined

	const gradertUttakMaaned = erGradert
		? aktivBeregning?.alderMdUttak
		: undefined

	const gradertUttakAlder: Alder | undefined = erGradert
		? {
				aar: gradertUttakAar ?? 0,
				maaneder: gradertUttakMaaned ?? 0,
			}
		: undefined

	return { erGradert, heltUttakAlder, gradertUttakAlder }
}

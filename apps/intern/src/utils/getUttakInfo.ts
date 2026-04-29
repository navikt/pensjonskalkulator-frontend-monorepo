import type { Alder } from '@pensjonskalkulator-frontend-monorepo/types'

import type { BeregningParams } from '../api/beregningTypes'

function toAlder(aar?: number | null, maaneder?: number | null): Alder {
	return {
		aar: aar ?? 0,
		maaneder: maaneder ?? 0,
	}
}

export function getUttakInfo(aktivBeregning: BeregningParams | null) {
	if (aktivBeregning === null) {
		return {
			erGradert: false,
			heltUttakAlder: toAlder(),
			gradertUttakAlder: undefined,
		}
	}

	const { uttaksgrad } = aktivBeregning
	const erUttaksgradNull = uttaksgrad === 0
	const erGradert = uttaksgrad !== null && uttaksgrad > 0 && uttaksgrad < 100
	const harGradertEllerNullUttaksgrad = erGradert || erUttaksgradNull

	const heltUttakAlder = harGradertEllerNullUttaksgrad
		? toAlder(aktivBeregning.alderAarHeltUttak, aktivBeregning.alderMdHeltUttak)
		: toAlder(aktivBeregning.alderAarUttak, aktivBeregning.alderMdUttak)

	const gradertUttakAlder = harGradertEllerNullUttaksgrad
		? toAlder(aktivBeregning.alderAarUttak, aktivBeregning.alderMdUttak)
		: undefined

	return { erGradert, heltUttakAlder, gradertUttakAlder }
}

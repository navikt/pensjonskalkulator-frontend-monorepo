import type {
	SimuleringAfpPrivat,
	SimuleringAlderspensjon,
	TidsbegrensetOffentligAFP,
} from '@pensjonskalkulator-frontend-monorepo/types'
import {
	type AarligUtbetaling,
	type Alder,
	mergeAarligUtbetalinger,
	parseStartSluttUtbetaling,
} from '@pensjonskalkulator-frontend-monorepo/utils'
import { getAlderMinus1Maaned } from '@pensjonskalkulator-frontend-monorepo/utils/alder'

import type { BeregningParams } from '../api/beregningTypes'
import { getUttakInfo } from './getUttakInfo'

export const SISTE_AAR = 75

export interface AarligBeloep {
	aar: number
	beloep: number
}

export const filterAndMapSerie = (
	serie: AarligUtbetaling[],
	maxAar: number
): AarligBeloep[] => {
	return serie
		.filter((item) => item.alder !== Infinity && item.alder <= maxAar)
		.map((item) => ({ aar: item.alder, beloep: item.beloep }))
}

const compareAlder = (left: Alder, right: Alder): number => {
	if (left.aar !== right.aar) return left.aar - right.aar
	return left.maaneder - right.maaneder
}

export const buildAlderspensjonSerie = (
	alderspensjonListe: SimuleringAlderspensjon[]
): AarligUtbetaling[] => [
	...alderspensjonListe
		.filter(({ alderAar }) => alderAar <= SISTE_AAR)
		.map(({ alderAar, beloep }) => ({ alder: alderAar, beloep: beloep ?? 0 })),
	...(alderspensjonListe.length > 0
		? [{ alder: Infinity, beloep: alderspensjonListe.at(-1)!.beloep ?? 0 }]
		: []),
]

export const buildAfpSerie = (
	privatAfpListe: SimuleringAfpPrivat[] | null | undefined,
	tidsbegrensetOffentligAfp: TidsbegrensetOffentligAFP | null | undefined,
	heltUttakAlder: Alder
): AarligUtbetaling[] => {
	// Privat AFP er livsvarig
	const privatAfpSerie: AarligUtbetaling[] = [
		...(privatAfpListe ?? [])
			.filter(({ alderAar }) => alderAar <= SISTE_AAR)
			.map(({ alderAar, aarligBeloep }) => ({
				alder: alderAar,
				beloep: aarligBeloep ?? 0,
			})),
		...((privatAfpListe?.length ?? 0) > 0
			? [{ alder: Infinity, beloep: privatAfpListe!.at(-1)!.aarligBeloep ?? 0 }]
			: []),
	]

	// Offentlig (tidsbegrenset) AFP løper fra helt uttak til 66 år
	const offentligAfpSerie: AarligUtbetaling[] =
		tidsbegrensetOffentligAfp && tidsbegrensetOffentligAfp.alderAar <= SISTE_AAR
			? parseStartSluttUtbetaling({
					startAlder: heltUttakAlder,
					sluttAlder: { aar: 66, maaneder: 11 },
					aarligUtbetaling:
						(tidsbegrensetOffentligAfp.totaltAfpBeloep ?? 0) * 12,
				})
			: []

	return mergeAarligUtbetalinger([privatAfpSerie, offentligAfpSerie])
}

export interface BuildInntektSerieParams {
	aarligInntektFoerUttakBeloep: number
	aktiverBeregning?: BeregningParams | null
}

export const buildInntektSerie = ({
	aarligInntektFoerUttakBeloep,
	aktiverBeregning,
}: BuildInntektSerieParams): AarligUtbetaling[] => {
	const { heltUttakAlder, gradertUttakAlder } = getUttakInfo(
		aktiverBeregning ?? null
	)
	const forsteUttakAlder = gradertUttakAlder ?? heltUttakAlder
	const aarFoerUttak = forsteUttakAlder.aar - 1

	const gradertStartAlder: Alder | undefined =
		aktiverBeregning?.alderAarUttak != null &&
		aktiverBeregning?.alderMdUttak != null
			? {
					aar: aktiverBeregning.alderAarUttak,
					maaneder: aktiverBeregning.alderMdUttak,
				}
			: undefined

	const gradertSluttAlder: Alder =
		heltUttakAlder.maaneder === 0
			? { aar: heltUttakAlder.aar - 1, maaneder: 11 }
			: { aar: heltUttakAlder.aar, maaneder: heltUttakAlder.maaneder - 1 }

	const harGyldigGradertPeriode =
		gradertStartAlder !== undefined &&
		compareAlder(gradertStartAlder, gradertSluttAlder) <= 0

	const inntektVedSidenAvUttakSluttAlder: Alder | undefined =
		aktiverBeregning?.alderAarInntektSlutter != null &&
		aktiverBeregning?.alderMdInntektSlutter != null
			? {
					aar: aktiverBeregning.alderAarInntektSlutter,
					maaneder: aktiverBeregning.alderMdInntektSlutter,
				}
			: undefined

	// Inntekt før uttak: året før første uttak frem til uttaksalder
	const inntektFoerUttak =
		aarFoerUttak > 0 &&
		aarFoerUttak <= SISTE_AAR &&
		compareAlder({ aar: aarFoerUttak, maaneder: 0 }, forsteUttakAlder) <= 0
			? parseStartSluttUtbetaling({
					startAlder: { aar: aarFoerUttak, maaneder: 0 },
					sluttAlder: getAlderMinus1Maaned(forsteUttakAlder),
					aarligUtbetaling: aarligInntektFoerUttakBeloep,
				})
			: []

	// Inntekt under gradert uttak (frem til helt uttak)
	const inntektVedGradertUttak =
		(aktiverBeregning?.pensjonsgivendeInntektVedSidenAvGradertUttak ?? 0) > 0 &&
		harGyldigGradertPeriode &&
		gradertStartAlder
			? parseStartSluttUtbetaling({
					startAlder: gradertUttakAlder ?? gradertStartAlder,
					sluttAlder: getAlderMinus1Maaned(heltUttakAlder),
					aarligUtbetaling:
						aktiverBeregning?.pensjonsgivendeInntektVedSidenAvGradertUttak ?? 0,
				})
			: []
	// Inntekt ved siden av helt uttak
	const inntektVedSidenAvHeltUttak =
		(aktiverBeregning?.pensjonsgivendeInntektVedSidenAvUttak ?? 0) > 0 &&
		inntektVedSidenAvUttakSluttAlder &&
		compareAlder(heltUttakAlder, inntektVedSidenAvUttakSluttAlder) <= 0
			? parseStartSluttUtbetaling({
					startAlder: heltUttakAlder,
					sluttAlder: getAlderMinus1Maaned(inntektVedSidenAvUttakSluttAlder),
					aarligUtbetaling:
						aktiverBeregning?.pensjonsgivendeInntektVedSidenAvUttak ?? 0,
				})
			: []

	// Inntekt samtidig med AFP (frem til 66 år)
	const inntektSamtidigMedAfp =
		(aktiverBeregning?.aarsinntektSamtidigMedAfp ?? 0) > 0
			? parseStartSluttUtbetaling({
					startAlder: heltUttakAlder,
					sluttAlder: { aar: 66, maaneder: 11 },
					aarligUtbetaling: aktiverBeregning?.aarsinntektSamtidigMedAfp ?? 0,
				})
			: []

	return mergeAarligUtbetalinger([
		inntektFoerUttak,
		inntektVedGradertUttak,
		inntektVedSidenAvHeltUttak,
		inntektSamtidigMedAfp,
	])
}

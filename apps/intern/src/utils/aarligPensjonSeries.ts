import type {
	PersonInternV1,
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
import {
	getAlderMinus1Maaned,
	transformFoedselsdatoToAlder,
} from '@pensjonskalkulator-frontend-monorepo/utils/alder'

import type { BeregningParams } from '../api/beregningTypes'
import { getUttakInfo } from './getUttakInfo'

export const SISTE_AAR = 77

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
		...parseStartSluttUtbetaling({
			startAlder: {
				aar: (privatAfpListe?.at(-1)?.alderAar ?? 75) + 1,
				maaneder: 0,
			},
			sluttAlder: { aar: SISTE_AAR, maaneder: 11 },
			aarligUtbetaling: privatAfpListe?.at(-1)?.aarligBeloep ?? 0,
		}),
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
	person?: PersonInternV1 | null
}

export const buildInntektSerie = ({
	aarligInntektFoerUttakBeloep,
	aktiverBeregning,
	person,
}: BuildInntektSerieParams): AarligUtbetaling[] => {
	const { heltUttakAlder, gradertUttakAlder } = getUttakInfo(
		aktiverBeregning ?? null
	)
	const forsteUttakAlder = gradertUttakAlder ?? heltUttakAlder
	const aarFoerUttak = forsteUttakAlder.aar - 1

	const inntektVedSidenAvUttakSluttAlder: Alder | undefined =
		aktiverBeregning?.alderAarInntektSlutter != null &&
		aktiverBeregning?.alderMdInntektSlutter != null
			? {
					aar: aktiverBeregning.alderAarInntektSlutter,
					maaneder: aktiverBeregning.alderMdInntektSlutter,
				}
			: undefined
	// Inntekt før uttak: året før første uttak frem til uttaksalder
	const brukerAlderNaa = person?.foedselsdato
		? transformFoedselsdatoToAlder(person.foedselsdato)
		: undefined

	const inntektFoerUttak =
		aarFoerUttak > 0
			? parseStartSluttUtbetaling({
					startAlder: {
						aar:
							aktiverBeregning?.endringAP && brukerAlderNaa
								? brukerAlderNaa.aar
								: aarFoerUttak,
						maaneder: 0,
					},
					sluttAlder: getAlderMinus1Maaned(forsteUttakAlder),
					aarligUtbetaling: aarligInntektFoerUttakBeloep,
				})
			: []

	// Inntekt under gradert uttak (frem til helt uttak)
	const inntektVedGradertUttak =
		aktiverBeregning?.pensjonsgivendeInntektVedSidenAvGradertUttak &&
		gradertUttakAlder
			? parseStartSluttUtbetaling({
					startAlder: gradertUttakAlder,
					sluttAlder: getAlderMinus1Maaned(heltUttakAlder),
					aarligUtbetaling:
						aktiverBeregning.pensjonsgivendeInntektVedSidenAvGradertUttak,
				})
			: []
	// Inntekt ved siden av helt uttak
	const inntektVedSidenAvHeltUttak =
		aktiverBeregning?.pensjonsgivendeInntektVedSidenAvUttak &&
		inntektVedSidenAvUttakSluttAlder
			? parseStartSluttUtbetaling({
					startAlder: heltUttakAlder,
					sluttAlder: getAlderMinus1Maaned(inntektVedSidenAvUttakSluttAlder),
					aarligUtbetaling:
						aktiverBeregning.pensjonsgivendeInntektVedSidenAvUttak,
				})
			: []
	// Inntekt samtidig med AFP (frem til 66 år)
	const inntektSamtidigMedAfp = aktiverBeregning?.aarsinntektSamtidigMedAfp
		? parseStartSluttUtbetaling({
				startAlder: heltUttakAlder,
				sluttAlder: { aar: 66, maaneder: 11 },
				aarligUtbetaling: aktiverBeregning.aarsinntektSamtidigMedAfp,
			})
		: []

	return mergeAarligUtbetalinger([
		inntektFoerUttak,
		inntektVedGradertUttak,
		inntektVedSidenAvHeltUttak,
		inntektSamtidigMedAfp,
	])
}

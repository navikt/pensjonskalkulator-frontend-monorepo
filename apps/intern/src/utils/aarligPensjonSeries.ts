import type {
	PersonInternV1,
	ServiceberegnetAfp,
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
export const SISTE_AAR_SERVICEBEREGNING = 67

export const getSisteAar = (aktivBeregning?: BeregningParams | null): number =>
	aktivBeregning?.afp === 'serviceberegning'
		? SISTE_AAR_SERVICEBEREGNING
		: SISTE_AAR

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
	alderspensjonListe: SimuleringAlderspensjon[],
	sisteAar: number = SISTE_AAR
): AarligUtbetaling[] => [
	...alderspensjonListe
		.filter(({ alderAar }) => alderAar <= sisteAar)
		.map(({ alderAar, beloep }) => ({ alder: alderAar, beloep: beloep ?? 0 })),
	...(alderspensjonListe.length > 0
		? [{ alder: Infinity, beloep: alderspensjonListe.at(-1)!.beloep ?? 0 }]
		: []),
]

export const buildAfpSerie = (
	privatAfpListe: SimuleringAfpPrivat[] | null | undefined,
	tidsbegrensetOffentligAfp: TidsbegrensetOffentligAFP | null | undefined,
	heltUttakAlder: Alder,
	sisteAar: number = SISTE_AAR,
	serviceberegnetAfp?: ServiceberegnetAfp | null
): AarligUtbetaling[] => {
	// Privat AFP er livsvarig
	const privatAfpSerie: AarligUtbetaling[] = [
		...(privatAfpListe ?? [])
			.filter(({ alderAar }) => alderAar <= sisteAar)
			.map(({ alderAar, aarligBeloep }) => ({
				alder: alderAar,
				beloep: aarligBeloep ?? 0,
			})),
		...parseStartSluttUtbetaling({
			startAlder: {
				aar: (privatAfpListe?.at(-1)?.alderAar ?? 75) + 1,
				maaneder: 0,
			},
			sluttAlder: { aar: sisteAar, maaneder: 11 },
			aarligUtbetaling: privatAfpListe?.at(-1)?.aarligBeloep ?? 0,
		}),
	]

	// Offentlig (tidsbegrenset) AFP løper fra helt uttak til 66 år
	const offentligAfpSerie: AarligUtbetaling[] =
		tidsbegrensetOffentligAfp && tidsbegrensetOffentligAfp.alderAar <= sisteAar
			? parseStartSluttUtbetaling({
					startAlder: heltUttakAlder,
					sluttAlder: { aar: 66, maaneder: 11 },
					aarligUtbetaling:
						(tidsbegrensetOffentligAfp.totaltAfpBeloep ?? 0) * 12,
				})
			: []

	// Serviceberegnet (tidsbegrenset offentlig) AFP løper fra helt uttak til 67 år
	const beregnetAfp = serviceberegnetAfp?.beregnetAfp
	const serviceAfpMaanedligBeloep = beregnetAfp
		? (beregnetAfp.grunnpensjon ?? 0) +
			(beregnetAfp.tilleggspensjon ?? 0) +
			(beregnetAfp.afpTillegg ?? 0) +
			(beregnetAfp.saertillegg ?? 0)
		: 0
	const serviceAfpSerie: AarligUtbetaling[] = beregnetAfp
		? parseStartSluttUtbetaling({
				startAlder: heltUttakAlder,
				sluttAlder: { aar: 66, maaneder: 11 },
				aarligUtbetaling: serviceAfpMaanedligBeloep * 12,
			})
		: []

	return mergeAarligUtbetalinger([
		privatAfpSerie,
		offentligAfpSerie,
		serviceAfpSerie,
	])
}

export interface BuildInntektSerieParams {
	aarligInntektFoerUttakBeloep: number
	aktivBeregning?: BeregningParams | null
	person?: PersonInternV1 | null
}

export const buildInntektSerie = ({
	aarligInntektFoerUttakBeloep,
	aktivBeregning,
	person,
}: BuildInntektSerieParams): AarligUtbetaling[] => {
	const { heltUttakAlder, gradertUttakAlder } = getUttakInfo(
		aktivBeregning ?? null
	)
	const forsteUttakAlder = gradertUttakAlder ?? heltUttakAlder
	const aarFoerUttak = forsteUttakAlder.aar - 1

	const inntektVedSidenAvUttakSluttAlder: Alder | undefined =
		aktivBeregning?.alderAarInntektSlutter != null &&
		aktivBeregning?.alderMdInntektSlutter != null
			? {
					aar: aktivBeregning.alderAarInntektSlutter,
					maaneder: aktivBeregning.alderMdInntektSlutter,
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
							aktivBeregning?.endringAP && brukerAlderNaa
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
		aktivBeregning?.pensjonsgivendeInntektVedSidenAvGradertUttak &&
		gradertUttakAlder
			? parseStartSluttUtbetaling({
					startAlder: gradertUttakAlder,
					sluttAlder: getAlderMinus1Maaned(heltUttakAlder),
					aarligUtbetaling:
						aktivBeregning.pensjonsgivendeInntektVedSidenAvGradertUttak,
				})
			: []
	// Inntekt ved siden av helt uttak
	const inntektVedSidenAvHeltUttak =
		aktivBeregning?.pensjonsgivendeInntektVedSidenAvUttak &&
		inntektVedSidenAvUttakSluttAlder
			? parseStartSluttUtbetaling({
					startAlder: heltUttakAlder,
					sluttAlder: getAlderMinus1Maaned(inntektVedSidenAvUttakSluttAlder),
					aarligUtbetaling:
						aktivBeregning.pensjonsgivendeInntektVedSidenAvUttak,
				})
			: []
	// Inntekt samtidig med AFP (frem til 66 år)
	const inntektSamtidigMedAfp = aktivBeregning?.aarsinntektSamtidigMedAfp
		? parseStartSluttUtbetaling({
				startAlder: heltUttakAlder,
				sluttAlder: { aar: 66, maaneder: 11 },
				aarligUtbetaling: aktivBeregning.aarsinntektSamtidigMedAfp,
			})
		: []

	return mergeAarligUtbetalinger([
		inntektFoerUttak,
		inntektVedGradertUttak,
		inntektVedSidenAvHeltUttak,
		inntektSamtidigMedAfp,
	])
}

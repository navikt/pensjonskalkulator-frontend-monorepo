import type {
	Alder,
	LagreSimuleringSpecDtoV1,
	SimuleringUtenlandsperiode,
} from '@pensjonskalkulator-frontend-monorepo/types'
import {
	isFoedtEtter1963,
	isOvergangskull,
} from '@pensjonskalkulator-frontend-monorepo/utils'

import { getUttakInfo } from '../utils/getUttakInfo'
import { mapMaanedligAlderspensjonForKnekkpunkter } from '../utils/mapMaanedligAlderspensjonForKnekkpunkter'
import { selectByUttakAlder } from '../utils/selectByUttakAlder'
import type { BeregningParams, BeregningResult } from './beregningTypes'
import { mapUtenlandsperiodeListe } from './mapBeregningParams'

const NORMERT_PENSJONSALDER_AAR = 67

function getNormertPensjonsalderPlassering(
	aktivBeregning?: BeregningParams | null,
	heltUttakAlder?: Alder,
	gradertUttakAlder?: Alder
): 'MELLOM_GRADERT_OG_HELT' | 'ETTER_HELT' | undefined {
	const harAfpPrivat =
		aktivBeregning?.afp === 'ja_privat' ||
		aktivBeregning?.endringAfpPrivat === true

	if (!harAfpPrivat) {
		return undefined
	}

	const heltAar = heltUttakAlder?.aar ?? 0
	const gradertAar = gradertUttakAlder?.aar ?? 0

	const erUttaksgradNull = aktivBeregning?.uttaksgrad === 0
	const harGradertSection = !!gradertUttakAlder || erUttaksgradNull

	if (
		harGradertSection &&
		heltAar > NORMERT_PENSJONSALDER_AAR &&
		gradertAar < NORMERT_PENSJONSALDER_AAR
	) {
		return 'MELLOM_GRADERT_OG_HELT'
	}

	if (heltAar < NORMERT_PENSJONSALDER_AAR) {
		return 'ETTER_HELT'
	}

	return undefined
}

export function mapBeregningResultToLagreSpec(
	result: BeregningResult,
	aktivBeregning?: BeregningParams | null,
	navEnhetId?: string | null,
	grunnbeloep?: number | null,
	foedselsdato?: string | null,
	utenlandsperiodeListe?: SimuleringUtenlandsperiode[]
): LagreSimuleringSpecDtoV1 {
	const { heltUttakAlder, gradertUttakAlder } = getUttakInfo(
		aktivBeregning ?? null
	)
	const heltUttakAar = heltUttakAlder.aar
	const gradertUttakAar = gradertUttakAlder?.aar

	const {
		vedHeltUttak: privatAfpVedHeltUttak,
		vedGradertUttak: privatAfpVedGradertUttak,
	} = selectByUttakAlder(result.privatAfpListe, {
		heltUttakAar,
		gradertUttakAar,
	})

	const {
		vedHeltUttak: livsvarigOffentligAfpVedHeltUttak,
		vedGradertUttak: livsvarigOffentligAfpVedGradertUttak,
	} = selectByUttakAlder(result.livsvarigOffentligAfpListe, {
		heltUttakAar,
		gradertUttakAar,
	})

	const { vedHeltUttak: privatAfpVedNormertPensjonsalder } = selectByUttakAlder(
		result.privatAfpListe,
		{ heltUttakAar: NORMERT_PENSJONSALDER_AAR }
	)

	const utenlandsperioder = utenlandsperiodeListe
		? utenlandsperiodeListe.map((periode) => ({
				...periode,
				tom: periode.tom ?? null,
			}))
		: aktivBeregning?.harOppholdUtenforNorge === true &&
			  aktivBeregning.utenlandsOpphold.length
			? mapUtenlandsperiodeListe(aktivBeregning.utenlandsOpphold).map(
					(periode) => ({
						...periode,
						tom: periode.tom ?? null,
					})
				)
			: null
	const kull = foedselsdato
		? isFoedtEtter1963(foedselsdato)
			? 'KAP20'
			: isOvergangskull(foedselsdato)
				? 'OVERGANG'
				: 'KAP19'
		: undefined

	const maanedligAlderspensjonForKnekkpunkter =
		mapMaanedligAlderspensjonForKnekkpunkter(
			result.maanedligAlderspensjonForKnekkpunkter,
			grunnbeloep,
			kull,
			aktivBeregning?.afp
		)
	return {
		alderspensjonListe: result.alderspensjonListe.map((ap) => ({
			alderAar: ap.alderAar,
			beloep: ap.beloep,
			gjenlevendetillegg: ap.gjenlevendetillegg ?? null,
		})),
		afpPrivat: privatAfpVedHeltUttak
			? {
					vedGradertUttak: privatAfpVedGradertUttak
						? {
								alderAar: privatAfpVedGradertUttak.alderAar,
								aarligBeloep: privatAfpVedGradertUttak.aarligBeloep,
								kompensasjonstillegg:
									privatAfpVedGradertUttak.kompensasjonstillegg,
								kronetillegg:
									(gradertUttakAar ?? 0) < NORMERT_PENSJONSALDER_AAR
										? privatAfpVedGradertUttak.kronetillegg
										: null,
								livsvarig: privatAfpVedGradertUttak.livsvarig,
								maanedligBeloep: privatAfpVedGradertUttak.maanedligBeloep ?? 0,
							}
						: null,
					vedHeltUttak: {
						alderAar: privatAfpVedHeltUttak.alderAar,
						aarligBeloep: privatAfpVedHeltUttak.aarligBeloep,
						kompensasjonstillegg: privatAfpVedHeltUttak.kompensasjonstillegg,
						kronetillegg:
							heltUttakAar < NORMERT_PENSJONSALDER_AAR
								? privatAfpVedHeltUttak.kronetillegg
								: null,
						livsvarig: privatAfpVedHeltUttak.livsvarig,
						maanedligBeloep: privatAfpVedHeltUttak.maanedligBeloep ?? 0,
					},
					vedNormertPensjonsalder: (() => {
						if (!privatAfpVedNormertPensjonsalder) {
							return null
						}
						return {
							alderAar: privatAfpVedNormertPensjonsalder.alderAar,
							aarligBeloep: privatAfpVedNormertPensjonsalder.aarligBeloep,
							kompensasjonstillegg:
								privatAfpVedNormertPensjonsalder.kompensasjonstillegg,
							livsvarig: privatAfpVedNormertPensjonsalder.livsvarig,
							maanedligBeloep:
								privatAfpVedNormertPensjonsalder.maanedligBeloep ?? 0,
						}
					})(),
				}
			: null,
		afpOffentligLivsvarig: livsvarigOffentligAfpVedHeltUttak
			? {
					vedGradertUttak: livsvarigOffentligAfpVedGradertUttak
						? {
								alderAar: livsvarigOffentligAfpVedGradertUttak.alderAar,
								aarligBeloep: livsvarigOffentligAfpVedGradertUttak.aarligBeloep,
								maanedligBeloep:
									livsvarigOffentligAfpVedGradertUttak.maanedligBeloep ?? 0,
							}
						: null,
					vedHeltUttak: {
						alderAar: livsvarigOffentligAfpVedHeltUttak.alderAar,
						aarligBeloep: livsvarigOffentligAfpVedHeltUttak.aarligBeloep,
						maanedligBeloep:
							livsvarigOffentligAfpVedHeltUttak.maanedligBeloep ?? 0,
					},
				}
			: null,
		afpOffentligTidsbegrenset: result.tidsbegrensetOffentligAfp
			? {
					alderAar: result.tidsbegrensetOffentligAfp.alderAar,
					totaltAfpBeloep: result.tidsbegrensetOffentligAfp.totaltAfpBeloep,
					tidligereArbeidsinntekt:
						result.tidsbegrensetOffentligAfp.tidligereArbeidsinntekt,
					grunnbeloep: result.tidsbegrensetOffentligAfp.grunnbeloep,
					sluttpoengtall: result.tidsbegrensetOffentligAfp.sluttpoengtall,
					trygdetid: result.tidsbegrensetOffentligAfp.trygdetid,
					poengaarTom1991: result.tidsbegrensetOffentligAfp.poengaarTom1991,
					poengaarFom1992: result.tidsbegrensetOffentligAfp.poengaarFom1992,
					grunnpensjon: result.tidsbegrensetOffentligAfp.grunnpensjon,
					tilleggspensjon: result.tidsbegrensetOffentligAfp.tilleggspensjon,
					afpTillegg: result.tidsbegrensetOffentligAfp.afpTillegg,
					saertillegg: result.tidsbegrensetOffentligAfp.saertillegg,
					afpGrad: result.tidsbegrensetOffentligAfp.afpGrad,
					erAvkortet: result.tidsbegrensetOffentligAfp.erAvkortet,
				}
			: null,
		vilkaarsproevingsresultat: {
			erInnvilget: result.vilkaarsproevingsresultat.erInnvilget,
			alternativ: result.vilkaarsproevingsresultat.alternativ
				? {
						gradertUttakAlder:
							result.vilkaarsproevingsresultat.alternativ.gradertUttakAlder ??
							null,
						uttaksgrad:
							result.vilkaarsproevingsresultat.alternativ.uttaksgrad ?? null,
						heltUttakAlder:
							result.vilkaarsproevingsresultat.alternativ.heltUttakAlder,
					}
				: null,
		},
		trygdetid: result.trygdetid
			? {
					antallAar: result.trygdetid.antallAar,
					erUtilstrekkelig: result.trygdetid.erUtilstrekkelig,
				}
			: null,
		pensjonsgivendeInntektListe:
			result.pensjonsgivendeInntektListe?.map((inntekt) => ({
				aarstall: inntekt.aarstall,
				beloep: inntekt.beloep,
			})) ?? null,
		simuleringsinformasjon: {
			gradertUttaksalder:
				aktivBeregning?.afp === 'ja_offentlig'
					? {
							aar: heltUttakAlder.aar,
							maaneder: heltUttakAlder.maaneder,
						}
					: gradertUttakAlder
						? {
								aar: gradertUttakAlder.aar,
								maaneder: gradertUttakAlder.maaneder,
							}
						: null,
			heltUttaksalder:
				aktivBeregning?.afp !== 'ja_offentlig'
					? {
							aar: heltUttakAlder.aar,
							maaneder: heltUttakAlder.maaneder,
						}
					: {
							aar: 67,
							maaneder: 0,
						},
			sivilstatus: aktivBeregning?.sivilstatus ?? null,
			utenlandsperioder,
			kull,
			normertPensjonsalderPlassering: getNormertPensjonsalderPlassering(
				aktivBeregning,
				heltUttakAlder,
				gradertUttakAlder
			),
		},
		maanedligAlderspensjonForKnekkpunkter,
		navEnhetId: navEnhetId ?? null,
	}
}

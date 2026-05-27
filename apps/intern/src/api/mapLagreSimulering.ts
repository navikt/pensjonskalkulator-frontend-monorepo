import type {
	Alder,
	LagreSimuleringSpecDtoV1,
} from '@pensjonskalkulator-frontend-monorepo/types'
import {
	isFoedtEtter1963,
	isOvergangskull,
} from '@pensjonskalkulator-frontend-monorepo/utils'
import {
	DATE_BACKEND_FORMAT,
	DATE_ENDUSER_FORMAT,
} from '@pensjonskalkulator-frontend-monorepo/utils/dates'
import { format, parse } from 'date-fns'

import { getUttakInfo } from '../utils/getUttakInfo'
import { mapMaanedligAlderspensjonForKnekkpunkter } from '../utils/mapMaanedligAlderspensjonForKnekkpunkter'
import { selectByUttakAlder } from '../utils/selectByUttakAlder'
import type { BeregningParams, BeregningResult } from './beregningTypes'

function toBackendDate(value: string): string {
	if (!value.includes('.')) {
		return value
	}

	const parsedDate = parse(value, DATE_ENDUSER_FORMAT, new Date())

	if (Number.isNaN(parsedDate.getTime())) {
		return value
	}

	return format(parsedDate, DATE_BACKEND_FORMAT)
}

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

	if (harGradertSection && heltAar > 67 && gradertAar < 67) {
		return 'MELLOM_GRADERT_OG_HELT'
	}

	if (heltAar < 67) {
		return 'ETTER_HELT'
	}

	return undefined
}

export function mapBeregningResultToLagreSpec(
	result: BeregningResult,
	aktivBeregning?: BeregningParams | null,
	navEnhetId?: string | null,
	grunnbeloep?: number | null,
	foedselsdato?: string | null
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

	const utenlandsperioder =
		aktivBeregning?.harOppholdUtenforNorge === true &&
		aktivBeregning.utenlandsOpphold.length
			? aktivBeregning.utenlandsOpphold.map((periode) => ({
					fom: toBackendDate(periode.fom),
					tom: periode.tom ? toBackendDate(periode.tom) : null,
					landkode: periode.landkode,
					arbeidetUtenlands: periode.arbeidetUtenlands,
				}))
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
			kull
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
								kronetillegg: privatAfpVedGradertUttak.kronetillegg,
								livsvarig: privatAfpVedGradertUttak.livsvarig,
								maanedligBeloep: privatAfpVedGradertUttak.maanedligBeloep ?? 0,
							}
						: null,
					vedHeltUttak: {
						alderAar: privatAfpVedHeltUttak.alderAar,
						aarligBeloep: privatAfpVedHeltUttak.aarligBeloep,
						kompensasjonstillegg: privatAfpVedHeltUttak.kompensasjonstillegg,
						kronetillegg: privatAfpVedHeltUttak.kronetillegg,
						livsvarig: privatAfpVedHeltUttak.livsvarig,
						maanedligBeloep: privatAfpVedHeltUttak.maanedligBeloep ?? 0,
					},
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
					vedGradertUttak: gradertUttakAar
						? {
								alderAar: result.tidsbegrensetOffentligAfp.alderAar,
								totaltAfpBeloep:
									result.tidsbegrensetOffentligAfp.totaltAfpBeloep,
								tidligereArbeidsinntekt:
									result.tidsbegrensetOffentligAfp.tidligereArbeidsinntekt,
								grunnbeloep: result.tidsbegrensetOffentligAfp.grunnbeloep,
								sluttpoengtall: result.tidsbegrensetOffentligAfp.sluttpoengtall,
								trygdetid: result.tidsbegrensetOffentligAfp.trygdetid,
								poengaarTom1991:
									result.tidsbegrensetOffentligAfp.poengaarTom1991,
								poengaarFom1992:
									result.tidsbegrensetOffentligAfp.poengaarFom1992,
								grunnpensjon: result.tidsbegrensetOffentligAfp.grunnpensjon,
								tilleggspensjon:
									result.tidsbegrensetOffentligAfp.tilleggspensjon,
								afpTillegg: result.tidsbegrensetOffentligAfp.afpTillegg,
								saertillegg: result.tidsbegrensetOffentligAfp.saertillegg,
								afpGrad: result.tidsbegrensetOffentligAfp.afpGrad,
								erAvkortet: result.tidsbegrensetOffentligAfp.erAvkortet,
							}
						: null,
					vedHeltUttak: {
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
					},
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
			gradertUttaksalder: gradertUttakAlder
				? {
						aar: gradertUttakAlder.aar,
						maaneder: gradertUttakAlder.maaneder,
					}
				: null,
			heltUttaksalder: {
				aar: heltUttakAlder.aar,
				maaneder: heltUttakAlder.maaneder,
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

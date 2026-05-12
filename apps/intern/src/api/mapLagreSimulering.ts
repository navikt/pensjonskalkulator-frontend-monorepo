import type { LagreSimuleringSpecDtoV1 } from '@pensjonskalkulator-frontend-monorepo/types'
import {
	DATE_BACKEND_FORMAT,
	DATE_ENDUSER_FORMAT,
} from '@pensjonskalkulator-frontend-monorepo/utils/dates'
import { format, parse } from 'date-fns'

import { getUttakInfo } from '../utils/getUttakInfo'
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

export function mapBeregningResultToLagreSpec(
	result: BeregningResult,
	aktivBeregning?: BeregningParams | null,
	navEnhetId?: string | null
): LagreSimuleringSpecDtoV1 {
	const { heltUttakAlder, gradertUttakAlder } = getUttakInfo(
		aktivBeregning ?? null
	)
	const heltUttakAar = heltUttakAlder.aar
	const gradertUttakAar = gradertUttakAlder?.aar

	const privatAfpVedHeltUttak = result.privatAfpListe?.find(
		(afp) => afp.alderAar === heltUttakAar
	)
	const privatAfpVedGradertUttak =
		gradertUttakAar === undefined
			? null
			: (result.privatAfpListe?.find(
					(afp) => afp.alderAar === gradertUttakAar
				) ?? null)

	const livsvarigOffentligAfpVedHeltUttak =
		result.livsvarigOffentligAfpListe?.find(
			(afp) => afp.alderAar === heltUttakAar
		)
	const livsvarigOffentligAfpVedGradertUttak =
		gradertUttakAar === undefined
			? null
			: (result.livsvarigOffentligAfpListe?.find(
					(afp) => afp.alderAar === gradertUttakAar
				) ?? null)

	const utenlandsperioder =
		aktivBeregning?.harOppholdUtenforNorge === true &&
		aktivBeregning.utenlandsOpphold.length
			? aktivBeregning.utenlandsOpphold.map((periode) => ({
					fom: toBackendDate(periode.fom),
					tom: periode.tom ? toBackendDate(periode.tom) : null,
					landkode: periode.landkode,
					arbeidetUtenlands: periode.arbeidetUtenlands === true,
				}))
			: null
	const maanedligAlderspensjonForKnekkpunkter =
		result.maanedligAlderspensjonForKnekkpunkter

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
		},
		maanedligAlderspensjonForKnekkpunkter: maanedligAlderspensjonForKnekkpunkter
			? {
					vedGradertUttak:
						maanedligAlderspensjonForKnekkpunkter.vedGradertUttak ?? null,
					vedHeltUttak: maanedligAlderspensjonForKnekkpunkter.vedHeltUttak,
					vedNormertPensjonsalder:
						maanedligAlderspensjonForKnekkpunkter.vedNormertPensjonsalder,
				}
			: null,
		navEnhetId: navEnhetId ?? null,
	}
}

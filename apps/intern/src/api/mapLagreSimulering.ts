import type {
	Alder,
	LagreSimuleringSpecDtoV1,
	LagreUttaksinformasjonDto,
	OmstillingsstoenadOgGjenlevende,
	PersonInternV1,
	SimuleringUtenlandsperiode,
	Vedtak,
	Vilkaarsliste,
} from '@pensjonskalkulator-frontend-monorepo/types'
import {
	isFoedtEtter1963,
	isOvergangskull,
} from '@pensjonskalkulator-frontend-monorepo/utils'
import {
	isFoedtFoer1963,
	transformUttaksalderToDate,
} from '@pensjonskalkulator-frontend-monorepo/utils/alder'

import { buildTableRows } from '../components/Beregning/AarligPensjonTable'
import {
	mapMerknadListe,
	selectOpptjeningRows,
} from '../components/Beregning/OpptjeningTable'
import { getLandDetails } from '../components/UtenlandsOpphold/utils'
import { getUttakInfo } from '../utils/getUttakInfo'
import { mapMaanedligAlderspensjonForKnekkpunkter } from '../utils/mapMaanedligAlderspensjonForKnekkpunkter'
import { selectByUttakAlder } from '../utils/selectByUttakAlder'
import type { BeregningParams, BeregningResult } from './beregningTypes'
import { mapUtenlandsperiodeListe } from './mapBeregningParams'

const NORMERT_PENSJONSALDER_AAR = 67

const NORMERT_PENSJONSALDER_ALDER: Alder = {
	aar: NORMERT_PENSJONSALDER_AAR,
	maaneder: 0,
}

function mapUttaksinformasjon(
	alder: Alder,
	foedselsdato: string | null | undefined,
	grad: number
): LagreUttaksinformasjonDto {
	return {
		alder: { ...alder },
		uttaksdato: foedselsdato
			? transformUttaksalderToDate(alder, foedselsdato)
			: '',
		grad,
	}
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

export function mapPensjonsopptjeningToLagreDto(
	opptjening: BeregningResult['opptjeningListe'],
	showPensjonsbeholdning: boolean,
	ufoeretrygdgrad?: number | null
) {
	return selectOpptjeningRows(opptjening).map((entry) => ({
		aarstall: entry.aarstall,
		pensjonsgivendeInntekt:
			entry.pensjonsgivendeInntektBeloep > 0
				? entry.pensjonsgivendeInntektBeloep
				: 0,
		pensjonspoeng: entry.pensjonspoeng > 0 ? entry.pensjonspoeng : 0,
		pensjonsbeholdning: !showPensjonsbeholdning
			? null
			: entry.pensjonsbeholdningBeloep > 0
				? entry.pensjonsbeholdningBeloep
				: 0,
		merknad: mapMerknadListe(entry.merknadListe, ufoeretrygdgrad),
	}))
}

export function mapBeregningResultToLagreSpec(
	result: BeregningResult,
	foedselsdato: string,
	aktivBeregning?: BeregningParams | null,
	navEnhetId?: string | null,
	grunnbeloep?: number | null,
	utenlandsperiodeListe?: SimuleringUtenlandsperiode[],
	vedtak?: Vedtak,
	omstillingsstoenad?: OmstillingsstoenadOgGjenlevende,
	person?: PersonInternV1 | null
): LagreSimuleringSpecDtoV1 {
	const forbeholdVisningsvilkaar: Vilkaarsliste = []

	if (
		aktivBeregning?.afp === 'ja_offentlig' ||
		aktivBeregning?.afp === 'serviceberegning'
	) {
		forbeholdVisningsvilkaar.push(
			'BEREGNER_GAMMEL_AFP',
			'BEREGNER_AFP_GENERELT'
		)
	}

	if (aktivBeregning?.afp === 'ja_privat') {
		forbeholdVisningsvilkaar.push(
			'BEREGNER_AFP_GENERELT',
			'BEREGNER_AFP_PRIVAT'
		)
	}

	if (vedtak?.ufoeretrygdgrad && vedtak.ufoeretrygdgrad > 0) {
		forbeholdVisningsvilkaar.push('HAR_UFOERETRYGD')
	}

	if (omstillingsstoenad?.harLoependeSak) {
		forbeholdVisningsvilkaar.push('HAR_GJENLEVENDE_ELLER_OMSTILLINGSSTOENAD')
	}

	if (
		aktivBeregning?.beregnMedGjenlevenderett &&
		foedselsdato &&
		isFoedtFoer1963(foedselsdato)
	) {
		forbeholdVisningsvilkaar.push('BEREGNER_MED_GJENLEVENDERETT')
	}
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
		? utenlandsperiodeListe.map((periode) => {
				const land = getLandDetails(periode.landkode)

				return {
					...periode,
					arbeidetUtenlands: land?.kravOmArbeid
						? periode.arbeidetUtenlands
						: null,
					landkode: land?.navn ?? periode.landkode,
				}
			})
		: aktivBeregning?.harOppholdUtenforNorge === true &&
			  aktivBeregning.utenlandsOpphold.length
			? mapUtenlandsperiodeListe(aktivBeregning.utenlandsOpphold).map(
					(periode) => {
						const land = getLandDetails(periode.landkode)

						return {
							...periode,
							arbeidetUtenlands: land?.kravOmArbeid
								? periode.arbeidetUtenlands
								: null,
							landkode: land?.navn ?? periode.landkode,
						}
					}
				)
			: null
	const kull = isFoedtEtter1963(foedselsdato)
		? 'KAP20'
		: isOvergangskull(foedselsdato)
			? 'OVERGANG'
			: 'KAP19'

	const maanedligAlderspensjonForKnekkpunkter =
		mapMaanedligAlderspensjonForKnekkpunkter(
			result.maanedligAlderspensjonForKnekkpunkter,
			grunnbeloep,
			kull,
			aktivBeregning?.afp,
			!!aktivBeregning?.beregnMedGjenlevenderett,
			Boolean(vedtak?.loependeAlderspensjon?.harGjenlevenderett)
		)
	const aarligInntektFoerUttakBeloep =
		aktivBeregning?.afp !== 'serviceberegning'
			? (aktivBeregning?.aarligInntektFoerUttakBeloep ?? 0)
			: 0
	const aarligInntektOgPensjonListe = buildTableRows(
		result.alderspensjonListe,
		result.privatAfpListe,
		result.tidsbegrensetOffentligAfp,
		result.serviceberegnetAfp,
		aarligInntektFoerUttakBeloep,
		heltUttakAlder,
		aktivBeregning,
		person
	).map((row) => ({
		alderLabel: row.alderLabel,
		alderspensjon: row.alderspensjon,
		avtalefestetPensjon: row.afp,
		pensjonsgivendeInntekt: row.inntekt,
	}))
	const pensjonsopptjeningListe = mapPensjonsopptjeningToLagreDto(
		result.opptjeningListe,
		isFoedtEtter1963(foedselsdato) || isOvergangskull(foedselsdato),
		vedtak?.ufoeretrygdgrad
	)
	const uttaksgrad = aktivBeregning?.uttaksgrad ?? 100

	const normertPensjonsalderPlassering = getNormertPensjonsalderPlassering(
		aktivBeregning,
		heltUttakAlder,
		gradertUttakAlder
	)
	return {
		alderspensjonListe: result.alderspensjonListe.map((ap) => ({
			alderAar: ap.alderAar,
			beloep: ap.beloep,
			gjenlevendetillegg: ap.gjenlevendetillegg,
		})),
		afpPrivat: privatAfpVedHeltUttak
			? {
					vedGradertUttak: privatAfpVedGradertUttak
						? {
								...privatAfpVedGradertUttak,
								kronetillegg:
									(gradertUttakAar ?? 0) < NORMERT_PENSJONSALDER_AAR
										? privatAfpVedGradertUttak.kronetillegg
										: null,
								maanedligBeloep: privatAfpVedGradertUttak.maanedligBeloep ?? 0,
							}
						: null,
					vedHeltUttak: {
						...privatAfpVedHeltUttak,
						kronetillegg:
							heltUttakAar < NORMERT_PENSJONSALDER_AAR
								? privatAfpVedHeltUttak.kronetillegg
								: null,
						maanedligBeloep: privatAfpVedHeltUttak.maanedligBeloep ?? 0,
					},
					vedNormertPensjonsalder: privatAfpVedNormertPensjonsalder
						? {
								...privatAfpVedNormertPensjonsalder,
								kronetillegg: null,
								maanedligBeloep:
									privatAfpVedNormertPensjonsalder.maanedligBeloep ?? 0,
							}
						: null,
				}
			: null,
		// Livsvarig offentlig AFP mappes separat fra tidsbegrenset AFP i save-spec.
		afpOffentligLivsvarig: livsvarigOffentligAfpVedHeltUttak
			? {
					vedGradertUttak: livsvarigOffentligAfpVedGradertUttak
						? {
								...livsvarigOffentligAfpVedGradertUttak,
								maanedligBeloep:
									livsvarigOffentligAfpVedGradertUttak.maanedligBeloep ?? 0,
							}
						: null,
					vedHeltUttak: {
						...livsvarigOffentligAfpVedHeltUttak,
						maanedligBeloep:
							livsvarigOffentligAfpVedHeltUttak.maanedligBeloep ?? 0,
					},
				}
			: null,
		afpOffentligTidsbegrenset: result.tidsbegrensetOffentligAfp
			? {
					...result.tidsbegrensetOffentligAfp,
				}
			: null,
		vilkaarsproevingsresultat: {
			erInnvilget: result.vilkaarsproevingsresultat.erInnvilget,
			alternativ: result.vilkaarsproevingsresultat.alternativ
				? {
						...result.vilkaarsproevingsresultat.alternativ,
					}
				: null,
		},
		trygdetid: result.trygdetid
			? {
					...result.trygdetid,
				}
			: null,
		pensjonsgivendeInntektListe: result.pensjonsgivendeInntektListe?.map(
			(inntekt) => ({
				...inntekt,
			})
		),
		aarligInntektOgPensjonListe,
		pensjonsopptjeningListe,
		simuleringsinformasjon: {
			gradertUttakInformasjon:
				aktivBeregning?.afp === 'ja_offentlig'
					? mapUttaksinformasjon(heltUttakAlder, foedselsdato, uttaksgrad)
					: gradertUttakAlder
						? mapUttaksinformasjon(gradertUttakAlder, foedselsdato, uttaksgrad)
						: null,
			heltUttakInformasjon:
				aktivBeregning?.afp !== 'ja_offentlig'
					? mapUttaksinformasjon(heltUttakAlder, foedselsdato, 100)
					: mapUttaksinformasjon(
							NORMERT_PENSJONSALDER_ALDER,
							foedselsdato,
							100
						),
			normertUttakInformasjon: mapUttaksinformasjon(
				NORMERT_PENSJONSALDER_ALDER,
				foedselsdato,
				normertPensjonsalderPlassering === 'MELLOM_GRADERT_OG_HELT'
					? uttaksgrad
					: 100
			),
			sivilstatus: aktivBeregning?.beregnMedGjenlevenderett
				? 'ENKE_ELLER_ENKEMANN'
				: aktivBeregning?.sivilstatus,
			utenlandsperioder,
			kull,
			forbeholdVisningsvilkaar: forbeholdVisningsvilkaar,
			normertPensjonsalderPlassering: normertPensjonsalderPlassering,
		},
		maanedligAlderspensjonForKnekkpunkter,
		navEnhetId: navEnhetId,
		serviceberegning:
			aktivBeregning?.afp === 'serviceberegning'
				? {
						uttaksalder: { ...heltUttakAlder },
						uttaksdato: transformUttaksalderToDate(
							heltUttakAlder,
							foedselsdato
						),
						forventetFremtidigInntekt:
							aktivBeregning.aarsinntektSamtidigMedAfp ?? 0,
						afp: result.serviceberegnetAfp?.beregnetAfp
							? ({
									alderAar: heltUttakAlder.aar,
									totaltAfpBeloep:
										result.serviceberegnetAfp.beregnetAfp.totalbelopAfp,
									tidligereArbeidsinntekt:
										result.serviceberegnetAfp.beregnetAfp
											.tidligereArbeidsinntekt,
									grunnbeloep: result.serviceberegnetAfp.beregnetAfp.grunnbelop,
									sluttpoengtall:
										result.serviceberegnetAfp.beregnetAfp.sluttpoengtall,
									trygdetid: result.serviceberegnetAfp.beregnetAfp.trygdetid,
									poengaarTom1991:
										result.serviceberegnetAfp.beregnetAfp.poeangarE91,
									poengaarFom1992:
										result.serviceberegnetAfp.beregnetAfp.poeangarF92,
									grunnpensjon:
										result.serviceberegnetAfp.beregnetAfp.grunnpensjon,
									tilleggspensjon:
										result.serviceberegnetAfp.beregnetAfp.tilleggspensjon,
									afpTillegg: result.serviceberegnetAfp.beregnetAfp.afpTillegg,
									saertillegg:
										result.serviceberegnetAfp.beregnetAfp.saertillegg,
									afpGrad: result.serviceberegnetAfp.beregnetAfp.afpGrad,
									erAvkortet: result.serviceberegnetAfp.beregnetAfp.erAvkortet,
								} as NonNullable<
									NonNullable<
										LagreSimuleringSpecDtoV1['serviceberegning']
									>['afp']
								>)
							: null,
					}
				: null,
	}
}

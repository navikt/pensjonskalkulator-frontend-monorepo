import type {
	Alder,
	LagreSimuleringSpecDtoV1,
	LagreUttaksinformasjonDto,
	SimuleringUtenlandsperiode,
	Vedtak,
} from '@pensjonskalkulator-frontend-monorepo/types'
import {
	isFoedtEtter1963,
	isOvergangskull,
} from '@pensjonskalkulator-frontend-monorepo/utils'
import {
	isFoedtFoer1963,
	transformUttaksalderToDate,
} from '@pensjonskalkulator-frontend-monorepo/utils/alder'

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
	foedselsdato?: string | null
): LagreUttaksinformasjonDto {
	return {
		alder: { ...alder },
		uttaksdato: foedselsdato
			? transformUttaksalderToDate(alder, foedselsdato)
			: '',
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

export function mapBeregningResultToLagreSpec(
	result: BeregningResult,
	aktivBeregning?: BeregningParams | null,
	navEnhetId?: string | null,
	grunnbeloep?: number | null,
	foedselsdato?: string | null,
	utenlandsperiodeListe?: SimuleringUtenlandsperiode[],
	vedtak?: Vedtak,
	omstillingsstoenad?: OmstillingsstoenadOgGjenlevende
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
		? utenlandsperiodeListe.map((periode) => ({
				...periode,
				landkode: getLandDetails(periode.landkode)?.navn ?? periode.landkode,
				tom: periode.tom,
			}))
		: aktivBeregning?.harOppholdUtenforNorge === true &&
			  aktivBeregning.utenlandsOpphold.length
			? mapUtenlandsperiodeListe(aktivBeregning.utenlandsOpphold).map(
					(periode) => ({
						...periode,
						landkode:
							getLandDetails(periode.landkode)?.navn ?? periode.landkode,
						tom: periode.tom,
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
		simuleringsinformasjon: {
			gradertUttakInformasjon:
				aktivBeregning?.afp === 'ja_offentlig'
					? mapUttaksinformasjon(heltUttakAlder, foedselsdato)
					: gradertUttakAlder
						? mapUttaksinformasjon(gradertUttakAlder, foedselsdato)
						: null,
			heltUttakInformasjon:
				aktivBeregning?.afp !== 'ja_offentlig'
					? mapUttaksinformasjon(heltUttakAlder, foedselsdato)
					: mapUttaksinformasjon(NORMERT_PENSJONSALDER_ALDER, foedselsdato),
			normertUttakInformasjon: mapUttaksinformasjon(
				NORMERT_PENSJONSALDER_ALDER,
				foedselsdato
			),
			sivilstatus: aktivBeregning?.sivilstatus,
			utenlandsperioder,
			kull,
			forbeholdVisningsvilkaar: forbeholdVisningsvilkaar,
			normertPensjonsalderPlassering: getNormertPensjonsalderPlassering(
				aktivBeregning,
				heltUttakAlder,
				gradertUttakAlder
			),
		},
		maanedligAlderspensjonForKnekkpunkter,
		navEnhetId: navEnhetId,
	}
}

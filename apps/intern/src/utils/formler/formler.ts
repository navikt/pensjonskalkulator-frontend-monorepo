// staticFormelKode.ts
// Ported from StaticFormelKode.java
// Maps a formula code to its i18n key (the MathML entry in tekster-properties.xml).
import {
	isFoedtEtter1963,
	isOvergangskull,
} from '@pensjonskalkulator-frontend-monorepo/utils/alder'

import type { BeregningParams } from '../../api/beregningTypes'

export type StaticFormelKode =
	| 'BasGP2'
	| 'BasisGrunnpensjon'
	| 'BasisGrunnpensjonRedusert'
	| 'BasisTilleggspensjon'
	| 'FullPensjon'
	| 'FullPensjon67'
	| 'Garantipensjon'
	| 'Grunnpensjon'
	| 'Grunnpensjon1'
	| 'Grunnpensjon2'
	| 'Grunnpensjon3'
	| 'Grunnpensjon4'
	| 'GrunnpensjonRedusert1'
	| 'GrunnpensjonRedusert2'
	| 'GrunnpensjonRedusert3'
	| 'GrunnpensjonRedusert4'
	| 'Grunnytelse'
	| 'Inntektspensjon1'
	| 'Inntektspensjon2'
	| 'Inntektspensjon3'
	| 'MPNUttakBrukersTT'
	| 'MPNUttakFullTT'
	| 'Pensjonstillegg1'
	| 'Pensjonstillegg2'
	| 'Pensjonstillegg3'
	| 'Pensjonstillegg4'
	| 'GAP'
	| 'GAT'
	| 'GP'
	| 'GP4'
	| 'GP2og3'
	| 'GPR'
	| 'GPR2og3'
	| 'GPR4'
	| 'IP'
	| 'IP4'
	| 'PEN'
	| 'Pensjonstillegg'
	| 'PP233321_DFA_PSELV_BasGP1_Basisgrunnpensjon_FG_SIVE_001'
	| 'PP233321_DFA_PSELV_BasGP2_Basisgrunnpensjon_FG_SIVE_GJENL_001'
	| 'PT2og3'
	| 'PT4'
	| 'Tilleggspensjon'
	| 'Tilleggspensjon1'
	| 'Tilleggspensjon2'
	| 'Tilleggspensjon3'
	| 'Tilleggspensjon4'
	| 'TP'
	| 'TP2og3'
	| 'TP4'

/**
 * The i18n key each formula code resolves to (equivalent to getFormulaKey()).
 * `null` means the code has no formula key (see GAT).
 */
export const FORMULA_KEY: Record<StaticFormelKode, string | null> = {
	BasGP2: 'basgp2',
	BasisGrunnpensjon: 'basis_grunnpensjon',
	BasisGrunnpensjonRedusert: 'basis_grunnpensjon_redusert',
	BasisTilleggspensjon: 'basis_tilleggspensjon',
	FullPensjon: 'formler.fullpensjon',
	FullPensjon67: 'fullpensjon67',
	Garantipensjon: 'formler.garantipensjon',
	Grunnpensjon: 'grunnpensjon',
	Grunnpensjon1: 'grunnpensjon_1',
	Grunnpensjon2: 'grunnpensjon_2',
	Grunnpensjon3: 'grunnpensjon_3',
	Grunnpensjon4: 'grunnpensjon_4',
	GrunnpensjonRedusert1: 'formler.grunnpensjon_redusert_1',
	GrunnpensjonRedusert2: 'formler.grunnpensjon_redusert_2',
	GrunnpensjonRedusert3: 'formler.grunnpensjon_redusert_3',
	GrunnpensjonRedusert4: 'formler.grunnpensjon_redusert_4',
	Grunnytelse: 'formler.grunnytelse',
	Inntektspensjon1: 'formler.inntektspensjon_1',
	Inntektspensjon2: 'formler.inntektspensjon_2',
	Inntektspensjon3: 'formler.inntektspensjon_3',
	MPNUttakBrukersTT: 'formler.mpn_uttak_brukers_tt',
	MPNUttakFullTT: 'formler.mpn_uttak_full_tt',
	Pensjonstillegg1: 'formler.pensjonstillegg_1',
	Pensjonstillegg2: 'formler.pensjonstillegg_2',
	Pensjonstillegg3: 'formler.pensjonstillegg_3',
	Pensjonstillegg4: 'formler.pensjonstillegg_4',
	GAP: 'formler.garantipensjon',
	GAT: null,
	GP: 'formler.grunnpensjon_2',
	GP4: 'formler.grunnpensjon_4',
	GP2og3: 'formler.grunnpensjon_3',
	GPR: 'formler.grunnpensjon_redusert_2',
	GPR2og3: 'formler.grunnpensjon_redusert_3',
	GPR4: 'formler.grunnpensjon_redusert_4',
	IP: 'formler.inntektspensjon_2',
	IP4: 'formler.inntektspensjon_3',
	PEN: 'pen_avsl',
	Pensjonstillegg: 'pensjonstillegg',
	PP233321_DFA_PSELV_BasGP1_Basisgrunnpensjon_FG_SIVE_001:
		'pp233321_dfa_pselv_basgp1_basisgrunnpensjon_fg_sive-001',
	PP233321_DFA_PSELV_BasGP2_Basisgrunnpensjon_FG_SIVE_GJENL_001:
		'pp233321_dfa_pselv_basgp2_basisgrunnpensjon_fg_sive_gjenl-001',
	PT2og3: 'formler.pensjonstillegg_3',
	PT4: 'formler.pensjonstillegg_4',
	Tilleggspensjon: 'tilleggspensjon',
	Tilleggspensjon1: 'formler.tilleggspensjon_1',
	Tilleggspensjon2: 'formler.tilleggspensjon_2',
	Tilleggspensjon3: 'formler.tilleggspensjon_3',
	Tilleggspensjon4: 'formler.tilleggspensjon_4',
	TP: 'formler.tilleggspensjon_2',
	TP2og3: 'formler.tilleggspensjon_3',
	TP4: 'formler.tilleggspensjon_4',
}

export type UserGroup =
	| 'USER_GROUP1'
	| 'USER_GROUP2'
	| 'USER_GROUP3'
	| 'USER_GROUP4'
	| 'USER_GROUP5'

export function resolveUserGroup(person: Person): UserGroup {
	const { foedselsdato } = person
	// Group 4: overgangskull 1954–1962 (AP2016, blended kap. 19 + kap. 20)
	if (isOvergangskull(foedselsdato)) {
		return 'USER_GROUP4'
	}
	// Group 5: born 1963 or later (AP2025, kap. 20)
	if (isFoedtEtter1963(foedselsdato)) {
		return 'USER_GROUP5'
	}
	// Remaining are born 1953 or earlier
	const year = Number(foedselsdato.slice(0, 4))
	const month = Number(foedselsdato.slice(5, 7))
	// Group 1: born 1942 or earlier (Dagens alderspensjon, out of scope)
	if (year <= 1942) {
		return 'USER_GROUP1'
	}
	// Group 3: 1949–1953, plus those born December 1948 (new AFP rules)
	if (year >= 1949 || (year === 1948 && month === 12)) {
		return 'USER_GROUP3'
	}
	// Group 2: 1943–1948, except December 1948
	return 'USER_GROUP2'
}

export function resolveInntektspensjonFormel(
	g: UserGroup
): StaticFormelKode | null {
	if (g === 'USER_GROUP5') return 'IP'
	if (g === 'USER_GROUP4') return 'IP4'
	return null
}

export function resolveSaertilleggFormel(
	variantAfpEtterfAlder: boolean,
	epsHarPensjon: boolean
): string | null {
	if (!variantAfpEtterfAlder) return null
	return epsHarPensjon ? '94 % x Grunnbeløpet' : '74 % x Grunnbeløpet'
}

export function resolvePensjonstilleggFormel(
	g: UserGroup
): StaticFormelKode | null {
	if (g === 'USER_GROUP2' || g === 'USER_GROUP3') return 'PT2og3'
	if (g === 'USER_GROUP4') return 'PT4'
	return null
}

/** Equivalent of getFormulaKey(). */
export function getFormulaKey(kode: StaticFormelKode): string | null {
	return FORMULA_KEY[kode]
}

export interface ResolveGrunnpensjonFormelParams {
	aktivBeregning: BeregningParams
	person: Person
}

export function resolveGrunnpensjonFormel({
	aktivBeregning,
	person,
}: ResolveGrunnpensjonFormelParams): StaticFormelKode | null {
	const full =
		!aktivBeregning.epsHarPensjon && !aktivBeregning.epsHarInntektOver2G
	const gjelderAfpOffentlig = aktivBeregning.afp === 'ja_offentlig'
	if (!gjelderAfpOffentlig && isOvergangskull(person.foedselsdato))
		return full ? 'GP4' : 'GPR4'
	if (gjelderAfpOffentlig) return full ? 'GP' : 'GPR'
	return null
}

export interface TilleggspensjonFormelContext {
	userGroup: UserGroup
	variantAfp: boolean
	variantAfpEtterfAlder: boolean
	detaljerAlderspensjon: boolean
}

/** Ported from detaljerutregKAP19.xhtml (lines 322–330). Order = view order. */
export function resolveTilleggspensjonFormel({
	userGroup,
	variantAfpEtterfAlder,
	detaljerAlderspensjon,
}: TilleggspensjonFormelContext): StaticFormelKode | null {
	if (variantAfpEtterfAlder && !detaljerAlderspensjon) return 'TP'
	if (
		(userGroup === 'USER_GROUP2' || userGroup === 'USER_GROUP3') &&
		detaljerAlderspensjon
	)
		return 'TP2og3'
	if (userGroup === 'USER_GROUP4') return 'TP4'
	return null
}

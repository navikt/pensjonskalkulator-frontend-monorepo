import { type ForbeholdContext } from '@pensjonskalkulator-frontend-monorepo/sanity'
import type {
	LoependeVedtak,
	PersonInternV1,
} from '@pensjonskalkulator-frontend-monorepo/types'
import {
	isFoedtEtter1963,
	isOvergangskull,
} from '@pensjonskalkulator-frontend-monorepo/utils'

import type { BeregningParams } from '../../api/beregningTypes'

interface BuildForbeholdContextArgs {
	aktivBeregning: BeregningParams | null
	person: PersonInternV1 | undefined
	loependeVedtak: LoependeVedtak | undefined
}

export function buildForbeholdContext({
	aktivBeregning,
	person,
	loependeVedtak,
}: BuildForbeholdContextArgs): ForbeholdContext {
	const ufoeretrygdgrad = loependeVedtak?.ufoeretrygd?.grad ?? 0
	const harUfoeretrygd = ufoeretrygdgrad > 0
	const har100Ufoeretrygd = ufoeretrygdgrad === 100
	const graderUfoeretrygd = ufoeretrygdgrad > 0 && ufoeretrygdgrad < 100

	// Intern-kalkulatoren støtter foreløpig kun AFP privat. Når
	// offentlig/gammel AFP introduseres skal disse utvides her, og
	// tilhørende tags eksponeres på nytt i FORBEHOLD_VILKAAR_TAGS.
	const beregnerAfpPrivat = aktivBeregning?.afp === 'ja_privat'
	const beregnerAfpUavhengigAvAarskull = beregnerAfpPrivat

	const foedselsdato = person?.foedselsdato
	// `isFoedtEtter1963` returnerer `boolean | null` (null når input mangler).
	// Tre disjunkte tags: før 1963, overgangskull (1954–1962), 1963+.
	const erFoedtEtter1963 =
		!!foedselsdato && isFoedtEtter1963(foedselsdato) === true
	const erOvergangskull = !!foedselsdato && isOvergangskull(foedselsdato)
	const foedtFoer1963 = !!foedselsdato && !erFoedtEtter1963 && !erOvergangskull

	return {
		harUfoeretrygd,
		graderUfoeretrygd,
		har100Ufoeretrygd,
		beregnerAfpPrivat,
		beregnerAfpUavhengigAvAarskull,
		beregnerMedGjenlevenderett: !!aktivBeregning?.beregnMedGjenlevenderett,
		foedtFoer1963,
		foedtEtter1963: erFoedtEtter1963,
		erOvergangskull,
	}
}

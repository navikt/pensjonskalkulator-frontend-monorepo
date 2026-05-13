import { type ForbeholdContext } from '@pensjonskalkulator-frontend-monorepo/sanity'
import type {
	OmstillingsstoenadOgGjenlevende,
	PersonInternV1,
	Vedtak,
} from '@pensjonskalkulator-frontend-monorepo/types'
import {
	isFoedtEtter1963,
	isOvergangskull,
} from '@pensjonskalkulator-frontend-monorepo/utils'

import type { BeregningParams } from '../../api/beregningTypes'

interface BuildForbeholdContextArgs {
	aktivBeregning: BeregningParams | null
	person: PersonInternV1 | undefined
	vedtak: Vedtak | undefined
	omstillingsstoenad: OmstillingsstoenadOgGjenlevende | undefined
}

export function buildForbeholdContext({
	aktivBeregning,
	person,
	vedtak,
	omstillingsstoenad,
}: BuildForbeholdContextArgs): ForbeholdContext {
	const ufoeretrygdgrad = vedtak?.ufoeretrygdgrad ?? 0
	const harUfoeretrygd = ufoeretrygdgrad > 0
	const har100Ufoeretrygd = ufoeretrygdgrad === 100
	const graderUfoeretrygd = ufoeretrygdgrad > 0 && ufoeretrygdgrad < 100

	const beregnerAfpPrivat = aktivBeregning?.afp === 'ja_privat'
	const beregnerAfpOffentlig = aktivBeregning?.afp === 'ja_offentlig'
	const beregnerGammelAfp = aktivBeregning?.afp === 'serviceberegning'
	const beregnerAfpUavhengigAvAarskull =
		beregnerAfpPrivat || beregnerAfpOffentlig || beregnerGammelAfp

	const harUtenlandsopphold =
		aktivBeregning?.harOppholdUtenforNorge === true ||
		(aktivBeregning?.utenlandsOpphold?.length ?? 0) > 0
	const harFremtidigUtenlandsopphold =
		aktivBeregning?.utenlandsOpphold?.some((opphold) => !opphold.tom) ?? false

	// Forbeholdene skal speile sivilstatusen som faktisk ble brukt i beregningen.
	// Ikke fall tilbake til person.sivilstatus her, siden PDL-data kan avvike fra
	// skjema-/beregningsverdien.
	const sivilstatus = aktivBeregning?.sivilstatus
	const erGift = sivilstatus === 'GIFT' || sivilstatus === 'REGISTRERT_PARTNER'
	const erSamboer = sivilstatus === 'SAMBOER'

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
		beregnerAfpOffentlig,
		beregnerGammelAfp,
		beregnerAfpUavhengigAvAarskull,
		harPrivatAfpVedtak: !!vedtak?.privatAfpFom,
		harTidsbegrensetOffentligAfpVedtak: !!vedtak?.tidsbegrensetOffentligAfpFom,
		beregnerMedGjenlevenderett: !!aktivBeregning?.beregnMedGjenlevenderett,
		harGjenlevendeEllerOmstillingsstoenad: !!omstillingsstoenad?.harLoependeSak,
		harUtenlandsopphold,
		harFremtidigUtenlandsopphold,
		erGift,
		erSamboer,
		foedtFoer1963,
		foedtEtter1963: erFoedtEtter1963,
		erOvergangskull,
	}
}

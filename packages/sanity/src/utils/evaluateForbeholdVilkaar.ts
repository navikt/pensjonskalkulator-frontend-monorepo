import type {
	ForbeholdContext,
	ForbeholdVilkaarTag,
} from '../schemaTypes/forbeholdVilkaarTags'

interface BetingelseLike {
	tag?: string | null
	negert?: boolean | null
}

interface VilkaarGruppeLike {
	betingelser?: readonly BetingelseLike[] | null
}

interface ForbeholdSynlighetLike {
	alltidSynlig?: boolean | null
	vilkaar?: readonly VilkaarGruppeLike[] | null
}

/**
 * Avgjør om et forbeholdAvsnitt skal vises gitt et sett vilkår og dagens
 * brukerkontekst.
 *
 * Modell:
 * - `alltidSynlig === true` => alltid synlig (overstyrer vilkår).
 * - `vilkaar` udefinert/null/tom liste => alltid synlig.
 * - Ytre OR mellom regelgrupper, indre AND innenfor en gruppe.
 * - Hver betingelse består av en tag og en valgfri `negert` (EXCEPT). Når
 *   `negert` er true matcher betingelsen når tagen IKKE er sann i `ctx`.
 * - Ukjente tags (verdier som ikke finnes i ForbeholdVilkaarTag) telles som
 *   ikke-matchende slik at avsnitt med foreldede tags ikke vises ved en feil.
 * - Avsnittet vises hvis MINST ÉN gruppe matcher.
 */

type ForbeholdInput =
	| ForbeholdSynlighetLike
	| readonly VilkaarGruppeLike[]
	| undefined
	| null

export function evaluateForbeholdVilkaar(
	source: ForbeholdInput,
	ctx: ForbeholdContext
): boolean {
	const { alltidSynlig, vilkaar } = normalize(source)

	if (alltidSynlig) return true
	if (!vilkaar || vilkaar.length === 0) return true

	return vilkaar.some((gruppe) => gruppeErOppfylt(gruppe, ctx))
}

function gruppeErOppfylt(
	gruppe: VilkaarGruppeLike,
	ctx: ForbeholdContext
): boolean {
	const betingelser = gruppe.betingelser ?? []
	if (betingelser.length === 0) return true

	return betingelser.every((betingelse) => betingelseErOppfylt(betingelse, ctx))
}

function betingelseErOppfylt(
	betingelse: BetingelseLike,
	ctx: ForbeholdContext
): boolean {
	if (!betingelse.tag) return false

	const tag = betingelse.tag as ForbeholdVilkaarTag
	const erSann = ctx[tag] === true

	return betingelse.negert ? !erSann : erSann
}

function normalize(source: ForbeholdInput): ForbeholdSynlighetLike {
	if (!source) return {}
	if (Array.isArray(source)) return { vilkaar: source }
	return source as ForbeholdSynlighetLike
}

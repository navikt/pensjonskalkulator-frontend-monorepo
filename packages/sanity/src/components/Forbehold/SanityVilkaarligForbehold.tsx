import React from 'react'

import { SanityContext } from '../../context/SanityContext'
import type { ForbeholdContext } from '../../schemaTypes/forbeholdVilkaarTags'
import { evaluateForbeholdVilkaar } from '../../utils/evaluateForbeholdVilkaar'
import { SanityForbehold } from './SanityForbehold'

interface Props {
	ctx: ForbeholdContext
	title?: React.ReactNode
	avsnittTestId?: string
}

/**
 * Vilkår-aware wrapper: leser `forbeholdAvsnittData` fra `SanityContext`,
 * filtrerer mot `ctx` via `evaluateForbeholdVilkaar`, og rendrer resultatet
 * med `SanityForbehold`.
 *
 * Bruk denne i intern-kalkulatoren der avsnitt har `vilkaar`-felt.
 * Bruk `SanityForbehold` direkte i kontekster uten vilkår (f.eks. ekstern).
 */
export const SanityVilkaarligForbehold = ({
	ctx,
	title,
	avsnittTestId,
}: Props) => {
	const { forbeholdAvsnittData } = React.useContext(SanityContext)

	const synligeAvsnitt = React.useMemo(
		() =>
			forbeholdAvsnittData.filter((avsnitt) =>
				evaluateForbeholdVilkaar(avsnitt, ctx)
			),
		[forbeholdAvsnittData, ctx]
	)

	return (
		<SanityForbehold
			avsnitt={synligeAvsnitt}
			title={title}
			avsnittTestId={avsnittTestId}
		/>
	)
}

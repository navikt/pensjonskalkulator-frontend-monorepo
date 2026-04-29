import { SanityVilkaarligForbehold } from '@pensjonskalkulator-frontend-monorepo/sanity'
import { useMemo } from 'react'

import { useBeregningContext } from '../BeregningContext'
import { buildForbeholdContext } from './forbeholdContext'

export const Forbehold = () => {
	const { aktivBeregning, person, loependeVedtak } = useBeregningContext()

	const ctx = useMemo(
		() => buildForbeholdContext({ aktivBeregning, person, loependeVedtak }),
		[aktivBeregning, person, loependeVedtak]
	)

	return (
		<div>
			<SanityVilkaarligForbehold ctx={ctx} />
		</div>
	)
}

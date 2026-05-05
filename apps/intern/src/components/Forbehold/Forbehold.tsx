import { SanityVilkaarligForbehold } from '@pensjonskalkulator-frontend-monorepo/sanity'
import { useMemo } from 'react'

import { useBeregningContext } from '../BeregningContext'
import { buildForbeholdContext } from './forbeholdContext'

export const Forbehold = () => {
	const { aktivBeregning, person, vedtak } = useBeregningContext()

	const ctx = useMemo(
		() => buildForbeholdContext({ aktivBeregning, person, vedtak }),
		[aktivBeregning, person, vedtak]
	)

	return (
		<div>
			<SanityVilkaarligForbehold ctx={ctx} />
		</div>
	)
}

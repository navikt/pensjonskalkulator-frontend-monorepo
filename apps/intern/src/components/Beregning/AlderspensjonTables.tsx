import type { AlderspensjonPensjonsberegning } from '@pensjonskalkulator-frontend-monorepo/types'

import { BeregningTable } from './BeregningTable'
import {
	mapAlderspensjonToRows,
	mapOpptjeningEtterKapittel19ToRows,
	mapOpptjeningEtterKapittel20ToRows,
} from './beregningMappers'

interface AlderspensjonTablesProps {
	entry: AlderspensjonPensjonsberegning
	erFoedtFoer1963?: boolean | null
	erOvergangskull?: boolean | null
	erFoedtEtter1963?: boolean | null
	grunnbeloep?: number
}

export const AlderspensjonTables = ({
	entry,
	erFoedtFoer1963,
	erOvergangskull,
	erFoedtEtter1963,
	grunnbeloep,
}: AlderspensjonTablesProps) => (
	<>
		<BeregningTable
			title="Alderspensjon"
			valueHeader="Kr per måned"
			rows={mapAlderspensjonToRows(entry)}
		/>
		{erFoedtFoer1963 && (
			<BeregningTable
				title="Opptjening etter kapittel 19"
				valueHeader="Kr per måned"
				rows={mapOpptjeningEtterKapittel19ToRows(entry, grunnbeloep)}
				simple
			/>
		)}
		{(erOvergangskull || erFoedtEtter1963) && (
			<BeregningTable
				title="Opptjening etter kapittel 20"
				valueHeader="Kr per måned"
				rows={mapOpptjeningEtterKapittel20ToRows(entry)}
				simple
			/>
		)}
	</>
)

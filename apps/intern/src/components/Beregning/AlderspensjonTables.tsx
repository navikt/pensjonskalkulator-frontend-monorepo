import type { SimuleringMaanedligAlderspensjon } from '@pensjonskalkulator-frontend-monorepo/types'

import { BeregningDetailTable } from './BeregningDetailTable'
import { BeregningTableWithSum } from './BeregningTableWithSum'
import {
	mapAlderspensjonToRows,
	mapOpptjeningEtterKapittel19ToRows,
	mapOpptjeningEtterKapittel20ToRows,
} from './beregningMappers'

interface AlderspensjonTablesProps {
	entry: SimuleringMaanedligAlderspensjon
	erFoedtFoer1963?: boolean | null
	erOvergangskull?: boolean | null
	erFoedtEtter1963?: boolean | null
	grunnbeloep?: number
	alderspensjonGrad: number
	simulererMedGjenlevenderett?: boolean
	isGradert?: boolean
	visAarsbelop?: boolean
}

export const AlderspensjonTables = ({
	entry,
	erFoedtFoer1963,
	erOvergangskull,
	erFoedtEtter1963,
	grunnbeloep,
	alderspensjonGrad,
	simulererMedGjenlevenderett = false,
	isGradert = false,
	visAarsbelop = false,
}: AlderspensjonTablesProps) => (
	<>
		<BeregningTableWithSum
			title={`${alderspensjonGrad} % alderspensjon`}
			valueHeader={visAarsbelop ? 'Kr per år' : 'Kr per måned'}
			rows={mapAlderspensjonToRows(
				entry,
				!!erFoedtFoer1963,
				!!erOvergangskull || !!erFoedtEtter1963,
				simulererMedGjenlevenderett
			)}
			visAarsbelop={visAarsbelop}
		/>
		{erFoedtFoer1963 && (
			<BeregningDetailTable
				title="Opptjening etter kapittel 19"
				rows={mapOpptjeningEtterKapittel19ToRows(
					entry,
					visAarsbelop,
					grunnbeloep,
					isGradert
				)}
			/>
		)}
		{(erOvergangskull || erFoedtEtter1963) && (
			<BeregningDetailTable
				title="Opptjening etter kapittel 20"
				rows={mapOpptjeningEtterKapittel20ToRows(entry)}
			/>
		)}
	</>
)

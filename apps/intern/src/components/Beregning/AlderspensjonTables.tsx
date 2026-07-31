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
	harGjenlevenderett?: boolean
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
	harGjenlevenderett = false,
}: AlderspensjonTablesProps) => (
	<>
		<BeregningTableWithSum
			title={`${alderspensjonGrad} % alderspensjon`}
			valueHeader={visAarsbelop ? 'Kr per år' : 'Kr per måned'}
			sumLabel="Sum alderspensjon"
			rows={mapAlderspensjonToRows(
				entry,
				!!erFoedtFoer1963,
				!!erOvergangskull || !!erFoedtEtter1963,
				simulererMedGjenlevenderett,
				harGjenlevenderett
			)}
			visAarsbelop={visAarsbelop}
		/>
		{erFoedtFoer1963 && (
			<BeregningDetailTable
				title="Opptjening alderspensjon etter kapittel 19"
				rows={mapOpptjeningEtterKapittel19ToRows(
					entry,
					visAarsbelop,
					grunnbeloep,
					isGradert,
					!!erOvergangskull
				)}
			/>
		)}
		{(erOvergangskull || erFoedtEtter1963) && (
			<BeregningDetailTable
				title="Opptjening alderspensjon etter kapittel 20"
				rows={mapOpptjeningEtterKapittel20ToRows(entry, !erFoedtEtter1963)}
			/>
		)}
	</>
)

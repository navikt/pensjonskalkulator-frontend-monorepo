import type { SimuleringMaanedligAlderspensjon } from '@pensjonskalkulator-frontend-monorepo/types'

import { useBeregningContext } from '../BeregningContext'
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
	reducedGrunnpensjon?: boolean
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
	reducedGrunnpensjon = false,
}: AlderspensjonTablesProps) => {
	const { aktivBeregning } = useBeregningContext()
	const erEndring = Boolean(aktivBeregning?.endringAP)

	return (
		<>
			<BeregningTableWithSum
				title={`${alderspensjonGrad} % alderspensjon`}
				valueHeader={visAarsbelop ? 'Kr per år' : 'Kr per måned'}
				sumLabel="Sum alderspensjon"
				rows={mapAlderspensjonToRows({
					entry,
					visKap19: Boolean(erFoedtFoer1963),
					visKap20: Boolean(erOvergangskull) || Boolean(erFoedtEtter1963),
					simulererMedGjenlevenderett,
					harGjenlevenderett,
					erOvergangskull: Boolean(erOvergangskull),
					reducedGrunnpensjon,
					erEndring,
				})}
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
					visAarsbelop={visAarsbelop}
				/>
			)}
			{(erOvergangskull || erFoedtEtter1963) && (
				<BeregningDetailTable
					title="Opptjening alderspensjon etter kapittel 20"
					rows={mapOpptjeningEtterKapittel20ToRows(entry, !erFoedtEtter1963)}
					visAarsbelop={visAarsbelop}
				/>
			)}
		</>
	)
}

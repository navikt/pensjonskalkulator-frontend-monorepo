import type { LivsvarigOffentligAFP } from '@pensjonskalkulator-frontend-monorepo/types'

import { BodyLong, VStack } from '@navikt/ds-react'

import { BeregningTableWithSum } from './BeregningTableWithSum'
import { mapLivsvarigOffentligAfpToRows } from './beregningMappers'

interface LivsvarigOffentligAfpTablesProps {
	entry: LivsvarigOffentligAFP
	beskrivelse: string
	alderspensjonBeloep?: number
	visAarsbelop: boolean
	testId?: string
}

export const LivsvarigOffentligAfpTables = ({
	entry,
	beskrivelse,
	alderspensjonBeloep,
	visAarsbelop,
	testId,
}: LivsvarigOffentligAfpTablesProps) => {
	const valueHeader = visAarsbelop ? 'Kr per år' : 'Kr per måned'
	const sumAlderspensjonOgAfp =
		alderspensjonBeloep != null
			? visAarsbelop
				? alderspensjonBeloep * 12 + entry.aarligBeloep
				: alderspensjonBeloep + (entry.maanedligBeloep ?? 0)
			: undefined

	return (
		<VStack gap="space-32" data-testid={testId}>
			<VStack gap="space-8">
				<BeregningTableWithSum
					title="AFP i offentlig sektor"
					valueHeader={valueHeader}
					rows={mapLivsvarigOffentligAfpToRows(entry)}
					sumLabel="Sum AFP"
					visAarsbelop={visAarsbelop}
				/>
				<BodyLong size="small" textColor="subtle">
					{beskrivelse}
				</BodyLong>
			</VStack>
			{sumAlderspensjonOgAfp != null && (
				<BeregningTableWithSum
					title="Alderspensjon og AFP"
					valueHeader={valueHeader}
					sumLabel="Sum pensjon"
					addToSum={sumAlderspensjonOgAfp}
					visAarsbelop={visAarsbelop}
				/>
			)}
		</VStack>
	)
}

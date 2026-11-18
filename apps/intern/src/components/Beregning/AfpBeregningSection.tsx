import type {
	LivsvarigOffentligAFP,
	TidsbegrensetOffentligAFP,
} from '@pensjonskalkulator-frontend-monorepo/types'

import { BodyLong, Checkbox, HStack, Heading, VStack } from '@navikt/ds-react'

import { useBeregningContext } from '../BeregningContext'
import { BeregningDetailTable } from './BeregningDetailTable'
import { BeregningTableWithSum } from './BeregningTableWithSum'
import { LivsvarigOffentligAfpTables } from './LivsvarigOffentligAfpTables'
import {
	mapAfpToRows,
	mapTidsbegrensetAfpOpptjeningToRows,
} from './beregningMappers'

import styles from '../BeregningSection/BeregningSection.module.css'

export type OffentligAfp =
	| { type: 'tidsbegrenset'; entry: TidsbegrensetOffentligAFP }
	| { type: 'livsvarig'; entry: LivsvarigOffentligAFP }

interface AfpBeregningSectionProps {
	title: string
	tableCount: number
	afp: OffentligAfp
	alderspensjonBeloep?: number
	visAarsbelop: boolean
	testId?: string
	showVisAarsbelopCheckbox?: boolean
	onVisAarsbelopChange?: (checked: boolean) => void
}

export const AfpBeregningSection = ({
	title,
	tableCount,
	afp,
	alderspensjonBeloep,
	visAarsbelop,
	testId,
	showVisAarsbelopCheckbox,
	onVisAarsbelopChange,
}: AfpBeregningSectionProps) => {
	const { aktivBeregning } = useBeregningContext()
	const valueHeader = visAarsbelop ? 'Kr per år' : 'Kr per måned'

	return (
		<VStack gap="space-12" data-testid={testId}>
			<HStack justify="space-between" align="center">
				<Heading level="3" size="small">
					{title}
				</Heading>
				{showVisAarsbelopCheckbox && (
					<Checkbox
						onChange={(e) => onVisAarsbelopChange?.(e.target.checked)}
						size="small"
					>
						Vis årsbeløp
					</Checkbox>
				)}
			</HStack>
			<div
				className={styles.tableGrid}
				style={{ '--table-columns': tableCount } as React.CSSProperties}
			>
				{afp.type === 'livsvarig' ? (
					<LivsvarigOffentligAfpTables
						entry={afp.entry}
						alderspensjonBeloep={alderspensjonBeloep}
						visAarsbelop={visAarsbelop}
					/>
				) : (
					<>
						<VStack gap="space-8">
							<BeregningTableWithSum
								title="AFP i offentlig sektor"
								valueHeader={valueHeader}
								rows={mapAfpToRows({
									...afp.entry,
									epsHarPensjon: aktivBeregning?.epsHarPensjon,
								})}
								sumLabel="Sum AFP"
								visAarsbelop={visAarsbelop}
							/>
							{afp.entry.erAvkortet && (
								<BodyLong size="small" textColor="subtle">
									Sum redusert pga. total pensjon oversteg 70 % av tidligere
									inntekt
								</BodyLong>
							)}
						</VStack>
						<BeregningDetailTable
							title="Opptjening AFP i offentlig sektor"
							rows={mapTidsbegrensetAfpOpptjeningToRows(afp.entry)}
							visAarsbelop={visAarsbelop}
						/>
					</>
				)}
			</div>
		</VStack>
	)
}

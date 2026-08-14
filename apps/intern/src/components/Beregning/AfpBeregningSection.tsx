import type {
	PersonInternV1,
	TidsbegrensetOffentligAFP,
} from '@pensjonskalkulator-frontend-monorepo/types'

import { BodyLong, Checkbox, HStack, Heading, VStack } from '@navikt/ds-react'

import type { BeregningParams } from '../../api/beregningTypes'
import { BeregningDetailTable } from './BeregningDetailTable'
import { BeregningTableWithSum } from './BeregningTableWithSum'
import {
	mapAfpToRows,
	mapTidsbegrensetAfpOpptjeningToRows,
} from './beregningMappers'

import styles from '../BeregningSection/BeregningSection.module.css'

interface AfpBeregningSectionProps {
	title: string
	tableCount: number
	entry: TidsbegrensetOffentligAFP
	visAarsbelop: boolean
	showVisAarsbelopCheckbox?: boolean
	onVisAarsbelopChange?: (checked: boolean) => void
	aktivBeregning: BeregningParams | null
	person?: PersonInternV1 | null
}

export const AfpBeregningSection = ({
	title,
	tableCount,
	entry,
	visAarsbelop,
	showVisAarsbelopCheckbox,
	onVisAarsbelopChange,
	aktivBeregning,
	person = null,
}: AfpBeregningSectionProps) => {
	const afpRows = mapAfpToRows(entry, aktivBeregning, person)
	const opptjeningRows = mapTidsbegrensetAfpOpptjeningToRows(entry)

	return (
		<VStack gap="space-12">
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
				<VStack gap="space-8">
					<BeregningTableWithSum
						title="AFP i offentlig sektor"
						valueHeader={visAarsbelop ? 'Kr per år' : 'Kr per måned'}
						rows={afpRows}
						sumLabel="Sum AFP"
						visAarsbelop={visAarsbelop}
					/>
					{entry.erAvkortet && (
						<BodyLong size="small" textColor="subtle">
							Sum redusert pga. total pensjon oversteg 70 % av tidligere inntekt
						</BodyLong>
					)}
				</VStack>
				<BeregningDetailTable
					title="Opptjening AFP i offentlig sektor"
					rows={opptjeningRows}
				/>
			</div>
		</VStack>
	)
}

import type { TidsbegrensetOffentligAFP } from '@pensjonskalkulator-frontend-monorepo/types'

import { BodyLong, Heading, VStack } from '@navikt/ds-react'

import { BeregningDetailTable } from './BeregningDetailTable'
import { BeregningTableWithSum } from './BeregningTableWithSum'
import {
	mapTidsbegrensetAfpOpptjeningToRows,
	mapTidsbegrensetAfpToRows,
} from './beregningMappers'

import styles from '../BeregningSection/BeregningSection.module.css'

interface AfpBeregningSectionProps {
	title: string
	tableCount: number
	entry: TidsbegrensetOffentligAFP
	visAarsbelop: boolean
}

export const AfpBeregningSection = ({
	title,
	tableCount,
	entry,
	visAarsbelop,
}: AfpBeregningSectionProps) => {
	const afpRows = mapTidsbegrensetAfpToRows(entry)
	const opptjeningRows = mapTidsbegrensetAfpOpptjeningToRows(entry)

	return (
		<VStack gap="space-12">
			<Heading level="3" size="small">
				{title}
			</Heading>
			<div
				className={styles.tableGrid}
				style={{ '--table-columns': tableCount } as React.CSSProperties}
			>
				<VStack gap="space-8">
					<BeregningTableWithSum
						title="AFP"
						valueHeader={visAarsbelop ? 'Kr per år' : 'Kr per måned'}
						rows={afpRows}
						visAarsbelop={visAarsbelop}
					/>
					{entry.erAvkortet && (
						<BodyLong size="small" textColor="subtle">
							Sum redusert pga. total pensjon oversteg 70 % av tidligere inntekt
						</BodyLong>
					)}
				</VStack>
				<BeregningDetailTable title="Opptjening AFP" rows={opptjeningRows} />
			</div>
		</VStack>
	)
}

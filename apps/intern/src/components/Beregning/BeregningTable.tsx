import { BodyShort, Label, Table } from '@navikt/ds-react'

import styles from './BeregningTable.module.css'

export type Unit = 'kr' | 'år'

export interface BeregningTableRow {
	label: string
	value?: number
	unit?: Unit
}

interface BeregningTableProps {
	title: string
	valueHeader: string
	rows?: BeregningTableRow[]
	sumLabel?: string
	addToSum?: number
	simple?: boolean
}

const formatKroner = (value?: number) =>
	value?.toLocaleString('nb-NO', { maximumFractionDigits: 0 }) ?? ''

export const BeregningTable = ({
	title,
	valueHeader,
	rows = [],
	sumLabel = 'Sum',
	addToSum = 0,
	simple = false,
}: BeregningTableProps) => {
	const sum =
		rows.reduce((acc, row) => acc + Math.max(row.value ?? 0, 0), 0) + addToSum

	return (
		<Table zebraStripes size="small" className={styles.table}>
			<Table.Header>
				<Table.Row className={styles.headerRow}>
					<Table.HeaderCell colSpan={simple ? 2 : undefined}>
						<Label style={{ whiteSpace: 'nowrap' }} size="small">
							{title}
						</Label>
					</Table.HeaderCell>
					{!simple && (
						<Table.HeaderCell align="right">
							<Label style={{ whiteSpace: 'nowrap' }} size="small">
								{valueHeader}
							</Label>
						</Table.HeaderCell>
					)}
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{rows.map(
					(row) =>
						row.value != null &&
						row.value >= 0 && (
							<Table.Row key={row.label}>
								<Table.DataCell>
									<BodyShort size="small">{row.label}</BodyShort>
								</Table.DataCell>
								<Table.DataCell align="right">
									<BodyShort size="small">
										{row.unit
											? `${formatKroner(row.value)} ${row.unit}`
											: formatKroner(row.value)}
									</BodyShort>
								</Table.DataCell>
							</Table.Row>
						)
				)}
				{!simple && (
					<Table.Row>
						<Table.DataCell>
							<Label size="small">{sumLabel}</Label>
						</Table.DataCell>
						<Table.DataCell align="right">
							<Label size="small">{formatKroner(sum)}&nbsp;kr</Label>
						</Table.DataCell>
					</Table.Row>
				)}
			</Table.Body>
		</Table>
	)
}

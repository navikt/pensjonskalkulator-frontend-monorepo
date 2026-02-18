import { BodyShort, Label, Table } from '@navikt/ds-react'

import styles from './BeregningTable.module.css'

export interface BeregningTableRow {
	label: string
	value: number
}

interface BeregningTableProps {
	title: string
	valueHeader: string
	rows: BeregningTableRow[]
	sumLabel?: string
}

const formatKroner = (value: number) =>
	value.toLocaleString('nb-NO', { maximumFractionDigits: 0 })

export const BeregningTable = ({
	title,
	valueHeader,
	rows,
	sumLabel = 'Sum',
}: BeregningTableProps) => {
	const sum = rows.reduce((acc, row) => acc + row.value, 0)

	return (
		<Table zebraStripes size="small" className={styles.table}>
			<Table.Header>
				<Table.Row className={styles.headerRow}>
					<Table.HeaderCell>
						<Label size="small">{title}</Label>
					</Table.HeaderCell>
					<Table.HeaderCell align="right">
						<Label size="small">{valueHeader}</Label>
					</Table.HeaderCell>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{rows.map((row) => (
					<Table.Row key={row.label}>
						<Table.DataCell>
							<BodyShort size="small">{row.label}</BodyShort>
						</Table.DataCell>
						<Table.DataCell align="right">
							<BodyShort size="small">{formatKroner(row.value)}</BodyShort>
						</Table.DataCell>
					</Table.Row>
				))}
				<Table.Row>
					<Table.DataCell>
						<Label size="small">{sumLabel}</Label>
					</Table.DataCell>
					<Table.DataCell align="right">
						<Label size="small">{formatKroner(sum)}</Label>
					</Table.DataCell>
				</Table.Row>
			</Table.Body>
		</Table>
	)
}

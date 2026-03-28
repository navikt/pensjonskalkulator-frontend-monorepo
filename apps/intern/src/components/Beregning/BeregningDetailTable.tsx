import { BodyShort, Label, Table } from '@navikt/ds-react'

import styles from './BeregningTable.module.css'

export interface BeregningDetailRow {
	label: string
	value: string
	hide?: boolean
}

interface BeregningDetailTableProps {
	title: string
	rows?: BeregningDetailRow[]
}

export const BeregningDetailTable = ({
	title,
	rows = [],
}: BeregningDetailTableProps) => {
	const validRows = rows.filter((row) => row.value !== '' && !row.hide)

	return (
		<Table
			zebraStripes={validRows.length > 3}
			size="small"
			className={styles.table}
		>
			<Table.Header>
				<Table.Row className={styles.headerRow}>
					<Table.HeaderCell colSpan={2}>
						<Label style={{ whiteSpace: 'nowrap' }} size="small">
							{title}
						</Label>
					</Table.HeaderCell>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{validRows.map((row) => (
					<Table.Row key={row.label}>
						<Table.DataCell>
							<BodyShort size="small">{row.label}</BodyShort>
						</Table.DataCell>
						<Table.DataCell align="right">
							<BodyShort size="small">{row.value}</BodyShort>
						</Table.DataCell>
					</Table.Row>
				))}
			</Table.Body>
		</Table>
	)
}

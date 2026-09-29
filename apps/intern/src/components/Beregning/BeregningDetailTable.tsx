import { BodyShort, Box, Label, Table } from '@navikt/ds-react'

import type { Formula } from './FormulaPopover'
import { FormulaPopover } from './FormulaPopover'

import styles from './BeregningTable.module.css'

export interface BeregningDetailRow {
	label: string
	value: string
	hide?: boolean
	formula?: Formula
}

interface BeregningDetailTableProps {
	title: string
	rows?: BeregningDetailRow[]
	visAarsbelop?: boolean
}

export const BeregningDetailTable = ({
	title,
	rows = [],
	visAarsbelop = false,
}: BeregningDetailTableProps) => {
	const validRows = rows.filter((row) => row.value !== '' && !row.hide)

	return (
		<Box overflowX={{ xs: 'auto', xl: 'visible' }}>
			<Table
				zebraStripes={validRows.length > 3}
				size="small"
				className={`${styles.table} ${styles.captionTable}`}
			>
				<caption className={styles.tableCaption}>
					<Label as="span" style={{ whiteSpace: 'nowrap' }} size="small">
						{title}
					</Label>
				</caption>
				<Table.Body>
					{validRows.map((row) => (
						<Table.Row key={row.label}>
							<Table.HeaderCell scope="row">
								<BodyShort size="small" className={styles.labelCell}>
									{row.label}
									{row.formula && (
										<FormulaPopover
											formula={row.formula}
											visAarsbelop={visAarsbelop}
										/>
									)}
								</BodyShort>
							</Table.HeaderCell>
							<Table.DataCell align="right">
								<BodyShort size="small">{row.value}</BodyShort>
							</Table.DataCell>
						</Table.Row>
					))}
				</Table.Body>
			</Table>
		</Box>
	)
}

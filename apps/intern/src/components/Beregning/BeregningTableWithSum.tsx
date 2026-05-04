import { BodyShort, Label, Table } from '@navikt/ds-react'

import styles from './BeregningTable.module.css'

export type Unit = 'kr' | 'år'

export interface BeregningTableRow {
	label: string
	value?: number
	yearlyValue?: number
	unit?: Unit
	hide?: boolean
	showWhenZero?: boolean
}

interface BeregningTableWithSumProps {
	title: string
	valueHeader: string
	rows?: BeregningTableRow[]
	sumLabel?: string
	addToSum?: number
	visAarsbelop: boolean
}

const formatKroner = (value?: number) =>
	value?.toLocaleString('nb-NO', { maximumFractionDigits: 0 }) ?? ''

export function computeRowsSum(
	rows: BeregningTableRow[],
	visAarsbelop: boolean
): number {
	const getValue = visAarsbelop
		? (row: BeregningTableRow) => row.yearlyValue
		: (row: BeregningTableRow) => row.value
	return rows
		.filter(
			(row) =>
				getValue(row) != null &&
				((getValue(row) ?? 0) > 0 ||
					(row.showWhenZero && getValue(row) === 0)) &&
				!row.hide
		)
		.reduce((acc, row) => acc + Math.max(getValue(row) ?? 0, 0), 0)
}

export const BeregningTableWithSum = ({
	title,
	valueHeader,
	rows = [],
	sumLabel = 'Sum',
	addToSum = 0,
	visAarsbelop = false,
}: BeregningTableWithSumProps) => {
	const value = visAarsbelop
		? (row: BeregningTableRow) => row.yearlyValue
		: (row: BeregningTableRow) => row.value
	const validRows = rows.filter(
		(row) =>
			value(row) != null &&
			((value(row) ?? 0) > 0 || (row.showWhenZero && value(row) === 0)) &&
			!row.hide
	)

	const sum =
		computeRowsSum(validRows, visAarsbelop) + (addToSum > 0 ? addToSum : 0)
	return (
		<Table
			zebraStripes={validRows.length > 2}
			size="small"
			className={styles.table}
		>
			<Table.Header>
				<Table.Row className={styles.headerRow}>
					<Table.HeaderCell>
						<Label style={{ whiteSpace: 'nowrap' }} size="small">
							{title}
						</Label>
					</Table.HeaderCell>
					<Table.HeaderCell align="right">
						<Label style={{ whiteSpace: 'nowrap' }} size="small">
							{valueHeader}
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
							<BodyShort size="small">
								{row.unit
									? `${formatKroner(value(row))} ${row.unit}`
									: formatKroner(value(row))}
							</BodyShort>
						</Table.DataCell>
					</Table.Row>
				))}
				<Table.Row>
					<Table.DataCell>
						<Label size="small">{sumLabel}</Label>
					</Table.DataCell>
					<Table.DataCell align="right">
						<Label size="small">{formatKroner(sum)}&nbsp;kr</Label>
					</Table.DataCell>
				</Table.Row>
			</Table.Body>
		</Table>
	)
}

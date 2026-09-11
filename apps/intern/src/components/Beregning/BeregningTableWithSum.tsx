import { BodyShort, Box, Label, Table } from '@navikt/ds-react'

import type { Formula } from './FormulaPopover'
import { FormulaPopover } from './FormulaPopover'

import styles from './BeregningTable.module.css'

export type Unit = 'kr' | 'år'

export interface BeregningTableRow {
	label: string
	value?: number
	yearlyValue?: number
	unit?: Unit
	hide?: boolean
	showWhenZero?: boolean
	formula?: Formula
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
		<Box overflowX={{ xs: 'auto', xl: 'visible' }}>
			<Table
				zebraStripes={validRows.length > 2}
				size="small"
				className={styles.table}
			>
				<caption className="srOnly">{title}</caption>
				<Table.Header>
					<Table.Row className={styles.headerRow}>
						<Table.HeaderCell scope="col">
							<Label style={{ whiteSpace: 'nowrap' }} size="small">
								{title}
							</Label>
						</Table.HeaderCell>
						<Table.HeaderCell scope="col" align="right">
							<Label style={{ whiteSpace: 'nowrap' }} size="small">
								{valueHeader}
							</Label>
						</Table.HeaderCell>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{validRows.map((row) => (
						<Table.Row key={row.label + title}>
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
								<BodyShort size="small">
									{row.unit
										? `${formatKroner(value(row))} ${row.unit}`
										: formatKroner(value(row))}
								</BodyShort>
							</Table.DataCell>
						</Table.Row>
					))}
					<Table.Row>
						<Table.HeaderCell scope="row">
							<Label size="small">{sumLabel}</Label>
						</Table.HeaderCell>
						<Table.DataCell align="right">
							<Label size="small">{formatKroner(sum)}</Label>
						</Table.DataCell>
					</Table.Row>
				</Table.Body>
			</Table>
		</Box>
	)
}

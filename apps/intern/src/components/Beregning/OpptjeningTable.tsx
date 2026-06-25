import type {
	Opptjening,
	OpptjeningAvdoed,
} from '@pensjonskalkulator-frontend-monorepo/types'

import { BodyShort, Heading, Table } from '@navikt/ds-react'

import styles from './BeregningTable.module.css'

export interface OpptjeningTableRow {
	aar: number
	pensjonsgivendeInntekt: string
	pensjonspoeng: string
	pensjonsbeholdning: string | null
	merknad?: string
}

interface OpptjeningTableProps {
	opptjening: Opptjening | OpptjeningAvdoed
	erOvergangskull?: boolean
	erFoedtEtter1963?: boolean | null
	isOpptjeningAvdoedSection?: boolean
}

export function mapOpptjeningToTableRows(
	opptjening: Opptjening | OpptjeningAvdoed,
	showPensjonsbeholdning: boolean
): OpptjeningTableRow[] {
	return [...opptjening]
		.sort((a, b) => b.aarstall - a.aarstall)
		.map((entry) => ({
			aar: entry.aarstall,
			pensjonsgivendeInntekt:
				entry.pensjonsgivendeInntektBeloep > 0
					? `${entry.pensjonsgivendeInntektBeloep.toLocaleString('nb-NO')} kr`
					: '0',
			pensjonspoeng:
				entry.pensjonspoeng > 0
					? entry.pensjonspoeng.toLocaleString('nb-NO', {
							minimumFractionDigits: 2,
							maximumFractionDigits: 2,
						})
					: '0',
			pensjonsbeholdning: showPensjonsbeholdning
				? entry.pensjonsbeholdningBeloep != null &&
					entry.pensjonsbeholdningBeloep > 0
					? entry.pensjonsbeholdningBeloep.toLocaleString('nb-NO')
					: '0'
				: null,
		}))
}

export function OpptjeningTable({
	opptjening,
	erOvergangskull,
	erFoedtEtter1963,
	isOpptjeningAvdoedSection,
}: OpptjeningTableProps) {
	const showPensjonsbeholdning =
		!isOpptjeningAvdoedSection && Boolean(erFoedtEtter1963 || erOvergangskull)
	const showPensjonspoeng = !erFoedtEtter1963 || erOvergangskull
	const rows = mapOpptjeningToTableRows(opptjening, showPensjonsbeholdning)

	const title = isOpptjeningAvdoedSection
		? 'Pensjonsopptjening avdøde'
		: 'Pensjonsopptjening bruker'

	const testId = isOpptjeningAvdoedSection
		? 'opptjening-table-avdoed'
		: 'opptjening-table-bruker'

	return (
		<div data-testid={testId}>
			<Heading size="xsmall" spacing>
				{title}
			</Heading>
			<Table
				zebraStripes={rows.length > 3}
				size="small"
				className={styles.table}
			>
				<Table.Header>
					<Table.Row className={styles.headerRow}>
						<Table.HeaderCell>
							<BodyShort size="small" weight="semibold">
								År
							</BodyShort>
						</Table.HeaderCell>
						<Table.HeaderCell align="right">
							<BodyShort size="small" weight="semibold">
								Pensjonsgivende inntekt
							</BodyShort>
						</Table.HeaderCell>
						{showPensjonspoeng && (
							<Table.HeaderCell align="right">
								<BodyShort size="small" weight="semibold">
									Pensjonspoeng
								</BodyShort>
							</Table.HeaderCell>
						)}
						{showPensjonsbeholdning && (
							<Table.HeaderCell align="right">
								<BodyShort size="small" weight="semibold">
									Pensjonsbeholdning
								</BodyShort>
							</Table.HeaderCell>
						)}
						<Table.HeaderCell>
							<BodyShort size="small" weight="semibold">
								Merknad
							</BodyShort>
						</Table.HeaderCell>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{rows.map((row) => (
						<Table.Row key={row.aar}>
							<Table.DataCell>
								<BodyShort size="small">{row.aar}</BodyShort>
							</Table.DataCell>
							<Table.DataCell align="right">
								<BodyShort size="small">{row.pensjonsgivendeInntekt}</BodyShort>
							</Table.DataCell>
							{showPensjonspoeng && (
								<Table.DataCell align="right">
									<BodyShort size="small">{row.pensjonspoeng}</BodyShort>
								</Table.DataCell>
							)}
							{showPensjonsbeholdning && (
								<Table.DataCell align="right">
									<BodyShort size="small">{row.pensjonsbeholdning}</BodyShort>
								</Table.DataCell>
							)}
							<Table.DataCell>
								<BodyShort size="small">{row.merknad}</BodyShort>
							</Table.DataCell>
						</Table.Row>
					))}
				</Table.Body>
			</Table>
		</div>
	)
}

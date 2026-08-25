import type {
	Opptjening,
	OpptjeningAvdoed,
} from '@pensjonskalkulator-frontend-monorepo/types'

import { BodyShort, Heading, Table } from '@navikt/ds-react'

import styles from './BeregningTable.module.css'

const merknadTextMap: Record<string, string> = {
	AFP: 'AFP (dersom du har hatt flere perioder med AFP vises kun merknader for siste periode)',
	REFORM:
		'Pensjonsbeholdningen din ble etablert med virkning 1. januar 2010 i forbindelse med at pensjonsreformen trådte i kraft. Da ble den opptjeningen du hadde i kalenderår frem til og med 2008 (siste år med ferdig skattemelding) summert til en beholdningsstørrelse.',
	PRE_2010:
		'Pensjonsbeholdningen din ble etablert med virkning 1. januar 2010 i forbindelse med at pensjonsreformen trådte i kraft. Da ble den opptjeningen du hadde i kalenderår frem til og med 2008 (siste år med ferdig skattemelding) summert til en beholdningsstørrelse.',
	INGEN_OPPTJENING: 'Du har ingen registrert opptjening dette året',
	DAGPENGER: 'Mottak av dagpenger',
	FOERSTEGANGSTJENESTE: 'Avtjent førstegangstjeneste',
	OMSORGSOPPTJENING:
		'Du er godskrevet omsorgsopptjening for ulønnet omsorgsarbeid i dette året',
	GRADERT_UTTAK: 'Gradert uttak',
	HELT_UTTAK: 'Alderspensjon: 100 prosent',
}

export function mapMerknadListe(
	merknadListe: string[],
	ufoeretrygdgrad?: number | null
): string {
	if (merknadListe.length === 0) return ''
	return merknadListe
		.filter((merknad) => merknad !== 'NONE' && merknad !== 'UNKNOWN')
		.map((merknad) => {
			if (merknad === 'UFOEREGRAD') {
				return ufoeretrygdgrad != null
					? `Uføretrygd: ${ufoeretrygdgrad} prosent`
					: ''
			}
			return merknadTextMap[merknad] ?? ''
		})
		.join(', ')
}

export function selectOpptjeningRows(
	opptjening: Opptjening | OpptjeningAvdoed
): Opptjening | OpptjeningAvdoed {
	const yearsWithIncome = opptjening.filter(
		(entry) => entry.pensjonsgivendeInntektBeloep > 0
	)

	if (yearsWithIncome.length === 0) {
		return []
	}

	const firstIncomeYear = Math.min(...yearsWithIncome.map((e) => e.aarstall))
	const lastIncomeYear = Math.max(...yearsWithIncome.map((e) => e.aarstall))

	return [...opptjening]
		.filter(
			(entry) =>
				entry.aarstall >= firstIncomeYear && entry.aarstall <= lastIncomeYear
		)
		.sort((a, b) => b.aarstall - a.aarstall)
}

export interface OpptjeningTableRow {
	aar: number
	pensjonsgivendeInntekt: string
	pensjonspoeng: string
	pensjonsbeholdning: string | null
	merknad: string
}

interface OpptjeningTableProps {
	opptjening: Opptjening | OpptjeningAvdoed
	erOvergangskull?: boolean
	erFoedtEtter1963?: boolean | null
	isOpptjeningAvdoedSection?: boolean
	ufoeretrygdgrad?: number | null
	erServiceberegning?: boolean
}

export function mapOpptjeningToTableRows(
	opptjening: Opptjening | OpptjeningAvdoed,
	showPensjonsbeholdning: boolean,
	ufoeretrygdgrad?: number | null
): OpptjeningTableRow[] {
	return selectOpptjeningRows(opptjening).map((entry) => ({
		aar: entry.aarstall,
		pensjonsgivendeInntekt:
			entry.pensjonsgivendeInntektBeloep > 0
				? entry.pensjonsgivendeInntektBeloep.toLocaleString('nb-NO')
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
		merknad: mapMerknadListe(entry.merknadListe, ufoeretrygdgrad),
	}))
}

export function OpptjeningTable({
	opptjening,
	erOvergangskull,
	erFoedtEtter1963,
	isOpptjeningAvdoedSection,
	ufoeretrygdgrad,
	erServiceberegning,
}: OpptjeningTableProps) {
	const showPensjonsbeholdning =
		!erServiceberegning &&
		!isOpptjeningAvdoedSection &&
		Boolean(erFoedtEtter1963 || erOvergangskull)
	const showPensjonspoeng = !erFoedtEtter1963 || erOvergangskull
	const rows = mapOpptjeningToTableRows(
		opptjening,
		showPensjonsbeholdning,
		ufoeretrygdgrad
	)

	const title = isOpptjeningAvdoedSection
		? 'Inntekt og pensjonsopptjening avdøde'
		: 'Inntekt og pensjonsopptjening'

	const testId = isOpptjeningAvdoedSection
		? 'opptjening-table-avdoed'
		: 'opptjening-table-bruker'

	return (
		<div data-testid={testId}>
			<Heading level="3" size="small" spacing>
				{title}
			</Heading>
			<Table
				zebraStripes={rows.length > 3}
				size="small"
				className={`${styles.table} ${styles.opptjeningTable}`}
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
								Pensjonsgivende inntekt (kr)
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
									Pensjonsbeholdning (kr)
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

import type {
	SimuleringAfpPrivat,
	SimuleringAlderspensjon,
	TidsbegrensetOffentligAFP,
} from '@pensjonskalkulator-frontend-monorepo/types'
import {
	type Alder,
	mergeAarligUtbetalinger,
} from '@pensjonskalkulator-frontend-monorepo/utils'

import { BodyShort, Heading, Label, Table, VStack } from '@navikt/ds-react'

import type { BeregningParams } from '../../api/beregningTypes'
import {
	SISTE_AAR,
	buildAfpSerie,
	buildAlderspensjonSerie,
	buildInntektSerie,
	filterAndMapSerie,
} from '../../utils/aarligPensjonSeries'
import { Divider } from '../Divider/Divider'

import styles from './BeregningTable.module.css'

interface AarligPensjonTableProps {
	alderspensjonListe: SimuleringAlderspensjon[]
	privatAfpListe?: SimuleringAfpPrivat[] | null
	tidsbegrensetOffentligAfp?: TidsbegrensetOffentligAFP | null
	pensjonsgivendeInntekt?: number
	heltUttakAlder: Alder
	gradertUttakAlder?: Alder
	aktiverBeregning?: BeregningParams | null
}

const formatNOK = (value: number): string =>
	value.toLocaleString('nb-NO', { maximumFractionDigits: 0 })

interface TableRow {
	alderLabel: string
	alderspensjon: number
	afp: number
	inntekt: number
}

// Slår sammen påfølgende elementer som er like (i henhold til isEqual)
const groupConsecutive = <T,>(
	items: T[],
	isEqual: (a: T, b: T) => boolean
): T[][] => {
	const groups: T[][] = []
	for (const item of items) {
		const current = groups.at(-1)
		if (current && isEqual(current[0], item)) {
			current.push(item)
		} else {
			groups.push([item])
		}
	}
	return groups
}

function buildTableRows(
	alderspensjonListe: SimuleringAlderspensjon[],
	privatAfpListe: SimuleringAfpPrivat[] | null | undefined,
	tidsbegrensetOffentligAfp: TidsbegrensetOffentligAFP | null | undefined,
	aarligInntektFoerUttakBeloep: number,
	heltUttakAlder: Alder,
	aktiverBeregning?: BeregningParams | null
): TableRow[] {
	const alderspensjonSerie = buildAlderspensjonSerie(alderspensjonListe)
	const afpSerie = buildAfpSerie(
		privatAfpListe,
		tidsbegrensetOffentligAfp,
		heltUttakAlder
	)
	const inntektSerie = buildInntektSerie({
		aarligInntektFoerUttakBeloep,
		aktiverBeregning,
	})

	const merged = mergeAarligUtbetalinger([
		alderspensjonSerie,
		afpSerie,
		inntektSerie,
	])

	// Convert series to component data (filter Infinity and cap at SISTE_AAR)
	const alderspensjonMap = filterAndMapSerie(alderspensjonSerie, SISTE_AAR)
	const afpMap = filterAndMapSerie(afpSerie, SISTE_AAR)
	const inntektMap = filterAndMapSerie(inntektSerie, SISTE_AAR)

	type RawRow = {
		alderAar: number
		alderspensjon: number
		afp: number
		inntekt: number
	}

	const raw: RawRow[] = filterAndMapSerie(merged, SISTE_AAR).map(({ aar }) => ({
		alderAar: aar,
		alderspensjon: alderspensjonMap.find((s) => s.aar === aar)?.beloep ?? 0,
		afp: afpMap.find((s) => s.aar === aar)?.beloep ?? 0,
		inntekt: inntektMap.find((s) => s.aar === aar)?.beloep ?? 0,
	}))

	const groups = groupConsecutive(
		raw,
		(a, b) =>
			a.alderspensjon === b.alderspensjon &&
			a.afp === b.afp &&
			a.inntekt === b.inntekt
	)

	return groups.map((group, idx) => {
		const first = group[0]
		const last = group.at(-1)!
		const isLastGroup = idx === groups.length - 1

		let alderLabel: string
		if (isLastGroup) {
			alderLabel = `Livsvarig fra ${first.alderAar} år`
		} else if (group.length === 1) {
			alderLabel = `${first.alderAar} år`
		} else {
			alderLabel = `${first.alderAar} til ${last.alderAar} år`
		}

		return {
			alderLabel,
			alderspensjon: first.alderspensjon,
			afp: first.afp,
			inntekt: first.inntekt,
		}
	})
}

export const AarligPensjonTable = ({
	alderspensjonListe,
	privatAfpListe,
	tidsbegrensetOffentligAfp,
	heltUttakAlder,
	aktiverBeregning,
}: AarligPensjonTableProps) => {
	const aarligInntektFoerUttakBeloep =
		aktiverBeregning?.aarligInntektFoerUttakBeloep ?? 0

	const rows = buildTableRows(
		alderspensjonListe,
		privatAfpListe,
		tidsbegrensetOffentligAfp,
		aarligInntektFoerUttakBeloep,
		heltUttakAlder,
		aktiverBeregning
	)

	if (rows.length === 0 || aktiverBeregning?.afp === 'serviceberegning')
		return null

	const visAfpKolonne = rows.some((r) => r.afp > 0)
	const visInntektKolonne = rows.some((r) => r.inntekt > 0)

	return (
		<>
			<Divider customMargin="32px" />
			<VStack gap="space-12">
				<Heading level="3" size="small" as="h3">
					Årlig inntekt og pensjon
				</Heading>
				<Table
					zebraStripes={rows.length > 2}
					size="small"
					className={styles.table}
				>
					<Table.Header>
						<Table.Row className={styles.headerRow}>
							<Table.HeaderCell scope="col">
								<Label style={{ whiteSpace: 'nowrap' }} size="small">
									Alder
								</Label>
							</Table.HeaderCell>
							<Table.HeaderCell scope="col" align="right">
								<Label style={{ whiteSpace: 'nowrap' }} size="small">
									Alderspensjon
								</Label>
							</Table.HeaderCell>
							{visAfpKolonne && (
								<Table.HeaderCell scope="col" align="right">
									<Label style={{ whiteSpace: 'nowrap' }} size="small">
										Avtalefestet pensjon
									</Label>
								</Table.HeaderCell>
							)}
							{visInntektKolonne && (
								<Table.HeaderCell scope="col" align="right">
									<Label style={{ whiteSpace: 'nowrap' }} size="small">
										Pensjonsgivende inntekt
									</Label>
								</Table.HeaderCell>
							)}
							<Table.HeaderCell scope="col" align="right">
								<Label style={{ whiteSpace: 'nowrap' }} size="small" as="span">
									Sum kr per år
								</Label>
							</Table.HeaderCell>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{rows.map((row) => {
							const sum = row.alderspensjon + row.afp + row.inntekt
							return (
								<Table.Row key={row.alderLabel}>
									<Table.DataCell>
										<BodyShort size="small">{row.alderLabel}</BodyShort>
									</Table.DataCell>
									<Table.DataCell align="right">
										<BodyShort size="small">
											{formatNOK(row.alderspensjon)}
										</BodyShort>
									</Table.DataCell>
									{visAfpKolonne && (
										<Table.DataCell align="right">
											<BodyShort size="small">{formatNOK(row.afp)}</BodyShort>
										</Table.DataCell>
									)}
									{visInntektKolonne && (
										<Table.DataCell align="right">
											<BodyShort size="small">
												{formatNOK(row.inntekt)}
											</BodyShort>
										</Table.DataCell>
									)}
									<Table.DataCell align="right">
										<Label size="small" as="span">
											{formatNOK(sum)}
										</Label>
									</Table.DataCell>
								</Table.Row>
							)
						})}
					</Table.Body>
				</Table>
			</VStack>
		</>
	)
}

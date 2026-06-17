import type {
	PersonInternV1,
	ServiceberegnetAfp,
	SimuleringAfpPrivat,
	SimuleringAlderspensjon,
	TidsbegrensetOffentligAFP,
} from '@pensjonskalkulator-frontend-monorepo/types'
import {
	type Alder,
	mergeAarligUtbetalinger,
} from '@pensjonskalkulator-frontend-monorepo/utils'

import {
	BodyLong,
	BodyShort,
	Heading,
	Label,
	Table,
	VStack,
} from '@navikt/ds-react'

import type { BeregningParams } from '../../api/beregningTypes'
import {
	buildAfpSerie,
	buildAlderspensjonSerie,
	buildInntektSerie,
	filterAndMapSerie,
	getSisteAar,
} from '../../utils/aarligPensjonSeries'
import { Divider } from '../Divider/Divider'

import styles from './BeregningTable.module.css'

interface AarligPensjonTableProps {
	alderspensjonListe: SimuleringAlderspensjon[]
	privatAfpListe?: SimuleringAfpPrivat[] | null
	tidsbegrensetOffentligAfp?: TidsbegrensetOffentligAFP | null
	serviceberegnetAfp?: ServiceberegnetAfp | null
	heltUttakAlder: Alder
	aktivBeregning?: BeregningParams | null
	person?: PersonInternV1 | null
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
	serviceberegnetAfp: ServiceberegnetAfp | null | undefined,
	aarligInntektFoerUttakBeloep: number,
	heltUttakAlder: Alder,
	aktivBeregning?: BeregningParams | null,
	person?: PersonInternV1 | null
): TableRow[] {
	const sisteAar = getSisteAar(aktivBeregning)

	const alderspensjonSerie = buildAlderspensjonSerie(
		alderspensjonListe,
		sisteAar
	)
	const afpSerie = buildAfpSerie(
		privatAfpListe,
		tidsbegrensetOffentligAfp,
		heltUttakAlder,
		sisteAar,
		serviceberegnetAfp
	)
	const inntektSerie = buildInntektSerie({
		aarligInntektFoerUttakBeloep,
		aktivBeregning,
		person,
	})

	const merged = mergeAarligUtbetalinger([
		alderspensjonSerie,
		afpSerie,
		inntektSerie,
	])

	// Convert series to component data (filter Infinity and cap at sisteAar)
	const alderspensjonMap = filterAndMapSerie(alderspensjonSerie, sisteAar)
	const afpMap = filterAndMapSerie(afpSerie, sisteAar)
	const inntektMap = filterAndMapSerie(inntektSerie, sisteAar)

	type RawRow = {
		alderAar: number
		alderspensjon: number
		afp: number
		inntekt: number
	}

	const raw: RawRow[] = filterAndMapSerie(merged, sisteAar).map(({ aar }) => ({
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

	const erServiceberegning = aktivBeregning?.afp === 'serviceberegning'

	return groups.map((group, idx) => {
		const first = group[0]
		const last = group.at(-1)!
		const isLastGroup = idx === groups.length - 1

		let alderLabel: string
		if (isLastGroup && !erServiceberegning) {
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
	serviceberegnetAfp,
	heltUttakAlder,
	aktivBeregning,
	person,
}: AarligPensjonTableProps) => {
	const aarligInntektFoerUttakBeloep =
		aktivBeregning?.afp !== 'serviceberegning'
			? (aktivBeregning?.aarligInntektFoerUttakBeloep ?? 0)
			: 0

	const rows = buildTableRows(
		alderspensjonListe,
		privatAfpListe,
		tidsbegrensetOffentligAfp,
		serviceberegnetAfp,
		aarligInntektFoerUttakBeloep,
		heltUttakAlder,
		aktivBeregning,
		person
	)

	if (rows.length === 0) return null

	const visAfpKolonne = rows.some((r) => r.afp > 0)
	const visInntektKolonne = rows.some((r) => r.inntekt > 0)
	const visAlderspensjonKolonne = aktivBeregning?.afp !== 'serviceberegning'

	return (
		<>
			<Divider customMargin="32px" />
			<VStack gap="space-12">
				<VStack gap="space-4">
					<Heading level="3" size="small" as="h3">
						Årlig inntekt og pensjon
					</Heading>
					<BodyLong size="small" textColor="subtle">
						Eventuell tilvekst av alderspensjon er inkludert i beløpene
					</BodyLong>
				</VStack>
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
							{visAlderspensjonKolonne && (
								<Table.HeaderCell scope="col" align="right">
									<Label style={{ whiteSpace: 'nowrap' }} size="small">
										Alderspensjon
									</Label>
								</Table.HeaderCell>
							)}
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
									{visAlderspensjonKolonne && (
										<Table.DataCell align="right">
											<BodyShort size="small">
												{formatNOK(row.alderspensjon)}
											</BodyShort>
										</Table.DataCell>
									)}
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

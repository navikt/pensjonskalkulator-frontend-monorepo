import type {
	Opptjening,
	OpptjeningAvdoed,
} from '@pensjonskalkulator-frontend-monorepo/types'
import { getMaanedNavn } from '@pensjonskalkulator-frontend-monorepo/utils/dates'
import { useEffect, useState } from 'react'

import { BodyShort, Box, Heading, ReadMore, Table } from '@navikt/ds-react'

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
	HELT_UTTAK: 'Alderspensjon: 100 %',
	UTTAK_STOPPET: 'Uttak stoppet',
}

type OpptjeningMerknad =
	| Opptjening[number]['merknadListe'][number]
	| OpptjeningAvdoed[number]['merknadListe'][number]

type Uttaksgrad = NonNullable<
	Extract<OpptjeningMerknad, { kode: string }>['uttaksgrad']
>

function formatUttaksmerknad(kode: string, uttaksgrad?: Uttaksgrad | null) {
	const tekst = merknadTextMap[kode] ?? ''
	const erUttaksmerknad =
		kode === 'GRADERT_UTTAK' ||
		kode === 'HELT_UTTAK' ||
		kode === 'UTTAK_STOPPET'
	if (!uttaksgrad || !erUttaksmerknad) return tekst

	const maaned = getMaanedNavn(uttaksgrad.kalendermaanedFom)
	return `Alderspensjon: ${uttaksgrad.grad} %${maaned ? ` (${maaned})` : ''}`
}

function getMerknadKode(merknad: OpptjeningMerknad): string {
	return typeof merknad === 'string' ? merknad : merknad.kode
}

export function mapMerknadListe(
	merknadListe: OpptjeningMerknad[],
	ufoeretrygdgrad?: number | null
): string {
	if (merknadListe.length === 0) return ''
	return merknadListe
		.filter((merknad) => {
			const kode = getMerknadKode(merknad)
			return kode !== 'NONE' && kode !== 'UNKNOWN'
		})
		.map((merknad) => {
			const kode = getMerknadKode(merknad)
			if (kode === 'UFOEREGRAD') {
				return ufoeretrygdgrad != null ? `Uføretrygd: ${ufoeretrygdgrad} %` : ''
			}
			return formatUttaksmerknad(
				kode,
				typeof merknad === 'string' ? null : merknad.uttaksgrad
			)
		})
		.join(', ')
}

export function selectOpptjeningRows(
	opptjening: Opptjening | OpptjeningAvdoed,
	heltUttakAarstall?: number | null,
	inntektSlutterAarstall?: number | null
): (Opptjening[number] | OpptjeningAvdoed[number])[] {
	const sisteAarstall = inntektSlutterAarstall ?? heltUttakAarstall

	return [...opptjening]
		.filter(
			(entry) =>
				(sisteAarstall == null || entry.aarstall <= sisteAarstall) &&
				!(
					entry.merknadListe.length > 0 &&
					entry.merknadListe.every(
						(merknad) => getMerknadKode(merknad) === 'INGEN_OPPTJENING'
					)
				)
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
	heltUttakAarstall?: number | null
	inntektSlutterAarstall?: number | null
	beregnesMedGjenlevenderett?: boolean
}

export function mapOpptjeningToTableRows(
	opptjening: Opptjening | OpptjeningAvdoed,
	showPensjonsbeholdning: boolean,
	ufoeretrygdgrad?: number | null,
	heltUttakAarstall?: number | null,
	inntektSlutterAarstall?: number | null
): OpptjeningTableRow[] {
	return selectOpptjeningRows(
		opptjening,
		heltUttakAarstall,
		inntektSlutterAarstall
	).map((entry) => ({
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
	heltUttakAarstall,
	inntektSlutterAarstall,
	beregnesMedGjenlevenderett,
}: OpptjeningTableProps) {
	const [visAlleAar, setVisAlleAar] = useState(false)
	const showPensjonsbeholdning =
		!isOpptjeningAvdoedSection &&
		!erServiceberegning &&
		Boolean(erFoedtEtter1963 || erOvergangskull)
	const showPensjonspoeng = !erFoedtEtter1963 || erOvergangskull
	const rows = mapOpptjeningToTableRows(
		opptjening,
		showPensjonsbeholdning,
		ufoeretrygdgrad,
		heltUttakAarstall,
		inntektSlutterAarstall
	)
	const visReadMore = beregnesMedGjenlevenderett && rows.length > 8
	const synligeRader = visReadMore && !visAlleAar ? rows.slice(0, 8) : rows

	useEffect(() => {
		setVisAlleAar(false)
	}, [beregnesMedGjenlevenderett, opptjening])

	const title = isOpptjeningAvdoedSection ? 'Avdøde' : 'Gjenlevende'

	const testId = isOpptjeningAvdoedSection
		? 'opptjening-table-avdoed'
		: 'opptjening-table-bruker'

	return (
		<div data-testid={testId}>
			{beregnesMedGjenlevenderett && (
				<Heading level="4" size="xsmall" spacing>
					{title}
				</Heading>
			)}
			<Box overflowX={{ xs: 'auto', xl: 'visible' }}>
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
						{synligeRader.map((row) => (
							<Table.Row key={row.aar}>
								<Table.DataCell>
									<BodyShort size="small">{row.aar}</BodyShort>
								</Table.DataCell>
								<Table.DataCell align="right">
									<BodyShort size="small">
										{row.pensjonsgivendeInntekt}
									</BodyShort>
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
								<Table.DataCell data-testid={`merknad-${row.aar}`}>
									<BodyShort size="small">{row.merknad}</BodyShort>
								</Table.DataCell>
							</Table.Row>
						))}
					</Table.Body>
				</Table>
			</Box>
			{visReadMore && (
				<ReadMore
					header={visAlleAar ? 'Vis færre år' : 'Vis alle år'}
					size="small"
					style={{ marginTop: '8px' }}
					open={visAlleAar}
					onOpenChange={setVisAlleAar}
				>
					<span className="srOnly">Flere år vises i tabellen over.</span>
				</ReadMore>
			)}
		</div>
	)
}

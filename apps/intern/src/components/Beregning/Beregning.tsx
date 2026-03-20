import type { SimuleringAlderspensjon } from '@pensjonskalkulator-frontend-monorepo/types'
import {
	isFoedtEtter1963,
	isOvergangskull,
} from '@pensjonskalkulator-frontend-monorepo/utils'
import { isFoedtFoer1963 } from '@pensjonskalkulator-frontend-monorepo/utils/alder'

import {
	BodyLong,
	Box,
	HStack,
	Heading,
	Loader,
	VStack,
} from '@navikt/ds-react'

import { useGrunnbeloepQuery } from '../../api/queries'
import { useBeregningContext } from '../BeregningContext'
import { BeregningTable, type BeregningTableRow } from './BeregningTable'

import styles from './Beregning.module.css'

function mapAlderspensjonToRows(
	entry: SimuleringAlderspensjon
): BeregningTableRow[] {
	return [
		{
			label: 'Grunnpensjon (kap. 19)',
			value: Math.round((entry.grunnpensjonBeloep ?? 0) / 12),
		},
		{
			label: 'Tilleggspensjon (kap. 19)',
			value: Math.round((entry.tilleggspensjonBeloep ?? 0) / 12),
		},
		{
			label: 'Pensjonstillegg (kap. 19)',
			value: Math.round((entry.pensjonstillegg ?? 0) / 12),
		},
		{
			label: 'Gjenlevendetillegg (kap. 19)',
			value: Math.round((entry.gjenlevendetillegg ?? 0) / 12),
		},
		{
			label: 'Inntektspensjon (kap. 20)',
			value: Math.round((entry.inntektspensjonBeloep ?? 0) / 12),
		},
		{
			label: 'Garantipensjon (kap. 20)',
			value: Math.round((entry.garantipensjonBeloep ?? 0) / 12),
		},
		{
			label: 'Skjermingstillegg',
			value: Math.round((entry.skjermingstillegg ?? 0) / 12),
		},
	]
}

function mapOpptjeningEtterKapittel19ToRows(
	opptjening: SimuleringAlderspensjon,
	grunnbeloep?: number
): BeregningTableRow[] {
	return [
		{
			label: 'Andelsbrøk',
			value: opptjening?.kapittel19Andel,
		},
		{
			label: 'Grunnbeløp (G)',
			value: grunnbeloep,
			visBeloepKroner: true,
		},
		{
			label: 'Minste pensjonsbeløp',
			value: 279933,
			visBeloepKroner: true,
		},
		{
			label: 'Forholdstall ved uttak',
			value: opptjening.forholdstall,
		},
		{
			label: 'Sluttpoengtall',
			value: opptjening?.sluttpoengtall,
		},
		{
			label: 'Trygdetid',
			value: opptjening.kapittel19Trygdetid,
		},
		{
			label: 'Poengår før 1992 (45 %)',
			value: opptjening.poengaarTom1991,
		},
		{
			label: 'Poengår etter 1991 (42 %)',
			value: opptjening.poengaarFom1992,
		},
		{
			label: 'Basispensjon',
			value: 183665,
			visBeloepKroner: true,
		},
		{
			label: 'Restpensjon',
			value: 183665,
			visBeloepKroner: true,
		},
	]
}
function mapOpptjeningEtterKapittel20ToRows(
	opptjening: SimuleringAlderspensjon
): BeregningTableRow[] {
	return [
		{
			label: 'Andelsbrøk',
			value: opptjening.kapittel20Andel,
		},
		{
			label: 'Delingstall ved uttak',
			value: opptjening.delingstall,
		},
		{
			label: 'Garantipensjon',
			value: opptjening.garantipensjonBeloep,
			visBeloepKroner: true,
		},
		{
			label: 'Garantitillegg',
			value: opptjening.garantitilleggBeloep,
			visBeloepKroner: true,
		},
		{
			label: 'Pensjonsbeholdning før uttak',
			value: opptjening.pensjonsbeholdningFoerUttakBeloep,
			visBeloepKroner: true,
		},
		{
			label: 'Pensjonsbeholdning etter uttak',
			value: (opptjening?.pensjonsbeholdningFoerUttakBeloep ?? 0) / 2,
			visBeloepKroner: true,
		},
		{
			label: 'Trygdetid',
			value: opptjening.kapittel20Trygdetid,
		},
	]
}
function formatAlderTitle(
	aar: number,
	md: number,
	uttaksgrad: number | string
): string {
	const alderText = md > 0 ? `${aar} år og ${md} måneder` : `${aar} år`
	return `${uttaksgrad} % alderspensjon ved ${alderText}`
}

export const Beregning = () => {
	const { isBeregningLoading, beregning, aktivBeregning, person } =
		useBeregningContext()
	const { data: grunnbeloep } = useGrunnbeloepQuery()
	const erOvergangskull = person && isOvergangskull(person.foedselsdato)
	const erFoedtEtter1963 = person && isFoedtEtter1963(person.foedselsdato)
	const erFoedtFoer1963 = person && isFoedtFoer1963(person.foedselsdato)

	if (!beregning && isBeregningLoading) {
		return (
			<div className={styles.beregning}>
				<div className={styles.loader}>
					<Loader size="3xlarge" title="Beregner pensjon …" />
				</div>
			</div>
		)
	}

	if (!beregning || beregning.vilkaarsproevingsresultat.erInnvilget === false) {
		return (
			<Box
				borderColor="neutral-subtle"
				borderWidth="0 0 0 1"
				className={styles.beregning}
			>
				<BodyLong>Ingen beregning enda.</BodyLong>
			</Box>
		)
	}

	const erGradert =
		aktivBeregning &&
		aktivBeregning.uttaksgrad !== null &&
		aktivBeregning.uttaksgrad < 100

	const heltUttakAar = erGradert
		? aktivBeregning.alderAarHeltUttak
		: aktivBeregning?.alderAarUttak

	const gradertUttakAar = erGradert ? aktivBeregning?.alderAarUttak : undefined

	const heltEntry = beregning?.alderspensjonListe?.find(
		(entry) => entry.alderAar === (heltUttakAar ?? 0)
	)
	const gradertEntry = beregning?.alderspensjonListe?.find(
		(entry) => entry.alderAar === (gradertUttakAar ?? 0)
	)

	const titleHeltUttak =
		aktivBeregning &&
		formatAlderTitle(
			erGradert
				? (aktivBeregning.alderAarHeltUttak ?? 0)
				: (aktivBeregning.alderAarUttak ?? 0),
			erGradert
				? (aktivBeregning.alderMdHeltUttak ?? 0)
				: (aktivBeregning.alderMdUttak ?? 0),
			100
		)
	const titleGradertUttak =
		aktivBeregning &&
		formatAlderTitle(
			aktivBeregning.alderAarUttak ?? 0,
			aktivBeregning.alderMdUttak ?? 0,
			aktivBeregning.uttaksgrad ?? 0
		)

	return (
		<Box
			borderColor="neutral-subtle"
			borderWidth="0 0 0 1"
			className={styles.beregning}
		>
			<VStack
				className={`${styles.tables} ${isBeregningLoading ? styles.loadingOverlay : ''}`}
			>
				{isBeregningLoading && (
					<div className={styles.overlayLoader}>
						<Loader size="3xlarge" title="Beregner pensjon …" />
					</div>
				)}
				{gradertEntry && (
					<>
						<Heading level="3" size="small">
							{titleGradertUttak}
						</Heading>
						<HStack wrap={false} gap="space-40" className={styles.tableRow}>
							<BeregningTable
								title="Alderspensjon"
								valueHeader="Kr per måned"
								rows={mapAlderspensjonToRows(gradertEntry)}
							/>
							{erFoedtFoer1963 && (
								<BeregningTable
									title="Opptjening etter kapittel 19"
									valueHeader="Kr per måned"
									rows={mapOpptjeningEtterKapittel19ToRows(
										gradertEntry,
										grunnbeloep?.grunnbeløp
									)}
									simple
								/>
							)}
							{(erOvergangskull || erFoedtEtter1963) && (
								<BeregningTable
									title="Opptjening etter kapittel 20"
									valueHeader="Kr per måned"
									rows={mapOpptjeningEtterKapittel20ToRows(gradertEntry)}
									simple
								/>
							)}
						</HStack>
					</>
				)}
				<Heading level="3" size="small">
					{titleHeltUttak}
				</Heading>
				<HStack wrap={false} gap="space-40" className={styles.tableRow}>
					{beregning && aktivBeregning && heltEntry && (
						<BeregningTable
							title="Alderspensjon"
							valueHeader="Kr per måned"
							rows={mapAlderspensjonToRows(heltEntry)}
						/>
					)}
					{heltEntry && (
						<>
							{erFoedtFoer1963 && (
								<BeregningTable
									title="Opptjening etter kapittel 19"
									valueHeader="Kr per måned"
									rows={mapOpptjeningEtterKapittel19ToRows(
										heltEntry,
										grunnbeloep?.grunnbeløp
									)}
									simple
								/>
							)}
							{(erOvergangskull || erFoedtEtter1963) && (
								<BeregningTable
									title="Opptjening etter kapittel 20"
									valueHeader="Kr per måned"
									rows={mapOpptjeningEtterKapittel20ToRows(heltEntry)}
									simple
								/>
							)}
						</>
					)}
				</HStack>
			</VStack>
		</Box>
	)
}

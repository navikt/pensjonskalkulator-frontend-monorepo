import type { AlderspensjonPensjonsberegning } from '@pensjonskalkulator-frontend-monorepo/types'
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
import { getUttakInfo } from '../../utils/getUttakInfo'
import { useBeregningContext } from '../BeregningContext'
import { BeregningTable, type BeregningTableRow } from './BeregningTable'

import styles from './Beregning.module.css'

function mapAlderspensjonToRows(
	entry: AlderspensjonPensjonsberegning
): BeregningTableRow[] {
	return [
		{
			label: 'Grunnpensjon (kap. 19)',
			value: Math.round((entry.grunnpensjon ?? 0) / 12),
		},
		{
			label: 'Tilleggspensjon (kap. 19)',
			value: Math.round((entry.tilleggspensjon ?? 0) / 12),
		},
		{
			label: 'Pensjonstillegg (kap. 19)',
			value: Math.round((entry.pensjonstillegg ?? 0) / 12),
		},
		{
			label: 'Gjenlevendetillegg (kap. 19)',
			value: Math.round((entry.kapittel19Gjenlevendetillegg ?? 0) / 12),
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
	opptjening: AlderspensjonPensjonsberegning,
	grunnbeloep?: number
): BeregningTableRow[] {
	return [
		{
			label: 'Andelsbrøk',
			value: opptjening.andelsbroekKap19,
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
			value: opptjening.sluttpoengtall,
		},
		{
			label: 'Trygdetid',
			value: opptjening.trygdetidKap19,
		},
		{
			label: 'Poengår før 1992 (45 %)',
			value: opptjening.poengaarFoer92,
		},
		{
			label: 'Poengår etter 1991 (42 %)',
			value: opptjening.poengaarEtter91,
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
	opptjening: AlderspensjonPensjonsberegning
): BeregningTableRow[] {
	return [
		{
			label: 'Andelsbrøk',
			value: opptjening.andelsbroekKap20,
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
			value: 54453,
			visBeloepKroner: true,
		},
		{
			label: 'Pensjonsbeholdning før uttak',
			value: opptjening.pensjonBeholdningFoerUttakBeloep,
			visBeloepKroner: true,
		},
		{
			label: 'Pensjonsbeholdning etter uttak',
			value: opptjening.pensjonBeholdningFoerUttakBeloep ?? 0 / 2,
			visBeloepKroner: true,
		},
		{
			label: 'Trygdetid',
			value: opptjening.trygdetidKap20,
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

	const hasBeregning =
		beregning && beregning.vilkaarsproeving.vilkaarErOppfylt !== false
	if (!hasBeregning) {
		return (
			<Box
				borderColor="neutral-subtle"
				borderWidth="0 0 0 1"
				className={`${styles.beregning} ${isBeregningLoading ? styles.loadingOverlay : ''}`}
			>
				{isBeregningLoading && (
					<div className={styles.overlayLoader}>
						<Loader size="3xlarge" title="Beregner pensjon …" />
					</div>
				)}
				<BodyLong>Ingen beregning enda.</BodyLong>
			</Box>
		)
	}

	const { erGradert, heltUttakAlder, gradertUttakAlder } =
		getUttakInfo(aktivBeregning)

	const heltEntry = beregning?.alderspensjon?.find(
		(entry) => entry.alder === (heltUttakAlder.aar ?? 0)
	)
	const gradertEntry = beregning?.alderspensjon?.find(
		(entry) => entry.alder === (gradertUttakAlder?.aar ?? 0)
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
			className={`${styles.beregning} ${isBeregningLoading ? styles.loadingOverlay : ''}`}
		>
			{isBeregningLoading && (
				<div className={styles.overlayLoader}>
					<Loader size="3xlarge" title="Beregner pensjon …" />
				</div>
			)}
			<VStack className={styles.tables}>
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

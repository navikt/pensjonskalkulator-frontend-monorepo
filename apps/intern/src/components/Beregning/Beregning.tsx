import type { AlderspensjonPensjonsberegning } from '@pensjonskalkulator-frontend-monorepo/types'

import {
	BodyLong,
	GlobalAlert,
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
	opptjening: AlderspensjonPensjonsberegning
) {
	const { data: grunnbeloep } = useGrunnbeloepQuery()
	return [
		{
			label: 'Andelsbrøk',
			value: opptjening.andelsbroekKap19,
		},
		{
			label: 'Grunnbeløp (G)',
			value: grunnbeloep?.grunnbeløp,
		},
		{
			label: 'Minste pensjonsbeløp',
			value: 279933,
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
		},
		{
			label: 'Restpensjon',
			value: 183665,
		},
	]
}
function mapOpptjeningEtterKapittel20ToRows(
	opptjening: AlderspensjonPensjonsberegning
) {
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
		},
		{
			label: 'Garantitillegg',
			value: 54453,
		},
		{
			label: 'Pensjonsbeholdning før uttak',
			value: opptjening.pensjonBeholdningFoerUttakBeloep,
		},
		{
			label: 'Pensjonsbeholdning etter uttak',
			value: opptjening.pensjonBeholdningFoerUttakBeloep ?? 0 / 2,
		},
		{
			label: 'Trygdetid',
			value: opptjening.trygdetidKap20,
		},
	]
}
function formatAlderTitle(aar: string, md: string, uttaksgrad: string): string {
	const maaneder = parseInt(md, 10)
	const alderText =
		maaneder > 0 ? `${aar} år og ${maaneder} måneder` : `${aar} år`
	return `${uttaksgrad} % alderspensjon ved ${alderText}`
}

export const Beregning = () => {
	const { isBeregningLoading, beregning, committedParams, isDirty } =
		useBeregningContext()

	if (!beregning && isBeregningLoading) {
		return (
			<div className={styles.beregning}>
				<div className={styles.loader}>
					<Loader size="3xlarge" title="Beregner pensjon …" />
				</div>
			</div>
		)
	}

	if (!beregning) {
		return (
			<div className={styles.beregning}>
				<BodyLong>Ingen beregning enda.</BodyLong>
			</div>
		)
	}

	const erGradert =
		committedParams && parseInt(committedParams.uttaksgrad, 10) < 100

	const heltUttakAar = erGradert
		? committedParams.alderAarHeltUttak
		: committedParams?.alderAarUttak

	const gradertUttakAar = erGradert ? committedParams?.alderAarUttak : undefined

	const heltEntry = beregning?.alderspensjon?.find(
		(entry) => entry.alder === parseInt(heltUttakAar ?? '', 10)
	)
	const gradertEntry = beregning?.alderspensjon?.find(
		(entry) => entry.alder === parseInt(gradertUttakAar ?? '', 10)
	)

	const titleHeltUttak =
		committedParams &&
		formatAlderTitle(
			erGradert
				? committedParams.alderAarHeltUttak
				: committedParams.alderAarUttak,
			erGradert
				? committedParams.alderMdHeltUttak
				: committedParams.alderMdUttak,
			'100'
		)
	const titleGradertUttak =
		committedParams &&
		formatAlderTitle(
			committedParams.alderAarUttak,
			committedParams.alderMdUttak,
			committedParams.uttaksgrad
		)

	return (
		<div className={styles.beregning}>
			{isDirty && (
				<GlobalAlert
					status="warning"
					size="small"
					className={styles.globalAlert}
				>
					<GlobalAlert.Header>
						<GlobalAlert.Title>
							Du har gjort endringer i skjemaet. Oppdater beregningen.
						</GlobalAlert.Title>
					</GlobalAlert.Header>
				</GlobalAlert>
			)}
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
						<Heading size="small">{titleGradertUttak}</Heading>
						<HStack wrap={false} gap="space-40" className={styles.tableRow}>
							<BeregningTable
								title="Alderspensjon"
								valueHeader="Kr per måned"
								rows={mapAlderspensjonToRows(gradertEntry)}
							/>
							<BeregningTable
								title="Opptjening etter kapittel 19"
								valueHeader="Kr per måned"
								rows={mapOpptjeningEtterKapittel19ToRows(gradertEntry)}
								simple
							/>
							<BeregningTable
								title="Opptjening etter kapittel 20"
								valueHeader="Kr per måned"
								rows={mapOpptjeningEtterKapittel20ToRows(gradertEntry)}
								simple
							/>
						</HStack>
					</>
				)}
				<Heading size="small">{titleHeltUttak}</Heading>
				<HStack wrap={false} gap="space-40" className={styles.tableRow}>
					{beregning && committedParams && heltEntry && (
						<BeregningTable
							title="Alderspensjon"
							valueHeader="Kr per måned"
							rows={mapAlderspensjonToRows(heltEntry)}
						/>
					)}
					{heltEntry && (
						<>
							<BeregningTable
								title="Opptjening etter kapittel 19"
								valueHeader="Kr per måned"
								rows={mapOpptjeningEtterKapittel19ToRows(heltEntry)}
								simple
							/>
							<BeregningTable
								title="Opptjening etter kapittel 20"
								valueHeader="Kr per måned"
								rows={mapOpptjeningEtterKapittel20ToRows(heltEntry)}
								simple
							/>
						</>
					)}
				</HStack>
			</VStack>
		</div>
	)
}

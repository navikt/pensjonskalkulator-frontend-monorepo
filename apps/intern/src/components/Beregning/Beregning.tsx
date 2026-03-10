import {
	isFoedtEtter1963,
	isOvergangskull,
} from '@pensjonskalkulator-frontend-monorepo/utils'
import { isFoedtFoer1963 } from '@pensjonskalkulator-frontend-monorepo/utils/alder'

import { BodyLong, Box, Heading, Loader, VStack } from '@navikt/ds-react'

import { useGrunnbeloepQuery } from '../../api/queries'
import { useBeregningContext } from '../BeregningContext'
import { BeregningTable } from './BeregningTable'
import {
	formatAlderTitle,
	mapAlderspensjonToRows,
	mapOpptjeningEtterKapittel19ToRows,
	mapOpptjeningEtterKapittel20ToRows,
	mapPrivatAfp,
} from './beregningMappers'

import styles from './Beregning.module.css'

export const Beregning = () => {
	const { isBeregningLoading, beregning, aktivBeregning, person } =
		useBeregningContext()
	const { data: grunnbeloep } = useGrunnbeloepQuery()
	const erOvergangskull = person ? isOvergangskull(person.foedselsdato) : false
	const erFoedtEtter1963 = person
		? isFoedtEtter1963(person.foedselsdato)
		: false
	const erFoedtFoer1963 = person ? isFoedtFoer1963(person.foedselsdato) : false

	if (!beregning && isBeregningLoading) {
		return (
			<div className={styles.beregning}>
				<div className={styles.loader}>
					<Loader size="3xlarge" title="Beregner pensjon …" />
				</div>
			</div>
		)
	}

	if (!beregning || beregning.vilkaarsproeving.vilkaarErOppfylt === false) {
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

	const tableCount =
		1 +
		(erFoedtFoer1963 ? 1 : 0) +
		(erOvergangskull || erFoedtEtter1963 ? 1 : 0)

	const heltUttakAar = erGradert
		? aktivBeregning.alderAarHeltUttak
		: aktivBeregning?.alderAarUttak

	const gradertUttakAar = erGradert ? aktivBeregning?.alderAarUttak : undefined

	const heltEntry = beregning?.alderspensjon?.find(
		(entry) => entry.alder === (heltUttakAar ?? 0)
	)
	const gradertEntry = beregning?.alderspensjon?.find(
		(entry) => entry.alder === (gradertUttakAar ?? 0)
	)
	const afpPrivatVedGradertUttak = beregning?.afpPrivat?.find(
		(entry) => entry.alder === (gradertUttakAar ?? 0)
	)
	// const afpPrivatVedHeltUttak = beregning?.afpPrivat?.find(
	// 	(entry) => entry.alder === (heltUttakAar ?? 0)
	// )

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
				gap="space-32"
				className={` ${isBeregningLoading ? styles.loadingOverlay : ''}`}
			>
				{isBeregningLoading && (
					<div className={styles.overlayLoader}>
						<Loader size="3xlarge" title="Beregner pensjon …" />
					</div>
				)}
				{gradertEntry && (
					<VStack gap="space-12">
						<Heading level="3" size="small">
							{titleGradertUttak}
						</Heading>
						<div
							className={styles.tableGrid}
							style={{ '--table-columns': tableCount } as React.CSSProperties}
						>
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
							{aktivBeregning?.afp === 'ja_privat' && (
								<VStack gap="space-12">
									<Heading level="3" size="small">
										AFP i privat sektor ved {}
									</Heading>
									<BeregningTable
										title="AFP"
										valueHeader="Kr per måned"
										rows={mapPrivatAfp(afpPrivatVedGradertUttak)}
									/>
								</VStack>
							)}
						</div>
					</VStack>
				)}
				<VStack gap="space-12">
					<Heading level="3" size="small">
						{titleHeltUttak}
					</Heading>
					<div
						className={styles.tableGrid}
						style={{ '--table-columns': tableCount } as React.CSSProperties}
					>
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
					</div>
				</VStack>
			</VStack>
		</Box>
	)
}

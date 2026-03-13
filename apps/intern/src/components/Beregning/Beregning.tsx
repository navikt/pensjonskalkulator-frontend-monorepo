import {
	isFoedtEtter1963,
	isOvergangskull,
} from '@pensjonskalkulator-frontend-monorepo/utils'
import { isFoedtFoer1963 } from '@pensjonskalkulator-frontend-monorepo/utils/alder'

import { BodyLong, Box, Heading, Loader, VStack } from '@navikt/ds-react'

import { useGrunnbeloepQuery } from '../../api/queries'
import { useBeregningContext } from '../BeregningContext'
import { AlderspensjonTables } from './AlderspensjonTables'
import { BeregningTable } from './BeregningTable'
import {
	formatAfpTitle,
	formatAlderTitle,
	mapPrivatAfp,
} from './beregningMappers'

import styles from './Beregning.module.css'

export const Beregning = () => {
	const { isBeregningLoading, beregning, aktivBeregning, person } =
		useBeregningContext()
	const { data: grunnbeloep } = useGrunnbeloepQuery()
	const erOvergangskull = person && isOvergangskull(person.foedselsdato)
	const erFoedtEtter1963 = person && isFoedtEtter1963(person.foedselsdato)
	const erFoedtFoer1963 = person && isFoedtFoer1963(person.foedselsdato)

	if (!beregning && isBeregningLoading) {
		return (
			<Box
				borderColor="neutral-subtle"
				borderWidth="0 0 0 1"
				className={styles.beregning}
			>
				<Box className={styles.loader}>
					<Loader size="3xlarge" title="Beregner pensjon …" />
				</Box>
			</Box>
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

	const gradertUttakAlder = erGradert
		? {
				aar: erGradert ? aktivBeregning?.alderAarUttak : undefined,
				maaneder: erGradert ? aktivBeregning?.alderMdUttak : undefined,
			}
		: undefined

	const heltUttakAlder = {
		aar: erGradert
			? aktivBeregning?.alderAarHeltUttak
			: (aktivBeregning?.alderAarUttak ?? 0),
		maaneder: erGradert
			? aktivBeregning?.alderMdHeltUttak
			: (aktivBeregning?.alderMdUttak ?? 0),
	}

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
	const maanedsbeloepHeltUttak =
		beregning.alderspensjonMaanedligVedEndring?.heltUttakMaanedligBeloep
	const maanedsbeloepGradertUttak =
		beregning.alderspensjonMaanedligVedEndring?.gradertUttakMaanedligBeloep
	const afpPrivatVedGradertUttak = beregning?.afpPrivat?.find(
		(entry) => entry.alder === (gradertUttakAar ?? 0)
	)
	const afpPrivatVedHeltUttak = beregning?.afpPrivat?.find(
		(entry) => entry.alder === (heltUttakAar ?? 0)
	)
	const afpPrivatVed67Aar = beregning?.afpPrivat?.find(
		(entry) => entry.alder === 67
	)
	const alderspensjonVed67Aar = beregning?.alderspensjon?.find(
		(entry) => entry.alder === 67
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
							<AlderspensjonTables
								entry={gradertEntry}
								erFoedtFoer1963={erFoedtFoer1963}
								erOvergangskull={erOvergangskull}
								erFoedtEtter1963={erFoedtEtter1963}
								grunnbeloep={grunnbeloep?.grunnbeløp}
							/>
							{aktivBeregning?.afp === 'ja_privat' && (
								<VStack gap="space-24">
									<VStack gap="space-12">
										<BeregningTable
											title="AFP i privat sektor"
											valueHeader="Kr per måned"
											rows={mapPrivatAfp(
												afpPrivatVedGradertUttak,
												gradertUttakAlder!.aar! < 67
											)}
											addToSum={maanedsbeloepGradertUttak ?? 0}
										/>
									</VStack>
									{heltUttakAlder.aar! > 67 && gradertUttakAlder!.aar! < 67 && (
										<VStack gap="space-12">
											<Heading level="3" size="small">
												{formatAfpTitle(67, 0)}
											</Heading>
											<BeregningTable
												title="AFP i privat sektor"
												valueHeader="Kr per måned"
												rows={mapPrivatAfp(afpPrivatVed67Aar, false)}
												addToSum={(alderspensjonVed67Aar?.beloep ?? 0) / 12}
											/>
										</VStack>
									)}
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
							<AlderspensjonTables
								entry={heltEntry}
								erFoedtFoer1963={erFoedtFoer1963}
								erOvergangskull={erOvergangskull}
								erFoedtEtter1963={erFoedtEtter1963}
								grunnbeloep={grunnbeloep?.grunnbeløp}
							/>
						)}
						{aktivBeregning?.afp === 'ja_privat' && (
							<VStack gap="space-24">
								<BeregningTable
									title="Avtalefestet pensjon i privat sektor"
									valueHeader="Kr per måned"
									rows={mapPrivatAfp(
										afpPrivatVedHeltUttak,
										heltUttakAlder.aar! < 67
									)}
								/>
								<BeregningTable
									title="Alderspensjon og AFP"
									valueHeader="Kr per måned"
									addToSum={
										maanedsbeloepHeltUttak ??
										0 + (afpPrivatVedHeltUttak?.maanedligBeloep ?? 0)
									}
								/>
								{heltUttakAlder.aar! < 67 && (
									<VStack gap="space-12">
										<Heading level="3" size="small">
											{formatAfpTitle(67, 0)}
										</Heading>
										{beregning && aktivBeregning && alderspensjonVed67Aar && (
											<AlderspensjonTables
												entry={alderspensjonVed67Aar}
												erFoedtFoer1963={erFoedtFoer1963}
												erOvergangskull={erOvergangskull}
												erFoedtEtter1963={erFoedtEtter1963}
												grunnbeloep={grunnbeloep?.grunnbeløp}
											/>
										)}
										<BeregningTable
											title="Avtalefestet pensjon i privat sektor"
											valueHeader="Kr per måned"
											rows={mapPrivatAfp(afpPrivatVed67Aar, false)}
										/>
										<BeregningTable
											title="Alderspensjon og AFP"
											valueHeader="Kr per måned"
											addToSum={
												(alderspensjonVed67Aar?.beloep ?? 0) / 12 +
												(afpPrivatVed67Aar?.maanedligBeloep ?? 0)
											}
										/>
									</VStack>
								)}
							</VStack>
						)}
					</div>
				</VStack>
			</VStack>
		</Box>
	)
}

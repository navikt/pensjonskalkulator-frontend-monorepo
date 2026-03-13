import {
	isFoedtEtter1963,
	isOvergangskull,
} from '@pensjonskalkulator-frontend-monorepo/utils'
import { isFoedtFoer1963 } from '@pensjonskalkulator-frontend-monorepo/utils/alder'

import { BodyLong, Box, Loader, VStack } from '@navikt/ds-react'

import { useGrunnbeloepQuery } from '../../api/queries'
import { useBeregningContext } from '../BeregningContext'
import { BeregningSection } from '../BeregningSection/BeregningSection'
import { formatAlderTitle } from './beregningMappers'

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
				: (aktivBeregning.alderMdUttak ?? 0)
		)
	const titleGradertUttak =
		aktivBeregning &&
		formatAlderTitle(
			aktivBeregning.alderAarUttak ?? 0,
			aktivBeregning.alderMdUttak ?? 0
		)

	const harAfpPrivat = aktivBeregning?.afp === 'ja_privat'

	const sectionCommonProps = {
		tableCount,
		erFoedtFoer1963,
		erOvergangskull,
		erFoedtEtter1963,
		grunnbeloep: grunnbeloep?.grunnbeløp,
	}

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
					<>
						<BeregningSection
							title={titleGradertUttak || ''}
							{...sectionCommonProps}
							entry={gradertEntry}
							showAfp={harAfpPrivat}
							afpEntry={afpPrivatVedGradertUttak}
							visKronetillegg={gradertUttakAlder!.aar! < 67}
							afpTableAddToSum={maanedsbeloepGradertUttak ?? 0}
							totalAddToSum={
								(maanedsbeloepGradertUttak ?? 0) +
								(afpPrivatVedGradertUttak?.maanedligBeloep ?? 0)
							}
						/>
						{harAfpPrivat &&
							heltUttakAlder.aar! > 67 &&
							gradertUttakAlder!.aar! < 67 && (
								<BeregningSection
									title={formatAlderTitle(67, 0)}
									{...sectionCommonProps}
									entry={alderspensjonVed67Aar}
									showAfp
									afpEntry={afpPrivatVed67Aar}
									totalAddToSum={
										(alderspensjonVed67Aar?.beloep ?? 0) / 12 +
										(afpPrivatVed67Aar?.maanedligBeloep ?? 0)
									}
								/>
							)}
					</>
				)}
				<BeregningSection
					title={titleHeltUttak || ''}
					{...sectionCommonProps}
					entry={heltEntry}
					showAfp={harAfpPrivat}
					afpEntry={afpPrivatVedHeltUttak}
					visKronetillegg={heltUttakAlder.aar! < 67}
					totalAddToSum={
						(maanedsbeloepHeltUttak ?? 0) +
						(afpPrivatVedHeltUttak?.maanedligBeloep ?? 0)
					}
				/>
				{harAfpPrivat && heltUttakAlder.aar! < 67 && (
					<BeregningSection
						title={formatAlderTitle(67, 0)}
						{...sectionCommonProps}
						entry={alderspensjonVed67Aar}
						showAfp
						afpEntry={afpPrivatVed67Aar}
						totalAddToSum={
							(alderspensjonVed67Aar?.beloep ?? 0) / 12 +
							(afpPrivatVed67Aar?.maanedligBeloep ?? 0)
						}
					/>
				)}
			</VStack>
		</Box>
	)
}

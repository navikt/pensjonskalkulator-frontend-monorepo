import {
	isFoedtEtter1963,
	isOvergangskull,
} from '@pensjonskalkulator-frontend-monorepo/utils'
import { isFoedtFoer1963 } from '@pensjonskalkulator-frontend-monorepo/utils/alder'

import { BodyLong, Box, Loader, VStack } from '@navikt/ds-react'

import { useGrunnbeloepQuery } from '../../api/queries'
import { getUttakInfo } from '../../utils/getUttakInfo'
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

	const hasBeregning =
		beregning && beregning.vilkaarsproevingsresultat.erInnvilget !== false
	if (!hasBeregning) {
		return (
			<Box
				borderColor="border-subtle"
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

	const tableCount =
		1 +
		(erFoedtFoer1963 ? 1 : 0) +
		(erOvergangskull || erFoedtEtter1963 ? 1 : 0)

	const afpPrivatVedGradertUttak = beregning?.privatAfpListe?.find(
		(entry) => entry.alderAar === (gradertUttakAlder?.aar ?? 0)
	)
	const afpPrivatVedHeltUttak = beregning?.privatAfpListe?.find(
		(entry) => entry.alderAar === (heltUttakAlder.aar ?? 0)
	)
	const afpPrivatVed67Aar = beregning?.privatAfpListe?.find(
		(entry) => entry.alderAar === 67
	)

	const helMaanedligAlderspensjon =
		beregning.maanedligAlderspensjonForKnekkpunkter?.vedHeltUttak

	const gradertMaanedligAlderspensjon =
		beregning.maanedligAlderspensjonForKnekkpunkter?.vedGradertUttak

	const normertMaanedligAlderspensjon =
		beregning.maanedligAlderspensjonForKnekkpunkter?.vedNormertPensjonsalder

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

	const simulererMedGjenlevenderett = !!aktivBeregning?.beregnMedGjenlevenderett

	const sectionCommonProps = {
		tableCount,
		erFoedtFoer1963,
		erOvergangskull,
		erFoedtEtter1963,
		grunnbeloep: grunnbeloep?.grunnbeløp,
		simulererMedGjenlevenderett,
	}
	return (
		<Box
			borderColor="border-subtle"
			borderWidth="0 0 0 1"
			className={`${styles.beregning} ${isBeregningLoading ? styles.loadingOverlay : ''}`}
		>
			<VStack
				gap="space-32"
				className={isBeregningLoading ? styles.loadingOverlay : undefined}
			>
				{isBeregningLoading && (
					<div className={styles.overlayLoader}>
						<Loader size="3xlarge" title="Beregner pensjon …" />
					</div>
				)}
				{gradertMaanedligAlderspensjon && (
					<>
						<BeregningSection
							title={titleGradertUttak || ''}
							{...sectionCommonProps}
							entry={gradertMaanedligAlderspensjon}
							showAfp={harAfpPrivat}
							afpEntry={afpPrivatVedGradertUttak}
							visKronetillegg={(gradertUttakAlder?.aar ?? 0) < 67}
							totalAddToSum={
								(gradertMaanedligAlderspensjon.beloep ?? 0) +
								(afpPrivatVedGradertUttak?.maanedligBeloep ?? 0)
							}
							alderspensjonGrad={aktivBeregning?.uttaksgrad ?? 0}
							isGradert
						/>
						{harAfpPrivat &&
							(heltUttakAlder.aar ?? 0) > 67 &&
							(gradertUttakAlder?.aar ?? 0) < 67 && (
								<BeregningSection
									title={formatAlderTitle(67, 0)}
									{...sectionCommonProps}
									entry={normertMaanedligAlderspensjon}
									showAfp
									afpEntry={afpPrivatVed67Aar}
									totalAddToSum={
										(normertMaanedligAlderspensjon?.beloep ?? 0) +
										(afpPrivatVed67Aar?.maanedligBeloep ?? 0)
									}
									alderspensjonGrad={aktivBeregning?.uttaksgrad ?? 0}
									isGradert
								/>
							)}
					</>
				)}
				<BeregningSection
					title={titleHeltUttak || ''}
					{...sectionCommonProps}
					entry={helMaanedligAlderspensjon}
					showAfp={harAfpPrivat}
					afpEntry={afpPrivatVedHeltUttak}
					visKronetillegg={(heltUttakAlder.aar ?? 0) < 67}
					totalAddToSum={
						(helMaanedligAlderspensjon?.beloep ?? 0) +
						(afpPrivatVedHeltUttak?.maanedligBeloep ?? 0)
					}
					alderspensjonGrad={100}
				/>
				{harAfpPrivat && (heltUttakAlder.aar ?? 0) < 67 && (
					<BeregningSection
						title={formatAlderTitle(67, 0)}
						{...sectionCommonProps}
						entry={normertMaanedligAlderspensjon}
						showAfp
						afpEntry={afpPrivatVed67Aar}
						totalAddToSum={
							(normertMaanedligAlderspensjon?.beloep ?? 0) +
							(afpPrivatVed67Aar?.maanedligBeloep ?? 0)
						}
						alderspensjonGrad={100}
					/>
				)}
			</VStack>
		</Box>
	)
}

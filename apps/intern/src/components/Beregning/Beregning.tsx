import {
	isFoedtEtter1963,
	isOvergangskull,
} from '@pensjonskalkulator-frontend-monorepo/utils'
import { isFoedtFoer1963 } from '@pensjonskalkulator-frontend-monorepo/utils/alder'
import { useState } from 'react'

import { BodyLong, Box, Checkbox, Loader, VStack } from '@navikt/ds-react'

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
	const [visAarsbelop, setVisAarsbelop] = useState(false)

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

	const afpPrivatVedGradertUttak = beregning?.privatAfpListe?.find(
		(entry) => entry.alderAar === (gradertUttakAar ?? 0)
	)
	const afpPrivatVedHeltUttak = beregning?.privatAfpListe?.find(
		(entry) => entry.alderAar === (heltUttakAar ?? 0)
	)
	const afpPrivatVed67Aar = beregning?.privatAfpListe?.find(
		(entry) => entry.alderAar === 67
	)

	const helAarligAlderspensjon = beregning.alderspensjonListe.find(
		(entry) => entry.alderAar === heltUttakAlder.aar
	)

	const gradertAarligAlderspensjon = erGradert
		? beregning.alderspensjonListe.find(
				(entry) => entry.alderAar === gradertUttakAlder?.aar
			)
		: undefined

	const normertAarligAlderspensjon = beregning.alderspensjonListe.find(
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
			borderColor="neutral-subtle"
			borderWidth="0 0 0 1"
			className={styles.beregning}
			position="relative"
		>
			<Box position="absolute" right="space-48" top="space-24">
				<Checkbox
					onChange={(e) => setVisAarsbelop(e.target.checked)}
					size="small"
				>
					Vis årsbeløp
				</Checkbox>
			</Box>
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
							yearlyEntry={gradertAarligAlderspensjon}
							showAfp={harAfpPrivat}
							afpEntry={afpPrivatVedGradertUttak}
							visKronetillegg={(gradertUttakAlder?.aar ?? 0) < 67}
							alderspensjonGrad={aktivBeregning?.uttaksgrad ?? 0}
							isGradert
							visAarsbelop={visAarsbelop}
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
									alderspensjonGrad={aktivBeregning?.uttaksgrad ?? 0}
									isGradert
									visAarsbelop={visAarsbelop}
									yearlyEntry={normertAarligAlderspensjon}
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
					alderspensjonGrad={100}
					visAarsbelop={visAarsbelop}
					yearlyEntry={helAarligAlderspensjon}
				/>
				{harAfpPrivat && (heltUttakAlder.aar ?? 0) < 67 && (
					<BeregningSection
						title={formatAlderTitle(67, 0)}
						{...sectionCommonProps}
						entry={normertMaanedligAlderspensjon}
						showAfp
						afpEntry={afpPrivatVed67Aar}
						alderspensjonGrad={100}
						visAarsbelop={visAarsbelop}
						yearlyEntry={normertAarligAlderspensjon}
					/>
				)}
			</VStack>
		</Box>
	)
}

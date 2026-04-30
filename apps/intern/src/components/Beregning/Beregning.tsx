import {
	isFoedtEtter1963,
	isOvergangskull,
} from '@pensjonskalkulator-frontend-monorepo/utils'
import { isFoedtFoer1963 } from '@pensjonskalkulator-frontend-monorepo/utils/alder'
import { useState } from 'react'

import { BodyLong, Box, Checkbox, Loader, Tabs, VStack } from '@navikt/ds-react'

import { useGrunnbeloepQuery } from '../../api/queries'
import { getUttakInfo } from '../../utils/getUttakInfo'
import { useBeregningContext } from '../BeregningContext'
import { BeregningSection } from '../BeregningSection/BeregningSection'
import { Forbehold } from '../Forbehold/Forbehold'
import { formatAlderTitle } from './beregningMappers'

import styles from './Beregning.module.css'

export const Beregning = () => {
	const { isBeregningLoading, beregning, aktivBeregning, person } =
		useBeregningContext()
	const { data: grunnbeloep } = useGrunnbeloepQuery()
	const erOvergangskull = person && isOvergangskull(person.foedselsdato)
	const erFoedtEtter1963 = person && isFoedtEtter1963(person.foedselsdato)
	const erFoedtFoer1963 = person && isFoedtFoer1963(person.foedselsdato)
	const [activeTab, setActiveTab] = useState('beregning')
	const [visAarsbelop, setVisAarsbelop] = useState(false)

	const hasBeregning =
		beregning && beregning.vilkaarsproevingsresultat.erInnvilget !== false
	if (!hasBeregning) {
		return (
			<Box
				borderColor="neutral-subtle"
				borderWidth="0 0 0 1"
				className={`${styles.beregning} ${isBeregningLoading ? styles.loadingOverlay : ''}`}
				data-testid="beregning-result"
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
		beregning?.maanedligAlderspensjonForKnekkpunkter?.vedHeltUttak

	const gradertMaanedligAlderspensjon =
		beregning?.maanedligAlderspensjonForKnekkpunkter?.vedGradertUttak

	const normertMaanedligAlderspensjon =
		beregning?.maanedligAlderspensjonForKnekkpunkter?.vedNormertPensjonsalder

	const erUttaksgradNull = aktivBeregning?.uttaksgrad === 0
	const titleHeltUttak =
		aktivBeregning &&
		formatAlderTitle(
			erGradert || erUttaksgradNull
				? (aktivBeregning.alderAarHeltUttak ?? 0)
				: (aktivBeregning.alderAarUttak ?? 0),
			erGradert || erUttaksgradNull
				? (aktivBeregning.alderMdHeltUttak ?? 0)
				: (aktivBeregning.alderMdUttak ?? 0)
		)
	const titleGradertUttak =
		aktivBeregning &&
		formatAlderTitle(
			aktivBeregning.alderAarUttak ?? 0,
			aktivBeregning.alderMdUttak ?? 0
		)

	const harAfpPrivat =
		aktivBeregning?.afp === 'ja_privat' ||
		aktivBeregning?.endringAfpPrivat === true

	const shouldRenderAFPPrivatForGradertSection =
		gradertMaanedligAlderspensjon || erUttaksgradNull

	const shouldRenderNormertAfpBeforeHeltSection =
		harAfpPrivat &&
		shouldRenderAFPPrivatForGradertSection &&
		(heltUttakAlder.aar ?? 0) > 67 &&
		(gradertUttakAlder?.aar ?? 0) < 67

	const shouldRenderNormertAfpAfterHeltSection =
		harAfpPrivat && (heltUttakAlder.aar ?? 0) < 67

	const normertAfpAlderspensjonGrad = shouldRenderNormertAfpBeforeHeltSection
		? (aktivBeregning?.uttaksgrad ?? 0)
		: 100

	const simulererMedGjenlevenderett = !!aktivBeregning?.beregnMedGjenlevenderett

	const sectionCommonProps = {
		tableCount,
		erFoedtFoer1963,
		erOvergangskull,
		erFoedtEtter1963,
		grunnbeloep: grunnbeloep?.grunnbeløp,
		simulererMedGjenlevenderett,
	}
	const gradertAfpSection = (
		<BeregningSection
			title={titleGradertUttak || ''}
			{...sectionCommonProps}
			entry={gradertMaanedligAlderspensjon ?? undefined}
			showAfp={harAfpPrivat}
			afpEntry={afpPrivatVedGradertUttak}
			visKronetillegg={(gradertUttakAlder?.aar ?? 0) < 67}
			totalAddToSum={
				(gradertMaanedligAlderspensjon?.beloep ?? 0) +
				(afpPrivatVedGradertUttak?.maanedligBeloep ?? 0)
			}
			alderspensjonGrad={aktivBeregning?.uttaksgrad ?? 0}
			isGradert
			erUttaksgradNull={erUttaksgradNull}
			testId="beregning-section-gradert"
		/>
	)
	const renderNormertAfpSection = ({ testId }: { testId: string }) => {
		if (
			!shouldRenderNormertAfpBeforeHeltSection &&
			!shouldRenderNormertAfpAfterHeltSection
		) {
			return null
		}
		return (
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
				alderspensjonGrad={normertAfpAlderspensjonGrad}
				isGradert
				testId={testId}
				erUttaksgradNull={erUttaksgradNull}
			/>
		)
	}

	return (
		<Box
			borderColor="neutral-subtle"
			borderWidth="0 0 0 1"
			position="relative"
			className={`${styles.beregning} ${isBeregningLoading ? styles.loadingOverlay : ''}`}
			data-testid="beregning-result"
		>
			<Tabs value={activeTab} onChange={setActiveTab}>
				<Tabs.List>
					<Tabs.Tab value="beregning" label="Beregning" />
					<Tabs.Tab value="forbehold" label="Forbehold" />
				</Tabs.List>
				<Tabs.Panel value="beregning" className={styles.tabPanel}>
					<Box
						position="absolute"
						right={{ sm: 'space-24', xl: 'space-48' }}
						top="space-24"
					>
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
						{(gradertMaanedligAlderspensjon ||
							(harAfpPrivat && erUttaksgradNull)) &&
							gradertAfpSection}
						{shouldRenderNormertAfpBeforeHeltSection &&
							renderNormertAfpSection({ testId: 'beregning-section-gradert-67' })}

						<BeregningSection
							title={titleHeltUttak || ''}
							{...sectionCommonProps}
							entry={helMaanedligAlderspensjon}
							showAfp={harAfpPrivat}
							afpEntry={afpPrivatVedHeltUttak}
							visKronetillegg={(heltUttakAlder.aar ?? 0) < 67}
							alderspensjonGrad={100}
							visAarsbelop={visAarsbelop}
							testId="beregning-section-helt"
						/>
						{shouldRenderNormertAfpAfterHeltSection &&
							renderNormertAfpSection({ testId: 'beregning-section-helt-67' })}
					</VStack>
				</Tabs.Panel>
				<Tabs.Panel value="forbehold" className={styles.tabPanel}>
					<Forbehold />
				</Tabs.Panel>
			</Tabs>
		</Box>
	)
}

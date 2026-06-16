import { SanityVilkaarligForbehold } from '@pensjonskalkulator-frontend-monorepo/sanity'
import {
	isFoedtEtter1963,
	isOvergangskull,
} from '@pensjonskalkulator-frontend-monorepo/utils'
import { isFoedtFoer1963 } from '@pensjonskalkulator-frontend-monorepo/utils/alder'
import { useState } from 'react'

import { BodyLong, Box, HGrid, Loader, Tabs, VStack } from '@navikt/ds-react'

import {
	useFeatureToggleQuery,
	useGrunnbeloepQuery,
	useOpptjeningQuery,
} from '../../api/queries'
import { getUttakInfo } from '../../utils/getUttakInfo'
import { useBeregningContext } from '../BeregningContext'
import { BeregningSection } from '../BeregningSection/BeregningSection'
import { buildForbeholdContext } from '../Forbehold/forbeholdContext'
import { AfpBeregningSection } from './AfpBeregningSection'
import { OpptjeningTable } from './OpptjeningTable'
import { ServiceAfpBeregningSection } from './ServiceAfpBeregningSection'
import { formatAlderTitle } from './beregningMappers'

import styles from './Beregning.module.css'

export const Beregning = () => {
	const {
		isBeregningLoading,
		beregning,
		aktivBeregning,
		person,
		vedtak,
		omstillingsstoenad,
		fnr,
	} = useBeregningContext()
	const { data: grunnbeloep } = useGrunnbeloepQuery()
	const { data: forbeholdInternSynlig } = useFeatureToggleQuery(
		'forbehold-intern-synlig'
	)
	const visForbehold = forbeholdInternSynlig?.enabled === true
	const erOvergangskull = person && isOvergangskull(person.foedselsdato)
	const erFoedtEtter1963 = person && isFoedtEtter1963(person.foedselsdato)
	const erFoedtFoer1963 = person && isFoedtFoer1963(person.foedselsdato)
	const [activeTab, setActiveTab] = useState('beregning')
	const [visAarsbelop, setVisAarsbelop] = useState(false)

	const skalBeregneAfpKap19 =
		aktivBeregning?.afp === 'ja_offentlig' && erFoedtFoer1963
	const erServiceberegning = aktivBeregning?.afp === 'serviceberegning'

	const { data: opptjening, isLoading: isOpptjeningLoading } =
		useOpptjeningQuery(fnr)

	const { data: opptjeningAvdoed } = useOpptjeningQuery(
		vedtak?.avdoed?.pid || undefined
	)

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

	const forbeholdContext = buildForbeholdContext({
		aktivBeregning,
		person,
		vedtak,
		omstillingsstoenad,
	})

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

	const erUttaksgradNull = aktivBeregning?.uttaksgrad === 0
	const titleHeltUttak =
		(aktivBeregning &&
			formatAlderTitle(
				erGradert || erUttaksgradNull
					? (aktivBeregning.alderAarHeltUttak ?? 0)
					: (aktivBeregning.alderAarUttak ?? 0),
				erGradert || erUttaksgradNull
					? (aktivBeregning.alderMdHeltUttak ?? 0)
					: (aktivBeregning.alderMdUttak ?? 0)
			)) ||
		''
	const titleGradertUttak =
		aktivBeregning &&
		formatAlderTitle(
			aktivBeregning.alderAarUttak ?? 0,
			aktivBeregning.alderMdUttak ?? 0
		)

	const harAfpPrivat =
		aktivBeregning?.afp === 'ja_privat' ||
		aktivBeregning?.endringAfpPrivat === true

	const harGradertUttakEllerAfpPrivatUtenUttak =
		gradertMaanedligAlderspensjon || (harAfpPrivat && erUttaksgradNull)

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

	const ufoeretrygdBeregningInfo = 'Uføretrygd vises ikke i beregningen.'

	const sectionCommonProps = {
		tableCount,
		erFoedtFoer1963,
		erOvergangskull,
		erFoedtEtter1963,
		grunnbeloep: grunnbeloep?.grunnbeløp,
		simulererMedGjenlevenderett,
	}
	const showGradertFirst =
		!!gradertMaanedligAlderspensjon || (harAfpPrivat && erUttaksgradNull)

	const showCheckboxOnAfpKap19 =
		!showGradertFirst &&
		skalBeregneAfpKap19 &&
		!!beregning.tidsbegrensetOffentligAfp

	const showCheckboxOnHelt =
		!showGradertFirst && !showCheckboxOnAfpKap19 && !erServiceberegning

	const harGjenlevenderett =
		vedtak?.loependeAlderspensjon?.harGjenlevenderett ?? false

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
			visAarsbelop={visAarsbelop}
			testId="beregning-section-gradert"
			showVisAarsbelopCheckbox={showGradertFirst}
			harGjenlevenderett={harGjenlevenderett}
			onVisAarsbelopChange={setVisAarsbelop}
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
				entry={normertMaanedligAlderspensjon ?? undefined}
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
				visAarsbelop={visAarsbelop}
				harGjenlevenderett={harGjenlevenderett}
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
			<Tabs value={activeTab} onChange={setActiveTab} size="small">
				<Tabs.List>
					<Tabs.Tab value="beregning" label="Beregning" />
					{opptjening && <Tabs.Tab value="opptjening" label="Opptjening" />}
					{visForbehold && <Tabs.Tab value="forbehold" label="Forbehold" />}
				</Tabs.List>
				<Tabs.Panel value="beregning" className={styles.tabPanel}>
					{vedtak?.ufoeretrygdgrad && (
						<BodyLong size="small" spacing data-testid="ufoeretrygd-info">
							{ufoeretrygdBeregningInfo}
						</BodyLong>
					)}
					<VStack
						gap="space-32"
						className={isBeregningLoading ? styles.loadingOverlay : undefined}
					>
						{isBeregningLoading && (
							<div className={styles.overlayLoader}>
								<Loader size="3xlarge" title="Beregner pensjon …" />
							</div>
						)}
						{erServiceberegning &&
							beregning.serviceberegnetAfp?.beregnetAfp && (
								<ServiceAfpBeregningSection
									title={titleHeltUttak}
									entry={beregning.serviceberegnetAfp.beregnetAfp}
									visAarsbelop={visAarsbelop}
									showVisAarsbelopCheckbox
									onVisAarsbelopChange={setVisAarsbelop}
								/>
							)}
						{!erServiceberegning &&
							harGradertUttakEllerAfpPrivatUtenUttak &&
							gradertAfpSection}

						{!erServiceberegning &&
							shouldRenderNormertAfpBeforeHeltSection &&
							renderNormertAfpSection({
								testId: 'beregning-section-gradert-67',
							})}
						{!erServiceberegning &&
							skalBeregneAfpKap19 &&
							beregning.tidsbegrensetOffentligAfp && (
								<AfpBeregningSection
									title={titleHeltUttak}
									tableCount={tableCount}
									entry={beregning.tidsbegrensetOffentligAfp}
									visAarsbelop={visAarsbelop}
									showVisAarsbelopCheckbox={showCheckboxOnAfpKap19}
									onVisAarsbelopChange={setVisAarsbelop}
								/>
							)}
						{!erServiceberegning && (
							<BeregningSection
								title={
									skalBeregneAfpKap19 ? formatAlderTitle(67, 0) : titleHeltUttak
								}
								{...sectionCommonProps}
								entry={
									skalBeregneAfpKap19
										? (normertMaanedligAlderspensjon ?? undefined)
										: (helMaanedligAlderspensjon ?? undefined)
								}
								showAfp={harAfpPrivat}
								afpEntry={afpPrivatVedHeltUttak}
								visKronetillegg={(heltUttakAlder.aar ?? 0) < 67}
								alderspensjonGrad={100}
								visAarsbelop={visAarsbelop}
								totalAddToSum={
									(helMaanedligAlderspensjon?.beloep ?? 0) +
									(afpPrivatVedHeltUttak?.maanedligBeloep ?? 0)
								}
								testId="beregning-section-helt"
								showVisAarsbelopCheckbox={showCheckboxOnHelt}
								harGjenlevenderett={harGjenlevenderett}
								onVisAarsbelopChange={setVisAarsbelop}
							/>
						)}
						{!erServiceberegning &&
							shouldRenderNormertAfpAfterHeltSection &&
							renderNormertAfpSection({ testId: 'beregning-section-helt-67' })}
					</VStack>
				</Tabs.Panel>
				{opptjening && (
					<Tabs.Panel value="opptjening" className={styles.tabPanel}>
						{isOpptjeningLoading && (
							<div className={styles.overlayLoader}>
								<Loader size="3xlarge" title="Henter opptjening …" />
							</div>
						)}
						<VStack
							gap="space-32"
							className={
								isOpptjeningLoading ? styles.loadingOverlay : undefined
							}
						>
							{opptjening && (
								<OpptjeningTable
									opptjening={opptjening}
									erOvergangskull={erOvergangskull}
									erFoedtEtter1963={erFoedtEtter1963}
									isOpptjeningAvdoedSection={false}
								/>
							)}

							{opptjeningAvdoed && (
								<OpptjeningTable
									opptjening={opptjeningAvdoed}
									erOvergangskull={erOvergangskull}
									erFoedtEtter1963={erFoedtEtter1963}
									isOpptjeningAvdoedSection={true}
								/>
							)}
						</VStack>
					</Tabs.Panel>
				)}
				{visForbehold && (
					<Tabs.Panel value="forbehold" className={styles.tabPanel}>
						<div style={{ maxWidth: '66%' }}>
							<SanityVilkaarligForbehold ctx={forbeholdContext} size="small" />
						</div>
					</Tabs.Panel>
				)}
			</Tabs>
			<HGrid marginBlock="space-40" columns={3}>
				<BodyLong size="small" style={{ gridColumn: 'span 2' }}>
					Pensjonen er beregnet på grunnlag av de opplysningene vi har om deg, i
					tillegg til de opplysningene du har oppgitt selv. Dette er derfor en
					foreløpig beregning av hva du kan forvente deg i pensjon.
					Pensjonsberegningen er vist i dagens kroneverdi. Beregningen er ikke
					juridisk bindende.
				</BodyLong>
			</HGrid>
		</Box>
	)
}

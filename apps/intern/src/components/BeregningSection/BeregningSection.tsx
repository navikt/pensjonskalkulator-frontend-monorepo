import type {
	LivsvarigOffentligAFP,
	SimuleringAfpPrivat,
	SimuleringMaanedligAlderspensjon,
} from '@pensjonskalkulator-frontend-monorepo/types'

import { Checkbox, HStack, Heading, VStack } from '@navikt/ds-react'

import { AlderspensjonTables } from '../Beregning/AlderspensjonTables'
import { BeregningTableWithSum } from '../Beregning/BeregningTableWithSum'
import { LivsvarigOffentligAfpTables } from '../Beregning/LivsvarigOffentligAfpTables'
import { mapPrivatAfp } from '../Beregning/beregningMappers'

import styles from './BeregningSection.module.css'

interface BeregningSectionProps {
	title: string
	tableCount: number
	entry?: SimuleringMaanedligAlderspensjon
	erFoedtFoer1963?: boolean | null
	erOvergangskull?: boolean | null
	erFoedtEtter1963?: boolean | null
	grunnbeloep?: number
	visPrivatAfp?: boolean
	privatAfp?: SimuleringAfpPrivat
	livsvarigOffentligAfp?: LivsvarigOffentligAFP
	visKronetillegg?: boolean
	alderspensjonGrad: number
	simulererMedGjenlevenderett?: boolean
	harGjenlevenderett?: boolean
	isGradert?: boolean
	visAarsbelop: boolean
	erUttaksgradNull?: boolean
	testId?: string
	showVisAarsbelopCheckbox?: boolean
	onVisAarsbelopChange?: (checked: boolean) => void
	reducedGrunnpensjon?: boolean
}

export const BeregningSection = ({
	title,
	tableCount,
	entry,
	erFoedtFoer1963,
	erOvergangskull,
	erFoedtEtter1963,
	grunnbeloep,
	visPrivatAfp = false,
	privatAfp,
	livsvarigOffentligAfp,
	visKronetillegg = false,
	alderspensjonGrad,
	simulererMedGjenlevenderett = false,
	isGradert = false,
	visAarsbelop = false,
	testId,
	erUttaksgradNull = false,
	showVisAarsbelopCheckbox,
	harGjenlevenderett = false,
	onVisAarsbelopChange,
	reducedGrunnpensjon = false,
}: BeregningSectionProps) => {
	const valueHeader = visAarsbelop ? 'Kr per år' : 'Kr per måned'
	const maanedligSumAlderspensjonOgPrivatAfp =
		(entry?.beloep ?? 0) + (privatAfp?.maanedligBeloep ?? 0)
	const sumAlderspensjonOgPrivatAfp = visAarsbelop
		? maanedligSumAlderspensjonOgPrivatAfp * 12
		: maanedligSumAlderspensjonOgPrivatAfp

	const visAlderspensjon = !erUttaksgradNull || alderspensjonGrad === 100
	return (
		<VStack gap="space-12" data-testid={testId}>
			{(visPrivatAfp || livsvarigOffentligAfp || !erUttaksgradNull) && (
				<HStack justify="space-between" align="center">
					<Heading level="3" size="small">
						{title}
					</Heading>
					{showVisAarsbelopCheckbox && (
						<Checkbox
							onChange={(e) => onVisAarsbelopChange?.(e.target.checked)}
							size="small"
						>
							Vis årsbeløp
						</Checkbox>
					)}
				</HStack>
			)}
			<div
				className={styles.tableGrid}
				style={{ '--table-columns': tableCount } as React.CSSProperties}
			>
				{entry && visAlderspensjon && (
					<AlderspensjonTables
						entry={entry}
						erFoedtFoer1963={erFoedtFoer1963}
						erOvergangskull={erOvergangskull}
						erFoedtEtter1963={erFoedtEtter1963}
						grunnbeloep={grunnbeloep}
						alderspensjonGrad={alderspensjonGrad}
						visAarsbelop={visAarsbelop}
						simulererMedGjenlevenderett={simulererMedGjenlevenderett}
						harGjenlevenderett={harGjenlevenderett}
						isGradert={isGradert}
						reducedGrunnpensjon={reducedGrunnpensjon}
					/>
				)}
				{visPrivatAfp && (
					<VStack
						gap="space-32"
						data-testid={testId ? `${testId}-afp` : undefined}
					>
						<BeregningTableWithSum
							title="AFP i privat sektor"
							valueHeader={valueHeader}
							rows={mapPrivatAfp(privatAfp, visKronetillegg)}
							sumLabel="Sum AFP"
							visAarsbelop={visAarsbelop}
						/>

						{visAlderspensjon && (
							<BeregningTableWithSum
								title="Alderspensjon og AFP"
								valueHeader={valueHeader}
								sumLabel="Sum pensjon"
								addToSum={sumAlderspensjonOgPrivatAfp}
								visAarsbelop={visAarsbelop}
							/>
						)}
					</VStack>
				)}
				{livsvarigOffentligAfp && (
					<LivsvarigOffentligAfpTables
						entry={livsvarigOffentligAfp}
						alderspensjonBeloep={visAlderspensjon ? entry?.beloep : undefined}
						visAarsbelop={visAarsbelop}
						testId={testId ? `${testId}-afp` : undefined}
					/>
				)}
			</div>
		</VStack>
	)
}

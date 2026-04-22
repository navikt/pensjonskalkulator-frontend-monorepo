import type {
	SimuleringAfpPrivat,
	SimuleringMaanedligAlderspensjon,
} from '@pensjonskalkulator-frontend-monorepo/types'

import { Heading, VStack } from '@navikt/ds-react'

import { AlderspensjonTables } from '../Beregning/AlderspensjonTables'
import { BeregningTableWithSum } from '../Beregning/BeregningTableWithSum'
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
	showAfp?: boolean
	afpEntry?: SimuleringAfpPrivat
	visKronetillegg?: boolean
	alderspensjonGrad: number
	totalAddToSum?: number
	simulererMedGjenlevenderett?: boolean
	isGradert?: boolean
	erUttaksgradNull?: boolean
}

export const BeregningSection = ({
	title,
	tableCount,
	entry,
	erFoedtFoer1963,
	erOvergangskull,
	erFoedtEtter1963,
	grunnbeloep,
	showAfp = false,
	afpEntry,
	visKronetillegg = false,
	totalAddToSum = 0,
	alderspensjonGrad,
	simulererMedGjenlevenderett = false,
	isGradert = false,
	erUttaksgradNull = false,
}: BeregningSectionProps) => (
	<VStack gap="space-12">
		{(showAfp || !erUttaksgradNull) && (
			<Heading level="3" size="small">
				{title}
			</Heading>
		)}
		<div
			className={styles.tableGrid}
			style={{ '--table-columns': tableCount } as React.CSSProperties}
		>
			{entry && !erUttaksgradNull && (
				<AlderspensjonTables
					entry={entry}
					erFoedtFoer1963={erFoedtFoer1963}
					erOvergangskull={erOvergangskull}
					erFoedtEtter1963={erFoedtEtter1963}
					grunnbeloep={grunnbeloep}
					alderspensjonGrad={alderspensjonGrad}
					simulererMedGjenlevenderett={simulererMedGjenlevenderett}
					isGradert={isGradert}
				/>
			)}
			{showAfp && (
				<VStack gap="space-32">
					<BeregningTableWithSum
						title="AFP i privat sektor"
						valueHeader="Kr per måned"
						rows={mapPrivatAfp(afpEntry, visKronetillegg)}
					/>

					{!erUttaksgradNull && (
						<BeregningTableWithSum
							title="Alderspensjon og AFP"
							valueHeader="Kr per måned"
							addToSum={totalAddToSum}
						/>
					)}
				</VStack>
			)}
		</div>
	</VStack>
)

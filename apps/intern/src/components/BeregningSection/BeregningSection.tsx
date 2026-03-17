import type {
	AfpPrivatPensjonsberegning,
	AlderspensjonPensjonsberegning,
} from '@pensjonskalkulator-frontend-monorepo/types'

import { Heading, VStack } from '@navikt/ds-react'

import { AlderspensjonTables } from '../Beregning/AlderspensjonTables'
import { BeregningTableWithSum } from '../Beregning/BeregningTableWithSum'
import { mapPrivatAfp } from '../Beregning/beregningMappers'

import styles from './BeregningSection.module.css'

interface BeregningSectionProps {
	title: string
	tableCount: number
	entry?: AlderspensjonPensjonsberegning
	erFoedtFoer1963?: boolean | null
	erOvergangskull?: boolean | null
	erFoedtEtter1963?: boolean | null
	grunnbeloep?: number
	showAfp?: boolean
	afpEntry?: AfpPrivatPensjonsberegning
	visKronetillegg?: boolean
	alderspensjonGrad: number
	afpTableAddToSum?: number
	totalAddToSum?: number
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
	afpTableAddToSum,
	totalAddToSum = 0,
	alderspensjonGrad,
}: BeregningSectionProps) => (
	<VStack gap="space-12">
		<Heading level="3" size="small">
			{title}
		</Heading>
		<div
			className={styles.tableGrid}
			style={{ '--table-columns': tableCount } as React.CSSProperties}
		>
			{entry && (
				<AlderspensjonTables
					entry={entry}
					erFoedtFoer1963={erFoedtFoer1963}
					erOvergangskull={erOvergangskull}
					erFoedtEtter1963={erFoedtEtter1963}
					grunnbeloep={grunnbeloep}
					alderspensjonGrad={alderspensjonGrad}
				/>
			)}
			{showAfp && (
				<VStack gap="space-32">
					<BeregningTableWithSum
						title="Avtalefestet pensjon i privat sektor"
						valueHeader="Kr per måned"
						rows={mapPrivatAfp(afpEntry, visKronetillegg)}
						addToSum={afpTableAddToSum}
					/>
					<BeregningTableWithSum
						title="Alderspensjon og AFP"
						valueHeader="Kr per måned"
						addToSum={totalAddToSum}
					/>
				</VStack>
			)}
		</div>
	</VStack>
)

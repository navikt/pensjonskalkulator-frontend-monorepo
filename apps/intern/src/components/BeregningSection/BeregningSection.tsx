import type {
	SimuleringAfpPrivat,
	SimuleringMaanedligAlderspensjon,
} from '@pensjonskalkulator-frontend-monorepo/types'

import { Heading, VStack } from '@navikt/ds-react'

import { AlderspensjonTables } from '../Beregning/AlderspensjonTables'
import {
	BeregningTableWithSum,
	computeRowsSum,
} from '../Beregning/BeregningTableWithSum'
import {
	mapAlderspensjonToRows,
	mapPrivatAfp,
} from '../Beregning/beregningMappers'

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
	simulererMedGjenlevenderett?: boolean
	isGradert?: boolean
	visAarsbelop?: boolean
	testId?: string
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
	alderspensjonGrad,
	simulererMedGjenlevenderett = false,
	isGradert = false,
	visAarsbelop = false,
	testId,
}: BeregningSectionProps) => {
	const afpRows = mapPrivatAfp(afpEntry, visKronetillegg)
	const alderspensjonRows = entry
		? mapAlderspensjonToRows(
				entry,
				!!erFoedtFoer1963,
				!!erOvergangskull || !!erFoedtEtter1963,
				simulererMedGjenlevenderett
			)
		: []

	return (
		<VStack gap="space-12" data-testid={testId}>
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
						visAarsbelop={visAarsbelop}
						simulererMedGjenlevenderett={simulererMedGjenlevenderett}
						isGradert={isGradert}
					/>
				)}
				{showAfp && (
					<VStack gap="space-32">
						<BeregningTableWithSum
							title="Avtalefestet pensjon i privat sektor"
							valueHeader={visAarsbelop ? 'Kr per år' : 'Kr per måned'}
							rows={afpRows}
							visAarsbelop={visAarsbelop}
						/>
						<BeregningTableWithSum
							title="Alderspensjon og AFP"
							valueHeader={visAarsbelop ? 'Kr per år' : 'Kr per måned'}
							addToSum={
								computeRowsSum(alderspensjonRows, visAarsbelop) +
								computeRowsSum(afpRows, visAarsbelop)
							}
							visAarsbelop={visAarsbelop}
						/>
					</VStack>
				)}
			</div>
		</VStack>
	)
}

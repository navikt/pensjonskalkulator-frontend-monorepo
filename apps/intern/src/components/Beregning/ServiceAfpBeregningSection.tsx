import { BodyLong, Heading, VStack } from '@navikt/ds-react'

import { BeregningDetailTable } from './BeregningDetailTable'
import { BeregningTableWithSum } from './BeregningTableWithSum'
import {
	type ServiceberegnetAfpResult,
	mapServiceAfpOpptjeningRows,
	mapServiceAfpToRows,
} from './beregningMappers'

import styles from '../BeregningSection/BeregningSection.module.css'

interface ServiceAfpBeregningSectionProps {
	title: string
	tableCount: number
	entry: ServiceberegnetAfpResult
	visAarsbelop: boolean
}

export const ServiceAfpBeregningSection = ({
	title,
	entry,
	visAarsbelop,
}: ServiceAfpBeregningSectionProps) => {
	const afpRows = mapServiceAfpToRows(entry)
	const opptjeningRows = mapServiceAfpOpptjeningRows(entry)

	return (
		<VStack gap="space-12">
			<Heading level="3" size="small">
				{title}
			</Heading>
			<div
				className={styles.tableGrid}
				style={{ '--table-columns': 3 } as React.CSSProperties}
			>
				<VStack gap="space-8">
					<BeregningTableWithSum
						title="AFP"
						valueHeader={visAarsbelop ? 'Kr per år' : 'Kr per måned'}
						rows={afpRows}
						visAarsbelop={visAarsbelop}
					/>
					{entry.erAvkortet && (
						<BodyLong size="small" textColor="subtle">
							Sum redusert pga. total pensjon oversteg 70 % av tidligere inntekt
						</BodyLong>
					)}
				</VStack>
				<BeregningDetailTable title="Opptjening AFP" rows={opptjeningRows} />
				<BodyLong size="small" style={{ gridColumn: 'span 2' }}>
					Pensjonen er beregnet på grunnlag av de opplysningene vi har om deg, i
					tillegg til de opplysningene du har oppgitt selv. Dette er derfor en
					foreløpig beregning av hva du kan forvente deg i pensjon.
					Pensjonsberegningen er vist i dagens kroneverdi. Beregningen er ikke
					juridisk bindende.
				</BodyLong>
			</div>
		</VStack>
	)
}

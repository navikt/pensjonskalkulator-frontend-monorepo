import { BodyLong, Checkbox, HStack, Heading, VStack } from '@navikt/ds-react'

import { BeregningDetailTable } from './BeregningDetailTable'
import { BeregningTableWithSum } from './BeregningTableWithSum'
import {
	type ServiceberegnetAfpResult,
	mapAfpToRows,
	mapServiceAfpOpptjeningRows,
} from './beregningMappers'

import styles from '../BeregningSection/BeregningSection.module.css'

interface ServiceAfpBeregningSectionProps {
	title: string
	entry: ServiceberegnetAfpResult
	visAarsbelop: boolean
	showVisAarsbelopCheckbox?: boolean
	onVisAarsbelopChange?: (checked: boolean) => void
}

export const ServiceAfpBeregningSection = ({
	title,
	entry,
	visAarsbelop,
	showVisAarsbelopCheckbox,
	onVisAarsbelopChange,
}: ServiceAfpBeregningSectionProps) => {
	const afpRows = mapAfpToRows({
		grunnpensjon: entry.grunnpensjon ?? 0,
		tilleggspensjon: entry.tilleggspensjon ?? 0,
		afpTillegg: entry.afpTillegg ?? 0,
		saertillegg: entry.saertillegg ?? 0,
	})
	const opptjeningRows = mapServiceAfpOpptjeningRows(entry)

	return (
		<VStack gap="space-12">
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

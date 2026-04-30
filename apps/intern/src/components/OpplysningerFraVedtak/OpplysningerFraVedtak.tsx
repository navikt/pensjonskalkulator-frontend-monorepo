import type { Vedtak } from '@pensjonskalkulator-frontend-monorepo/types'

import { Heading, Table } from '@navikt/ds-react'

import styles from '../Gjenlevenderett/OpplysningerInfo.module.css'

export const OpplysningerFraVedtak = ({ vedtak }: { vedtak?: Vedtak }) => {
	const rows = [
		{
			label: 'Sivilstatus',
			value: vedtak?.loependeAlderspensjon?.sivilstatus ?? 'Uoppgitt',
		},
		{
			label: 'Opphold utenfor Norge',
			//TODO: Fiks verdi når backend har støtte for dette feltet
			// value: vedtak?.loependeAlderspensjon?.oppholdUtland ? 'Ja' : 'Nei',
			value: 'Ja',
		},
	]
	return (
		<>
			<Heading level="3" size="xsmall" className={styles.opplysningerHeading}>
				Opplysninger hentet fra vedtak om alderspensjon
			</Heading>
			<Table className={styles.opplysningerTable} size="small">
				<Table.Body>
					{rows.map(({ label, value }) => (
						<Table.Row key={label}>
							<Table.DataCell textSize="small">{label}</Table.DataCell>
							<Table.DataCell textSize="small">{value}</Table.DataCell>
						</Table.Row>
					))}
				</Table.Body>
			</Table>
		</>
	)
}

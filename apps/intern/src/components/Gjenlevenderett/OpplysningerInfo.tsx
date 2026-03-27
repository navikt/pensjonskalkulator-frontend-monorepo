import type { EpsOpplysninger } from '@pensjonskalkulator-frontend-monorepo/types'
import { format, parseISO } from 'date-fns'

import { Heading, Table, VStack } from '@navikt/ds-react'

import { useGrunnbeloepQuery } from '../../api/queries'
import { RHFRadio, RHFTextField } from '../BeregningForm/rhf-adapters'
import { showEPSMinstePensjonsgivendeInntektFoerDoedsfall } from '../BeregningForm/utils'
import { getEpsDoedsdato } from './utils'

import styles from './OpplysningerInfo.module.css'

function mapEpsOpplysninger(
	eps: EpsOpplysninger
): { label: string; value: string }[] {
	const { relasjonPersondata } = eps
	const navn = relasjonPersondata?.navn
	const registrertDoedsDato = relasjonPersondata?.doedsdato
	const doedsdato = getEpsDoedsdato(eps)
	const formatertDoedsdato = format(parseISO(doedsdato), 'dd.MM.yyyy')

	return [
		{
			label: 'Navn',
			value: `${navn?.etternavn}, ${navn?.fornavn} ${navn?.mellomnavn ?? ''}`,
		},
		{
			label: 'Dødsdato',
			value: registrertDoedsDato
				? formatertDoedsdato
				: `Ikke registrert. ${formatertDoedsdato} brukes.`,
		},
	]
}

export const OpplysningerInfo = ({
	EPSOpplysninger,
}: {
	EPSOpplysninger: EpsOpplysninger
}) => {
	const rows = mapEpsOpplysninger(EPSOpplysninger)
	const { data: grunnbeloep } = useGrunnbeloepQuery()
	const grunnbeloepTekst = grunnbeloep ? `(${grunnbeloep.grunnbeløp} kr)` : ''

	return (
		<VStack gap="space-24" data-testid="EPS-opplysninger-info">
			<Heading level="3" size="xsmall" className={styles.opplysningerHeading}>
				Opplysninger om avdøde
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
			<RHFTextField
				name="epsAntallUtenlandsOppholdAar"
				label="Antall år bodd/jobbet i utlandet etter fylte 16 år"
				style={{ width: '96px' }}
				formatError="Skriv hele tall for å oppgi antall år i utlandet."
			/>
			<RHFTextField
				name="epsPensjonsgivendeInntektFoerDoedsDato"
				label="Pensjonsgivende inntekt året før dødsdato"
				style={{ width: '184px' }}
				formatError="Du må skrive hele tall for å oppgi inntekt."
			/>
			{showEPSMinstePensjonsgivendeInntektFoerDoedsfall(EPSOpplysninger) && (
				<RHFRadio
					name="epsMinstePensjonsgivendeInntektFoerDoedsfall"
					legend={`Minst 1G ${grunnbeloepTekst} i pensjonsgivende inntekt ved dødsdato`}
					className={styles.horizontalRadioGroup}
					testid="eps-minste-PGI-foer-doedsfall"
				/>
			)}
			<RHFRadio
				name="epsMedlemAvFolketrygdenVedDoedsDato"
				legend="Medlem av folketrygden de 5 siste årene før dødsdato"
				className={styles.horizontalRadioGroup}
			/>
			<RHFRadio
				name="epsRegistretSomFlykting"
				legend="Registrert som flyktning"
				className={styles.horizontalRadioGroup}
			/>
		</VStack>
	)
}

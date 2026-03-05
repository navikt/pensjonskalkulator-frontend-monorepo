import type { EpsOpplysninger } from '@pensjonskalkulator-frontend-monorepo/types'
import { format, subDays } from 'date-fns'

import { Heading, VStack } from '@navikt/ds-react'

import { useGrunnbeloepQuery } from '../../api/queries'
import { RHFRadio, RHFTextField } from '../BeregningForm/rhf-adapters'

import styles from './OpplysningerInfo.module.css'

export const OpplysningerInfo = ({
	EPSOpplysninger,
}: {
	EPSOpplysninger: EpsOpplysninger
}) => {
	const { relasjonPersondata } = EPSOpplysninger
	const registrertDoedsDato = relasjonPersondata?.doedsdato
	const doedsfall =
		registrertDoedsDato ?? format(subDays(new Date(), 1), 'dd.MM.yyyy')

	const doedsfallTekst =
		registrertDoedsDato ?? `Ikke registrert. ${doedsfall} brukes.`

	const EPSNavn = `${relasjonPersondata?.navn?.etternavn}, ${relasjonPersondata?.navn?.fornavn} ${relasjonPersondata?.navn?.mellomnavn ?? ''}`
	const { data: grunnbeloep } = useGrunnbeloepQuery()
	const grunnbeloepTekst = grunnbeloep ? `(<${grunnbeloep.grunnbeløp}> kr)` : ''
	return (
		<VStack gap="space-24">
			<Heading level="3" size="xsmall">
				Opplysninger om avdøde
			</Heading>
			<table className={styles.opplysningerTable}>
				<tbody>
					<tr>
						<td>Navn</td>
						<td>{EPSNavn}</td>
					</tr>
					<tr>
						<td>Dato for dødsfall</td>
						<td>{doedsfallTekst}</td>
					</tr>
				</tbody>
			</table>
			<RHFTextField
				name="epsAntallUtenlandsOppholdAar"
				label="År bodd/jobbet i utlandet etter fylte 16 år"
				style={{ width: '96px' }}
			/>
			<RHFTextField
				name="epsPensjonsgivendeInntektFoerDoedsDato"
				label="Pensjonsgivende inntekt året før dødsdato"
				style={{ width: '184px' }}
			/>
			<RHFRadio
				name="epsMinstePensjonsgivendeInntektFoerDoedsfall"
				legend={`Minst 1G ${grunnbeloepTekst} i pensjonsgivende inntekt ved dødsdato`}
				className={styles.horizontalRadioGroup}
			/>
			<RHFRadio
				name="epsMedlemAvFolketrygdenVedDoedsDato"
				legend="Medlem av folketrygden de 5 siste årene før dødsfallet"
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

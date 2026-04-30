import type {
	EpsOpplysninger,
	VedtakInformasjonOmAvdoed,
} from '@pensjonskalkulator-frontend-monorepo/types'
import { format, parseISO } from 'date-fns'

import { BodyLong, Heading, Table, VStack } from '@navikt/ds-react'

import { useGrunnbeloepQuery } from '../../api/queries'
import { RHFRadio, RHFTextField } from '../BeregningForm/rhf-adapters'
import { showEPSMinstePensjonsgivendeInntektFoerDoedsfall } from '../BeregningForm/utils'
import { getEpsDoedsdato } from './utils'

import styles from './OpplysningerInfo.module.css'

type OpplysningerInfoItem = { label: string; value: string | number }

function mapEpsOpplysninger({
	eps,
	vedtakInfoAvdoed,
}: {
	eps: EpsOpplysninger
	vedtakInfoAvdoed?: VedtakInformasjonOmAvdoed
}): OpplysningerInfoItem[] {
	const { relasjonPersondata } = eps
	const navn = relasjonPersondata?.navn
	const registrertDoedsDato = relasjonPersondata?.doedsdato
	const doedsdato = getEpsDoedsdato(eps)
	const formatertDoedsdato = format(parseISO(doedsdato), 'dd.MM.yyyy')

	const opplysninger: OpplysningerInfoItem[] = [
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

	if (vedtakInfoAvdoed) {
		opplysninger.push(
			{
				label: 'Antall år bodd/jobbet i utlandet etter fylte 16 år',
				value: vedtakInfoAvdoed?.antallAarUtenlands ?? 0,
			},
			{
				label: 'Minst 1G (130 160 kr) i pensjonsgivende inntekt ved dødsdato',
				value: vedtakInfoAvdoed?.aarligPensjonsgivendeInntektErMinst1G
					? 'Ja'
					: 'Nei',
			},
			{
				label: 'Medlem av folketrygden de 5 siste årene før dødsdato',
				value: vedtakInfoAvdoed?.harTilstrekkeligMedlemskapIFolketrygden
					? 'Ja'
					: 'Nei',
			},
			{
				label: 'Registrert som flyktning',
				value: vedtakInfoAvdoed?.erFlyktning ? 'Ja' : 'Nei',
			}
		)
	}

	return opplysninger
}

export const OpplysningerInfo = ({
	EPSOpplysninger,
	vedtakInfoAvdoed,
	vedtakAPDato,
}: {
	EPSOpplysninger: EpsOpplysninger
	vedtakInfoAvdoed?: VedtakInformasjonOmAvdoed
	vedtakAPDato?: string
}) => {
	const rows = mapEpsOpplysninger({ eps: EPSOpplysninger, vedtakInfoAvdoed })
	const { data: grunnbeloep } = useGrunnbeloepQuery()
	const grunnbeloepTekst = grunnbeloep ? `(${grunnbeloep.grunnbeløp} kr)` : ''
	const formatertVedtakAPDato = vedtakAPDato
		? format(parseISO(vedtakAPDato), 'dd.MM.yyyy')
		: undefined

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
			{vedtakInfoAvdoed && (
				<BodyLong>
					Hentet fra vedtak om alderspensjon, {formatertVedtakAPDato}.
				</BodyLong>
			)}
			{!vedtakInfoAvdoed && (
				<RHFTextField
					name="epsAntallUtenlandsOppholdAar"
					label="Antall år bodd/jobbet i utlandet etter fylte 16 år"
					style={{ width: '96px' }}
				/>
			)}
			<RHFTextField
				name="epsPensjonsgivendeInntektFoerDoedsDato"
				label="Pensjonsgivende inntekt året før dødsdato"
				style={{ width: '184px' }}
			/>
			{showEPSMinstePensjonsgivendeInntektFoerDoedsfall(EPSOpplysninger) &&
				!vedtakInfoAvdoed && (
					<RHFRadio
						name="epsMinstePensjonsgivendeInntektFoerDoedsfall"
						legend={`Minst 1G ${grunnbeloepTekst} i pensjonsgivende inntekt ved dødsdato`}
						className={styles.horizontalRadioGroup}
						testid="eps-minste-PGI-foer-doedsfall"
					/>
				)}
			{!vedtakInfoAvdoed && (
				<>
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
				</>
			)}
		</VStack>
	)
}

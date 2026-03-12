import { useState } from 'react'
import { useWatch } from 'react-hook-form'

import {
	BodyLong,
	Button,
	ErrorMessage,
	Loader,
	LocalAlert,
} from '@navikt/ds-react'

import { useEPSOpplysningerQuery } from '../../api/queries'
import { useBeregningContext } from '../BeregningContext'
import { RHFCheckbox } from '../BeregningForm/rhf-adapters/RHFCheckbox'
import { RHFRadio } from '../BeregningForm/rhf-adapters/RHFRadio'
import { useFormValidation } from '../BeregningForm/useFormValidation'
import { OpplysningerInfo } from './OpplysningerInfo'

import styles from './Gjenlevenderett.module.css'

export const Gjenlevenderett = () => {
	const { form, fnr } = useBeregningContext()
	const { control } = form
	const { validatebakgrunnForBrukAvOpplysningerOmEPS } = useFormValidation()

	const [epsQueryParams, setEpsQueryParams] = useState<{
		sivilstatus: string
		bakgrunn: string
	}>({} as { sivilstatus: string; bakgrunn: string })

	const {
		data: EPSOpplysninger,
		isError,
		isLoading: isEPSLoading,
	} = useEPSOpplysningerQuery({ fnr, ...epsQueryParams })

	const [beregnMedGjenlevenderett] = useWatch({
		control,
		name: ['beregnMedGjenlevenderett'] as const,
	})

	const handleHentEPSOpplysninger = () => {
		form.clearErrors([
			'bakgrunnForBrukAvOpplysningerOmEPS',
			'harHentetEPSOpplysninger',
		])

		const formData = form.getValues()
		const errors = validatebakgrunnForBrukAvOpplysningerOmEPS(formData)

		if (Object.keys(errors).length > 0) {
			for (const key of Object.keys(errors) as (keyof typeof errors)[]) {
				form.setError(key, { message: errors[key] })
			}
			return
		}

		form.setValue('harHentetEPSOpplysninger', true)
		setEpsQueryParams({
			sivilstatus: formData.sivilstatus,
			bakgrunn: formData.bakgrunnForBrukAvOpplysningerOmEPS!,
		})
	}

	const EPSLoader = <Loader>Henter opplysninger</Loader>
	const EPSError = (
		<LocalAlert status="warning" size="small" data-testid="EPS-henting-feil">
			<LocalAlert.Header>
				<LocalAlert.Title>Kunne ikke hente opplysninger</LocalAlert.Title>
			</LocalAlert.Header>
			<LocalAlert.Content>
				Noe gikk galt ved henting av opplysninger om EPS. Prøv på nytt eller
				beregn alderspensjon uten gjenlevenderett.
			</LocalAlert.Content>
		</LocalAlert>
	)

	const isEPSInfoEmpty = EPSOpplysninger && EPSOpplysninger.pid === null

	const EPSButtonText = isError
		? 'Hent opplysninger om EPS på nytt'
		: 'Hent opplysninger om EPS'

	const harHentetError = form.formState.errors.harHentetEPSOpplysninger?.message

	return (
		<>
			<RHFCheckbox
				name="beregnMedGjenlevenderett"
				label="Beregn med gjenlevenderett (valgfritt)"
				testid="beregn-med-gjenlevenderett"
			/>

			{beregnMedGjenlevenderett && (
				<div className={styles.gjenlevenderettSection}>
					<BodyLong
						size="small"
						className={styles.opplysningerOmEPSInfo}
						data-testid="EPS-samtykke-tekst"
					>
						For å beregne gjenlevenderett, må opplysninger om
						ektefelle/partner/samboer (EPS) hentes.
					</BodyLong>
					{isEPSLoading && EPSLoader}
					{!isEPSLoading && !isError && !EPSOpplysninger && (
						<RHFRadio
							name="bakgrunnForBrukAvOpplysningerOmEPS"
							legend="Hva er grunnlaget for å hente opplysninger om EPS i denne veiledningen?"
							testid="bakgrunn-for-bruk-EPS"
							options={[
								{
									value: 'DOEDSFALL_REGISTRERT',
									label: 'Bruker opplyser at EPS er død',
								},
								{
									value: 'SAMTYKKE_BEGGE_PARTER',
									label: 'Henvendelse fra begge parter foreligger',
								},
							]}
						/>
					)}
					{isError && EPSError}

					{!isEPSLoading && !EPSOpplysninger && (
						<Button
							variant="secondary"
							onClick={handleHentEPSOpplysninger}
							className={styles.epsSubmitButton}
							data-testid="EPS-hent-opplysninger-button"
							size="small"
						>
							{EPSButtonText}
						</Button>
					)}
					{harHentetError && (
						<ErrorMessage
							size="small"
							showIcon
							spacing
							className={styles.customErrorMessage}
						>
							{harHentetError}
						</ErrorMessage>
					)}
					{isEPSInfoEmpty && (
						<LocalAlert status="warning" data-testid="EPS-ikke-funnet">
							<LocalAlert.Header>
								<LocalAlert.Title>Fant ikke opplysninger</LocalAlert.Title>
							</LocalAlert.Header>
							<LocalAlert.Content>
								Vi fant ikke opplysninger om EPS. Gjenlevenderett kan derfor
								ikke beregnes. Du kan beregne alderspensjon uten gjenlevenderett
								i stedet.
							</LocalAlert.Content>
						</LocalAlert>
					)}
					{EPSOpplysninger && !isEPSInfoEmpty && (
						<OpplysningerInfo EPSOpplysninger={EPSOpplysninger} />
					)}
				</div>
			)}
		</>
	)
}

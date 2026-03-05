import { useWatch } from 'react-hook-form'

import { BodyLong, Button } from '@navikt/ds-react'

import { useBeregningContext } from '../BeregningContext'
import { RHFCheckbox } from '../BeregningForm/rhf-adapters/RHFCheckbox'
import { RHFRadio } from '../BeregningForm/rhf-adapters/RHFRadio'
import { useFormValidation } from '../BeregningForm/useFormValidation'

import styles from './Gjenlevenderett.module.css'

export const Gjenlevenderett = () => {
	const { form } = useBeregningContext()
	const { control } = form
	const { validatebakgrunnForBrukAvOpplysningerOmEPS } = useFormValidation()

	const [beregnMedGjenlevenderett] = useWatch({
		control,
		name: ['beregnMedGjenlevenderett'] as const,
	})

	const handleHentEPSOpplysninger = () => {
		form.clearErrors('bakgrunnForBrukAvOpplysningerOmEPS')

		const errors = validatebakgrunnForBrukAvOpplysningerOmEPS(form.getValues())

		if (Object.keys(errors).length > 0) {
			for (const key of Object.keys(errors) as (keyof typeof errors)[]) {
				form.setError(key, { message: errors[key] })
			}
			return
		}

		console.log('Henter opplysninger om EPS...')
	}

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

					<Button
						variant="secondary"
						onClick={handleHentEPSOpplysninger}
						className={styles.epsButton}
						data-testid="EPS-hent-opplysninger-button"
					>
						Hent opplysninger om EPS
					</Button>
				</div>
			)}
		</>
	)
}

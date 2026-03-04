import { useWatch } from 'react-hook-form'

import { BodyLong, Button } from '@navikt/ds-react'

import { useBeregningContext } from '../BeregningContext'
import { RHFCheckbox } from '../BeregningForm/rhf-adapters/RHFCheckbox'
import { RHFRadioValg } from '../BeregningForm/rhf-adapters/RHFRadioValg'
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
			/>

			{beregnMedGjenlevenderett && (
				<div className={styles.gjenlevenderettSection}>
					<BodyLong size="small" className={styles.opplysningerOmEPSInfo}>
						For å beregne gjenlevenderett, må opplysninger om
						ektefelle/partner/samboer (EPS) hentes.
					</BodyLong>
					<RHFRadioValg
						name="bakgrunnForBrukAvOpplysningerOmEPS"
						legend="Hva er grunnlaget for å hente opplysninger om EPS i denne veiledningen?"
						valg={[
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
					>
						Hent opplysninger om EPS
					</Button>
				</div>
			)}
		</>
	)
}

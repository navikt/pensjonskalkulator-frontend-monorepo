import { useWatch } from 'react-hook-form'

import { Button } from '@navikt/ds-react'

import { useBeregningContext } from '../BeregningContext'
import { RHFCheckbox } from '../BeregningForm/rhf-adapters/RHFCheckbox'
import { RHFRadioValg } from '../BeregningForm/rhf-adapters/RHFRadioValg'

import styles from './../BeregningForm/BeregningForm.module.css'

export const Gjenlevenderett = () => {
	const { form } = useBeregningContext()

	const { control } = form

	const [beregnMedGjenlevenderett] = useWatch({
		control,
		name: ['beregnMedGjenlevenderett'] as const,
	})

	const handleHentEPSOpplysninger = () => {
		if (!form.getFieldState('bakgrunnForBrukAvOpplysningerOmEPS')?.error) {
			// hent EPS opplysninger
			console.log('Henter opplysninger om EPS...')
		}
	}

	return (
		<>
			<RHFCheckbox
				name="beregnMedGjenlevenderett"
				label="Beregn med gjenlevenderett (valgfritt)"
			/>
			<hr className={styles.divider} />

			{beregnMedGjenlevenderett && (
				<>
					<RHFRadioValg
						name="bakgrunnForBrukAvOpplysningerOmEPS"
						legend="Hva er bakgrunnen for bruk av opplysninger om EPS?"
						valg={[
							{
								value: 'SAMTYKKE_BEGGE_PARTER',
								label: 'Samtykke fra begge parter',
							},
							{ value: 'DOEDSFALL_REGISTRERT', label: 'Dødsfall registrert' },
						]}
					/>

					<Button variant="secondary" onClick={handleHentEPSOpplysninger}>
						Hent opplysninger om EPS
					</Button>
				</>
			)}
		</>
	)
}

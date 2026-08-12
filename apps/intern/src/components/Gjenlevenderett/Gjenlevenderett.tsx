import type { Sivilstand } from '@pensjonskalkulator-frontend-monorepo/types'
import { useEffect, useState } from 'react'
import { useWatch } from 'react-hook-form'

import {
	BodyLong,
	Button,
	ErrorMessage,
	Loader,
	LocalAlert,
	VStack,
} from '@navikt/ds-react'

import { useEPSOpplysningerQuery, useVedtakQuery } from '../../api/queries'
import { getEpsVedtakStatus } from '../../utils'
import { SanityAlert } from '../Alerts/SanityAlert'
import { useBeregningContext } from '../BeregningContext'
import { RHFCheckbox } from '../BeregningForm/rhf-adapters/RHFCheckbox'
import { RHFRadio } from '../BeregningForm/rhf-adapters/RHFRadio'
import { useFormValidation } from '../BeregningForm/useFormValidation'
import { OpplysningerInfo } from './OpplysningerInfo'
import { getEpsDoedsdato } from './utils'

import styles from './Gjenlevenderett.module.css'

export const Gjenlevenderett = () => {
	const { form, fnr, person, resetForm } = useBeregningContext()
	const { control } = form
	const { validatebakgrunnForBrukAvOpplysningerOmEPS } = useFormValidation()

	const [epsQueryParams, setEpsQueryParams] = useState<{
		sivilstatus: Sivilstand
		bakgrunn: string
	}>({} as { sivilstatus: Sivilstand; bakgrunn: string })

	const {
		data: EPSOpplysninger,
		isError,
		isLoading: isEPSLoading,
	} = useEPSOpplysningerQuery({ fnr, ...epsQueryParams })

	const { data: vedtak, isLoading: isVedtakLoading } = useVedtakQuery(fnr)

	const vedtakInfoAvdoed =
		!isVedtakLoading && vedtak ? getEpsVedtakStatus(vedtak) : null

	useEffect(() => {
		form.setValue('vedtakInfoAvdoed', Boolean(vedtakInfoAvdoed), {
			shouldDirty: false,
		})

		if (!vedtakInfoAvdoed) {
			form.setValue('epsMinstePensjonsgivendeInntektFoerDoedsfall', null, {
				shouldDirty: false,
			})
			form.setValue('epsMedlemAvFolketrygdenVedDoedsDato', null, {
				shouldDirty: false,
			})
			form.setValue('epsRegistretSomFlykting', false, {
				shouldDirty: false,
			})
			form.setValue('epsAntallUtenlandsOppholdAar', undefined, {
				shouldDirty: false,
			})
			return
		}

		form.setValue(
			'epsMinstePensjonsgivendeInntektFoerDoedsfall',
			vedtakInfoAvdoed.aarligPensjonsgivendeInntektErMinst1G ?? null,
			{ shouldDirty: false }
		)
		form.setValue(
			'epsMedlemAvFolketrygdenVedDoedsDato',
			vedtakInfoAvdoed.harTilstrekkeligMedlemskapIFolketrygden ?? null,
			{ shouldDirty: false }
		)
		form.setValue(
			'epsRegistretSomFlykting',
			vedtakInfoAvdoed.erFlyktning ?? null,
			{ shouldDirty: false }
		)
		form.setValue(
			'epsAntallUtenlandsOppholdAar',
			vedtakInfoAvdoed.antallAarUtenlands ?? undefined,
			{ shouldDirty: false }
		)
	}, [vedtakInfoAvdoed, form])

	useEffect(() => {
		if (EPSOpplysninger) {
			form.setValue('epsOpplysninger', EPSOpplysninger, {
				shouldDirty: false,
			})
			form.setValue('harHentetEPSOpplysninger', true, {
				shouldDirty: false,
			})
		}
	}, [EPSOpplysninger, form])

	const [beregnMedGjenlevenderett] = useWatch({
		control,
		name: ['beregnMedGjenlevenderett'] as const,
	})

	const [formEpsOpplysninger, harHentetEPSOpplysninger] = useWatch({
		control,
		name: ['epsOpplysninger', 'harHentetEPSOpplysninger'] as const,
	})

	useEffect(() => {
		if (!harHentetEPSOpplysninger || !person) {
			setEpsQueryParams({} as { sivilstatus: Sivilstand; bakgrunn: string })
		}
	}, [harHentetEPSOpplysninger, person])

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

		setEpsQueryParams({
			sivilstatus: person!.sivilstand,
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

	const isEPSInfoEmpty =
		formEpsOpplysninger &&
		(formEpsOpplysninger.pid === null ||
			formEpsOpplysninger?.relasjonstype === 'UKJENT')

	const EPSButtonText = isError
		? 'Hent opplysninger om EPS på nytt'
		: 'Hent opplysninger om EPS'

	const harHentetError = form.formState.errors.harHentetEPSOpplysninger?.message

	const erBakgrunnDoedsfallRegistrert =
		epsQueryParams.bakgrunn === 'DOEDSFALL_REGISTRERT'
	const harRegistrertDoedsdato =
		formEpsOpplysninger &&
		Boolean(
			getEpsDoedsdato({
				epsOpplysninger: formEpsOpplysninger,
				vedtakInfoAvdoed: vedtakInfoAvdoed ?? undefined,
			})
		)

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
					{!isEPSLoading && !isError && !formEpsOpplysninger && (
						<RHFRadio
							name="bakgrunnForBrukAvOpplysningerOmEPS"
							legend="Hva er grunnlaget for å hente opplysninger om EPS i denne veiledningen?"
							testid="bakgrunn-for-bruk-EPS"
							gap="space-0"
							options={[
								{
									value: 'DOEDSFALL_REGISTRERT',
									label: 'Dødsfall er registrert',
								},
								{
									value: 'SAMTYKKE_BEGGE_PARTER',
									label: 'Henvendelse fra begge parter foreligger',
								},
							]}
						/>
					)}
					{isError && EPSError}

					{!isEPSLoading && !formEpsOpplysninger && (
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
					{formEpsOpplysninger &&
						!isEPSInfoEmpty &&
						erBakgrunnDoedsfallRegistrert &&
						!harRegistrertDoedsdato && (
							<VStack gap="space-16" align="start">
								<SanityAlert
									id="beregning.gjenlevenderett.doedsfall.ikke.registrert"
									className={styles.doedsfallSanityAlert}
								/>
								<Button variant="secondary" size="small" onClick={resetForm}>
									Start på nytt
								</Button>
							</VStack>
						)}
					{formEpsOpplysninger &&
						!isEPSInfoEmpty &&
						(!erBakgrunnDoedsfallRegistrert || harRegistrertDoedsdato) && (
							<OpplysningerInfo
								EPSOpplysninger={formEpsOpplysninger}
								vedtakInfoAvdoed={vedtakInfoAvdoed ?? undefined}
								vedtakAPDato={vedtak?.avdoed?.foersteAlderspensjonVirkningsdato}
							/>
						)}
				</div>
			)}
		</>
	)
}

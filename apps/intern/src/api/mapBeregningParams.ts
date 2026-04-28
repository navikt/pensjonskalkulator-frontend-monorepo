import type {
	SimuleringRequestBody,
	SimuleringUtenlandsperiode,
	SimuleringsType,
} from '@pensjonskalkulator-frontend-monorepo/types'
import {
	DATE_BACKEND_FORMAT,
	DATE_ENDUSER_FORMAT,
} from '@pensjonskalkulator-frontend-monorepo/utils/dates'
import { format, parse } from 'date-fns'

import { getEpsDoedsdato } from '../components/Gjenlevenderett/utils'
import type {
	BeregningFormData,
	UtenlandsOppholdFormValues,
} from './beregningTypes'

const toBackendDate = (value: string) =>
	format(parse(value, DATE_ENDUSER_FORMAT, new Date()), DATE_BACKEND_FORMAT)

const mapUtenlandsperiodeListe = (
	utenlandsOpphold: UtenlandsOppholdFormValues[]
): SimuleringUtenlandsperiode[] =>
	utenlandsOpphold.map(
		(opphold): SimuleringUtenlandsperiode => ({
			fom: toBackendDate(opphold.fom),
			tom: opphold.tom ? toBackendDate(opphold.tom) : undefined,
			landkode: opphold.landkode,
			arbeidetUtenlands: opphold.arbeidetUtenlands === true,
		})
	)

export function mapBeregningParamsToRequest(
	formData: BeregningFormData
): SimuleringRequestBody {
	const uttaksalder = {
		aar: formData.alderAarUttak ?? 0,
		maaneder: formData.alderMdUttak ?? 0,
	}

	const harInntektVedSiden = formData.harInntektVedSidenAvUttak === true
	const inntektVsaBeloep = harInntektVedSiden
		? (formData.pensjonsgivendeInntektVedSidenAvUttak ?? undefined)
		: undefined
	const inntektSluttAar = harInntektVedSiden
		? (formData.alderAarInntektSlutter ?? undefined)
		: undefined
	const inntektSluttMd = harInntektVedSiden
		? (formData.alderMdInntektSlutter ?? undefined)
		: undefined

	const aarligInntektFoerUttak =
		formData.aarligInntektFoerUttakBeloep ?? undefined

	const grad = formData.uttaksgrad ?? 0
	const erGradert = grad < 100

	const aarligInntektVsaPensjonGradert =
		erGradert &&
		formData.pensjonsgivendeInntektVedSidenAvGradertUttak !== null &&
		Number.isFinite(formData.pensjonsgivendeInntektVedSidenAvGradertUttak)
			? formData.pensjonsgivendeInntektVedSidenAvGradertUttak
			: undefined

	const heltUttaksalder = erGradert
		? {
				aar: formData.alderAarHeltUttak ?? 0,
				maaneder: formData.alderMdHeltUttak ?? 0,
			}
		: uttaksalder

	let simuleringstype: SimuleringsType = 'ALDERSPENSJON'

	// Behold samme rekkefølge
	if (formData.beregnMedGjenlevenderett && formData.epsOpplysninger?.pid) {
		simuleringstype = 'ALDERSPENSJON_MED_GJENLEVENDERETT'
	}

	if (formData.afp === 'ja_privat') {
		simuleringstype = 'ALDERSPENSJON_MED_PRIVAT_AFP'
	}

	if (formData.endringAP) {
		simuleringstype = 'ENDRING_ALDERSPENSJON'
	}

	if (formData.endringAfpPrivat) {
		simuleringstype = 'ENDRING_ALDERSPENSJON_MED_PRIVAT_AFP'
	}

	const epsPid = formData.epsOpplysninger?.pid
	const epsDoedsdato = formData.epsOpplysninger
		? getEpsDoedsdato(formData.epsOpplysninger)
		: undefined
	const erEndring = Boolean(formData.endringAP || formData.endringAfpPrivat)
	const utenlandsperiodeListe =
		formData.harOppholdUtenforNorge === true && formData.utenlandsOpphold.length
			? mapUtenlandsperiodeListe(formData.utenlandsOpphold)
			: undefined

	return {
		simuleringstype,
		aarligInntektFoerUttakBeloep: aarligInntektFoerUttak,
		utenlandsperiodeListe,
		gradertUttak: erGradert
			? {
					grad,
					uttaksalder,
					aarligInntektVsaPensjonBeloep: aarligInntektVsaPensjonGradert,
				}
			: undefined,
		heltUttak: {
			uttaksalder: heltUttaksalder,
			aarligInntektVsaPensjon:
				inntektVsaBeloep !== undefined &&
				inntektSluttAar !== undefined &&
				inntektSluttMd !== undefined
					? {
							beloep: inntektVsaBeloep,
							sluttAlder: {
								aar: inntektSluttAar,
								maaneder: inntektSluttMd,
							},
						}
					: undefined,
		},
		sivilstatus: formData.sivilstatus,
		eps: erEndring
			? null
			: {
					levende: {
						harInntektOver2G: Boolean(formData.epsHarInntektOver2G),
						harPensjon: Boolean(formData.epsHarPensjon),
					},
					avdoed:
						formData.beregnMedGjenlevenderett && epsPid && epsDoedsdato
							? {
									pid: epsPid,
									doedsdato: epsDoedsdato,
									medlemAvFolketrygden: Boolean(
										formData.epsMedlemAvFolketrygdenVedDoedsDato
									),
									inntektFoerDoedBeloep:
										formData.epsPensjonsgivendeInntektFoerDoedsDato ??
										undefined,
									inntektErOverGrunnbeloepet: Boolean(
										formData.epsMinstePensjonsgivendeInntektFoerDoedsfall
									),
									antallAarUtenlands: formData.epsAntallUtenlandsOppholdAar,
								}
							: undefined,
				},
	}
}

import type {
	SimuleringRequestBody,
	SimuleringUtenlandsperiode,
} from '@pensjonskalkulator-frontend-monorepo/types'
import {
	DATE_BACKEND_FORMAT,
	DATE_ENDUSER_FORMAT,
} from '@pensjonskalkulator-frontend-monorepo/utils/dates'
import { format, parse } from 'date-fns'

import { getEpsDoedsdato } from '../components/Gjenlevenderett/utils'
import type { BeregningFormData } from './beregningTypes'

type UtenlandsOppholdFormItem = {
	land: string
	arbeidetUtenlands: boolean | null
	startdato: string
	sluttdato: string
}

type BeregningFormDataWithUtenlandsOpphold = BeregningFormData & {
	utenlandsOpphold: UtenlandsOppholdFormItem[]
}

const toBackendDate = (value: string) =>
	format(parse(value, DATE_ENDUSER_FORMAT, new Date()), DATE_BACKEND_FORMAT)

const mapUtenlandsperiodeListe = (
	utenlandsOpphold: UtenlandsOppholdFormItem[]
): SimuleringUtenlandsperiode[] =>
	utenlandsOpphold.map(
		(opphold): SimuleringUtenlandsperiode => ({
			fom: toBackendDate(opphold.startdato),
			tom: opphold.sluttdato ? toBackendDate(opphold.sluttdato) : undefined,
			landkode: opphold.land,
			arbeidetUtenlands: opphold.arbeidetUtenlands === true,
		})
	)

export function mapBeregningParamsToRequest(
	formData: BeregningFormDataWithUtenlandsOpphold
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

	const simuleringstype =
		formData.beregnMedGjenlevenderett && formData.epsOpplysninger?.pid
			? 'ALDERSPENSJON_MED_GJENLEVENDERETT'
			: 'ALDERSPENSJON'

	const epsPid = formData.epsOpplysninger?.pid
	const epsDoedsdato = formData.epsOpplysninger
		? getEpsDoedsdato(formData.epsOpplysninger)
		: undefined

	return {
		simuleringstype,
		aarligInntektFoerUttakBeloep: aarligInntektFoerUttak,
		utenlandsperiodeListe: mapUtenlandsperiodeListe(formData.utenlandsOpphold),
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
		eps: {
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
								formData.epsPensjonsgivendeInntektFoerDoedsDato ?? undefined,
							inntektErOverGrunnbeloepet: Boolean(
								formData.epsMinstePensjonsgivendeInntektFoerDoedsfall
							),
							antallAarUtenlands: formData.epsAntallUtenlandsOppholdAar,
						}
					: undefined,
		},
	}
}

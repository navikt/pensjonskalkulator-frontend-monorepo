import type {
	SimuleringAfpPrivat,
	SimuleringMaanedligAlderspensjon,
} from '@pensjonskalkulator-frontend-monorepo/types'

import type { BeregningDetailRow } from './BeregningDetailTable'
import type { BeregningTableRow } from './BeregningTableWithSum'

const formatNumber = (value?: number | null): string =>
	value != null ? value.toLocaleString('nb-NO') : ''

const formatKr = (value?: number | null): string =>
	value != null && value >= 0
		? `${value.toLocaleString('nb-NO', { maximumFractionDigits: 0 })} kr`
		: ''

const formatAar = (value?: number | null): string =>
	value != null ? `${value} år` : ''

export function mapAlderspensjonToRows(
	entry: SimuleringMaanedligAlderspensjon,
	visKap19: boolean,
	visKap20: boolean,
	simulererMedGjenlevenderett: boolean
): BeregningTableRow[] {
	const skjermingstillegg = Math.round((entry.skjermingstillegg ?? 0) / 12)
	return [
		...(visKap19
			? [
					{
						label: 'Grunnpensjon (kap. 19)',
						value: Math.round((entry.grunnpensjonBeloep ?? 0) / 12),
					},
					{
						label: 'Tilleggspensjon (kap. 19)',
						value: Math.round((entry.tilleggspensjonBeloep ?? 0) / 12),
					},
					{
						label: 'Pensjonstillegg (kap. 19)',
						value: Math.round((entry.pensjonstillegg ?? 0) / 12),
					},
					{
						label: 'Gjenlevendetillegg (kap. 19)',
						value: Math.round((entry.gjenlevendetillegg ?? 0) / 12),
						hide: !simulererMedGjenlevenderett,
					},
				]
			: []),
		...(visKap20
			? [
					{
						label: 'Inntektspensjon (kap. 20)',
						value: Math.round((entry.inntektspensjonBeloep ?? 0) / 12),
					},
					{
						label: 'Garantipensjon (kap. 20)',
						value: Math.round((entry.garantipensjonBeloep ?? 0) / 12),
					},
				]
			: []),
		{
			label: 'Skjermingstillegg',
			value: skjermingstillegg,
			hide: skjermingstillegg <= 0,
		},
	]
}

export function mapOpptjeningEtterKapittel19ToRows(
	opptjening: SimuleringMaanedligAlderspensjon,
	grunnbeloep?: number
): BeregningDetailRow[] {
	return [
		{
			label: 'Andelsbrøk',
			value: formatNumber((opptjening.kapittel19Andel || 0) * 10) + '/10',
		},
		{
			label: 'Grunnbeløp (G)',
			value: formatKr(grunnbeloep),
		},
		{
			label: 'Minste pensjonsbeløp',
			value: formatKr(279933),
		},
		{
			label: 'Forholdstall ved uttak',
			value: formatNumber(opptjening.forholdstall ?? 0),
		},
		{
			label: 'Sluttpoengtall',
			value: formatNumber(opptjening.sluttpoengtall),
		},
		{
			label: 'Trygdetid',
			value: formatAar(opptjening.kapittel19Trygdetid),
		},
		{
			label: 'Poengår',
			value:
				formatNumber(
					(opptjening.poengaarFom1992 || 0) + (opptjening.poengaarTom1991 || 0)
				) + ' år',
		},
		{
			label: 'Poengår før 1992 (45 %)',
			value: formatNumber(opptjening.poengaarTom1991 || 0) + ' år',
		},
		{
			label: 'Poengår etter 1991 (42 %)',
			value: formatNumber(opptjening.poengaarFom1992 || 0) + ' år',
		},
	]
}

export function mapOpptjeningEtterKapittel20ToRows(
	opptjening: SimuleringMaanedligAlderspensjon
): BeregningDetailRow[] {
	return [
		{
			label: 'Andelsbrøk',
			value: formatNumber((opptjening.kapittel20Andel || 0) * 10) + '/10',
		},
		{
			label: 'Delingstall ved uttak',
			value: formatNumber(opptjening.delingstall),
		},
		{
			label: 'Garantipensjon',
			value: formatKr(opptjening.garantipensjonBeloep),
		},
		{
			label: 'Pensjonsbeholdning før uttak',
			value: formatKr(opptjening.pensjonsbeholdningFoerUttakBeloep),
		},
		{
			label: 'Pensjonsbeholdning etter uttak',
			value: formatKr(opptjening.pensjonsbeholdningEtterUttakBeloep ?? 0 / 2),
		},
		{
			label: 'Trygdetid',
			value: formatAar(opptjening.kapittel20Trygdetid),
		},
	]
}

export function mapPrivatAfp(
	entry?: SimuleringAfpPrivat,
	visKronetillegg = true
): BeregningTableRow[] {
	const kompensasjonstillegg = entry?.kompensasjonstillegg ?? 0
	return [
		{
			label: 'Kompensasjonstillegg',
			value: kompensasjonstillegg,
			hide: kompensasjonstillegg <= 0,
		},
		{
			label: 'Kronetillegg',
			value: visKronetillegg ? (entry?.kronetillegg ?? 0) : -1,
		},
		{
			label: 'Livsvarig del',
			value: entry?.livsvarig ?? 0,
		},
	]
}

export function formatAlderTitle(aar: number, md: number): string {
	const alderText =
		md > 0
			? `${aar} år og ${md} ${md !== 1 ? 'måneder' : 'måned'}`
			: `${aar} år`
	return `Pensjon ved ${alderText}`
}

export function formatAfpTitle(aar: number, md: number): string {
	const alderText =
		md > 0
			? `${aar} år og ${md} ${md !== 1 ? 'måneder' : 'måned'}`
			: `${aar} år`
	return `AFP ved ${alderText}`
}

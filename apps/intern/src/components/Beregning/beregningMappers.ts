import type { AlderspensjonPensjonsberegning } from '@pensjonskalkulator-frontend-monorepo/types'

import type { BeregningTableRow } from './BeregningTable'

export function mapAlderspensjonToRows(
	entry: AlderspensjonPensjonsberegning
): BeregningTableRow[] {
	return [
		{
			label: 'Grunnpensjon (kap. 19)',
			value: Math.round((entry.grunnpensjon ?? 0) / 12),
		},
		{
			label: 'Tilleggspensjon (kap. 19)',
			value: Math.round((entry.tilleggspensjon ?? 0) / 12),
		},
		{
			label: 'Pensjonstillegg (kap. 19)',
			value: Math.round((entry.pensjonstillegg ?? 0) / 12),
		},
		{
			label: 'Gjenlevendetillegg (kap. 19)',
			value: Math.round((entry.kapittel19Gjenlevendetillegg ?? 0) / 12),
		},
		{
			label: 'Inntektspensjon (kap. 20)',
			value: Math.round((entry.inntektspensjonBeloep ?? 0) / 12),
		},
		{
			label: 'Garantipensjon (kap. 20)',
			value: Math.round((entry.garantipensjonBeloep ?? 0) / 12),
		},
		{
			label: 'Skjermingstillegg',
			value: Math.round((entry.skjermingstillegg ?? 0) / 12),
		},
	]
}

export function mapOpptjeningEtterKapittel19ToRows(
	opptjening: AlderspensjonPensjonsberegning,
	grunnbeloep?: number
): BeregningTableRow[] {
	return [
		{
			label: 'Andelsbrøk',
			value: opptjening.andelsbroekKap19,
		},
		{
			label: 'Grunnbeløp (G)',
			value: grunnbeloep,
			unit: 'kr',
		},
		{
			label: 'Minste pensjonsbeløp',
			value: 279933,
			unit: 'kr',
		},
		{
			label: 'Forholdstall ved uttak',
			value: opptjening.forholdstall,
		},
		{
			label: 'Sluttpoengtall',
			value: opptjening.sluttpoengtall,
		},
		{
			label: 'Trygdetid',
			value: opptjening.trygdetidKap19,
			unit: 'år',
		},
		{
			label: 'Poengår før 1992 (45 %)',
			value: opptjening.poengaarFoer92,
		},
		{
			label: 'Poengår etter 1991 (42 %)',
			value: opptjening.poengaarEtter91,
		},
		{
			label: 'Basispensjon',
			value: 183665,
			unit: 'kr',
		},
		{
			label: 'Restpensjon',
			value: 183665,
			unit: 'kr',
		},
	]
}

export function mapOpptjeningEtterKapittel20ToRows(
	opptjening: AlderspensjonPensjonsberegning
): BeregningTableRow[] {
	return [
		{
			label: 'Andelsbrøk',
			value: opptjening.andelsbroekKap20,
		},
		{
			label: 'Delingstall ved uttak',
			value: opptjening.delingstall,
		},
		{
			label: 'Garantipensjon',
			value: opptjening.garantipensjonBeloep,
			unit: 'kr',
		},
		{
			label: 'Garantitillegg',
			value: 54453,
			unit: 'kr',
		},
		{
			label: 'Pensjonsbeholdning før uttak',
			value: opptjening.pensjonBeholdningFoerUttakBeloep,
			unit: 'kr',
		},
		{
			label: 'Pensjonsbeholdning etter uttak',
			value: opptjening.pensjonBeholdningFoerUttakBeloep ?? 0 / 2,
			unit: 'kr',
		},
		{
			label: 'Trygdetid',
			value: opptjening.trygdetidKap20,
			unit: 'år',
		},
	]
}

export function mapPrivatAfp(
	entry?: AfpPrivatPensjonsberegning
): BeregningTableRow[] {
	return [
		{
			label: 'Kompensasjonstillegg',
			value: entry?.kompensasjonstillegg ?? 0,
		},
		{
			label: 'Kronetillegg',
			value: entry?.kronetillegg ?? 0,
		},
		{
			label: 'Livsvarig del',
			value: entry?.livsvarig ?? 0,
		},
	]
}

export function formatAlderTitle(
	aar: number,
	md: number,
	uttaksgrad: number | string
): string {
	const alderText = md > 0 ? `${aar} år og ${md} måneder` : `${aar} år`
	return `${uttaksgrad} % alderspensjon ved ${alderText}`
}

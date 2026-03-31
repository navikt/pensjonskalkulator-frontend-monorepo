import landListData from '@pensjonskalkulator-frontend-monorepo/utils/land-list'

import type {
	LandDetails,
	OppholdDateFields,
	OppholdField,
	OppholdLabelFields,
	OppholdValues,
} from './types'

export const emptyOpphold: OppholdValues = {
	land: '',
	arbeidetUtenlands: null,
	startdato: '',
	sluttdato: '',
	brukFoedselsdato: false,
}

export const landList = landListData as LandDetails[]

export const getLandDetails = (landkode: string) =>
	landList.find((l) => l.landkode === landkode)

export const isAvtaleland = (landkode: string) =>
	getLandDetails(landkode)?.kravOmArbeid === true

export const getOppholdFieldName = <T extends OppholdField>(
	index: number,
	field: T
) => `utenlandsOpphold.${index}.${field}` as const

export const getOppholdLabels = (opphold: OppholdLabelFields) => {
	const labels: string[] = []

	if (opphold.arbeidetUtenlands === true) {
		labels.push('Jobbet')
	}

	if (opphold.startdato && !opphold.sluttdato) {
		labels.push('Varig opphold')
	}

	return labels
}

export const getOppholdDateText = (opphold: OppholdDateFields) => {
	if (opphold.startdato && opphold.sluttdato) {
		return `${opphold.startdato}-${opphold.sluttdato}`
	}

	return opphold.startdato
}

export const getOppholdSummaryText = (opphold: OppholdLabelFields) => {
	const dateText = getOppholdDateText(opphold)
	const labelText = getOppholdLabels(opphold)
		.map((label) => `(${label})`)
		.join(' ')
	const summaryText = [dateText, labelText].filter(Boolean).join(' ')

	return summaryText ? ` ${summaryText}` : ''
}

export const getOppholdCopyText = (oppholdList: OppholdValues[]) =>
	oppholdList
		.map((opphold) => {
			const landDetails = getLandDetails(opphold.land)
			const datotekst =
				opphold.startdato && opphold.sluttdato
					? `${opphold.startdato}-${opphold.sluttdato}`
					: opphold.startdato
						? `${opphold.startdato} (Varig opphold)`
						: ''
			const arbeidstekst =
				opphold.arbeidetUtenlands === null
					? ''
					: opphold.arbeidetUtenlands
						? ' (Jobbet)'
						: ' (Jobbet ikke)'

			return [
				landDetails?.navn ?? opphold.land,
				`${datotekst}${arbeidstekst}`.trim(),
			]
				.filter(Boolean)
				.join('\n')
		})
		.join('\n\n')

export const hasRequiredOppholdValues = ({
	currentLand,
	startdato,
	arbeidetUtenlands,
}: {
	currentLand: string
	startdato: string
	arbeidetUtenlands: boolean | null
}) =>
	Boolean(
		currentLand &&
		startdato &&
		(!isAvtaleland(currentLand) || arbeidetUtenlands !== null)
	)

export const formatFoedselsdato = (value?: string) => {
	if (!value) return ''
	const isoDate = value.split('T')[0]
	const [year, month, day] = isoDate.split('-')
	if (!year || !month || !day) return ''
	return `${day}.${month}.${year}`
}

import type { UtenlandsOppholdItem } from '../../api/beregningTypes'

export type LandDetails = {
	landkode: string
	navn: string
	kravOmArbeid?: boolean
}

export type OppholdValues = UtenlandsOppholdItem

export type OppholdField = keyof OppholdValues

export type OppholdDateFields = Pick<OppholdValues, 'fom' | 'tom'>

export type OppholdLabelFields = Pick<
	OppholdValues,
	'arbeidetUtenlands' | 'fom' | 'tom'
>

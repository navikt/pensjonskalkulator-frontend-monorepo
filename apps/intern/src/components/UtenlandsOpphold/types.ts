export type LandDetails = {
	landkode: string
	navn: string
	kravOmArbeid?: boolean
}

export type OppholdValues = {
	land: string
	arbeidetUtenlands: boolean | null
	startdato: string
	sluttdato: string
	brukFoedselsdato: boolean
}

export type OppholdField = keyof OppholdValues

export type OppholdDateFields = Pick<OppholdValues, 'startdato' | 'sluttdato'>

export type OppholdLabelFields = Pick<
	OppholdValues,
	'arbeidetUtenlands' | 'startdato' | 'sluttdato'
>

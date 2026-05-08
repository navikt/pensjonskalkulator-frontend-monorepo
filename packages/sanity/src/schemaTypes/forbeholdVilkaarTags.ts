// Kun tags som er faktisk koblet til reell brukerkontekst i intern-appen
// eksponeres her. Tags for AFP offentlig/gammel, gjenlevenderett-vedtak,
// omstillingsstønad-vedtak, pensjonsavtale-samtykke og offentlig
// tjenestepensjon legges til når dataene blir tilgjengelige i intern.
export const FORBEHOLD_VILKAAR_TAGS = [
	{ value: 'harUfoeretrygd', title: 'Har uføretrygd' },
	{ value: 'graderUfoeretrygd', title: 'Har gradert uføretrygd' },
	{ value: 'har100Ufoeretrygd', title: 'Har 100 % uføretrygd' },
	{ value: 'beregnerAfpPrivat', title: 'Beregner AFP privat' },
	{
		value: 'beregnerAfpUavhengigAvAarskull',
		title: 'Beregner AFP (offentlig eller privat) – uavhengig av årskull',
	},
	{
		value: 'beregnerMedGjenlevenderett',
		title: 'Beregner alderspensjon med gjenlevenderett',
	},
	{ value: 'foedtFoer1963', title: 'Født før 1963' },
	{
		value: 'foedtEtter1963',
		title: 'Født 1963 eller senere (ekskl. overgangskull)',
	},
	{ value: 'erOvergangskull', title: 'Tilhører overgangskull (1954–1962)' },
] as const

export type ForbeholdVilkaarTag =
	(typeof FORBEHOLD_VILKAAR_TAGS)[number]['value']

export interface ForbeholdBetingelse {
	tag: ForbeholdVilkaarTag
	negert?: boolean
}

export type ForbeholdVilkaar = Array<{
	betingelser?: ForbeholdBetingelse[]
}>

export type ForbeholdContext = Partial<Record<ForbeholdVilkaarTag, boolean>>

export const FORBEHOLD_VILKAAR_TAGS = [
	{ value: 'harUfoeretrygd', title: 'Har uføretrygd' },
	{ value: 'graderUfoeretrygd', title: 'Har gradert uføretrygd' },
	{ value: 'har100Ufoeretrygd', title: 'Har 100 % uføretrygd' },
	{ value: 'beregnerAfpPrivat', title: 'Beregner AFP privat' },
	{ value: 'beregnerAfpOffentlig', title: 'Beregner AFP offentlig' },
	{ value: 'beregnerGammelAfp', title: 'Beregner gammel AFP offentlig' },
	{
		value: 'beregnerAfpUavhengigAvAarskull',
		title: 'Beregner AFP (offentlig eller privat) – uavhengig av årskull',
	},
	{ value: 'harPrivatAfpVedtak', title: 'Har vedtak om AFP privat' },
	{
		value: 'harTidsbegrensetOffentligAfpVedtak',
		title: 'Har vedtak om tidsbegrenset AFP offentlig',
	},
	{
		value: 'beregnerMedGjenlevenderett',
		title: 'Beregner alderspensjon med gjenlevenderett',
	},
	{
		value: 'harGjenlevendeEllerOmstillingsstoenad',
		title: 'Har løpende gjenlevendepensjon eller omstillingsstønad',
	},
	{ value: 'harUtenlandsopphold', title: 'Har opphold utenfor Norge' },
	{
		value: 'harFremtidigUtenlandsopphold',
		title: 'Har fremtidig opphold utenfor Norge',
	},
	{ value: 'erGift', title: 'Er gift' },
	{ value: 'erSamboer', title: 'Er samboer' },
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

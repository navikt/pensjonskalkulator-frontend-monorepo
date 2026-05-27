import type {
	SimuleringMaanedligAlderspensjon,
	components,
} from '@pensjonskalkulator-frontend-monorepo/types'

import { mapAndelToTeller } from './mapAndelToTeller'

type LagreMaanedligAlderspensjonDto =
	components['schemas']['LagreMaanedligAlderspensjonDto']

type Kull = 'KAP19' | 'KAP20' | 'OVERGANG'

export function mapLagreMaanedligAlderspensjon(
	maanedligAlderspensjon: SimuleringMaanedligAlderspensjon,
	grunnbeloep?: number | null,
	kull?: Kull | null
): LagreMaanedligAlderspensjonDto
export function mapLagreMaanedligAlderspensjon(
	maanedligAlderspensjon: SimuleringMaanedligAlderspensjon | null | undefined,
	grunnbeloep?: number | null,
	kull?: Kull | null
): LagreMaanedligAlderspensjonDto | null
export function mapLagreMaanedligAlderspensjon(
	maanedligAlderspensjon: SimuleringMaanedligAlderspensjon | null | undefined,
	grunnbeloep?: number | null,
	kull?: Kull | null
): LagreMaanedligAlderspensjonDto | null {
	if (!maanedligAlderspensjon) {
		return null
	}

	const visKap19 = kull !== 'KAP20'
	const visKap20 = kull !== 'KAP19'

	return {
		beloep: maanedligAlderspensjon.beloep,
		inntektspensjonBeloep: visKap20
			? (maanedligAlderspensjon.inntektspensjonBeloep ?? null)
			: null,
		delingstall: visKap20 ? (maanedligAlderspensjon.delingstall ?? null) : null,
		pensjonsbeholdningFoerUttakBeloep: visKap20
			? (maanedligAlderspensjon.pensjonsbeholdningFoerUttakBeloep ?? null)
			: null,
		pensjonsbeholdningEtterUttakBeloep: visKap20
			? (maanedligAlderspensjon.pensjonsbeholdningEtterUttakBeloep ?? null)
			: null,
		sluttpoengtall: visKap19
			? (maanedligAlderspensjon.sluttpoengtall ?? null)
			: null,
		poengaarTom1991: visKap19
			? (maanedligAlderspensjon.poengaarTom1991 ?? null)
			: null,
		poengaarFom1992: visKap19
			? (maanedligAlderspensjon.poengaarFom1992 ?? null)
			: null,
		forholdstall: visKap19
			? (maanedligAlderspensjon.forholdstall ?? null)
			: null,
		grunnpensjonBeloep: visKap19
			? (maanedligAlderspensjon.grunnpensjonBeloep ?? null)
			: null,
		tilleggspensjonBeloep: visKap19
			? (maanedligAlderspensjon.tilleggspensjonBeloep ?? null)
			: null,
		pensjonstillegg: visKap19
			? (maanedligAlderspensjon.pensjonstillegg ?? null)
			: null,
		skjermingstillegg: maanedligAlderspensjon.skjermingstillegg ?? null,
		kapittel19AndelTeller: visKap19
			? mapAndelToTeller(maanedligAlderspensjon.kapittel19Andel)
			: null,
		kapittel19Trygdetid: visKap19
			? (maanedligAlderspensjon.kapittel19Trygdetid ?? null)
			: null,
		basispensjonBeloep: visKap19
			? (maanedligAlderspensjon.basispensjonBeloep ?? null)
			: null,
		restpensjonBeloep: visKap19
			? (maanedligAlderspensjon.restpensjonBeloep ?? null)
			: null,
		gjenlevendetillegg: visKap19
			? (maanedligAlderspensjon.gjenlevendetillegg ?? null)
			: null,
		minstePensjonsnivaaSats: visKap19
			? (maanedligAlderspensjon.minstePensjonsnivaaSats ?? null)
			: null,
		minstePensjonsnivaaBeloep: visKap19
			? maanedligAlderspensjon.minstePensjonsnivaaSats
			: null,
		kapittel20AndelTeller: visKap20
			? mapAndelToTeller(maanedligAlderspensjon.kapittel20Andel)
			: null,
		kapittel20Trygdetid: visKap20
			? (maanedligAlderspensjon.kapittel20Trygdetid ?? null)
			: null,
		garantipensjonBeloep: visKap20
			? (maanedligAlderspensjon.garantipensjonBeloep ?? null)
			: null,
		garantipensjonsnivaaBeloep: null,
		garantipensjonSats: visKap20
			? (maanedligAlderspensjon.garantipensjonSats ?? null)
			: null,
		garantitilleggBeloep: visKap20
			? (maanedligAlderspensjon.garantitilleggBeloep ?? null)
			: null,
		grunnbeloep: grunnbeloep ?? null,
	}
}

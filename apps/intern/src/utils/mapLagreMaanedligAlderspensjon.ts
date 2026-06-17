import type {
	LagreMaanedligAlderspensjonDto,
	SimuleringMaanedligAlderspensjon,
} from '@pensjonskalkulator-frontend-monorepo/types'

import { mapAndelToTeller } from './mapAndelToTeller'

export function mapLagreMaanedligAlderspensjon(
	maanedligAlderspensjon: SimuleringMaanedligAlderspensjon | null | undefined,
	grunnbeloep?: number | null,
	kull?: Kull | null
): LagreMaanedligAlderspensjonDto | null {
	if (!maanedligAlderspensjon) {
		return null
	}

	const common = {
		beloep: maanedligAlderspensjon.beloep,
		skjermingstillegg: maanedligAlderspensjon.skjermingstillegg,
		garantipensjonsnivaaBeloep: null,
		grunnbeloep: grunnbeloep,
	}

	if (kull === 'KAP19') {
		return {
			...common,
			sluttpoengtall: maanedligAlderspensjon.sluttpoengtall,
			poengaarTom1991: maanedligAlderspensjon.poengaarTom1991,
			poengaarFom1992: maanedligAlderspensjon.poengaarFom1992,
			forholdstall: maanedligAlderspensjon.forholdstall,
			grunnpensjonBeloep: maanedligAlderspensjon.grunnpensjonBeloep,
			tilleggspensjonBeloep: maanedligAlderspensjon.tilleggspensjonBeloep,
			pensjonstillegg: maanedligAlderspensjon.pensjonstillegg,
			kapittel19AndelTeller: mapAndelToTeller(
				maanedligAlderspensjon.kapittel19Andel
			),
			kapittel19Trygdetid: maanedligAlderspensjon.kapittel19Trygdetid,
			basispensjonBeloep: maanedligAlderspensjon.basispensjonBeloep,
			restpensjonBeloep: maanedligAlderspensjon.restpensjonBeloep,
			gjenlevendetillegg: maanedligAlderspensjon.gjenlevendetillegg,
			minstePensjonsnivaaSats: maanedligAlderspensjon.minstePensjonsnivaaSats,
			minstePensjonsnivaaBeloep: maanedligAlderspensjon.minstePensjonsnivaaSats,
		}
	}

	if (kull === 'KAP20') {
		return {
			...common,
			inntektspensjonBeloep: maanedligAlderspensjon.inntektspensjonBeloep,
			delingstall: maanedligAlderspensjon.delingstall,
			pensjonsbeholdningFoerUttakBeloep:
				maanedligAlderspensjon.pensjonsbeholdningFoerUttakBeloep,
			pensjonsbeholdningEtterUttakBeloep:
				maanedligAlderspensjon.pensjonsbeholdningEtterUttakBeloep,
			kapittel20AndelTeller: mapAndelToTeller(
				maanedligAlderspensjon.kapittel20Andel
			),
			kapittel20Trygdetid: maanedligAlderspensjon.kapittel20Trygdetid,
			garantipensjonBeloep: maanedligAlderspensjon.garantipensjonBeloep,
			garantipensjonSats: maanedligAlderspensjon.garantipensjonSats,
			garantitilleggBeloep: maanedligAlderspensjon.garantitilleggBeloep,
		}
	}

	const { kapittel19Andel, kapittel20Andel, ...rest } = maanedligAlderspensjon

	return {
		...rest,
		garantipensjonsnivaaBeloep: null,
		grunnbeloep: grunnbeloep,
		kapittel19AndelTeller: mapAndelToTeller(kapittel19Andel),
		kapittel20AndelTeller: mapAndelToTeller(kapittel20Andel),
		minstePensjonsnivaaBeloep: maanedligAlderspensjon.minstePensjonsnivaaSats,
	}
}

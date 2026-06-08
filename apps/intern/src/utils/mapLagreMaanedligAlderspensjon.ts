import type {
	SimuleringMaanedligAlderspensjon,
	components,
} from '@pensjonskalkulator-frontend-monorepo/types'

import { mapAndelToTeller } from './mapAndelToTeller'

type LagreMaanedligAlderspensjonDto =
	components['schemas']['LagreMaanedligAlderspensjonDto']

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
		skjermingstillegg: maanedligAlderspensjon.skjermingstillegg ?? null,
		garantipensjonsnivaaBeloep: null,
		grunnbeloep: grunnbeloep ?? null,
	}

	if (kull === 'KAP19') {
		return {
			...common,
			inntektspensjonBeloep: null,
			delingstall: null,
			pensjonsbeholdningFoerUttakBeloep: null,
			pensjonsbeholdningEtterUttakBeloep: null,
			sluttpoengtall: maanedligAlderspensjon.sluttpoengtall ?? null,
			poengaarTom1991: maanedligAlderspensjon.poengaarTom1991 ?? null,
			poengaarFom1992: maanedligAlderspensjon.poengaarFom1992 ?? null,
			forholdstall: maanedligAlderspensjon.forholdstall ?? null,
			grunnpensjonBeloep: maanedligAlderspensjon.grunnpensjonBeloep ?? null,
			tilleggspensjonBeloep:
				maanedligAlderspensjon.tilleggspensjonBeloep ?? null,
			pensjonstillegg: maanedligAlderspensjon.pensjonstillegg ?? null,
			kapittel19AndelTeller: mapAndelToTeller(
				maanedligAlderspensjon.kapittel19Andel
			),
			kapittel19Trygdetid: maanedligAlderspensjon.kapittel19Trygdetid ?? null,
			basispensjonBeloep: maanedligAlderspensjon.basispensjonBeloep ?? null,
			restpensjonBeloep: maanedligAlderspensjon.restpensjonBeloep ?? null,
			gjenlevendetillegg: maanedligAlderspensjon.gjenlevendetillegg ?? null,
			minstePensjonsnivaaSats:
				maanedligAlderspensjon.minstePensjonsnivaaSats ?? null,
			minstePensjonsnivaaBeloep: maanedligAlderspensjon.minstePensjonsnivaaSats,
			kapittel20AndelTeller: null,
			kapittel20Trygdetid: null,
			garantipensjonBeloep: null,
			garantipensjonSats: null,
			garantitilleggBeloep: null,
		}
	}

	if (kull === 'KAP20') {
		return {
			...common,
			inntektspensjonBeloep:
				maanedligAlderspensjon.inntektspensjonBeloep ?? null,
			delingstall: maanedligAlderspensjon.delingstall ?? null,
			pensjonsbeholdningFoerUttakBeloep:
				maanedligAlderspensjon.pensjonsbeholdningFoerUttakBeloep ?? null,
			pensjonsbeholdningEtterUttakBeloep:
				maanedligAlderspensjon.pensjonsbeholdningEtterUttakBeloep ?? null,
			sluttpoengtall: null,
			poengaarTom1991: null,
			poengaarFom1992: null,
			forholdstall: null,
			grunnpensjonBeloep: null,
			tilleggspensjonBeloep: null,
			pensjonstillegg: null,
			kapittel19AndelTeller: null,
			kapittel19Trygdetid: null,
			basispensjonBeloep: null,
			restpensjonBeloep: null,
			gjenlevendetillegg: null,
			minstePensjonsnivaaSats: null,
			minstePensjonsnivaaBeloep: null,
			kapittel20AndelTeller: mapAndelToTeller(
				maanedligAlderspensjon.kapittel20Andel
			),
			kapittel20Trygdetid: maanedligAlderspensjon.kapittel20Trygdetid ?? null,
			garantipensjonBeloep: maanedligAlderspensjon.garantipensjonBeloep ?? null,
			garantipensjonSats: maanedligAlderspensjon.garantipensjonSats ?? null,
			garantitilleggBeloep: maanedligAlderspensjon.garantitilleggBeloep ?? null,
		}
	}

	return {
		...common,
		inntektspensjonBeloep: maanedligAlderspensjon.inntektspensjonBeloep ?? null,
		delingstall: maanedligAlderspensjon.delingstall ?? null,
		pensjonsbeholdningFoerUttakBeloep:
			maanedligAlderspensjon.pensjonsbeholdningFoerUttakBeloep ?? null,
		pensjonsbeholdningEtterUttakBeloep:
			maanedligAlderspensjon.pensjonsbeholdningEtterUttakBeloep ?? null,
		sluttpoengtall: maanedligAlderspensjon.sluttpoengtall ?? null,
		poengaarTom1991: maanedligAlderspensjon.poengaarTom1991 ?? null,
		poengaarFom1992: maanedligAlderspensjon.poengaarFom1992 ?? null,
		forholdstall: maanedligAlderspensjon.forholdstall ?? null,
		grunnpensjonBeloep: maanedligAlderspensjon.grunnpensjonBeloep ?? null,
		tilleggspensjonBeloep: maanedligAlderspensjon.tilleggspensjonBeloep ?? null,
		pensjonstillegg: maanedligAlderspensjon.pensjonstillegg ?? null,
		kapittel19AndelTeller: mapAndelToTeller(
			maanedligAlderspensjon.kapittel19Andel
		),
		kapittel19Trygdetid: maanedligAlderspensjon.kapittel19Trygdetid ?? null,
		basispensjonBeloep: maanedligAlderspensjon.basispensjonBeloep ?? null,
		restpensjonBeloep: maanedligAlderspensjon.restpensjonBeloep ?? null,
		gjenlevendetillegg: maanedligAlderspensjon.gjenlevendetillegg ?? null,
		minstePensjonsnivaaSats:
			maanedligAlderspensjon.minstePensjonsnivaaSats ?? null,
		minstePensjonsnivaaBeloep: maanedligAlderspensjon.minstePensjonsnivaaSats,
		kapittel20AndelTeller: mapAndelToTeller(
			maanedligAlderspensjon.kapittel20Andel
		),
		kapittel20Trygdetid: maanedligAlderspensjon.kapittel20Trygdetid ?? null,
		garantipensjonBeloep: maanedligAlderspensjon.garantipensjonBeloep ?? null,
		garantipensjonSats: maanedligAlderspensjon.garantipensjonSats ?? null,
		garantitilleggBeloep: maanedligAlderspensjon.garantitilleggBeloep ?? null,
	}
}

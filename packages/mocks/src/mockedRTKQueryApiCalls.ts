import type { LoependeVedtak, Person, Sivilstand } from './types'

export const personMock = {
	navn: 'Aprikos Nordmann',
	fornavn: 'Aprikos',
	sivilstand: 'UGIFT' as Sivilstand,
	foedselsdato: '1963-04-30',
	pensjoneringAldre: {
		normertPensjoneringsalder: {
			aar: 67,
			maaneder: 0,
		},
		nedreAldersgrense: {
			aar: 62,
			maaneder: 0,
		},
		oevreAldersgrense: {
			aar: 75,
			maaneder: 0,
		},
	},
} satisfies Person

export const pre1963PersonMock = {
	navn: 'Aprikos Nordmann',
	fornavn: 'Aprikos',
	sivilstand: 'UGIFT' as Sivilstand,
	foedselsdato: '1960-04-30',
	pensjoneringAldre: {
		normertPensjoneringsalder: {
			aar: 67,
			maaneder: 0,
		},
		nedreAldersgrense: {
			aar: 62,
			maaneder: 0,
		},
		oevreAldersgrense: {
			aar: 75,
			maaneder: 0,
		},
	},
} satisfies Person

export const personEldreEnnAfpUfoereOppsigelsesalderMock = {
	navn: 'Aprikos Nordmann',
	fornavn: 'Aprikos',
	sivilstand: 'UGIFT' as Sivilstand,
	foedselsdato: '1963-01-30',
	pensjoneringAldre: {
		normertPensjoneringsalder: {
			aar: 67,
			maaneder: 0,
		},
		nedreAldersgrense: {
			aar: 62,
			maaneder: 0,
		},
		oevreAldersgrense: {
			aar: 75,
			maaneder: 0,
		},
	},
} satisfies Person

export const personYngreEnnAfpUfoereOppsigelsesalderMock = {
	navn: 'Aprikos Nordmann',
	fornavn: 'Aprikos',
	sivilstand: 'UGIFT' as Sivilstand,
	foedselsdato: '1990-01-30',
	pensjoneringAldre: {
		normertPensjoneringsalder: {
			aar: 67,
			maaneder: 0,
		},
		nedreAldersgrense: {
			aar: 62,
			maaneder: 0,
		},
		oevreAldersgrense: {
			aar: 75,
			maaneder: 0,
		},
	},
} satisfies Person

export const personMedOekteAldersgrenseMock = {
	navn: 'Aprikos Nordmann',
	fornavn: 'Aprikos',
	sivilstand: 'UGIFT' as Sivilstand,
	foedselsdato: '1963-04-30',
	pensjoneringAldre: {
		normertPensjoneringsalder: {
			aar: 70,
			maaneder: 0,
		},
		nedreAldersgrense: {
			aar: 65,
			maaneder: 0,
		},
		oevreAldersgrense: {
			aar: 75,
			maaneder: 0,
		},
	},
} satisfies Person

export const grunnbeloepMock = 100000

export const personMedSamboerMock = {
	navn: 'Aprikos Nordmann',
	fornavn: 'Aprikos',
	sivilstand: 'GIFT' as Sivilstand,
	foedselsdato: '1963-04-30',
	pensjoneringAldre: {
		normertPensjoneringsalder: {
			aar: 67,
			maaneder: 0,
		},
		nedreAldersgrense: {
			aar: 62,
			maaneder: 0,
		},
		oevreAldersgrense: {
			aar: 75,
			maaneder: 0,
		},
	},
} satisfies Person

export const inntektMock = {
	beloep: 521338,
	aar: 2021,
}

export const ekskludertStatusMock = { ekskludert: false, aarsak: 'NONE' }

export const erApotekerMock = false

export const omstillingsstoenadOgGjenlevendeUtenSakMock = {
	harLoependeSak: false,
}

export const omstillingsstoenadOgGjenlevendeMock = {
	harLoependeSak: true,
}

export const loependeVedtak0UfoeregradMock: LoependeVedtak = {
	harLoependeVedtak: false,
	ufoeretrygd: {
		grad: 0,
	},
}

export const loependeVedtak100UfoeregradMock: LoependeVedtak = {
	harLoependeVedtak: true,
	ufoeretrygd: {
		grad: 100,
	},
}

export const loependeVedtak75UfoeregradMock: LoependeVedtak = {
	harLoependeVedtak: true,
	ufoeretrygd: {
		grad: 75,
	},
}

export const loependeVedtakLoependeAlderspensjonMock: LoependeVedtak = {
	harLoependeVedtak: true,
	alderspensjon: {
		grad: 100,
		uttaksgradFom: '2020-10-02',
		fom: '2020-10-02',
		sivilstand: 'UGIFT',
	},
	ufoeretrygd: {
		grad: 0,
	},
}

export const loependeVedtakLoependeAlderspensjonMedSisteUtbetalingMock: LoependeVedtak =
	{
		harLoependeVedtak: true,
		alderspensjon: {
			grad: 100,
			uttaksgradFom: '2020-10-02',
			fom: '2020-10-02',
			sisteUtbetaling: {
				beloep: 34000,
				utbetalingsdato: '2024-10-12',
			},
			sivilstand: 'UGIFT',
		},
		ufoeretrygd: {
			grad: 0,
		},
	}

export const loependeVedtakLoepende50AlderspensjonMock: LoependeVedtak = {
	harLoependeVedtak: true,
	alderspensjon: {
		grad: 50,
		uttaksgradFom: '2020-10-02',
		fom: '2020-10-02',
		sivilstand: 'UGIFT',
	},
	ufoeretrygd: {
		grad: 0,
	},
}

export const loependeVedtakLoependeAlderspensjonOg40UfoeretrygdMock: LoependeVedtak =
	{
		harLoependeVedtak: true,
		alderspensjon: {
			grad: 100,
			uttaksgradFom: '2020-10-02',
			fom: '2020-10-02',
			sivilstand: 'UGIFT',
		},
		ufoeretrygd: {
			grad: 40,
		},
	}

export const loependeVedtakLoependeAFPprivatMock: LoependeVedtak = {
	harLoependeVedtak: true,
	alderspensjon: {
		grad: 0,
		uttaksgradFom: '2020-10-02',
		fom: '2020-10-02',
		sivilstand: 'UGIFT',
	},
	ufoeretrygd: {
		grad: 0,
	},
	afpPrivat: {
		fom: '2020-10-02',
	},
}

export const loependeVedtakLoependeAFPoffentligMock: LoependeVedtak = {
	harLoependeVedtak: true,
	ufoeretrygd: {
		grad: 0,
	},
	afpOffentlig: {
		fom: '2020-10-02',
	},
}

export const loependeVedtakPre2025OffentligAfpMock: LoependeVedtak = {
	harLoependeVedtak: true,
	ufoeretrygd: {
		grad: 0,
	},
	pre2025OffentligAfp: {
		fom: '2020-10-02',
	},
}

export const loependeVedtakLoepende0Alderspensjon100UfoeretrygdMock: LoependeVedtak =
	{
		harLoependeVedtak: true,
		alderspensjon: {
			grad: 0,
			uttaksgradFom: '2020-10-02',
			fom: '2020-10-02',
			sivilstand: 'UGIFT',
		},
		ufoeretrygd: {
			grad: 100,
		},
	}

export const loependeVedtakFremtidigMock: LoependeVedtak = {
	harLoependeVedtak: true,
	ufoeretrygd: {
		grad: 0,
	},
	fremtidigAlderspensjon: {
		grad: 100,
		fom: '2099-01-01',
	},
}

export const loependeVedtakFremtidigMedAlderspensjonMock: LoependeVedtak = {
	harLoependeVedtak: true,
	alderspensjon: {
		grad: 100,
		uttaksgradFom: '2020-10-02',
		fom: '2020-10-02',
		sivilstand: 'UGIFT',
	},
	ufoeretrygd: {
		grad: 0,
	},
	fremtidigAlderspensjon: {
		grad: 100,
		fom: '2099-01-01',
	},
}

export const simulerOffentligTpMock = {
	simuleringsresultatStatus: 'OK' as const,
	muligeTpLeverandoerListe: [
		'Statens pensjonskasse',
		'Kommunal Landspensjonskasse',
		'Oslo Pensjonsforsikring',
	],
}

export const pensjonsavtalerMock = {
	avtaler: [],
	partialResponse: false,
}

export const alderspensjonForLiteTrygdetidMock = {
	alderspensjon: [
		{
			alder: 75,
			beloep: 384120,
		},
		{
			alder: 76,
			beloep: 384440,
		},
		{
			alder: 77,
			beloep: 384492,
		},
	],
	vilkaarsproeving: {
		vilkaarErOppfylt: true,
	},
	harForLiteTrygdetid: true,
}

export const afpOffentligLivsvarigFalseMock = {
	afpStatus: false,
	maanedligBeloep: undefined,
	virkningFom: undefined,
	sistBenyttetGrunnbeloep: undefined,
}

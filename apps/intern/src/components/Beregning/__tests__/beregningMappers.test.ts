import type { SimuleringMaanedligAlderspensjon } from '@pensjonskalkulator-frontend-monorepo/types'
import { describe, expect, test } from 'vitest'

import { mapAfpToRows, mapAlderspensjonToRows } from '../beregningMappers'

const baseEntry: SimuleringMaanedligAlderspensjon = {
	beloep: 20000,
	grunnpensjonBeloep: 8000,
	tilleggspensjonBeloep: 10000,
	pensjonstillegg: 500,
	inntektspensjonBeloep: 12000,
	garantipensjonBeloep: 3000,
	garantitilleggBeloep: 0,
	skjermingstillegg: 0,
	gjenlevendetillegg: 0,
}

describe('mapAlderspensjonToRows – formler ved endring', () => {
	test('bruker standard formler når erEndring er false', () => {
		const rows = mapAlderspensjonToRows({
			entry: baseEntry,
			visKap19: true,
			visKap20: true,
			simulererMedGjenlevenderett: false,
			harGjenlevenderett: false,
			erEndring: false,
		})

		const gp = rows.find((r) => r.label.includes('Grunnpensjon'))
		expect(gp?.formula?.title).toBe('Grunnpensjon')
		expect(gp?.formula?.denominator).toBe('40 × Forholdstall')

		const tp = rows.find((r) => r.label.includes('Tilleggspensjon'))
		expect(tp?.formula?.title).toBe('Tilleggspensjon')
		expect(tp?.formula?.denominator).toBe('40 × Forholdstall')

		const ip = rows.find((r) => r.label.includes('Inntektspensjon'))
		expect(ip?.formula?.title).toBe('Inntektspensjon')
		expect(ip?.formula?.denominator).toBe('Delingstall')

		const gap = rows.find((r) => r.label.includes('Garantipensjon'))
		expect(gap?.formula?.title).toBe('Garantipensjon')
		expect(gap?.formula?.denominator).toBe('Delingstall')
	})

	test('bruker endring-formler når erEndring er true', () => {
		const rows = mapAlderspensjonToRows({
			entry: baseEntry,
			visKap19: true,
			visKap20: true,
			simulererMedGjenlevenderett: false,
			harGjenlevenderett: false,
			erEndring: true,
		})

		const gp = rows.find((r) => r.label.includes('Grunnpensjon'))
		expect(gp?.formula?.numerator).toEqual(
			expect.arrayContaining([
				expect.stringContaining('Grunnpensjon før endring'),
			])
		)
		expect(gp?.formula?.denominator).toBe('Forholdstall')

		const tp = rows.find((r) => r.label.includes('Tilleggspensjon'))
		expect(tp?.formula?.numerator).toEqual(
			expect.arrayContaining([
				expect.stringContaining('Tilleggspensjon før endring'),
			])
		)
		expect(tp?.formula?.denominator).toBe('Forholdstall')

		const ip = rows.find((r) => r.label.includes('Inntektspensjon'))
		expect(ip?.formula?.numerator).toEqual(
			expect.arrayContaining([
				expect.stringContaining('Inntektspensjon før endring'),
			])
		)
		expect(ip?.formula?.denominator).toBe('Delingstall')

		const gap = rows.find((r) => r.label.includes('Garantipensjon'))
		expect(gap?.formula?.numerator).toEqual(
			expect.arrayContaining([
				expect.stringContaining('Garantipensjon før endring'),
			])
		)
		expect(gap?.formula?.denominator).toBe('Delingstall')
	})
})

describe('mapAfpToRows – særtillegg-formel', () => {
	test('bruker ordinær særtillegg (94%) når epsHarPensjon er false', () => {
		const rows = mapAfpToRows({
			grunnpensjon: 8000,
			tilleggspensjon: 5000,
			afpTillegg: 1000,
			saertillegg: 2000,
			epsHarPensjon: false,
		})

		const saertillegg = rows.find((r) => r.label === 'Særtillegg')
		expect(saertillegg?.formula?.numerator).toEqual(['94% × Grunnbeløpet'])
	})

	test('bruker redusert særtillegg (74%) når epsHarPensjon er true', () => {
		const rows = mapAfpToRows({
			grunnpensjon: 8000,
			tilleggspensjon: 5000,
			afpTillegg: 1000,
			saertillegg: 2000,
			epsHarPensjon: true,
		})

		const saertillegg = rows.find((r) => r.label === 'Særtillegg')
		expect(saertillegg?.formula?.numerator).toEqual(['74% × Grunnbeløpet'])
	})

	test('bruker ordinær særtillegg når epsHarPensjon er null', () => {
		const rows = mapAfpToRows({
			grunnpensjon: 8000,
			tilleggspensjon: 5000,
			afpTillegg: 1000,
			saertillegg: 2000,
			epsHarPensjon: null,
		})

		const saertillegg = rows.find((r) => r.label === 'Særtillegg')
		expect(saertillegg?.formula?.numerator).toEqual(['94% × Grunnbeløpet'])
	})
})

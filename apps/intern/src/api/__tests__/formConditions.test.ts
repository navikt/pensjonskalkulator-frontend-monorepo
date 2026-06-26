import { describe, expect, test } from 'vitest'

import { showSivilstatus } from '../../components/BeregningForm/utils'
import { showEpsHarInntektOver2G, showEpsHarPensjon } from '../formConditions'

const base = {
	sivilstatus: 'GIFT' as const,
	beregnMedGjenlevenderett: false,
	erEndring: false,
	serviceBeregning: false,
}

describe('showEpsHarPensjon', () => {
	test('shows when partner and not endring', () => {
		expect(showEpsHarPensjon(base)).toBe(true)
	})

	test('hides when no partner', () => {
		expect(showEpsHarPensjon({ ...base, sivilstatus: 'UGIFT' })).toBe(false)
	})

	test('hides when beregnMedGjenlevenderett', () => {
		expect(showEpsHarPensjon({ ...base, beregnMedGjenlevenderett: true })).toBe(
			false
		)
	})

	test('hides when erEndring without serviceBeregning', () => {
		expect(showEpsHarPensjon({ ...base, erEndring: true })).toBe(false)
	})

	test('shows when erEndring with serviceBeregning', () => {
		expect(
			showEpsHarPensjon({ ...base, erEndring: true, serviceBeregning: true })
		).toBe(true)
	})
})

describe('showEpsHarInntektOver2G', () => {
	const over2gBase = { ...base, epsHarPensjon: false as boolean | null }

	test('shows when partner, epsHarPensjon=false, not endring', () => {
		expect(showEpsHarInntektOver2G(over2gBase)).toBe(true)
	})

	test('hides when epsHarPensjon=true', () => {
		expect(
			showEpsHarInntektOver2G({ ...over2gBase, epsHarPensjon: true })
		).toBe(false)
	})

	test('hides when epsHarPensjon=null', () => {
		expect(
			showEpsHarInntektOver2G({ ...over2gBase, epsHarPensjon: null })
		).toBe(false)
	})

	test('hides when no partner', () => {
		expect(
			showEpsHarInntektOver2G({ ...over2gBase, sivilstatus: 'UGIFT' })
		).toBe(false)
	})

	test('hides when erEndring without serviceBeregning', () => {
		expect(showEpsHarInntektOver2G({ ...over2gBase, erEndring: true })).toBe(
			false
		)
	})

	test('shows when erEndring with serviceBeregning', () => {
		expect(
			showEpsHarInntektOver2G({
				...over2gBase,
				erEndring: true,
				serviceBeregning: true,
			})
		).toBe(true)
	})
})

describe('showSivilstatus', () => {
	test('shows when not endring and has sivilstatus', () => {
		expect(showSivilstatus(base)).toBe(true)
	})

	test('hides when erEndring without serviceBeregning', () => {
		expect(showSivilstatus({ ...base, erEndring: true })).toBe(false)
	})

	test('shows when erEndring with serviceBeregning', () => {
		expect(
			showSivilstatus({ ...base, erEndring: true, serviceBeregning: true })
		).toBe(true)
	})

	test('hides when beregnMedGjenlevenderett and sivilstatus with gjenlevenderett', () => {
		expect(showSivilstatus({ ...base, beregnMedGjenlevenderett: true })).toBe(
			false
		)
	})

	test('shows when beregnMedGjenlevenderett but sivilstatus without gjenlevenderett', () => {
		expect(
			showSivilstatus({
				...base,
				sivilstatus: 'UGIFT',
				beregnMedGjenlevenderett: true,
			})
		).toBe(true)
	})
})

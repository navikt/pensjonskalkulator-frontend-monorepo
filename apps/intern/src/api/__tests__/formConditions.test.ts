import { describe, expect, test } from 'vitest'

import {
	getAlderForAfpEndring,
	showSivilstatus,
} from '../../components/BeregningForm/utils'
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

	test('hides when erEndring with serviceBeregning but no partner', () => {
		expect(
			showEpsHarPensjon({
				...base,
				sivilstatus: 'UGIFT',
				erEndring: true,
				serviceBeregning: true,
			})
		).toBe(false)
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

	test('hides when erEndring with serviceBeregning but no partner', () => {
		expect(
			showEpsHarInntektOver2G({
				...over2gBase,
				sivilstatus: 'UGIFT',
				erEndring: true,
				serviceBeregning: true,
			})
		).toBe(false)
	})

	test('hides when erEndring with serviceBeregning but epsHarPensjon=true', () => {
		expect(
			showEpsHarInntektOver2G({
				...over2gBase,
				epsHarPensjon: true,
				erEndring: true,
				serviceBeregning: true,
			})
		).toBe(false)
	})

	test('hides when erEndring with serviceBeregning but epsHarPensjon=null', () => {
		expect(
			showEpsHarInntektOver2G({
				...over2gBase,
				epsHarPensjon: null,
				erEndring: true,
				serviceBeregning: true,
			})
		).toBe(false)
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

	test('hides when beregning med gjenlevenderett is selected, even for endring with serviceberegning', () => {
		expect(
			showSivilstatus({
				...base,
				sivilstatus: 'UGIFT',
				erEndring: true,
				serviceBeregning: true,
				beregnMedGjenlevenderett: true,
			})
		).toBe(false)
	})

	test('hides when beregnMedGjenlevenderett and sivilstatus with gjenlevenderett', () => {
		expect(showSivilstatus({ ...base, beregnMedGjenlevenderett: true })).toBe(
			false
		)
	})

	test('hides when beregnMedGjenlevenderett and sivilstatus without gjenlevenderett', () => {
		expect(
			showSivilstatus({
				...base,
				sivilstatus: 'UGIFT',
				beregnMedGjenlevenderett: true,
			})
		).toBe(false)
	})

	test('hides when not erEndring, serviceBeregning selected, but beregnMedGjenlevenderett and sivilstatus with gjenlevenderett (unchanged for users without vedtak)', () => {
		expect(
			showSivilstatus({
				...base,
				erEndring: false,
				serviceBeregning: true,
				beregnMedGjenlevenderett: true,
			})
		).toBe(false)
	})
})

describe('getAlderForAfpEndring', () => {
	test('returns 62/0 when switching to serviceberegning and age > 66', () => {
		expect(
			getAlderForAfpEndring({
				newAfpValue: 'serviceberegning',
				alderAarUttak: 67,
				foedselsdato: undefined,
			})
		).toEqual({ aar: 62, md: 0 })
	})

	test('returns brukers alder + 1 md when switching to ja_offentlig and age > 66', async () => {
		const { getBrukerensAlderISluttenAvMaaneden } =
			await import('@pensjonskalkulator-frontend-monorepo/utils/alder')
		const expected = getBrukerensAlderISluttenAvMaaneden('1960-01-15', {
			aar: 62,
			maaneder: 0,
		})

		expect(
			getAlderForAfpEndring({
				newAfpValue: 'ja_offentlig',
				alderAarUttak: 70,
				foedselsdato: '1960-01-15',
			})
		).toEqual({ aar: expected.aar, md: expected.maaneder })
	})

	test('returns min alder fallback when switching to ja_offentlig without foedselsdato', () => {
		expect(
			getAlderForAfpEndring({
				newAfpValue: 'ja_offentlig',
				alderAarUttak: 70,
				foedselsdato: undefined,
			})
		).toEqual({ aar: 62, md: 0 })
	})

	test('returns null when switching to serviceberegning and age <= 66', () => {
		expect(
			getAlderForAfpEndring({
				newAfpValue: 'serviceberegning',
				alderAarUttak: 66,
				foedselsdato: undefined,
			})
		).toBeNull()
	})

	test('returns null when switching to ja_offentlig and age <= 66', () => {
		expect(
			getAlderForAfpEndring({
				newAfpValue: 'ja_offentlig',
				alderAarUttak: 65,
				foedselsdato: '1960-01-15',
			})
		).toBeNull()
	})

	test('returns null when switching to ja_privat regardless of age', () => {
		expect(
			getAlderForAfpEndring({
				newAfpValue: 'ja_privat',
				alderAarUttak: 70,
				foedselsdato: undefined,
			})
		).toBeNull()
	})

	test('returns null when switching to nei regardless of age', () => {
		expect(
			getAlderForAfpEndring({
				newAfpValue: 'nei',
				alderAarUttak: 70,
				foedselsdato: undefined,
			})
		).toBeNull()
	})

	test('returns null when alderAarUttak is null', () => {
		expect(
			getAlderForAfpEndring({
				newAfpValue: 'serviceberegning',
				alderAarUttak: null,
				foedselsdato: undefined,
			})
		).toBeNull()
	})
})

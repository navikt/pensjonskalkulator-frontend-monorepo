import { describe, expect, test } from 'vitest'

import { getFormula } from '../formulas'

describe('getFormula', () => {
	test('returnerer undefined for ukjent nøkkel', () => {
		expect(getFormula('finnes-ikke')).toBeUndefined()
	})

	test('returnerer grunnpensjon-formel', () => {
		const formula = getFormula('formler.grunnpensjon_3')
		expect(formula).toEqual({
			title: 'Grunnpensjon',
			numerator: ['G × Trygdetid × Uttaksgrad'],
			denominator: '40 × Forholdstall',
		})
	})

	test('returnerer endring-formler med riktig nevner', () => {
		expect(getFormula('gp3')?.denominator).toBe('Forholdstall')
		expect(getFormula('tp3')?.denominator).toBe('Forholdstall')
		expect(getFormula('ip2')?.denominator).toBe('Delingstall')
		expect(getFormula('gap2')?.denominator).toBe('Delingstall')
	})

	test('returnerer ordinær særtillegg med 94%', () => {
		expect(getFormula('saertillegg_ordinaer')).toEqual({
			title: 'Særtillegg',
			numerator: ['94% × Grunnbeløpet'],
			denominator: '',
		})
	})

	test('returnerer redusert særtillegg med 74%', () => {
		expect(getFormula('saertillegg_redusert')).toEqual({
			title: 'Særtillegg',
			numerator: ['74% × Grunnbeløpet'],
			denominator: '',
		})
	})
})

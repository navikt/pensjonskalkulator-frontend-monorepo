import { describe, expect, test } from 'vitest'

import { formatPersonnavn } from './PersonInfo'

describe('formatPersonnavn', () => {
	test('viser etternavn først, etterfulgt av fornavn og mellomnavn', () => {
		expect(formatPersonnavn('Ola Mellomnavn Nordmann')).toBe(
			'Nordmann, Ola Mellomnavn'
		)
	})

	test('returnerer tom tekst når navnet mangler', () => {
		expect(formatPersonnavn('')).toBe('')
	})
})

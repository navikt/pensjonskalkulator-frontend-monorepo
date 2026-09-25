import { afterEach, describe, expect, it, vi } from 'vitest'

import { isEpsOver67EllerDoedsdatoEtter67aar } from './utils'

describe('isEpsOver67EllerDoedsdatoEtter67aar', () => {
	afterEach(() => {
		vi.useRealTimers()
	})

	it('returnerer false ved dødsfall før eller på 67-årsdagen', () => {
		expect(
			isEpsOver67EllerDoedsdatoEtter67aar({
				epsFoedselsdato: '1959-06-15',
				epsDoedsdato: '2026-06-14',
			})
		).toBe(false)
		expect(
			isEpsOver67EllerDoedsdatoEtter67aar({
				epsFoedselsdato: '1959-06-15',
				epsDoedsdato: '2026-06-15',
			})
		).toBe(false)
	})

	it('returnerer true ved dødsfall etter 67-årsdagen', () => {
		expect(
			isEpsOver67EllerDoedsdatoEtter67aar({
				epsFoedselsdato: '1959-06-15',
				epsDoedsdato: '2026-06-16',
			})
		).toBe(true)
	})

	it('returnerer true først dagen etter EPS fyller 67 år', () => {
		vi.useFakeTimers()

		vi.setSystemTime(new Date('2026-06-15T12:00:00'))
		expect(
			isEpsOver67EllerDoedsdatoEtter67aar({
				epsFoedselsdato: '1959-06-15',
			})
		).toBe(false)

		vi.setSystemTime(new Date('2026-06-16T12:00:00'))
		expect(
			isEpsOver67EllerDoedsdatoEtter67aar({
				epsFoedselsdato: '1959-06-15',
			})
		).toBe(true)
	})
})

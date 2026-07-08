import { describe, expect, it, vi } from 'vitest'

import { expandTwoDigitYear, normalizeTwoDigitYear } from './RHFDatePicker'

describe('expandTwoDigitYear', () => {
	it('tolker år >= pivot som 1900-tallet', () => {
		vi.useFakeTimers()
		vi.setSystemTime(new Date('2026-06-12'))

		// pivot = (2026 - 75) % 100 = 51
		expect(expandTwoDigitYear(51)).toBe(1951)
		expect(expandTwoDigitYear(99)).toBe(1999)
		expect(expandTwoDigitYear(60)).toBe(1960)

		vi.useRealTimers()
	})

	it('tolker år < pivot som 2000-tallet', () => {
		vi.useFakeTimers()
		vi.setSystemTime(new Date('2026-06-12'))

		// pivot = 51
		expect(expandTwoDigitYear(50)).toBe(2050)
		expect(expandTwoDigitYear(0)).toBe(2000)
		expect(expandTwoDigitYear(42)).toBe(2042)
		expect(expandTwoDigitYear(25)).toBe(2025)

		vi.useRealTimers()
	})

	it('pivot flytter seg med årstallet', () => {
		vi.useFakeTimers()
		vi.setSystemTime(new Date('2030-01-01'))

		// pivot = (2030 - 75) % 100 = 55
		expect(expandTwoDigitYear(55)).toBe(1955)
		expect(expandTwoDigitYear(54)).toBe(2054)

		vi.useRealTimers()
	})
})

describe('normalizeTwoDigitYear', () => {
	it('returnerer 6 siffer (ddmmyy) uendret', () => {
		expect(normalizeTwoDigitYear('010142')).toBe('010142')
		expect(normalizeTwoDigitYear('010160')).toBe('010160')
	})

	it('returnerer 8 siffer (ddmmyyyy) uendret', () => {
		expect(normalizeTwoDigitYear('01011942')).toBe('01011942')
		expect(normalizeTwoDigitYear('01012042')).toBe('01012042')
	})

	it('håndterer dd.mm.yy format', () => {
		vi.useFakeTimers()
		vi.setSystemTime(new Date('2026-06-12'))

		expect(normalizeTwoDigitYear('01.01.42')).toBe('01.01.2042')
		expect(normalizeTwoDigitYear('15.06.99')).toBe('15.06.1999')

		vi.useRealTimers()
	})

	it('returnerer input uendret hvis det ikke matcher', () => {
		expect(normalizeTwoDigitYear('abc')).toBe('abc')
		expect(normalizeTwoDigitYear('1.1.1990')).toBe('1.1.1990')
		expect(normalizeTwoDigitYear('')).toBe('')
	})
})

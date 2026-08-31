import { describe, expect, test } from 'vitest'

import { EpsError } from '../queries'

describe('EpsError', () => {
	test('stores aarsak from tilgangsnekt response', () => {
		const error = new EpsError('Failed', 'STRENGT_FORTROLIG_ADRESSE')
		expect(error).toBeInstanceOf(Error)
		expect(error).toBeInstanceOf(EpsError)
		expect(error.message).toBe('Failed')
		expect(error.aarsak).toBe('STRENGT_FORTROLIG_ADRESSE')
	})

	test('aarsak is undefined when not provided', () => {
		const error = new EpsError('Failed')
		expect(error.aarsak).toBeUndefined()
	})
})

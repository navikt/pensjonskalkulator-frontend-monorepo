import { render } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { PersonInfo, formatPersonnavn } from './PersonInfo'
import { useLivsvarigAFPQuery } from './api/queries'

const queryState: {
	foedselsdato: string | undefined
	erApoteker: boolean | null | undefined
} = vi.hoisted(() => ({ foedselsdato: undefined, erApoteker: undefined }))

vi.mock('./api/queries', () => ({
	useDecryptPidQuery: () => ({ data: 'test-fnr' }),
	useEncryptPidMutation: () => ({ mutate: vi.fn(), isPending: false }),
	useErApotekerQuery: () => ({ data: queryState.erApoteker }),
	useFeatureToggleQuery: () => ({ data: { enabled: false } }),
	useLivsvarigAFPQuery: vi.fn(() => ({ data: undefined })),
	useOmstillingsstoenadQuery: () => ({ data: undefined }),
	usePersonQuery: () => ({
		data: queryState.foedselsdato
			? { navn: 'Test Person', foedselsdato: queryState.foedselsdato }
			: undefined,
		isError: false,
		error: null,
	}),
	useVedtakQuery: () => ({ data: undefined }),
}))

describe('PersonInfo – henting av livsvarig AFP', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		window.history.replaceState({}, '', '/?pid=test-pid')
	})

	test.each([
		{ foedselsdato: undefined, erApoteker: false, enabled: false },
		{ foedselsdato: '1962-12-31', erApoteker: false, enabled: false },
		{ foedselsdato: '1963-01-01', erApoteker: false, enabled: true },
		{ foedselsdato: '1964-04-30', erApoteker: true, enabled: false },
		{
			foedselsdato: '1964-04-30',
			erApoteker: undefined,
			enabled: true,
		},
		{ foedselsdato: '1964-04-30', erApoteker: null, enabled: true },
		{ foedselsdato: '1964-04-30', erApoteker: false, enabled: true },
	])(
		'setter enabled til $enabled ved fødselsdato $foedselsdato og apotekerstatus $erApoteker',
		({ foedselsdato, erApoteker, enabled }) => {
			queryState.foedselsdato = foedselsdato
			queryState.erApoteker = erApoteker

			render(<PersonInfo />)

			expect(useLivsvarigAFPQuery).toHaveBeenCalledWith({
				fnr: 'test-fnr',
				enabled,
			})
		}
	)
})

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

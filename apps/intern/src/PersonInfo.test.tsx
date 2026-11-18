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
		{ foedselsdato: undefined, erApoteker: false, forventetFnr: undefined },
		{ foedselsdato: '1962-12-31', erApoteker: false, forventetFnr: undefined },
		{ foedselsdato: '1963-01-01', erApoteker: false, forventetFnr: 'test-fnr' },
		{ foedselsdato: '1964-04-30', erApoteker: true, forventetFnr: undefined },
		{
			foedselsdato: '1964-04-30',
			erApoteker: undefined,
			forventetFnr: undefined,
		},
		{ foedselsdato: '1964-04-30', erApoteker: null, forventetFnr: undefined },
		{ foedselsdato: '1964-04-30', erApoteker: false, forventetFnr: 'test-fnr' },
	])(
		'bruker fnr $forventetFnr ved fødselsdato $foedselsdato og apotekerstatus $erApoteker',
		({ foedselsdato, erApoteker, forventetFnr }) => {
			queryState.foedselsdato = foedselsdato
			queryState.erApoteker = erApoteker

			render(<PersonInfo />)

			expect(useLivsvarigAFPQuery).toHaveBeenCalledWith(
				'test-fnr',
				forventetFnr !== undefined
			)
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

import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import { OpptjeningTable, mapOpptjeningToTableRows } from '../OpptjeningTable'
import {
	mockOpptjeningAvdoed,
	mockOpptjeningKap19,
	mockOpptjeningKap20,
} from '../__mocks__/opptjening'

const nbsp = '\u00A0'

describe('mapOpptjeningToTableRows', () => {
	test('mapper opptjening med pensjonsbeholdning for kap20-brukere', () => {
		const rows = mapOpptjeningToTableRows(mockOpptjeningKap20, true)

		expect(rows).toHaveLength(6)
		expect(rows[0]).toEqual({
			aar: 2024,
			pensjonsgivendeInntekt: '0',
			pensjonspoeng: '0',
			pensjonsbeholdning: '0',
			merknad: '100 % alderspensjon',
		})
		expect(rows[3]).toEqual({
			aar: 2021,
			pensjonsgivendeInntekt: `278${nbsp}034 kr`,
			pensjonspoeng: '3,47',
			pensjonsbeholdning: `501${nbsp}831`,
			merknad: 'AFP',
		})
	})

	test('mapper opptjening uten pensjonsbeholdning for kap19-brukere', () => {
		const rows = mapOpptjeningToTableRows(mockOpptjeningKap19, false)

		expect(rows).toHaveLength(3)
		expect(rows[0]).toEqual({
			aar: 2022,
			pensjonsgivendeInntekt: `450${nbsp}000 kr`,
			pensjonspoeng: '4,12',
			pensjonsbeholdning: null,
			merknad: '',
		})
	})

	test('formaterer pensjonspoeng med to desimaler', () => {
		const rows = mapOpptjeningToTableRows(mockOpptjeningKap20, true)
		expect(rows[2].pensjonspoeng).toBe('3,47')
	})

	test('viser 0 for null pensjonsgivendeInntekt', () => {
		const rows = mapOpptjeningToTableRows(mockOpptjeningKap20, false)
		expect(rows[0].pensjonsgivendeInntekt).toBe('0')
	})
})

describe('OpptjeningTable', () => {
	test('viser pensjonsbeholdning-kolonne og skjuler pensjonspoeng for erFoedtEtter1963', () => {
		render(
			<OpptjeningTable
				opptjening={mockOpptjeningKap20}
				erFoedtEtter1963={true}
				erOvergangskull={false}
			/>
		)

		expect(
			screen.getByRole('heading', { name: 'Pensjonsopptjening bruker' })
		).toBeInTheDocument()
		expect(
			screen.getByRole('columnheader', { name: 'Pensjonsbeholdning' })
		).toBeInTheDocument()
		expect(screen.getAllByRole('cell', { name: /501.831/ })).toHaveLength(2)
		expect(
			screen.queryByRole('columnheader', { name: 'Pensjonspoeng' })
		).not.toBeInTheDocument()
	})

	test('viser både pensjonsbeholdning og pensjonspoeng for overgangskull', () => {
		render(
			<OpptjeningTable
				opptjening={mockOpptjeningKap20}
				erFoedtEtter1963={false}
				erOvergangskull={true}
			/>
		)

		expect(
			screen.getByRole('columnheader', { name: 'Pensjonsbeholdning' })
		).toBeInTheDocument()
		expect(
			screen.getByRole('columnheader', { name: 'Pensjonspoeng' })
		).toBeInTheDocument()
	})

	test('skjuler pensjonsbeholdning og viser pensjonspoeng for kap19-brukere', () => {
		render(
			<OpptjeningTable
				opptjening={mockOpptjeningKap19}
				erFoedtEtter1963={false}
				erOvergangskull={false}
			/>
		)

		expect(
			screen.queryByRole('columnheader', { name: 'Pensjonsbeholdning' })
		).not.toBeInTheDocument()
		expect(
			screen.getByRole('columnheader', { name: 'Pensjonspoeng' })
		).toBeInTheDocument()
	})

	test('viser tittel for avdød', () => {
		render(
			<OpptjeningTable
				opptjening={mockOpptjeningKap19}
				erFoedtEtter1963={false}
				isOpptjeningAvdoedSection={true}
			/>
		)

		expect(
			screen.getByRole('heading', { name: 'Pensjonsopptjening avdøde' })
		).toBeInTheDocument()
	})

	test('viser merknad-kolonne med pensjonspoengType', () => {
		render(
			<OpptjeningTable
				opptjening={mockOpptjeningKap20}
				erFoedtEtter1963={true}
			/>
		)

		expect(screen.getByRole('cell', { name: 'AFP' })).toBeInTheDocument()
		expect(
			screen.getAllByRole('cell', { name: '100 % alderspensjon' })
		).toHaveLength(3)
	})

	test('viser avdød opptjening uten pensjonsbeholdning selv for kap20', () => {
		render(
			<OpptjeningTable
				opptjening={mockOpptjeningAvdoed}
				erFoedtEtter1963={true}
				isOpptjeningAvdoedSection={true}
			/>
		)

		expect(
			screen.getByRole('heading', { name: 'Pensjonsopptjening avdøde' })
		).toBeInTheDocument()
		expect(
			screen.queryByRole('columnheader', { name: 'Pensjonsbeholdning' })
		).not.toBeInTheDocument()
		expect(screen.getAllByRole('cell', { name: /350.000 kr/ })).toHaveLength(1)
	})

	test('viser avdød opptjening uten pensjonsbeholdning for kap19', () => {
		render(
			<OpptjeningTable
				opptjening={mockOpptjeningAvdoed}
				erFoedtEtter1963={false}
				erOvergangskull={false}
				isOpptjeningAvdoedSection={true}
			/>
		)

		expect(
			screen.getByRole('heading', { name: 'Pensjonsopptjening avdøde' })
		).toBeInTheDocument()
		expect(
			screen.queryByRole('columnheader', { name: 'Pensjonsbeholdning' })
		).not.toBeInTheDocument()
	})
})

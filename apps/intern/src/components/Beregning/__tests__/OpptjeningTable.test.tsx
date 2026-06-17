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
	test('maps opptjening with pensjonsbeholdning for kap20 users', () => {
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

	test('maps opptjening without pensjonsbeholdning for kap19 users', () => {
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

	test('formats pensjonspoeng with two decimal places', () => {
		const rows = mapOpptjeningToTableRows(mockOpptjeningKap20, true)
		expect(rows[2].pensjonspoeng).toBe('3,47')
	})

	test('shows 0 for zero pensjonsgivendeInntekt', () => {
		const rows = mapOpptjeningToTableRows(mockOpptjeningKap20, false)
		expect(rows[0].pensjonsgivendeInntekt).toBe('0')
	})
})

describe('OpptjeningTable', () => {
	test('renders pensjonsbeholdning column for erFoedtEtter1963', () => {
		render(
			<OpptjeningTable
				opptjening={mockOpptjeningKap20}
				erFoedtEtter1963={true}
				erOvergangskull={false}
			/>
		)

		expect(screen.getByText('Pensjonsopptjening bruker')).toBeInTheDocument()
		expect(screen.getByText('Pensjonsbeholdning')).toBeInTheDocument()
		expect(screen.getAllByText(/501.831/)).toHaveLength(2)
	})

	test('renders pensjonsbeholdning column for erOvergangskull', () => {
		render(
			<OpptjeningTable
				opptjening={mockOpptjeningKap20}
				erFoedtEtter1963={false}
				erOvergangskull={true}
			/>
		)

		expect(screen.getByText('Pensjonsbeholdning')).toBeInTheDocument()
	})

	test('hides pensjonsbeholdning column for kap19 users', () => {
		render(
			<OpptjeningTable
				opptjening={mockOpptjeningKap19}
				erFoedtEtter1963={false}
				erOvergangskull={false}
			/>
		)

		expect(screen.queryByText('Pensjonsbeholdning')).not.toBeInTheDocument()
	})

	test('renders with avdoed title', () => {
		render(
			<OpptjeningTable
				opptjening={mockOpptjeningKap19}
				erFoedtEtter1963={false}
				isOpptjeningAvdoedSection={true}
			/>
		)

		expect(screen.getByText('Pensjonsopptjening avdøde')).toBeInTheDocument()
	})

	test('renders merknad column with pensjonspoengType', () => {
		render(
			<OpptjeningTable
				opptjening={mockOpptjeningKap20}
				erFoedtEtter1963={true}
			/>
		)

		expect(screen.getByText('AFP')).toBeInTheDocument()
		expect(screen.getAllByText('100 % alderspensjon')).toHaveLength(3)
	})

	test('renders avdoed opptjening table with correct title', () => {
		render(
			<OpptjeningTable
				opptjening={mockOpptjeningAvdoed}
				erFoedtEtter1963={true}
				isOpptjeningAvdoedSection={true}
			/>
		)

		expect(screen.getByText('Pensjonsopptjening avdøde')).toBeInTheDocument()
		expect(screen.getByText('Pensjonsbeholdning')).toBeInTheDocument()
		expect(screen.getAllByText(/350.000 kr/)).toHaveLength(1)
		expect(screen.getAllByText(/420.000/)).toHaveLength(1)
	})

	test('renders avdoed opptjening table without pensjonsbeholdning for kap19', () => {
		render(
			<OpptjeningTable
				opptjening={mockOpptjeningAvdoed}
				erFoedtEtter1963={false}
				erOvergangskull={false}
				isOpptjeningAvdoedSection={true}
			/>
		)

		expect(screen.getByText('Pensjonsopptjening avdøde')).toBeInTheDocument()
		expect(screen.queryByText('Pensjonsbeholdning')).not.toBeInTheDocument()
	})
})

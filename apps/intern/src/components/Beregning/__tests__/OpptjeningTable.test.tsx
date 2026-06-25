import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import { OpptjeningTable, mapOpptjeningToTableRows } from '../OpptjeningTable'
import {
	mockOpptjeningAvdoed,
	mockOpptjeningKap19,
	mockOpptjeningKap20,
	mockOpptjeningSimulering,
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
		})
		expect(rows[3]).toEqual({
			aar: 2021,
			pensjonsgivendeInntekt: `278${nbsp}034 kr`,
			pensjonspoeng: '3,47',
			pensjonsbeholdning: `501${nbsp}831`,
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

describe('OpptjeningTable med opptjeningListe fra simuleringsendepunkt', () => {
	test('mapper opptjeningListe fra simulering korrekt', () => {
		const rows = mapOpptjeningToTableRows(mockOpptjeningSimulering, true)

		expect(rows).toHaveLength(4)
		expect(rows[0]).toEqual({
			aar: 2013,
			pensjonsgivendeInntekt: '0',
			pensjonspoeng: '0',
			pensjonsbeholdning: `410${nbsp}000`,
		})
		expect(rows[1]).toEqual({
			aar: 2012,
			pensjonsgivendeInntekt: `500${nbsp}000 kr`,
			pensjonspoeng: '4,50',
			pensjonsbeholdning: `410${nbsp}000`,
		})
	})

	test('sorterer opptjeningListe fra simulering i synkende rekkefølge', () => {
		const rows = mapOpptjeningToTableRows(mockOpptjeningSimulering, false)

		expect(rows[0].aar).toBe(2013)
		expect(rows[1].aar).toBe(2012)
		expect(rows[2].aar).toBe(2011)
		expect(rows[3].aar).toBe(2010)
	})

	test('rendrer opptjeningListe fra simulering med pensjonsbeholdning for kap20', () => {
		render(
			<OpptjeningTable
				opptjening={mockOpptjeningSimulering}
				erFoedtEtter1963={true}
				erOvergangskull={false}
			/>
		)

		expect(
			screen.getByRole('columnheader', { name: 'Pensjonsbeholdning' })
		).toBeInTheDocument()
		expect(
			screen.queryByRole('columnheader', { name: 'Pensjonspoeng' })
		).not.toBeInTheDocument()
		expect(screen.getAllByRole('cell', { name: /410.000/ })).toHaveLength(2)
		expect(screen.getByRole('cell', { name: /500.000 kr/ })).toBeInTheDocument()
	})

	test('rendrer opptjeningListe fra simulering med pensjonspoeng for kap19', () => {
		render(
			<OpptjeningTable
				opptjening={mockOpptjeningSimulering}
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
		expect(screen.getByRole('cell', { name: '4,50' })).toBeInTheDocument()
		expect(screen.getByRole('cell', { name: '3,60' })).toBeInTheDocument()
	})

	test('rendrer opptjeningListe fra simulering med begge kolonner for overgangskull', () => {
		render(
			<OpptjeningTable
				opptjening={mockOpptjeningSimulering}
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
		expect(screen.getByRole('cell', { name: '4,50' })).toBeInTheDocument()
		expect(screen.getAllByRole('cell', { name: /410.000/ })).toHaveLength(2)
	})

	test('viser 0 for aar uten inntekt i opptjeningListe fra simulering', () => {
		const rows = mapOpptjeningToTableRows(mockOpptjeningSimulering, true)

		const yearWithoutIncome = rows.find((r) => r.aar === 2013)
		expect(yearWithoutIncome).toEqual({
			aar: 2013,
			pensjonsgivendeInntekt: '0',
			pensjonspoeng: '0',
			pensjonsbeholdning: `410${nbsp}000`,
		})
	})
})

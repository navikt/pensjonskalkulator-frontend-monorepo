import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import { OpptjeningTable, mapOpptjeningToTableRows } from '../OpptjeningTable'
import {
	mockOpptjeningAvdoed,
	mockOpptjeningKap19,
	mockOpptjeningKap20,
	mockOpptjeningMedUfoeregrad,
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
			merknad: '',
		})
		expect(rows[2]).toEqual({
			aar: 2022,
			pensjonsgivendeInntekt: `193${nbsp}192`,
			pensjonspoeng: '3,47',
			pensjonsbeholdning: '0',
			merknad: 'Mottak av dagpenger',
		})
		expect(rows[4]).toEqual({
			aar: 2020,
			pensjonsgivendeInntekt: `639${nbsp}932`,
			pensjonspoeng: '3,47',
			pensjonsbeholdning: `498${nbsp}943`,
			merknad: '',
		})
	})

	test('mapper opptjening uten pensjonsbeholdning for kap19-brukere', () => {
		const rows = mapOpptjeningToTableRows(mockOpptjeningKap19, false)

		expect(rows).toHaveLength(3)
		expect(rows[0]).toEqual({
			aar: 2022,
			pensjonsgivendeInntekt: `450${nbsp}000`,
			pensjonspoeng: '4,12',
			pensjonsbeholdning: null,
			merknad: '',
		})
	})

	test('formaterer pensjonspoeng med to desimaler', () => {
		const rows = mapOpptjeningToTableRows(mockOpptjeningKap20, true)
		expect(rows[2].pensjonspoeng).toBe('3,47')
	})

	test('viser år uten inntekt', () => {
		const rows = mapOpptjeningToTableRows(mockOpptjeningKap20, false)
		expect(rows.map((r) => r.aar)).toEqual([2024, 2023, 2022, 2021, 2020, 2019])
	})

	test('filtrerer bort år etter året for helt uttak', () => {
		const rows = mapOpptjeningToTableRows(
			mockOpptjeningKap20,
			false,
			null,
			2022
		)
		expect(rows.map((r) => r.aar)).toEqual([2022, 2021, 2020, 2019])
	})

	test('filtrerer på året inntekten slutter fremfor året for helt uttak', () => {
		const rows = mapOpptjeningToTableRows(
			mockOpptjeningKap20,
			false,
			null,
			2021,
			2023
		)
		expect(rows.map((r) => r.aar)).toEqual([2023, 2022, 2021, 2020, 2019])
	})

	test('mapper flere merknader komma-separert', () => {
		const rows = mapOpptjeningToTableRows(mockOpptjeningKap20, true)
		const rowWith2019 = rows.find((r) => r.aar === 2019)

		expect(rowWith2019?.merknad).toBe(
			'Pensjonsbeholdningen din ble etablert med virkning 1. januar 2010 i forbindelse med at pensjonsreformen trådte i kraft. Da ble den opptjeningen du hadde i kalenderår frem til og med 2008 (siste år med ferdig skattemelding) summert til en beholdningsstørrelse., Mottak av dagpenger'
		)
	})

	test('mapper UFOEREGRAD merknad med ufoeretrygdgrad', () => {
		const rows = mapOpptjeningToTableRows(mockOpptjeningMedUfoeregrad, true, 75)
		const rowWith2022 = rows.find((r) => r.aar === 2022)

		expect(rowWith2022?.merknad).toBe('Uføretrygd: 75 %')
	})

	test('mapper UFOEREGRAD merknad til tom streng når ufoeretrygdgrad er null', () => {
		const rows = mapOpptjeningToTableRows(
			mockOpptjeningMedUfoeregrad,
			true,
			null
		)
		const rowWith2022 = rows.find((r) => r.aar === 2022)

		expect(rowWith2022?.merknad).toBe('')
	})
})

describe('OpptjeningTable', () => {
	test('viser Merknad-kolonne', () => {
		render(
			<OpptjeningTable
				opptjening={mockOpptjeningKap20}
				erFoedtEtter1963={true}
				erOvergangskull={false}
			/>
		)

		expect(
			screen.getByRole('columnheader', { name: 'Merknad' })
		).toBeInTheDocument()
	})

	test('viser pensjonsbeholdning-kolonne og skjuler pensjonspoeng for erFoedtEtter1963', () => {
		render(
			<OpptjeningTable
				opptjening={mockOpptjeningKap20}
				erFoedtEtter1963={true}
				erOvergangskull={false}
			/>
		)

		expect(
			screen.getByRole('heading', { name: 'Inntekt og pensjonsopptjening' })
		).toBeInTheDocument()
		expect(
			screen.getByRole('columnheader', { name: 'Pensjonsbeholdning (kr)' })
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
			screen.getByRole('columnheader', { name: 'Pensjonsbeholdning (kr)' })
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
			screen.queryByRole('columnheader', { name: 'Pensjonsbeholdning (kr)' })
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
			screen.getByRole('heading', {
				name: 'Inntekt og pensjonsopptjening avdøde',
			})
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
			screen.getByRole('heading', {
				name: 'Inntekt og pensjonsopptjening avdøde',
			})
		).toBeInTheDocument()
		expect(
			screen.queryByRole('columnheader', { name: 'Pensjonsbeholdning (kr)' })
		).not.toBeInTheDocument()
		expect(screen.getAllByRole('cell', { name: /350.000/ })).toHaveLength(1)
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
			screen.getByRole('heading', {
				name: 'Inntekt og pensjonsopptjening avdøde',
			})
		).toBeInTheDocument()
		expect(
			screen.queryByRole('columnheader', { name: 'Pensjonsbeholdning (kr)' })
		).not.toBeInTheDocument()
	})
})

describe('OpptjeningTable med opptjeningListe fra simuleringsendepunkt', () => {
	test('mapper opptjeningListe fra simulering korrekt', () => {
		const rows = mapOpptjeningToTableRows(mockOpptjeningSimulering, true)

		expect(rows).toHaveLength(4)
		expect(rows[1]).toEqual({
			aar: 2012,
			pensjonsgivendeInntekt: `500${nbsp}000`,
			pensjonspoeng: '4,50',
			pensjonsbeholdning: `410${nbsp}000`,
			merknad: 'Alderspensjon: 100 %',
		})
		expect(rows[2]).toEqual({
			aar: 2011,
			pensjonsgivendeInntekt: `400${nbsp}000`,
			pensjonspoeng: '3,60',
			pensjonsbeholdning: `250${nbsp}000`,
			merknad: '',
		})
	})

	test('sorterer opptjeningListe fra simulering i synkende rekkefølge', () => {
		const rows = mapOpptjeningToTableRows(mockOpptjeningSimulering, false)

		expect(rows.map((r) => r.aar)).toEqual([2013, 2012, 2011, 2010])
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
			screen.getByRole('columnheader', { name: 'Pensjonsbeholdning (kr)' })
		).toBeInTheDocument()
		expect(
			screen.queryByRole('columnheader', { name: 'Pensjonspoeng' })
		).not.toBeInTheDocument()
		expect(screen.getAllByRole('cell', { name: /410.000/ })).toHaveLength(2)
		expect(screen.getByRole('cell', { name: /500.000/ })).toBeInTheDocument()
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
			screen.queryByRole('columnheader', { name: 'Pensjonsbeholdning (kr)' })
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
			screen.getByRole('columnheader', { name: 'Pensjonsbeholdning (kr)' })
		).toBeInTheDocument()
		expect(
			screen.getByRole('columnheader', { name: 'Pensjonspoeng' })
		).toBeInTheDocument()
		expect(screen.getByRole('cell', { name: '4,50' })).toBeInTheDocument()
		expect(screen.getAllByRole('cell', { name: /410.000/ })).toHaveLength(2)
	})

	test('rendrer UFOEREGRAD merknad med data-testid', () => {
		render(
			<OpptjeningTable
				opptjening={mockOpptjeningMedUfoeregrad}
				erFoedtEtter1963={true}
				erOvergangskull={false}
				ufoeretrygdgrad={75}
			/>
		)

		expect(screen.getByTestId('merknad-2022')).toHaveTextContent(
			'Uføretrygd: 75 %'
		)
	})

	test('rendrer HELT_UTTAK merknad med data-testid', () => {
		render(
			<OpptjeningTable
				opptjening={mockOpptjeningSimulering}
				erFoedtEtter1963={true}
				erOvergangskull={false}
			/>
		)

		expect(screen.getByTestId('merknad-2012')).toHaveTextContent(
			'Alderspensjon: 100 %'
		)
		expect(screen.getByTestId('merknad-2011')).toHaveTextContent('')
	})

	test('viser år uten inntekt etter siste inntektsår i opptjeningListe fra simulering', () => {
		const rows = mapOpptjeningToTableRows(mockOpptjeningSimulering, true)

		expect(rows[0]).toEqual({
			aar: 2013,
			pensjonsgivendeInntekt: '0',
			pensjonspoeng: '0',
			pensjonsbeholdning: `410${nbsp}000`,
			merknad: '',
		})
	})
})

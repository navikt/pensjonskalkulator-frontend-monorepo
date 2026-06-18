import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import { defaultBeregningFormData } from '../../../api/beregningTypes'
import {
	augmentOpptjening,
	augmentOpptjeningAvdoed,
} from '../../../utils/augmentOpptjening'
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

// foedselsdato 1960-06-15: alderAarUttak=67, alderMdUttak=0 → uttak 2027-07-01 → year 2027
const foedselsdato = '1960-06-15'

describe('augmentOpptjening', () => {
	test('returnerer opptjening uendret når alderAarUttak er null', () => {
		const result = augmentOpptjening(
			mockOpptjeningKap19,
			{ ...defaultBeregningFormData, aarligInntektFoerUttakBeloep: 600000 },
			foedselsdato
		)
		expect(result).toEqual(mockOpptjeningKap19)
	})

	test('returnerer opptjening uendret når aarligInntektFoerUttakBeloep er null', () => {
		const result = augmentOpptjening(
			mockOpptjeningKap19,
			{ ...defaultBeregningFormData, alderAarUttak: 67, alderMdUttak: 0 },
			foedselsdato
		)
		expect(result).toEqual(mockOpptjeningKap19)
	})

	test('legger til rad med aarligInntektFoerUttakBeloep for uttaksår', () => {
		const result = augmentOpptjening(
			mockOpptjeningKap19,
			{
				...defaultBeregningFormData,
				alderAarUttak: 67,
				alderMdUttak: 0,
				aarligInntektFoerUttakBeloep: 600000,
			},
			foedselsdato
		)
		expect(result).toHaveLength(mockOpptjeningKap19.length + 1)
		expect(result[result.length - 1]).toEqual({
			aar: 2027,
			pensjonsgivendeInntekt: 600000,
			pensjonspoeng: 0,
			omsorgspoeng: null,
			beholdning: null,
			pensjonspoengType: 'Oppgitt inntekt',
		})
	})

	test('legger til rad med pensjonsgivendeInntektVedSidenAvGradertUttak med uttaksgrad i merknad', () => {
		const result = augmentOpptjening(
			mockOpptjeningKap19,
			{
				...defaultBeregningFormData,
				alderAarUttak: 67,
				alderMdUttak: 0,
				uttaksgrad: 40,
				pensjonsgivendeInntektVedSidenAvGradertUttak: 300000,
			},
			foedselsdato
		)
		expect(result).toHaveLength(mockOpptjeningKap19.length + 1)
		expect(result[result.length - 1]).toEqual({
			aar: 2027,
			pensjonsgivendeInntekt: 300000,
			pensjonspoeng: 0,
			omsorgspoeng: null,
			beholdning: null,
			pensjonspoengType: 'Alderspensjon 40%',
		})
	})

	test('legger til begge rader når begge inntektsfelt er satt', () => {
		const result = augmentOpptjening(
			mockOpptjeningKap19,
			{
				...defaultBeregningFormData,
				alderAarUttak: 67,
				alderMdUttak: 0,
				uttaksgrad: 60,
				aarligInntektFoerUttakBeloep: 600000,
				pensjonsgivendeInntektVedSidenAvGradertUttak: 250000,
			},
			foedselsdato
		)
		expect(result).toHaveLength(mockOpptjeningKap19.length + 2)
		expect(result[result.length - 2]?.pensjonspoengType).toBe('Oppgitt inntekt')
		expect(result[result.length - 1]?.pensjonspoengType).toBe(
			'Alderspensjon 60%'
		)
	})

	test('legger til rad selv om året allerede finnes i opptjening', () => {
		const result = augmentOpptjening(
			mockOpptjeningKap19,
			{
				...defaultBeregningFormData,
				alderAarUttak: 62,
				alderMdUttak: 0,
				aarligInntektFoerUttakBeloep: 600000,
			},
			foedselsdato
		)
		// 62 år + foedselsdato 1960-06-15 → 2022, which exists in mockOpptjeningKap19
		expect(result).toHaveLength(mockOpptjeningKap19.length + 1)
		expect(result[result.length - 1]?.pensjonspoengType).toBe('Oppgitt inntekt')
		expect(result[result.length - 1]?.aar).toBe(2022)
	})
})

describe('augmentOpptjeningAvdoed', () => {
	test('returnerer opptjening uendret når epsPensjonsgivendeInntektFoerDoedsDato er null', () => {
		const result = augmentOpptjeningAvdoed(mockOpptjeningAvdoed, {
			...defaultBeregningFormData,
			epsOpplysninger: {
				pid: '12345678901',
				relasjonstype: 'EKTEFELLE',
				relasjonPersondata: { doedsdato: '2023-03-15' },
			},
		})
		expect(result).toEqual(mockOpptjeningAvdoed)
	})

	test('returnerer opptjening uendret når epsDoedsdato mangler', () => {
		const result = augmentOpptjeningAvdoed(mockOpptjeningAvdoed, {
			...defaultBeregningFormData,
			epsPensjonsgivendeInntektFoerDoedsDato: 450000,
			epsOpplysninger: undefined,
		})
		expect(result).toEqual(mockOpptjeningAvdoed)
	})

	test('legger til rad for året før dødsdato med riktig merknad', () => {
		const result = augmentOpptjeningAvdoed(mockOpptjeningAvdoed, {
			...defaultBeregningFormData,
			epsPensjonsgivendeInntektFoerDoedsDato: 450000,
			epsOpplysninger: {
				pid: '12345678901',
				relasjonstype: 'EKTEFELLE',
				relasjonPersondata: { doedsdato: '2023-03-15' },
			},
		})
		expect(result).toHaveLength(mockOpptjeningAvdoed.length + 1)
		expect(result[result.length - 1]).toEqual({
			aar: 2022,
			pensjonsgivendeInntekt: 450000,
			pensjonspoeng: 0,
			omsorgspoeng: null,
			beholdning: null,
			pensjonspoengType: 'Oppgitt inntekt',
		})
	})
})

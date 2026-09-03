import { describe, expect, test } from 'vitest'

import {
	mockOpptjeningKap19,
	mockOpptjeningKap20,
} from '../components/Beregning/__mocks__/opptjening'
import { mapPensjonsopptjeningToLagreDto } from './mapLagreSimulering'

describe('mapPensjonsopptjeningToLagreDto', () => {
	test('maps the same sorted rows shown in the accrual table', () => {
		expect(mapPensjonsopptjeningToLagreDto(mockOpptjeningKap20, true)).toEqual([
			{
				aarstall: 2024,
				pensjonsgivendeInntekt: 0,
				pensjonspoeng: 0,
				pensjonsbeholdning: 0,
				merknad: '',
			},
			{
				aarstall: 2023,
				pensjonsgivendeInntekt: 0,
				pensjonspoeng: 0,
				pensjonsbeholdning: 0,
				merknad: '',
			},
			{
				aarstall: 2022,
				pensjonsgivendeInntekt: 193192,
				pensjonspoeng: 3.47,
				pensjonsbeholdning: 0,
				merknad: 'Mottak av dagpenger',
			},
			{
				aarstall: 2021,
				pensjonsgivendeInntekt: 278034,
				pensjonspoeng: 3.47,
				pensjonsbeholdning: 501831,
				merknad:
					'Du er godskrevet omsorgsopptjening for ulønnet omsorgsarbeid i dette året',
			},
			{
				aarstall: 2020,
				pensjonsgivendeInntekt: 639932,
				pensjonspoeng: 3.47,
				pensjonsbeholdning: 498943,
				merknad: '',
			},
			{
				aarstall: 2019,
				pensjonsgivendeInntekt: 278034,
				pensjonspoeng: 3.47,
				pensjonsbeholdning: 501831,
				merknad:
					'Pensjonsbeholdningen din ble etablert med virkning 1. januar 2010 i forbindelse med at pensjonsreformen trådte i kraft. Da ble den opptjeningen du hadde i kalenderår frem til og med 2008 (siste år med ferdig skattemelding) summert til en beholdningsstørrelse., Mottak av dagpenger',
			},
		])
	})

	test('omits pension balance for cohorts where the table does not show it', () => {
		const rows = mapPensjonsopptjeningToLagreDto(mockOpptjeningKap19, false)

		expect(rows).toHaveLength(3)
		expect(rows[0]).toMatchObject({
			aarstall: 2022,
			pensjonsgivendeInntekt: 450000,
			pensjonspoeng: 4.12,
			pensjonsbeholdning: null,
		})
	})
})

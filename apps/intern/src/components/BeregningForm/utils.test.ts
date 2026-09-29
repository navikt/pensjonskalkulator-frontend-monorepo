import { describe, expect, it } from 'vitest'

import { showEPSMinstePensjonsgivendeInntektFoerDoedsfall } from './utils'

describe('showEPSMinstePensjonsgivendeInntektFoerDoedsfall', () => {
	it('returnerer true når EPS døde før fylte 67 år', () => {
		expect(
			showEPSMinstePensjonsgivendeInntektFoerDoedsfall({
				relasjonstype: 'AVDOED_EKTEFELLE',
				relasjonPersondata: {
					foedselsdato: '1959-06-15',
					doedsdato: '2026-06-14',
				},
			})
		).toBe(true)
	})

	it('returnerer false når EPS døde etter fylte 67 år', () => {
		expect(
			showEPSMinstePensjonsgivendeInntektFoerDoedsfall({
				relasjonstype: 'AVDOED_EKTEFELLE',
				relasjonPersondata: {
					foedselsdato: '1959-06-15',
					doedsdato: '2026-06-16',
				},
			})
		).toBe(false)
	})
})

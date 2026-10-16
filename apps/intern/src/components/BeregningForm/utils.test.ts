import { describe, expect, it } from 'vitest'

import {
	getVilkaarsproevingDynamicValues,
	showEPSMinstePensjonsgivendeInntektFoerDoedsfall,
} from './utils'

describe('getVilkaarsproevingDynamicValues', () => {
	it.each([true, false])(
		'supplies helt_alder independently of visGradert=%s',
		(visGradert) => {
			expect(
				getVilkaarsproevingDynamicValues({
					heltUttakAlder: { aar: 67, maaneder: 3 },
					gradertUttakAlder: { aar: 63, maaneder: 2 },
					uttaksgrad: 50,
					visGradert,
				})
			).toEqual({
				helt_alder: '67 år og 3 måneder',
				gradert_alder: '63 år og 2 måneder',
				alder: visGradert ? '63 år og 2 måneder' : '67 år og 3 måneder',
				grad: visGradert ? 50 : 100,
				grad_gradert: 50,
			})
		}
	)
	it('preserves fallbacks without a graded alternative', () => {
		expect(
			getVilkaarsproevingDynamicValues({
				heltUttakAlder: { aar: 67, maaneder: 0 },
				visGradert: true,
			})
		).toEqual({
			helt_alder: '67 år',
			alder: '67 år',
			gradert_alder: '',
			grad: 100,
			grad_gradert: 100,
		})
	})
})

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

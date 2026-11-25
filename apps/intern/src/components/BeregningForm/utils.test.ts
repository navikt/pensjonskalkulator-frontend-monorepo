import { describe, expect, it } from 'vitest'

import {
	getUttaksGradArray,
	getVilkaarsproevingDynamicValues,
	showEPSMinstePensjonsgivendeInntektFoerDoedsfall,
} from './utils'

describe('getUttaksGradArray', () => {
	it.each([
		{
			ufoeretrygdgrad: 50,
			skalBeregneLivsvarigAFP: true,
			grader: [20, 40, 50, 60, 80, 100],
		},
		{
			ufoeretrygdgrad: 100,
			skalBeregneLivsvarigAFP: true,
			grader: [20, 40, 50, 60, 80, 100],
		},
		{
			ufoeretrygdgrad: 50,
			skalBeregneLivsvarigAFP: false,
			grader: [20, 40, 50, 100],
		},
		{
			ufoeretrygdgrad: 100,
			skalBeregneLivsvarigAFP: false,
			grader: [100],
		},
	])(
		'gir riktige grader ved UT $ufoeretrygdgrad og livsvarig AFP $skalBeregneLivsvarigAFP',
		({ ufoeretrygdgrad, skalBeregneLivsvarigAFP, grader }) => {
			expect(
				getUttaksGradArray({
					skalBeregneAFPPrivat: false,
					skalBeregneLivsvarigAFP,
					ufoeretrygdgrad,
					erEndring: false,
					alderAarUttak: 65,
				})
			).toEqual(grader)
		}
	)
})

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
	it.each([undefined, null])(
		'uses the full age when the graded alternative is %s',
		(gradertUttakAlder) => {
			expect(
				getVilkaarsproevingDynamicValues({
					heltUttakAlder: { aar: 67, maaneder: 0 },
					gradertUttakAlder,
					visGradert: true,
				})
			).toEqual({
				helt_alder: '67 år',
				alder: '67 år',
				gradert_alder: '67 år',
				grad: 100,
				grad_gradert: 100,
			})
		}
	)
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

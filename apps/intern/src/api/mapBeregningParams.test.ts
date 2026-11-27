import type {
	PersonInternV1,
	Vedtak,
} from '@pensjonskalkulator-frontend-monorepo/types'
import { describe, expect, test } from 'vitest'

import { defaultBeregningFormData } from './beregningTypes'
import { getLivsvarigAfpBeloep } from './formConditions'
import {
	mapBeregningParamsToRequest,
	mapInnvilgetLivsvarigAfp,
} from './mapBeregningParams'

describe('getLivsvarigAfpBeloep', () => {
	test.each([undefined, null, 0, 8347])(
		'returnerer beløp %s fra vedtak',
		(beloep) => {
			expect(
				getLivsvarigAfpBeloep({
					harVedtak: true,
					fremtidigAlderspensjon: {
						grad: 100,
						fom: '2029-01-01',
						livsvarigOffentligAfpMaanedsbeloep: beloep,
					},
				})
			).toBe(beloep ?? undefined)
		}
	)
})

describe('innvilget livsvarig AFP fra v4', () => {
	test('støtter responsen med kun periodedato og null kroner', () => {
		expect(
			mapInnvilgetLivsvarigAfp(
				{
					afpInnvilget: true,
					maanedligBeloepListe: [{ virkningFom: '2026-11-24', beloep: 0 }],
				},
				{ aar: 65, maaneder: 0 },
				'1964-04-30'
			)
		).toMatchObject({
			aarligBruttoBeloep: 0,
			uttakFom: '2026-11-24',
		})
	})

	const afp = {
		afpInnvilget: true,
		virkningFom: '2027-01-01',
		sistBenyttetGrunnbeloep: 130160,
		maanedligBeloepListe: [
			{ virkningFom: '2031-01-01', beloep: 9000 },
			{ virkningFom: '2029-01-01', beloep: 8347 },
		],
	}

	test('velger beløpet som gjelder ved første AP-uttak fra to perioder', () => {
		expect(
			mapInnvilgetLivsvarigAfp(afp, { aar: 65, maaneder: 0 }, '1964-04-30')
		).toEqual({
			aarligBruttoBeloep: 100164,
			uttakFom: '2027-01-01',
			sistRegulertGrunnbeloep: 130160,
		})
	})

	test('beholder null kroner som et gyldig beløp', () => {
		expect(
			mapInnvilgetLivsvarigAfp(
				{
					...afp,
					maanedligBeloepListe: [{ virkningFom: '2029-05-01', beloep: 0 }],
				},
				{ aar: 65, maaneder: 0 },
				'1964-04-30'
			).aarligBruttoBeloep
		).toBe(0)
	})

	test.each([
		{ maanedligBeloepListe: [] },
		{ maanedligBeloepListe: [{ virkningFom: '2030-01-01', beloep: 8000 }] },
		{ maanedligBeloepListe: [{ virkningFom: '2029-01-01', beloep: null }] },
		{ maanedligBeloepListe: [{ virkningFom: null, beloep: 8000 }] },
		{ maanedligBeloepListe: [{ virkningFom: '2029-01-01', beloep: Infinity }] },
	])(
		'gir feil hvis beløp ved valgt AP-uttak mangler (%j)',
		({ maanedligBeloepListe }) => {
			expect(() =>
				mapInnvilgetLivsvarigAfp(
					{ ...afp, maanedligBeloepListe },
					{ aar: 65, maaneder: 0 },
					'1964-04-30'
				)
			).toThrow()
		}
	)
})

const person: PersonInternV1 = {
	navn: 'Test Person',
	foedselsdato: '1963-01-01',
	sivilstand: 'UGIFT',
	sivilstatus: 'UGIFT',
	pensjoneringAldre: {
		nedreAldersgrense: { aar: 62, maaneder: 0 },
		normertPensjoneringsalder: { aar: 67, maaneder: 0 },
		oevreAldersgrense: { aar: 75, maaneder: 0 },
	},
}

describe('simuleringstype for offentlig AFP', () => {
	test.each([8347, 0])('bruker månedlig AFP-beløp %s fra vedtak', (beloep) => {
		const vedtak: Vedtak = {
			harVedtak: true,
			fremtidigAlderspensjon: {
				grad: 100,
				fom: '2029-01-01',
				livsvarigOffentligAfpMaanedsbeloep: beloep,
			},
		}
		const request = mapBeregningParamsToRequest(
			{ ...defaultBeregningFormData, afp: 'ja_offentlig', endringAP: true },
			false,
			person,
			undefined,
			vedtak
		)

		expect(request.offentligAfp?.innvilgetLivsvarigAfpListe).toEqual([
			{ aarligBruttoBeloep: beloep * 12, uttakFom: '2029-01-01' },
		])
	})

	test.each([false, true])(
		'velger simuleringstype for ja/nei til AFP med endringAP %s',
		(endringAP) => {
			const request = mapBeregningParamsToRequest(
				{
					...defaultBeregningFormData,
					afp: 'ja_offentlig',
					endringAP,
				},
				false,
				person
			)

			expect(request.simuleringstype).toBe(
				endringAP
					? 'ENDRING_ALDERSPENSJON_MED_LIVSVARIG_OFFENTLIG_AFP'
					: 'ALDERSPENSJON_MED_LIVSVARIG_OFFENTLIG_AFP'
			)
			expect(request.offentligAfp).toBeUndefined()

			const requestUtenAfp = mapBeregningParamsToRequest(
				{
					...defaultBeregningFormData,
					afp: 'nei',
					endringAP,
				},
				false,
				person
			)

			expect(requestUtenAfp.simuleringstype).toBe(
				endringAP ? 'ENDRING_ALDERSPENSJON' : 'ALDERSPENSJON'
			)
		}
	)

	test.each([
		{ foedselsdato: '1962-12-31', erApoteker: false },
		{ foedselsdato: '1963-01-01', erApoteker: true },
	])(
		'beholder tidsbegrenset AFP ved fødselsdato $foedselsdato og erApoteker $erApoteker',
		({ foedselsdato, erApoteker }) => {
			const request = mapBeregningParamsToRequest(
				{ ...defaultBeregningFormData, afp: 'ja_offentlig' },
				erApoteker,
				{ ...person, foedselsdato }
			)

			expect(request.simuleringstype).toBe(
				'ALDERSPENSJON_MED_TIDSBEGRENSET_OFFENTLIG_AFP'
			)
		}
	)
})

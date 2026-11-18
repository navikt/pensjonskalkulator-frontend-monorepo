import type { Vedtak } from '@pensjonskalkulator-frontend-monorepo/types'
import { describe, expect, test } from 'vitest'

import { getVedtakStatus } from './utils'

describe('getVedtakStatus', () => {
	test.each([undefined, { harVedtak: false }])(
		'viser livsvarig AFP uten AP-vedtak (%s)',
		(vedtak) => {
			expect(getVedtakStatus(vedtak, undefined, { afpStatus: true })).toBe(
				'Livsvarig AFP i offentlig sektor'
			)
		}
	)

	test.each([false, null, undefined])(
		'beholder Uten vedtak når AFP-status er %s',
		(afpStatus) => {
			expect(
				getVedtakStatus({ harVedtak: false }, undefined, { afpStatus })
			).toBe('Uten vedtak')
		}
	)

	test.each([0, 50, 100])(
		'viser %s prosent AP sammen med livsvarig AFP',
		(grad) => {
			const vedtak: Vedtak = {
				harVedtak: true,
				loependeAlderspensjon: {
					grad,
					fom: '2026-01-01',
					uttaksgradFom: '2026-01-01',
					sivilstatus: 'UGIFT',
					harGjenlevenderett: false,
					harUtenlandsopphold: false,
				},
			}

			expect(getVedtakStatus(vedtak, undefined, { afpStatus: true })).toBe(
				`${grad} % alderspensjon fra 01.01.2026 / Livsvarig AFP i offentlig sektor`
			)
			expect(getVedtakStatus(vedtak, undefined, { afpStatus: false })).toBe(
				`${grad} % alderspensjon fra 01.01.2026`
			)
		}
	)

	test('viser fremtidig AP sammen med livsvarig AFP', () => {
		expect(
			getVedtakStatus(
				{
					harVedtak: true,
					fremtidigAlderspensjon: { grad: 100, fom: '2027-01-01' },
				},
				undefined,
				{ afpStatus: true }
			)
		).toBe(
			'100 % alderspensjon fra 01.01.2027 / Livsvarig AFP i offentlig sektor'
		)
	})

	test('beholder eksisterende oppførsel når AFP-respons mangler', () => {
		expect(getVedtakStatus()).toBe('Uten vedtak')
		expect(getVedtakStatus({ harVedtak: true, ufoeretrygdgrad: 100 })).toBe(
			'100 % uføretrygd '
		)
	})
})

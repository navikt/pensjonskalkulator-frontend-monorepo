import type { EpsOpplysninger } from '@pensjonskalkulator-frontend-monorepo/types'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { hideEpsPensjonsgivendeInntektFoerDoedsdato } from './utils'

const epsOpplysninger: EpsOpplysninger = {
	relasjonstype: 'AVDOED_EKTEFELLE',
	relasjonPersondata: {
		foedselsdato: '1949-12-31',
		doedsdato: '2025-01-01',
	},
}

describe('hideEpsPensjonsgivendeInntektFoerDoedsdato', () => {
	afterEach(() => {
		vi.useRealTimers()
	})

	it.each([
		['1950-01-01', false],
		['1949-12-31', true],
		['1949-01-01', true],
		['1948-01-01', true],
	])(
		'ved foedselsdato %s er skjuling %s',
		(foedselsdato, forventetSkjuling) => {
			expect(
				hideEpsPensjonsgivendeInntektFoerDoedsdato({
					epsOpplysninger: {
						...epsOpplysninger,
						relasjonPersondata: {
							...epsOpplysninger.relasjonPersondata,
							foedselsdato,
						},
					},
					brukerHarVedtakGjenlevendepensjon: false,
				})
			).toBe(forventetSkjuling)
		}
	)

	it.each([undefined, null, '1950-01-01'])(
		'skjuler ved gjenlevendepensjon uansett foedselsdato %s',
		(foedselsdato) => {
			expect(
				hideEpsPensjonsgivendeInntektFoerDoedsdato({
					epsOpplysninger: {
						...epsOpplysninger,
						relasjonPersondata: { foedselsdato },
					},
					brukerHarVedtakGjenlevendepensjon: true,
				})
			).toBe(true)
		}
	)

	it('beholder feltet når foedselsdato mangler uten gjenlevendepensjon', () => {
		expect(
			hideEpsPensjonsgivendeInntektFoerDoedsdato({
				epsOpplysninger: { relasjonstype: 'AVDOED_EKTEFELLE' },
				brukerHarVedtakGjenlevendepensjon: false,
			})
		).toBe(false)
	})

	it('bruker doedsdato fra vedtak fremfor EPS-oppslaget', () => {
		expect(
			hideEpsPensjonsgivendeInntektFoerDoedsdato({
				epsOpplysninger,
				vedtakInfoAvdoed: { doedsdato: '2024-12-31' },
				brukerHarVedtakGjenlevendepensjon: false,
			})
		).toBe(false)
	})

	it('bruker gårsdagen når doedsdato ikke er registrert', () => {
		vi.useFakeTimers()
		vi.setSystemTime(new Date(2026, 0, 1, 12))

		expect(
			hideEpsPensjonsgivendeInntektFoerDoedsdato({
				epsOpplysninger: {
					...epsOpplysninger,
					relasjonPersondata: { foedselsdato: '1950-12-31' },
				},
				brukerHarVedtakGjenlevendepensjon: false,
			})
		).toBe(false)
	})
})

import type { Vedtak } from '@pensjonskalkulator-frontend-monorepo/types'
import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import { OpplysningerFraVedtak } from './OpplysningerFraVedtak'

const vedtak: Vedtak = {
	harVedtak: true,
	loependeAlderspensjon: {
		grad: 100,
		fom: '2025-05-01',
		uttaksgradFom: '2023-08-01',
		sivilstatus: 'ENKE_ELLER_ENKEMANN',
		harGjenlevenderett: false,
		harUtenlandsopphold: false,
	},
}

describe('OpplysningerFraVedtak', () => {
	test('viser sivilstatus i normal case', () => {
		render(<OpplysningerFraVedtak vedtak={vedtak} />)

		expect(
			screen.getByRole('cell', { name: 'Enke eller enkemann' })
		).toBeVisible()
	})
})

import type { PersonInternV1 } from '@pensjonskalkulator-frontend-monorepo/types'
import { describe, expect, test } from 'vitest'

import { defaultBeregningFormData } from './beregningTypes'
import { mapBeregningParamsToRequest } from './mapBeregningParams'

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

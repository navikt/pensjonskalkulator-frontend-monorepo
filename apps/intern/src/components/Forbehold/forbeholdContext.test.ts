import type { Vedtak } from '@pensjonskalkulator-frontend-monorepo/types'
import { describe, expect, it } from 'vitest'

import type { BeregningParams } from '../../api/beregningTypes'
import { buildForbeholdContext } from './forbeholdContext'

const build = (
	aktivBeregning: Partial<BeregningParams> | null,
	vedtak?: Partial<Vedtak>
) =>
	buildForbeholdContext({
		aktivBeregning: aktivBeregning as BeregningParams | null,
		person: undefined,
		vedtak: vedtak as Vedtak | undefined,
		omstillingsstoenad: undefined,
	})

describe('buildForbeholdContext utenlandsopphold', () => {
	it('har ingen utenlandsopphold uten beregning eller vedtak', () => {
		const ctx = build(null)
		expect(ctx.harUtenlandsopphold).toBe(false)
		expect(ctx.harVedtakUtenlandsopphold).toBe(false)
	})

	it('setter harUtenlandsopphold når beregningen har opphold', () => {
		const ctx = build({ harOppholdUtenforNorge: true })
		expect(ctx.harUtenlandsopphold).toBe(true)
		expect(ctx.harVedtakUtenlandsopphold).toBe(false)
	})

	it('setter harVedtakUtenlandsopphold når vedtak om AP har opphold', () => {
		const ctx = build(null, {
			loependeAlderspensjon: { harUtenlandsopphold: true },
		} as Partial<Vedtak>)
		expect(ctx.harVedtakUtenlandsopphold).toBe(true)
		expect(ctx.harUtenlandsopphold).toBe(false)
	})
})

import { describe, expect, it } from 'vitest'

import type { ForbeholdContext } from '../../schemaTypes/forbeholdVilkaarTags'
import { evaluateForbeholdVilkaar } from '../evaluateForbeholdVilkaar'

const ctx = (overrides: ForbeholdContext = {}): ForbeholdContext => overrides

describe('evaluateForbeholdVilkaar', () => {
	describe('alltidSynlig', () => {
		it('returns true when alltidSynlig is set, even with non-matching vilkaar', () => {
			expect(
				evaluateForbeholdVilkaar(
					{
						alltidSynlig: true,
						vilkaar: [{ betingelser: [{ tag: 'harUfoeretrygd' }] }],
					},
					ctx({ harUfoeretrygd: false })
				)
			).toBe(true)
		})
	})

	describe('empty / missing vilkaar', () => {
		it('returns true for null source', () => {
			expect(evaluateForbeholdVilkaar(null, ctx())).toBe(true)
		})

		it('returns true for undefined source', () => {
			expect(evaluateForbeholdVilkaar(undefined, ctx())).toBe(true)
		})

		it('returns true when vilkaar list is empty', () => {
			expect(evaluateForbeholdVilkaar({ vilkaar: [] }, ctx())).toBe(true)
		})

		it('returns true when source is an empty array (raw vilkaar shape)', () => {
			expect(evaluateForbeholdVilkaar([], ctx())).toBe(true)
		})

		it('treats an empty betingelser group as matching', () => {
			expect(
				evaluateForbeholdVilkaar(
					{ vilkaar: [{ betingelser: [] }] },
					ctx({ harUfoeretrygd: false })
				)
			).toBe(true)
		})
	})

	describe('AND within a group', () => {
		const source = {
			vilkaar: [
				{
					betingelser: [
						{ tag: 'harUfoeretrygd' },
						{ tag: 'beregnerAfpPrivat' },
					],
				},
			],
		}

		it('matches when all conditions are true', () => {
			expect(
				evaluateForbeholdVilkaar(
					source,
					ctx({ harUfoeretrygd: true, beregnerAfpPrivat: true })
				)
			).toBe(true)
		})

		it('does not match when any condition is false', () => {
			expect(
				evaluateForbeholdVilkaar(
					source,
					ctx({ harUfoeretrygd: true, beregnerAfpPrivat: false })
				)
			).toBe(false)
		})

		it('treats a missing tag in ctx as false', () => {
			expect(
				evaluateForbeholdVilkaar(source, ctx({ harUfoeretrygd: true }))
			).toBe(false)
		})
	})

	describe('OR across groups', () => {
		const source = {
			vilkaar: [
				{ betingelser: [{ tag: 'harUfoeretrygd' }] },
				{ betingelser: [{ tag: 'foedtFoer1963' }] },
			],
		}

		it('matches when only the first group matches', () => {
			expect(
				evaluateForbeholdVilkaar(source, ctx({ harUfoeretrygd: true }))
			).toBe(true)
		})

		it('matches when only the second group matches', () => {
			expect(
				evaluateForbeholdVilkaar(source, ctx({ foedtFoer1963: true }))
			).toBe(true)
		})

		it('does not match when no group matches', () => {
			expect(evaluateForbeholdVilkaar(source, ctx())).toBe(false)
		})
	})

	describe('negation (EXCEPT)', () => {
		it('matches when negert tag is false in ctx', () => {
			expect(
				evaluateForbeholdVilkaar(
					{
						vilkaar: [
							{ betingelser: [{ tag: 'harUfoeretrygd', negert: true }] },
						],
					},
					ctx({ harUfoeretrygd: false })
				)
			).toBe(true)
		})

		it('does not match when negert tag is true in ctx', () => {
			expect(
				evaluateForbeholdVilkaar(
					{
						vilkaar: [
							{ betingelser: [{ tag: 'harUfoeretrygd', negert: true }] },
						],
					},
					ctx({ harUfoeretrygd: true })
				)
			).toBe(false)
		})

		it('combines AND with negation correctly', () => {
			expect(
				evaluateForbeholdVilkaar(
					{
						vilkaar: [
							{
								betingelser: [
									{ tag: 'beregnerAfpPrivat' },
									{ tag: 'har100Ufoeretrygd', negert: true },
								],
							},
						],
					},
					ctx({ beregnerAfpPrivat: true, har100Ufoeretrygd: false })
				)
			).toBe(true)
		})
	})

	describe('unknown / malformed conditions', () => {
		it('treats an unknown tag as not matching', () => {
			expect(
				evaluateForbeholdVilkaar(
					{
						vilkaar: [{ betingelser: [{ tag: 'tagSomIkkeFinnes' }] }],
					},
					ctx()
				)
			).toBe(false)
		})

		it('treats a missing tag string as not matching', () => {
			expect(
				evaluateForbeholdVilkaar(
					{ vilkaar: [{ betingelser: [{ tag: undefined }] }] },
					ctx()
				)
			).toBe(false)
		})

		it('still matches if another group is satisfied alongside an unknown-tag group', () => {
			expect(
				evaluateForbeholdVilkaar(
					{
						vilkaar: [
							{ betingelser: [{ tag: 'tagSomIkkeFinnes' }] },
							{ betingelser: [{ tag: 'harUfoeretrygd' }] },
						],
					},
					ctx({ harUfoeretrygd: true })
				)
			).toBe(true)
		})
	})

	describe('raw array source (without alltidSynlig wrapper)', () => {
		it('evaluates a vilkaar array directly', () => {
			expect(
				evaluateForbeholdVilkaar(
					[{ betingelser: [{ tag: 'harUfoeretrygd' }] }],
					ctx({ harUfoeretrygd: true })
				)
			).toBe(true)
		})
	})

	describe('additional edge cases', () => {
		it('treats betingelser: null as an empty group (matches)', () => {
			expect(
				evaluateForbeholdVilkaar({ vilkaar: [{ betingelser: null }] }, ctx())
			).toBe(true)
		})

		it('treats an empty-string tag as not matching', () => {
			expect(
				evaluateForbeholdVilkaar(
					{ vilkaar: [{ betingelser: [{ tag: '' }] }] },
					ctx()
				)
			).toBe(false)
		})

		it('matches when multiple OR groups all match (true OR true)', () => {
			expect(
				evaluateForbeholdVilkaar(
					{
						vilkaar: [
							{ betingelser: [{ tag: 'harUfoeretrygd' }] },
							{ betingelser: [{ tag: 'beregnerAfpPrivat' }] },
						],
					},
					ctx({ harUfoeretrygd: true, beregnerAfpPrivat: true })
				)
			).toBe(true)
		})

		it('handles complex (A AND NOT B) OR (C AND D) combinations', () => {
			const source = {
				vilkaar: [
					{
						betingelser: [
							{ tag: 'harUfoeretrygd' },
							{ tag: 'har100Ufoeretrygd', negert: true },
						],
					},
					{
						betingelser: [
							{ tag: 'beregnerAfpPrivat' },
							{ tag: 'foedtFoer1963' },
						],
					},
				],
			}

			// Group 1 matches: gradert uføretrygd
			expect(
				evaluateForbeholdVilkaar(
					source,
					ctx({ harUfoeretrygd: true, har100Ufoeretrygd: false })
				)
			).toBe(true)

			// Group 1 fails (100% ufør), group 2 matches
			expect(
				evaluateForbeholdVilkaar(
					source,
					ctx({
						harUfoeretrygd: true,
						har100Ufoeretrygd: true,
						beregnerAfpPrivat: true,
						foedtFoer1963: true,
					})
				)
			).toBe(true)

			// Neither group matches
			expect(
				evaluateForbeholdVilkaar(
					source,
					ctx({
						harUfoeretrygd: true,
						har100Ufoeretrygd: true,
						beregnerAfpPrivat: true,
						foedtFoer1963: false,
					})
				)
			).toBe(false)
		})

		it('does not mutate the input source or ctx', () => {
			const source = {
				alltidSynlig: false,
				vilkaar: [
					{
						betingelser: [
							{ tag: 'harUfoeretrygd' },
							{ tag: 'beregnerAfpPrivat', negert: true },
						],
					},
				],
			}
			const sourceSnapshot = structuredClone(source)
			const context = ctx({ harUfoeretrygd: true, beregnerAfpPrivat: false })
			const ctxSnapshot = { ...context }

			evaluateForbeholdVilkaar(source, context)

			expect(source).toEqual(sourceSnapshot)
			expect(context).toEqual(ctxSnapshot)
		})

		it('ignores unknown extra tags in ctx (only declared tags affect outcome)', () => {
			const source = {
				vilkaar: [{ betingelser: [{ tag: 'harUfoeretrygd' }] }],
			}
			const ctxWithExtras = {
				harUfoeretrygd: true,
				// Bevisst ukjent tag for å sjekke at den ikke påvirker evalueringen.
				ukjentTagSomIkkeFinnes: true,
			} as unknown as ForbeholdContext

			expect(evaluateForbeholdVilkaar(source, ctxWithExtras)).toBe(true)
		})

		it('does not match when unknown ctx tag is referenced by a betingelse', () => {
			expect(
				evaluateForbeholdVilkaar(
					{
						vilkaar: [{ betingelser: [{ tag: 'ukjentTagSomIkkeFinnes' }] }],
					},
					ctx({ harUfoeretrygd: true })
				)
			).toBe(false)
		})

		it('treats negert true on an unknown tag as matching (NOT-of-false)', () => {
			// Konsistens: ukjent tag => `false` i ctx, så `negert` blir `true`.
			// Dokumentert med test så vi vet om vi noen gang endrer denne semantikken.
			expect(
				evaluateForbeholdVilkaar(
					{
						vilkaar: [
							{
								betingelser: [{ tag: 'ukjentTagSomIkkeFinnes', negert: true }],
							},
						],
					},
					ctx()
				)
			).toBe(true)
		})
	})
})

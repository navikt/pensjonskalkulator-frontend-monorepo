import { type NodePatch, at, defineMigration, set } from 'sanity/migrate'

/**
 * Migration: split the legacy `innhold` field on `forbeholdAvsnitt` into
 * separate `innholdEkstern` and `innholdIntern` fields, and default the new
 * `visEkstern` / `visIntern` toggles to `true` for existing documents so they
 * keep showing up in both apps.
 *
 * Existing `innhold` is duplicated into both new fields.
 *
 * Dry-run (no writes):
 *   pnpm --filter @pensjonskalkulator-frontend-monorepo/sanity exec \
 *     -- npx sanity migration run split-forbehold-innhold --no-progress
 *
 * Run for real (writes to the configured dataset):
 *   pnpm --filter @pensjonskalkulator-frontend-monorepo/sanity exec \
 *     -- npx sanity migration run split-forbehold-innhold --no-dry-run
 */

interface ForbeholdAvsnittDoc {
	innhold?: unknown
	visEkstern?: boolean
	visIntern?: boolean
}

export default defineMigration({
	title: 'Split forbeholdAvsnitt.innhold into innholdEkstern and innholdIntern',
	documentTypes: ['forbeholdAvsnitt'],

	migrate: {
		document(doc) {
			const { innhold, visEkstern, visIntern } = doc as ForbeholdAvsnittDoc
			const ops: NodePatch[] = []

			if (innhold !== undefined) {
				ops.push(at('innholdEkstern', set(innhold)))
				ops.push(at('innholdIntern', set(innhold)))
			}

			if (visEkstern === undefined) {
				ops.push(at('visEkstern', set(true)))
			}

			if (visIntern === undefined) {
				ops.push(at('visIntern', set(true)))
			}

			return ops
		},
	},
})

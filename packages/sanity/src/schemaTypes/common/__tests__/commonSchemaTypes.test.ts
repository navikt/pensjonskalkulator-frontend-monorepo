import { type Workspace, createSchema, validateDocument } from 'sanity'
import { describe, expect, it, vi } from 'vitest'

import { languageField, nameField } from '../commonSchemaTypes'

const schema = createSchema({
	name: 'name-validation',
	types: ['alert', 'readmore'].map((name) => ({
		name,
		type: 'document',
		fields: [nameField, languageField],
	})),
})

async function validateName({
	name = 'test-alert',
	type = 'alert',
	id = 'drafts.current-document',
	language,
	duplicateCount = 0,
	fetchError,
}: {
	name?: string
	type?: string
	id?: string
	language?: string
	duplicateCount?: number
	fetchError?: Error
} = {}) {
	const fetch = fetchError
		? vi.fn().mockRejectedValue(fetchError)
		: vi.fn().mockResolvedValue(duplicateCount)
	const withConfig = vi.fn(() => ({ fetch }))
	const getClient = vi.fn(() => ({ withConfig }))
	const workspace = {
		schema,
		getClient,
		i18n: { loadNamespaces: async () => {}, t: (key: string) => key },
	} as unknown as Workspace
	const errors = await validateDocument({
		document: {
			_id: id,
			_type: type,
			_createdAt: '2026-11-03T00:00:00Z',
			_updatedAt: '2026-11-03T00:00:00Z',
			_rev: 'test-revision',
			name,
			language,
		},
		workspace,
		getDocumentExists: async () => true,
	})
	return { errors, fetch, withConfig }
}

describe('nameField', () => {
	it('accepts a unique name and checks drafts without using cached content', async () => {
		const { errors, fetch, withConfig } = await validateName()

		expect(errors).toEqual([])
		expect(withConfig).toHaveBeenCalledWith({
			useCdn: false,
			perspective: 'raw',
		})
		expect(fetch).toHaveBeenCalledWith(
			'count(*[_type == $type && name == $name && !(_id in [$id, $draftId]) && ($type == "alert" || coalesce(language, "") == $language)])',
			{
				type: 'alert',
				name: 'test-alert',
				id: 'current-document',
				draftId: 'drafts.current-document',
				language: '',
			}
		)
	})

	it('rejects a duplicate name with an actionable error', async () => {
		const { errors } = await validateName({ duplicateCount: 1 })

		expect(errors).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					level: 'error',
					path: ['name'],
					message:
						'Et dokument med samme navn finnes allerede. Velg et annet navn.',
				}),
			])
		)
	})

	it.each(['current-document', 'drafts.current-document'])(
		'excludes both versions of the current document when validating %s',
		async (id) => {
			const { errors, fetch } = await validateName({ id })

			expect(errors).toEqual([])
			expect(fetch.mock.calls[0][1]).toMatchObject({
				id: 'current-document',
				draftId: 'drafts.current-document',
			})
		}
	)

	it.each(['nb', 'nn', 'en'])(
		'scopes translated documents to language %s',
		async (language) => {
			const { errors, fetch } = await validateName({
				type: 'readmore',
				language,
			})

			expect(errors).toEqual([])
			expect(fetch.mock.calls[0][1]).toMatchObject({
				type: 'readmore',
				language,
			})
		}
	)

	it.each(['', '   '])(
		'rejects an empty name (%s) without querying Sanity',
		async (name) => {
			const { errors, fetch } = await validateName({ name })

			expect(errors).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						level: 'error',
						path: ['name'],
						message: 'Påkrevd',
					}),
				])
			)
			expect(fetch).not.toHaveBeenCalled()
		}
	)

	it('blocks publishing and logs an error if the uniqueness check fails', async () => {
		const fetchError = new Error('Sanity is unavailable')
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
		try {
			const { errors } = await validateName({ fetchError })

			expect(errors).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						level: 'error',
						path: ['name'],
						message: 'Kunne ikke kontrollere om navnet er unikt. Prøv igjen.',
					}),
				])
			)
			expect(consoleError).toHaveBeenCalledWith(
				'Kunne ikke kontrollere om Sanity-navnet er unikt',
				fetchError
			)
		} finally {
			consoleError.mockRestore()
		}
	})
})

import type {
	LoependeVedtak,
	Person,
} from '@pensjonskalkulator-frontend-monorepo/types'
import { skipToken, useQuery } from '@tanstack/react-query'

const API_BASE = '/pensjon/kalkulator/api'

async function fetchPerson(fnr: string): Promise<Person> {
	const response = await fetch(`${API_BASE}/v6/person`, {
		headers: {
			fnr,
		},
	})

	if (!response.ok) {
		throw new Error(`Failed to fetch person: ${response.status}`)
	}

	return response.json() as Promise<Person>
}

async function fetchLoependeVedtak(): Promise<LoependeVedtak> {
	const response = await fetch(`${API_BASE}/v4/vedtak/loepende-vedtak`)

	if (!response.ok) {
		throw new Error(`Failed to fetch loepende vedtak: ${response.status}`)
	}

	return response.json() as Promise<LoependeVedtak>
}

export function usePersonQuery(fnr?: string) {
	return useQuery({
		queryKey: ['person', fnr],
		queryFn: fnr ? () => fetchPerson(fnr) : skipToken,
	})
}

export function useLoependeVedtakQuery(enabled = true) {
	return useQuery({
		queryKey: ['loependeVedtak'],
		queryFn: fetchLoependeVedtak,
		enabled,
	})
}

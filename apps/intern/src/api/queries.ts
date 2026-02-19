import type {
	AlderspensjonRequestBody,
	LoependeVedtak,
	Person,
} from '@pensjonskalkulator-frontend-monorepo/types'
import { keepPreviousData, skipToken, useQuery } from '@tanstack/react-query'

import type { BeregningParams, BeregningResult } from './beregningTypes'
import { mapBeregningParamsToRequest } from './mapBeregningParams'

const API_BASE = '/pensjon/kalkulator/api'

async function decryptPid(encryptedPid: string): Promise<string> {
	const response = await fetch(`${API_BASE}/v1/decrypt`, {
		method: 'POST',
		headers: {
			'Content-Type': 'text/plain',
		},
		body: encryptedPid,
	})

	if (!response.ok) {
		throw new Error(`Failed to decrypt pid: ${response.status}`)
	}

	return response.text()
}

export function useDecryptPidQuery(encryptedPid?: string) {
	return useQuery({
		queryKey: ['decryptPid', encryptedPid],
		queryFn: encryptedPid ? () => decryptPid(encryptedPid) : skipToken,
	})
}

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

async function fetchLoependeVedtak(fnr: string): Promise<LoependeVedtak> {
	const response = await fetch(`${API_BASE}/v4/vedtak/loepende-vedtak`, {
		headers: {
			fnr,
		},
	})

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

export function useLoependeVedtakQuery(fnr?: string) {
	return useQuery({
		queryKey: ['loependeVedtak', fnr],
		queryFn: fnr ? () => fetchLoependeVedtak(fnr) : skipToken,
	})
}

async function fetchGrunnbeloep(): Promise<Grunnbeloep> {
	const response = await fetch('https://g.nav.no/api/v1/grunnbel%C3%B8p')

	if (!response.ok) {
		throw new Error(`Failed to fetch grunnbeløp: ${response.status}`)
	}

	return response.json() as Promise<Grunnbeloep>
}

export interface Grunnbeloep {
	dato: string
	grunnbeløp: number
	grunnbeløpPerMaaned: number
	gjennomsnittPerÅr: number
	omregningsfaktor: number
	virkningstidspunktForMinsteinntekt: string
}

export function useGrunnbeloepQuery() {
	return useQuery({
		queryKey: ['grunnbeloep'],
		queryFn: fetchGrunnbeloep,
	})
}

async function fetchBeregning(
	fnr: string,
	params: AlderspensjonRequestBody
): Promise<BeregningResult> {
	const response = await fetch(`${API_BASE}/v9/alderspensjon/simulering`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			fnr,
		},
		body: JSON.stringify(params),
	})

	if (!response.ok) {
		throw new Error(`Failed to fetch beregning: ${response.status}`)
	}

	return response.json() as Promise<BeregningResult>
}

export function useBeregningQuery(
	fnr: string | undefined,
	foedselsdato: string | undefined,
	params: BeregningParams | null
) {
	return useQuery({
		queryKey: ['beregning', fnr, params],
		queryFn:
			fnr && foedselsdato && params
				? () =>
						fetchBeregning(
							fnr,
							mapBeregningParamsToRequest(params, foedselsdato)
						)
				: skipToken,
		placeholderData: keepPreviousData,
	})
}

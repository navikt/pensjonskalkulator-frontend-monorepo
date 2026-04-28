import type {
	EpsOpplysninger,
	LoependeVedtak,
	PersonInternV1,
	SimuleringRequestBody,
	Sivilstatus,
} from '@pensjonskalkulator-frontend-monorepo/types'
import {
	keepPreviousData,
	skipToken,
	useMutation,
	useQuery,
} from '@tanstack/react-query'

import type { BeregningResult } from './beregningTypes'

export interface Grunnbeloep {
	dato: string
	grunnbeløp: number
	grunnbeløpPerMaaned: number
	gjennomsnittPerÅr: number
	omregningsfaktor: number
	virkningstidspunktForMinsteinntekt: string
}

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
		throw new Error(
			`Failed to decrypt pid: ${response.status} ${response.statusText}`
		)
	}

	return response.text()
}

export function useDecryptPidQuery(encryptedPid?: string) {
	return useQuery({
		queryKey: ['decryptPid', encryptedPid],
		queryFn: encryptedPid ? () => decryptPid(encryptedPid) : skipToken,
		retry: false,
	})
}

async function encryptPid(pid: string): Promise<string> {
	const response = await fetch(`${API_BASE}/v1/encrypt`, {
		method: 'POST',
		headers: {
			'Content-Type': 'text/plain',
		},
		body: pid,
	})

	if (!response.ok) {
		throw new Error(`Failed to encrypt pid: ${response.status}`)
	}

	return response.text()
}

export function useEncryptPidMutation() {
	return useMutation({
		mutationFn: encryptPid,
	})
}

interface FeatureToggle {
	enabled: boolean
}

async function fetchFeatureToggle(feature: string): Promise<FeatureToggle> {
	const response = await fetch(`${API_BASE}/feature/${feature}`)

	if (!response.ok) {
		throw new Error(`Failed to fetch feature toggle: ${response.status}`)
	}

	return response.json() as Promise<FeatureToggle>
}

export function useFeatureToggleQuery(feature: string) {
	return useQuery({
		queryKey: ['featureToggle', feature],
		queryFn: () => fetchFeatureToggle(feature),
	})
}

async function fetchPerson(fnr: string): Promise<PersonInternV1> {
	const response = await fetch(`${API_BASE}/intern/v1/person`, {
		headers: {
			fnr,
		},
	})

	if (!response.ok) {
		throw new Error(
			`Failed to fetch person data: ${response.status} ${response.statusText}`
		)
	}

	return response.json() as Promise<PersonInternV1>
}

async function fetchLoependeVedtak(fnr: string): Promise<LoependeVedtak> {
	const response = await fetch(`${API_BASE}/v4/vedtak/loepende-vedtak`, {
		headers: {
			fnr,
		},
	})

	if (!response.ok) {
		throw new Error(
			`Failed to fetch ongoing decisions: ${response.status} ${response.statusText}`
		)
	}

	return response.json() as Promise<LoependeVedtak>
}

async function fetchEPSOpplysninger({
	fnr,
	sivilstatus,
	bakgrunn,
}: {
	fnr: string
	sivilstatus: Sivilstatus
	bakgrunn: string
}): Promise<EpsOpplysninger> {
	const response = await fetch(`${API_BASE}/intern/v1/eps`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', fnr },
		body: JSON.stringify({ sivilstatus, bakgrunn }),
	})

	if (!response.ok) {
		throw new Error(
			`Failed to fetch EPS information: ${response.status} ${response.statusText}`
		)
	}

	return response.json() as Promise<EpsOpplysninger>
}

export interface Inntekt {
	beloep: number
	aar: number
}

async function fetchInntekt(fnr: string): Promise<Inntekt> {
	const response = await fetch(`${API_BASE}/inntekt`, {
		headers: {
			fnr,
		},
	})

	if (!response.ok) {
		throw new Error(`Failed to fetch inntekt: ${response.status}`)
	}

	return response.json() as Promise<Inntekt>
}

export function useInntektQuery(fnr?: string) {
	return useQuery({
		queryKey: ['inntekt', fnr],
		queryFn: fnr ? () => fetchInntekt(fnr) : skipToken,
		retry: false,
	})
}

async function fetchBeregning(
	fnr: string,
	params: SimuleringRequestBody
): Promise<BeregningResult> {
	const response = await fetch(`${API_BASE}/intern/v1/pensjon/simulering`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			fnr,
		},
		body: JSON.stringify(params),
	})

	if (!response.ok) {
		throw new Error(
			`Failed to calculate pension: ${response.status} ${response.statusText}`
		)
	}

	return response.json() as Promise<BeregningResult>
}

export function usePersonQuery(fnr?: string) {
	return useQuery({
		queryKey: ['person', fnr],
		queryFn: fnr ? () => fetchPerson(fnr) : skipToken,
		retry: false,
	})
}

export function useLoependeVedtakQuery(fnr?: string) {
	return useQuery({
		queryKey: ['loependeVedtak', fnr],
		queryFn: fnr ? () => fetchLoependeVedtak(fnr) : skipToken,
		retry: false,
	})
}

export function useEPSOpplysningerQuery({
	fnr,
	sivilstatus,
	bakgrunn,
}: {
	fnr?: string
	sivilstatus: Sivilstatus
	bakgrunn: string
}) {
	return useQuery({
		queryKey: ['EPSOpplysningerQuery', fnr, sivilstatus, bakgrunn],
		queryFn:
			fnr && sivilstatus && bakgrunn
				? () => fetchEPSOpplysninger({ fnr, sivilstatus, bakgrunn })
				: skipToken,
		retry: false,
	})
}

async function fetchGrunnbeloep(): Promise<Grunnbeloep> {
	const response = await fetch('https://g.nav.no/api/v1/grunnbel%C3%B8p')

	if (!response.ok) {
		throw new Error(`Failed to fetch grunnbeløp: ${response.status}`)
	}

	return response.json() as Promise<Grunnbeloep>
}

export function useGrunnbeloepQuery() {
	return useQuery({
		queryKey: ['grunnbeloep'],
		queryFn: fetchGrunnbeloep,
	})
}

export function useBeregningQuery(
	fnr: string | undefined,
	request: SimuleringRequestBody | null
) {
	return useQuery({
		queryKey: ['beregning', fnr, request],
		queryFn: fnr && request ? () => fetchBeregning(fnr, request) : skipToken,
		placeholderData: keepPreviousData,
	})
}

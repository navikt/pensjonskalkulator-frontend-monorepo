import type {
	AnsattEnhetResult,
	ApotekerStatus,
	EpsOpplysninger,
	LagreSimuleringResponseDtoV1,
	LagreSimuleringSpecDtoV1,
	OmstillingsstoenadOgGjenlevende,
	Opptjening,
	PersonInternV1,
	SimuleringRequestBody,
	Sivilstand,
	TilgangsnektAarsak,
	Vedtak,
} from '@pensjonskalkulator-frontend-monorepo/types'
import {
	keepPreviousData,
	skipToken,
	useMutation,
	useQuery,
} from '@tanstack/react-query'

import type { BeregningResult } from './beregningTypes'
import type { TilgangsnektResponse } from './typeguards'
import { isTilgangsnektResponse } from './typeguards'

export interface Grunnbeloep {
	dato: string
	grunnbeløp: number
	grunnbeløpPerMåned: number
	gjennomsnittPerÅr: number
	omregningsfaktor: number
	virkningstidspunktForMinsteinntekt: string
}

const API_BASE = '/pensjon/kalkulator/api'

export class KalkulatorError extends Error {
	status: number
	tilgangsnekt?: TilgangsnektResponse

	constructor(
		message: string,
		status: number,
		tilgangsnekt?: TilgangsnektResponse
	) {
		super(message)
		this.name = 'KalkulatorError'
		this.status = status
		this.tilgangsnekt = tilgangsnekt
	}
}

async function toKalkulatorError(
	response: Response,
	message: string
): Promise<KalkulatorError> {
	const body: unknown = await response.json().catch(() => undefined)
	const tilgangsnekt = isTilgangsnektResponse(body) ? body : undefined

	return new KalkulatorError(
		tilgangsnekt?.message ??
			`${message}: ${response.status} ${response.statusText}`,
		response.status,
		tilgangsnekt
	)
}

async function decryptPid(encryptedPid: string): Promise<string> {
	const response = await fetch(`${API_BASE}/v1/decrypt`, {
		method: 'POST',
		headers: {
			'Content-Type': 'text/plain',
		},
		body: encryptedPid,
	})

	if (!response.ok) {
		throw await toKalkulatorError(response, 'Failed to decrypt pid')
	}

	return response.text()
}

export function useDecryptPidQuery(encryptedPid?: string) {
	return useQuery<string, KalkulatorError>({
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
		throw await toKalkulatorError(response, 'Failed to encrypt pid')
	}

	return response.text()
}

export function useEncryptPidMutation() {
	return useMutation<string, KalkulatorError, string>({
		mutationFn: encryptPid,
	})
}

interface FeatureToggle {
	enabled: boolean
}

async function fetchFeatureToggle(feature: string): Promise<FeatureToggle> {
	const response = await fetch(`${API_BASE}/feature/${feature}`)

	if (!response.ok) {
		throw await toKalkulatorError(response, 'Failed to fetch feature toggle')
	}

	return response.json() as Promise<FeatureToggle>
}

export function useFeatureToggleQuery(feature: string) {
	return useQuery<FeatureToggle, KalkulatorError>({
		queryKey: ['featureToggle', feature],
		queryFn: () => fetchFeatureToggle(feature),
	})
}

export function useInternsimulatorLagreBrevButtonQuery() {
	return useFeatureToggleQuery('internsimulator.lagre-brev-button')
}

async function fetchPerson(fnr: string): Promise<PersonInternV1> {
	const response = await fetch(`${API_BASE}/intern/v1/person`, {
		headers: {
			fnr,
		},
	})

	if (!response.ok) {
		throw await toKalkulatorError(response, 'Failed to fetch person')
	}

	return response.json() as Promise<PersonInternV1>
}

async function fetchVedtak(fnr: string): Promise<Vedtak> {
	const response = await fetch(`${API_BASE}/v1/vedtak`, {
		headers: {
			fnr,
		},
	})

	if (!response.ok) {
		throw await toKalkulatorError(response, 'Failed to fetch decisions')
	}

	return response.json() as Promise<Vedtak>
}

export class EpsError extends KalkulatorError {
	aarsak?: TilgangsnektAarsak

	constructor(
		message: string,
		status: number,
		tilgangsnektAarsak?: TilgangsnektAarsak
	) {
		super(message, status)
		this.name = 'EpsError'
		this.aarsak = tilgangsnektAarsak
	}
}

async function fetchEPSOpplysninger({
	fnr,
	sivilstatus,
	bakgrunn,
}: {
	fnr: string
	sivilstatus: Sivilstand
	bakgrunn: string
}): Promise<EpsOpplysninger> {
	const response = await fetch(`${API_BASE}/intern/v1/eps`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', fnr },
		body: JSON.stringify({ sivilstatus, bakgrunn }),
	})

	if (!response.ok) {
		let aarsak: TilgangsnektAarsak | undefined
		try {
			const body = (await response.json()) as {
				problem?: { tilgangsnekt?: { aarsak?: TilgangsnektAarsak } }
			}
			aarsak = body?.problem?.tilgangsnekt?.aarsak
		} catch {
			// ignore parse errors
		}
		throw new EpsError(
			`Failed to fetch EPS information: ${response.status} ${response.statusText}`,
			response.status,
			aarsak
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
		throw await toKalkulatorError(response, 'Failed to fetch inntekt')
	}

	return response.json() as Promise<Inntekt>
}

export function useInntektQuery(fnr?: string) {
	return useQuery<Inntekt, KalkulatorError>({
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
		throw await toKalkulatorError(response, 'Failed to calculate pension')
	}

	return response.json() as Promise<BeregningResult>
}

export function usePersonQuery(fnr?: string) {
	return useQuery<PersonInternV1, KalkulatorError>({
		queryKey: ['person', fnr],
		queryFn: fnr ? () => fetchPerson(fnr) : skipToken,
		retry: false,
	})
}

export function useVedtakQuery(fnr?: string) {
	return useQuery<Vedtak, KalkulatorError>({
		queryKey: ['vedtak', fnr],
		queryFn: fnr ? () => fetchVedtak(fnr) : skipToken,
		retry: false,
	})
}

async function fetchOmstillingsstoenadOgGjenlevende(
	fnr: string
): Promise<OmstillingsstoenadOgGjenlevende> {
	const response = await fetch(
		`${API_BASE}/v1/loepende-omstillingsstoenad-eller-gjenlevendeytelse`,
		{
			headers: {
				fnr,
			},
		}
	)

	if (!response.ok) {
		throw await toKalkulatorError(
			response,
			'Failed to fetch omstillingsstønad/gjenlevende'
		)
	}

	return response.json() as Promise<OmstillingsstoenadOgGjenlevende>
}

export function useOmstillingsstoenadQuery(fnr?: string) {
	return useQuery<OmstillingsstoenadOgGjenlevende, KalkulatorError>({
		queryKey: ['omstillingsstoenad', fnr],
		queryFn: fnr ? () => fetchOmstillingsstoenadOgGjenlevende(fnr) : skipToken,
		retry: false,
	})
}

export function useEPSOpplysningerQuery({
	fnr,
	sivilstatus,
	bakgrunn,
}: {
	fnr?: string
	sivilstatus: Sivilstand
	bakgrunn: string
}) {
	return useQuery<EpsOpplysninger, EpsError>({
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
		throw await toKalkulatorError(response, 'Failed to fetch grunnbeløp')
	}

	return response.json() as Promise<Grunnbeloep>
}

export function useGrunnbeloepQuery() {
	return useQuery<Grunnbeloep, KalkulatorError>({
		queryKey: ['grunnbeloep'],
		queryFn: fetchGrunnbeloep,
	})
}

export function useBeregningQuery(
	fnr: string | undefined,
	request: SimuleringRequestBody | null,
	submitCount: number
) {
	return useQuery<BeregningResult, KalkulatorError>({
		queryKey: ['beregning', fnr, request, submitCount],
		queryFn: fnr && request ? () => fetchBeregning(fnr, request) : skipToken,
		placeholderData: keepPreviousData,
	})
}

async function fetchErApoteker(fnr: string): Promise<boolean | null> {
	const response = await fetch(`${API_BASE}/v1/er-apoteker`, {
		headers: {
			fnr,
		},
	}).catch(() => null)

	if (!response || !response.ok) {
		return null
	}

	const data = (await response.json()) as ApotekerStatus

	return data.apoteker
}

export function useErApotekerQuery(fnr?: string) {
	return useQuery<boolean | null, KalkulatorError>({
		queryKey: ['erApoteker', fnr],
		queryFn: fnr ? () => fetchErApoteker(fnr) : skipToken,
		retry: false,
	})
}

async function fetchOpptjening(fnr: string): Promise<Opptjening> {
	const response = await fetch(`${API_BASE}/intern/v1/opptjening`, {
		headers: {
			fnr,
		},
	})

	if (!response.ok) {
		throw await toKalkulatorError(response, 'Failed to fetch opptjening')
	}

	return response.json() as Promise<Opptjening>
}

export function useOpptjeningQueryForAvdoed(
	fnr?: string,
	beregnMedGjenlevenderett?: boolean
) {
	return useQuery<Opptjening, KalkulatorError>({
		queryKey: ['opptjening', fnr, beregnMedGjenlevenderett],
		queryFn:
			fnr && beregnMedGjenlevenderett ? () => fetchOpptjening(fnr) : skipToken,
		retry: false,
	})
}

async function lagreSimulering({
	fnr,
	spec,
}: {
	fnr: string
	spec: LagreSimuleringSpecDtoV1
}): Promise<LagreSimuleringResponseDtoV1> {
	const response = await fetch(`${API_BASE}/intern/v1/lagre-simulering`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			fnr,
		},
		body: JSON.stringify(spec),
	})

	if (!response.ok) {
		throw await toKalkulatorError(response, 'Failed to save simulation')
	}

	return response.json() as Promise<LagreSimuleringResponseDtoV1>
}

export function useLagreSimuleringMutation() {
	return useMutation<
		LagreSimuleringResponseDtoV1,
		KalkulatorError,
		{ fnr: string; spec: LagreSimuleringSpecDtoV1 }
	>({
		mutationFn: lagreSimulering,
	})
}

async function fetchEnheter(): Promise<AnsattEnhetResult> {
	const response = await fetch(`${API_BASE}/intern/v1/enheter`)

	if (!response.ok) {
		throw await toKalkulatorError(response, 'Failed to fetch enheter')
	}

	return response.json() as Promise<AnsattEnhetResult>
}

export function useEnheterQuery(enabled = true) {
	return useQuery<AnsattEnhetResult, KalkulatorError>({
		queryKey: ['enheter'],
		queryFn: fetchEnheter,
		enabled,
	})
}

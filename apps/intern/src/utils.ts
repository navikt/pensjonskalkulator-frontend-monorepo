import type { LoependeVedtak } from '@pensjonskalkulator-frontend-monorepo/types'

const DEV_DEFAULT_FNR = '00000000000'

export function getFnrFromUrl(): string | undefined {
	const params = new URLSearchParams(window.location.search)
	const fnrFromUrl = params.get('fnr')

	if (fnrFromUrl) {
		return fnrFromUrl
	}

	// In development mode (not backend mode), use default fnr for MSW testing
	if (import.meta.env.MODE === 'development') {
		return DEV_DEFAULT_FNR
	}

	return undefined
}

export function getLoependeVedtakStatus(
	loependeVedtak?: LoependeVedtak
): string {
	if (!loependeVedtak || !loependeVedtak.harLoependeVedtak) {
		return 'Uten vedtak'
	}

	return ''
}

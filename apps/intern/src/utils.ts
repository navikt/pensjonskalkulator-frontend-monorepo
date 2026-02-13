import type { LoependeVedtak } from '@pensjonskalkulator-frontend-monorepo/types'

const DEV_DEFAULT_FNR = '000000000000'

export function getFnrFromUrl(): string | undefined {
	if (import.meta.env.DEV) {
		return DEV_DEFAULT_FNR
	}

	const params = new URLSearchParams(window.location.search)
	return params.get('fnr') ?? undefined
}

export function getLoependeVedtakStatus(
	loependeVedtak?: LoependeVedtak
): string {
	if (!loependeVedtak || !loependeVedtak.harLoependeVedtak) {
		return 'Uten vedtak'
	}

	return ''
}

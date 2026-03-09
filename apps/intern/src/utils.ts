import type { LoependeVedtak } from '@pensjonskalkulator-frontend-monorepo/types'

export function getPidFromUrl(): string | undefined {
	const params = new URLSearchParams(window.location.search)
	return params.get('pid') ?? undefined
}

export function getLoependeVedtakStatus(
	loependeVedtak?: LoependeVedtak
): string {
	if (!loependeVedtak || !loependeVedtak.harLoependeVedtak) {
		return 'Uten vedtak'
	}

	return ''
}

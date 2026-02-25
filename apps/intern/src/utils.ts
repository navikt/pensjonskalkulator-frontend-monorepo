import type { LoependeVedtak } from '@pensjonskalkulator-frontend-monorepo/types'

const DEV_DEFAULT_PID = 'encrypted-default-pid'

export function getPidFromUrl(): string | undefined {
	const params = new URLSearchParams(window.location.search)
	const pid = params.get('pid')

	if (pid) {
		return pid
	}

	if (import.meta.env.MODE === 'development') {
		return DEV_DEFAULT_PID
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

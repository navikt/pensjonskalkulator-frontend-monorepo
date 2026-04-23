import type {
	LoependeVedtak,
	OmstillingsstoenadOgGjenlevende,
} from '@pensjonskalkulator-frontend-monorepo/types'

export function getPidFromUrl(): string | undefined {
	const params = new URLSearchParams(window.location.search)
	return params.get('pid') ?? undefined
}

export function getLoependeVedtakStatus(
	loependeVedtak?: LoependeVedtak,
	omstillingsstoenad?: OmstillingsstoenadOgGjenlevende
): string {
	if (omstillingsstoenad?.harLoependeSak) {
		return 'Omstillingsstønad/gjenlevendeytelse'
	}

	if (!loependeVedtak || !loependeVedtak.harLoependeVedtak) {
		return 'Uten vedtak'
	}

	return ''
}

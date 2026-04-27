import type {
	Vedtak,
	VedtakInformasjonOmAvdoed,
} from '@pensjonskalkulator-frontend-monorepo/types'

export function getPidFromUrl(): string | undefined {
	const params = new URLSearchParams(window.location.search)
	return params.get('pid') ?? undefined
}

export function getLoependeVedtakStatus(vedtak?: Vedtak): boolean {
	if (!vedtak || !vedtak.loependeAlderspensjon) {
		return false
	}

	return vedtak.harVedtak
}

export function getEpsVedtakStatus(
	vedtak?: Vedtak
): VedtakInformasjonOmAvdoed | undefined {
	if (vedtak && vedtak.avdoed) {
		return vedtak.avdoed
	}

	return
}

import type { LoependeVedtak } from '@pensjonskalkulator-frontend-monorepo/types'
import { format, parseISO } from 'date-fns'

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

	const { alderspensjon, afpPrivat } = loependeVedtak
	const alderspensjonString = alderspensjon
		? `${alderspensjon.grad} % alderspensjon fra ${format(parseISO(alderspensjon.fom), 'dd.MM.yyyy')}`
		: ''
	const afpPrivatString = afpPrivat ? ' / AFP i privat sektor' : ''

	return `${alderspensjonString}${afpPrivatString}`
}

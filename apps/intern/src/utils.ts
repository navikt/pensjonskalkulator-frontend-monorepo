import type {
	Vedtak,
	VedtakInformasjonOmAvdoed,
} from '@pensjonskalkulator-frontend-monorepo/types'
import { format, parseISO } from 'date-fns'

export function getPidFromUrl(): string | undefined {
	const params = new URLSearchParams(window.location.search)
	return params.get('pid') ?? undefined
}

export function getVedtakStatus(vedtak?: Vedtak): string {
	if (!vedtak || !vedtak.harVedtak) {
		return 'Uten vedtak'
	}

	const loependeAlderspensjon = vedtak.loependeAlderspensjon
	const alderspensjonString = loependeAlderspensjon
		? `${loependeAlderspensjon.grad} % alderspensjon fra ${format(parseISO(loependeAlderspensjon.fom), 'dd.MM.yyyy')}`
		: ''
	const afpPrivatString = vedtak.privatAfpFom ? ' / AFP i privat sektor' : ''

	return `${alderspensjonString}${afpPrivatString}`
}

export function getEpsVedtakStatus(
	vedtak?: Vedtak
): VedtakInformasjonOmAvdoed | undefined {
	if (vedtak && vedtak.avdoed) {
		return vedtak.avdoed
	}

	return
}

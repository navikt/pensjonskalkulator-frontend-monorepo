import type {
	OmstillingsstoenadOgGjenlevende,
	Vedtak,
	VedtakInformasjonOmAvdoed,
} from '@pensjonskalkulator-frontend-monorepo/types'
import { format, parseISO } from 'date-fns'

export function getPidFromUrl(): string | undefined {
	const params = new URLSearchParams(window.location.search)
	return params.get('pid') ?? undefined
}

export function getEnhetsidFromUrl(): string | undefined {
	const params = new URLSearchParams(window.location.search)
	return params.get('saksbehandlerValgtEnhet') ?? undefined
}

export function getPesysBrukeroversiktUrl(): string {
	return window.location.hostname.endsWith('.dev.nav.no')
		? 'https://pensjon-psak-q2.intern.dev.nav.no/psak/bruker/brukeroversikt'
		: 'https://pensjon-psak.nais.adeo.no/psak/bruker/brukeroversikt'
}

export function getVedtakStatus(
	vedtak?: Vedtak,
	omstillingsstoenad?: OmstillingsstoenadOgGjenlevende
): string {
	const loependeAlderspensjon = vedtak?.loependeAlderspensjon
	const fremtidigAlderspensjon = vedtak?.fremtidigAlderspensjon

	const APFomDato = loependeAlderspensjon?.uttaksgradFom ?? ''
	const alderspensjonString = loependeAlderspensjon
		? `${loependeAlderspensjon.grad} % alderspensjon fra ${format(parseISO(APFomDato), 'dd.MM.yyyy')}`
		: ''
	if (omstillingsstoenad?.harLoependeSak) {
		return 'Gjenlevendepensjon eller omstillingsstønad'
	}

	const fremtidigAlderspensjonString = fremtidigAlderspensjon
		? `${alderspensjonString.length > 0 ? ' / ' : ''}${fremtidigAlderspensjon.grad} % alderspensjon fra ${format(parseISO(fremtidigAlderspensjon.fom), 'dd.MM.yyyy')}`
		: ''

	if (vedtak?.tidsbegrensetOffentligAfpFom) {
		const AFPOffentligString = 'AFP i offentlig sektor'
		const nullGradAP = vedtak.loependeAlderspensjon?.grad === 0
		return nullGradAP
			? `${alderspensjonString} / ${AFPOffentligString}`
			: AFPOffentligString
	}

	if (!vedtak || !vedtak.harVedtak) {
		return 'Uten vedtak'
	}

	const afpPrivatString = vedtak.privatAfpFom ? ' / AFP i privat sektor' : ''

	const ufoeretrygdString = vedtak.ufoeretrygdgrad
		? `${vedtak.ufoeretrygdgrad} % uføretrygd ${alderspensjonString.length > 0 ? '/ ' : ''}`
		: ''
	return `${ufoeretrygdString}${alderspensjonString}${fremtidigAlderspensjonString}${afpPrivatString}`
}

export function getEpsVedtakStatus(
	vedtak?: Vedtak
): VedtakInformasjonOmAvdoed | undefined {
	if (vedtak && vedtak.avdoed) {
		return vedtak.avdoed
	}

	return
}

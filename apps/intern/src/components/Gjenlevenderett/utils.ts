import type {
	EpsOpplysninger,
	VedtakInformasjonOmAvdoed,
} from '@pensjonskalkulator-frontend-monorepo/types'

export function getEpsDoedsdato(
	epsOpplysninger: EpsOpplysninger,
	vedtakInfoAvdoed?: VedtakInformasjonOmAvdoed
): string | undefined {
	return (
		vedtakInfoAvdoed?.doedsdato ??
		epsOpplysninger.relasjonPersondata?.doedsdato ??
		undefined
	)
}

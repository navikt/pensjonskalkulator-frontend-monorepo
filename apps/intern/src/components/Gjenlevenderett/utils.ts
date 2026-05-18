import type {
	EpsOpplysninger,
	VedtakInformasjonOmAvdoed,
} from '@pensjonskalkulator-frontend-monorepo/types'
import { format, subDays } from 'date-fns'

export function getEpsDoedsdato(
	epsOpplysninger: EpsOpplysninger,
	vedtakInfoAvdoed?: VedtakInformasjonOmAvdoed
): string {
	return (
		vedtakInfoAvdoed?.doedsdato ??
		epsOpplysninger.relasjonPersondata?.doedsdato ??
		format(subDays(new Date(), 1), 'yyyy-MM-dd')
	)
}

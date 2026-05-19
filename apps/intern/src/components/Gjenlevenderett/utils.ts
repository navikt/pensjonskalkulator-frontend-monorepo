import type {
	EpsOpplysninger,
	VedtakInformasjonOmAvdoed,
} from '@pensjonskalkulator-frontend-monorepo/types'
import { parseISO } from 'date-fns'

export function getEpsDoedsdato(
	epsOpplysninger: EpsOpplysninger,
	vedtakInfoAvdoed?: VedtakInformasjonOmAvdoed
): Date | undefined {
	const doedsdato =
		vedtakInfoAvdoed?.doedsdato ?? epsOpplysninger.relasjonPersondata?.doedsdato
	return doedsdato ? parseISO(doedsdato) : undefined
}

import type {
	EpsOpplysninger,
	VedtakGjenlevenderett,
	VedtakInformasjonOmAvdoed,
} from '@pensjonskalkulator-frontend-monorepo/types'
import { parseISO } from 'date-fns'

export function mapGjenlevenderettTilEpsOpplysninger(
	gjenlevenderett: VedtakGjenlevenderett
): EpsOpplysninger {
	return {
		pid: gjenlevenderett.avdoedPid,
		relasjonstype: 'AVDOED_EKTEFELLE',
		relasjonPersondata: {
			navn: gjenlevenderett.avdoedNavn ?? null,
			doedsdato: gjenlevenderett.doedsdato ?? null,
		},
	}
}

export function getEpsDoedsdato({
	epsOpplysninger,
	vedtakInfoAvdoed,
}: {
	epsOpplysninger: EpsOpplysninger
	vedtakInfoAvdoed?: VedtakInformasjonOmAvdoed
}): Date | undefined {
	const doedsdato =
		vedtakInfoAvdoed?.doedsdato ?? epsOpplysninger.relasjonPersondata?.doedsdato
	return doedsdato ? parseISO(doedsdato) : undefined
}

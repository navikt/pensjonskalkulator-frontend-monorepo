import type {
	EpsOpplysninger,
	VedtakGjenlevenderett,
	VedtakInformasjonOmAvdoed,
} from '@pensjonskalkulator-frontend-monorepo/types'
import { parseISO, subDays } from 'date-fns'

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

export function hideEpsPensjonsgivendeInntektFoerDoedsdato({
	epsOpplysninger,
	vedtakInfoAvdoed,
	brukerHarVedtakGjenlevendepensjon,
}: {
	epsOpplysninger: EpsOpplysninger
	vedtakInfoAvdoed?: VedtakInformasjonOmAvdoed
	brukerHarVedtakGjenlevendepensjon: boolean
}): boolean {
	if (brukerHarVedtakGjenlevendepensjon) return true

	const foedselsdato = epsOpplysninger.relasjonPersondata?.foedselsdato
	if (!foedselsdato) return false

	const doedsdato =
		getEpsDoedsdato({ epsOpplysninger, vedtakInfoAvdoed }) ??
		subDays(new Date(), 1)

	return doedsdato.getFullYear() - parseISO(foedselsdato).getFullYear() >= 76
}

import type { EpsOpplysninger } from '@pensjonskalkulator-frontend-monorepo/types'
import { format, subDays } from 'date-fns'

export function getEpsDoedsdato(epsOpplysninger: EpsOpplysninger): string {
	return (
		epsOpplysninger.relasjonPersondata?.doedsdato ??
		format(subDays(new Date(), 1), 'yyyy-MM-dd')
	)
}

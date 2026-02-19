import { Loader } from '@navikt/ds-react'

import { useBeregningContext } from '../BeregningContext'
import { BeregningTable } from './BeregningTable'

import styles from './Beregning.module.css'

const alderspensjonRows = [
	{ label: 'Grunnpensjon (kap. 19)', value: 7870 },
	{ label: 'Tilleggspensjon (kap. 19)', value: 3870 },
	{ label: 'Pensjonstillegg (kap. 19)', value: 2870 },
	{ label: 'Gjenlevendetillegg (kap. 19)', value: 1870 },
	{ label: 'Inntektspensjon (kap. 20)', value: 2870 },
	{ label: 'Garantipensjon (kap. 20)', value: 1870 },
	{ label: 'Garantitillegg (kap. 20)', value: 2853 },
]

const afpRows = [
	{ label: 'AFP kronetillegg', value: 2400 },
	{ label: 'AFP grunnbeløp', value: 1600 },
]

const privatTjenestepensjonRows = [
	{ label: 'Livsvarig alderspensjon', value: 4200 },
	{ label: 'Tidsbegrenset alderspensjon', value: 1800 },
]

export const Beregning = () => {
	const { isBeregningLoading } = useBeregningContext()

	if (isBeregningLoading) {
		return (
			<div className={styles.beregning}>
				<div className={styles.loader}>
					<Loader size="3xlarge" title="Beregner pensjon …" />
				</div>
			</div>
		)
	}

	return (
		<div className={styles.beregning}>
			<div className={styles.tables}>
				<BeregningTable
					title="Alderspensjon"
					valueHeader="Kr per måned"
					rows={alderspensjonRows}
				/>
				<BeregningTable title="AFP" valueHeader="Kr per måned" rows={afpRows} />
				<BeregningTable
					title="Privat tjenestepensjon"
					valueHeader="Kr per måned"
					rows={privatTjenestepensjonRows}
				/>
			</div>
		</div>
	)
}

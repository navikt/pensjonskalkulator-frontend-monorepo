import { Button } from '@navikt/ds-react'

import styles from './BeregningForm.module.css'

interface ButtonBarProps {
	onSubmit: () => void
	onReset: () => void
	isDirty: boolean
	hasCommittedParams: boolean
}

export const ButtonBar = ({
	onSubmit,
	onReset,
	isDirty,
	hasCommittedParams,
}: ButtonBarProps) => {
	return (
		<div className={styles.buttonBar}>
			<Button size="small" variant="primary" onClick={onSubmit}>
				{hasCommittedParams && !isDirty
					? 'Beregn pensjon'
					: isDirty
						? 'Oppdater pensjon'
						: 'Beregn pensjon'}
			</Button>
			<Button size="small" variant="tertiary" onClick={onReset}>
				Nullstill
			</Button>
		</div>
	)
}

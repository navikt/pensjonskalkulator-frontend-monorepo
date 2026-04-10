import { Box, Button, HStack } from '@navikt/ds-react'

import styles from './BeregningForm.module.css'

interface ButtonBarProps {
	onSubmit: () => void
	onReset: () => void
	isDirty: boolean
	harAktivBeregning: boolean
	isSubmitDisabled?: boolean
}

export const ButtonBar = ({
	onSubmit,
	onReset,
	isDirty,
	isSubmitDisabled = false,
}: ButtonBarProps) => {
	return (
		<div className={styles.buttonBar}>
			<Box paddingBlock="space-24 space-0">
				<HStack justify="space-between">
					<Button size="small" variant="secondary" onClick={onReset}>
						Nullstill
					</Button>
					<Button
						size="small"
						variant="primary"
						onClick={onSubmit}
						disabled={isSubmitDisabled}
					>
						{isDirty ? 'Oppdater pensjon' : 'Beregn pensjon'}
					</Button>
				</HStack>
			</Box>
		</div>
	)
}

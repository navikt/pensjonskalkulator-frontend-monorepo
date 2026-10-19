import { InternalHeader, Spacer, Switch } from '@navikt/ds-react'

import styles from './PesysHeader.module.css'

interface PesysHeaderProps {
	enhet?: Enhet
	mode: 'light' | 'dark'
	onModeChange: (mode: 'light' | 'dark') => void
	showThemeToggle: boolean
}

export const PesysHeader = (props: PesysHeaderProps) => {
	const { enhet, mode, onModeChange, showThemeToggle } = props
	return (
		<InternalHeader className={styles.pesysHeader}>
			<InternalHeader.Title as="h1" className={styles.title}>
				Pesys
			</InternalHeader.Title>
			<Spacer />
			{enhet && (
				<div className={styles.enhetInfo}>
					{enhet?.id} {enhet?.navn}
				</div>
			)}
			{showThemeToggle && (
				<div className={styles.themeControl}>
					<Switch
						size="small"
						checked={mode === 'dark'}
						onChange={(event) =>
							onModeChange(event.target.checked ? 'dark' : 'light')
						}
					>
						Mørkt tema
					</Switch>
				</div>
			)}
		</InternalHeader>
	)
}

import { useCallback, useEffect, useState } from 'react'

import { Box, Button, HStack } from '@navikt/ds-react'

import styles from './BeregningForm.module.css'

interface ButtonBarProps {
	onSubmit: () => void
	onReset: () => void
	isDirty: boolean
	harAktivBeregning: boolean
}

export const ButtonBar = ({ onSubmit, onReset, isDirty }: ButtonBarProps) => {
	const [isScrollable, setIsScrollable] = useState(false)

	const checkScrollable = useCallback(() => {
		const scrollArea = document.querySelector(`.${styles.section}`)
		if (scrollArea) {
			setIsScrollable(scrollArea.scrollHeight > scrollArea.clientHeight)
		}
	}, [])

	useEffect(() => {
		checkScrollable()
		const observer = new MutationObserver(checkScrollable)
		const scrollArea = document.querySelector(`.${styles.section}`)
		if (scrollArea) {
			observer.observe(scrollArea, { childList: true, subtree: true })
		}
		window.addEventListener('resize', checkScrollable)
		return () => {
			observer.disconnect()
			window.removeEventListener('resize', checkScrollable)
		}
	}, [checkScrollable])

	return (
		<div
			className={`${styles.buttonBar} ${isScrollable ? styles.buttonBarShadow : ''}`}
		>
			<Box
				borderColor="neutral-subtle"
				borderWidth={isScrollable ? '0 0 0 0' : '1 0 0 0'}
				paddingBlock="space-24 space-0"
			>
				<HStack justify="space-between">
					<Button size="small" variant="secondary" onClick={onReset}>
						Nullstill
					</Button>
					<Button size="small" variant="primary" onClick={onSubmit}>
						{isDirty ? 'Oppdater pensjon' : 'Beregn pensjon'}
					</Button>
				</HStack>
			</Box>
		</div>
	)
}

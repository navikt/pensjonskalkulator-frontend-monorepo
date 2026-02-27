import { useEffect, useRef, useState } from 'react'

import { Button } from '@navikt/ds-react'

import styles from './BeregningForm.module.css'

interface ButtonBarProps {
	onSubmit: () => void
	onReset: () => void
	isDirty: boolean
	harAktivBeregning: boolean
}

export const ButtonBar = ({ onSubmit, onReset, isDirty }: ButtonBarProps) => {
	const sentinelRef = useRef<HTMLDivElement>(null)
	const [isStuck, setIsStuck] = useState(false)

	useEffect(() => {
		const sentinel = sentinelRef.current
		if (!sentinel) return

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry) {
					setIsStuck(!entry.isIntersecting)
				}
			},
			{ threshold: 0 }
		)

		observer.observe(sentinel)
		return () => observer.disconnect()
	}, [])

	return (
		<>
			<div
				className={`${styles.buttonBar} ${isStuck ? styles.buttonBarStuck : ''}`}
			>
				<Button size="small" variant="secondary" onClick={onReset}>
					Nullstill
				</Button>
				<Button size="small" variant="primary" onClick={onSubmit}>
					{isDirty ? 'Oppdater pensjon' : 'Beregn pensjon'}
				</Button>
			</div>
			<div ref={sentinelRef} />
		</>
	)
}

import { useCallback, useEffect, useRef, useState } from 'react'

import { Popover } from '@navikt/ds-react'

import styles from './FormulaPopover.module.css'

export interface Formula {
	title: string
	numerator: string[]
	denominator: string
}

interface FormulaPopoverProps {
	formula: Formula
}

export const FormulaPopover = ({ formula }: FormulaPopoverProps) => {
	const buttonRef = useRef<HTMLButtonElement>(null)
	const popoverRef = useRef<HTMLDivElement>(null)
	const [open, setOpen] = useState(false)

	const handleClickOutside = useCallback((e: MouseEvent) => {
		const target = e.target as Node
		if (
			popoverRef.current?.contains(target) ||
			buttonRef.current?.contains(target)
		) {
			return
		}
		setOpen(false)
	}, [])

	useEffect(() => {
		if (open) {
			document.addEventListener('mousedown', handleClickOutside)
			return () => document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [open, handleClickOutside])

	return (
		<>
			<button
				ref={buttonRef}
				type="button"
				className={styles.formulaButton}
				aria-label={`Vis formel for ${formula.title}`}
				onClick={() => setOpen((prev) => !prev)}
			>
				<svg
					width="20"
					height="20"
					viewBox="0 0 20 20"
					fill="none"
					aria-hidden="true"
				>
					<circle
						cx="10"
						cy="10"
						r="9"
						stroke="currentColor"
						strokeWidth="1.5"
					/>
					<text
						x="10"
						y="14"
						textAnchor="middle"
						fontSize="10"
						fill="currentColor"
						fontFamily="serif"
						fontStyle="italic"
					>
						fx
					</text>
				</svg>
			</button>
			<Popover
				open={open}
				anchorEl={buttonRef.current}
				placement="top"
				onClose={() => {}}
			>
				<Popover.Content>
					<div ref={popoverRef} className={styles.formulaContent}>
						<span className={styles.formulaTitle}>{formula.title}</span>
						<div className={styles.fraction}>
							<div
								className={`${styles.numerator} ${formula.denominator ? styles.numeratorWithDivider : ''}`}
								style={{
									alignItems:
										formula.numerator.length > 2 ? 'flex-start' : 'center',
								}}
							>
								{formula.numerator.map((line, i) => (
									<span key={i}>{line}</span>
								))}
							</div>
							{formula.denominator && (
								<>
									<span className={styles.divider}> / </span>
									<span className={styles.denominator}>
										{formula.denominator}
									</span>
								</>
							)}
						</div>
					</div>
				</Popover.Content>
			</Popover>
		</>
	)
}

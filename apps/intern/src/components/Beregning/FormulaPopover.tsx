import { useCallback, useEffect, useRef, useState } from 'react'

import { SquarerootIcon } from '@navikt/aksel-icons'
import { Popover } from '@navikt/ds-react'

import styles from './FormulaPopover.module.css'

export interface Formula {
	title: string
	numerator: string[]
	denominator: string
}

function formulaToAriaLabel(formula: Formula): string {
	const numerator = formula.numerator.join(' ')
	if (!formula.denominator) return `${formula.title}: ${numerator}`
	return `${formula.title}: ${numerator} delt på ${formula.denominator}`
}

function formulaToCopyText(formula: Formula): string {
	const numerator = formula.numerator.join(' ')
	if (!formula.denominator) return numerator
	return `(${numerator}) / (${formula.denominator})`
}

interface FormulaPopoverProps {
	formula: Formula
}

export const FormulaPopover = ({ formula }: FormulaPopoverProps) => {
	const buttonRef = useRef<HTMLButtonElement>(null)
	const popoverRef = useRef<HTMLDivElement>(null)
	const fractionRef = useRef<HTMLDivElement>(null)
	const [open, setOpen] = useState(false)

	const numeratorLength = formula.numerator.join('').length
	const denominatorLength = formula.denominator.length
	const numeratorIsWider = numeratorLength >= denominatorLength

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

	useEffect(() => {
		if (open && popoverRef.current) {
			popoverRef.current.focus()
		}
	}, [open])

	return (
		<>
			<button
				ref={buttonRef}
				type="button"
				className={styles.formulaButton}
				aria-label={`Vis formel for ${formula.title}`}
				aria-expanded={open}
				onClick={() => setOpen((prev) => !prev)}
			>
				<SquarerootIcon aria-hidden="true" fontSize="1.25rem" />
			</button>
			<Popover
				open={open}
				anchorEl={buttonRef.current}
				placement="top"
				onClose={() => {}}
			>
				<Popover.Content>
					<div
						ref={popoverRef}
						className={styles.formulaContent}
						role="math"
						aria-roledescription="formel"
						aria-label={formulaToAriaLabel(formula)}
						tabIndex={-1}
						onKeyDown={(e) => {
							if (e.key === 'Escape') {
								setOpen(false)
								buttonRef.current?.focus()
							}
							if (e.key === 'c' && (e.metaKey || e.ctrlKey)) {
								e.preventDefault()
								navigator.clipboard.writeText(formulaToCopyText(formula))
							}
						}}
						onCopy={(e) => {
							e.preventDefault()
							e.clipboardData.setData('text/plain', formulaToCopyText(formula))
						}}
					>
						<span className={styles.formulaTitle} aria-hidden="true">
							{formula.title}
						</span>
						<div
							ref={fractionRef}
							className={styles.fraction}
							aria-hidden="true"
						>
							<div
								className={`${styles.numerator} ${formula.denominator && numeratorIsWider ? styles.numeratorWithDivider : ''}`}
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
									<span
										className={`${styles.denominator} ${!numeratorIsWider ? styles.denominatorWithDivider : ''}`}
									>
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

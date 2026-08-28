import { useEffect, useRef, useState } from 'react'

import { SquarerootIcon } from '@navikt/aksel-icons'
import { Popover } from '@navikt/ds-react'

import { useFeatureToggleQuery } from '../../api/queries'

import styles from './FormulaPopover.module.css'

export interface Formula {
	title: string
	numerator: string[]
	denominator: string
}

function formulaToCopyText(formula: Formula): string {
	const numerator = formula.numerator.join(' ')
	if (!formula.denominator) return numerator
	return `(${numerator}) / (${formula.denominator})`
}

interface FormulaPopoverProps {
	formula: Formula
	visAarsbelop?: boolean
}

export const FormulaPopover = ({
	formula,
	visAarsbelop,
}: FormulaPopoverProps) => {
	const { data: formlerToggle } = useFeatureToggleQuery(
		'internsimulator.vis-formler'
	)
	const buttonRef = useRef<HTMLButtonElement>(null)
	const popoverRef = useRef<HTMLDivElement>(null)
	const [open, setOpen] = useState(false)

	const numeratorIsWider =
		formula.numerator.join('').length >= formula.denominator.length

	useEffect(() => {
		if (open) popoverRef.current?.focus()
	}, [open])

	if (!formlerToggle?.enabled || !visAarsbelop) return null

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Escape') {
			setOpen(false)
			buttonRef.current?.focus()
		}
		if (e.key === 'c' && (e.metaKey || e.ctrlKey)) {
			e.preventDefault()
			navigator.clipboard.writeText(formulaToCopyText(formula))
		}
	}

	const handleCopy = (e: React.ClipboardEvent) => {
		e.preventDefault()
		e.clipboardData.setData('text/plain', formulaToCopyText(formula))
	}

	return (
		<>
			<button
				ref={buttonRef}
				type="button"
				className={styles.formulaButton}
				data-testid="formula-button"
				aria-expanded={open}
				onClick={() => setOpen((prev) => !prev)}
			>
				<SquarerootIcon aria-hidden="true" fontSize="16.5px" />
			</button>
			<Popover
				open={open}
				anchorEl={buttonRef.current}
				placement="top"
				onClose={() => setOpen(false)}
			>
				<Popover.Content>
					<div
						ref={popoverRef}
						className={styles.formulaContent}
						data-testid="formula-content"
						role="math"
						tabIndex={-1}
						onKeyDown={handleKeyDown}
						onCopy={handleCopy}
					>
						<span className={styles.formulaTitle}>{formula.title}</span>
						<div className={styles.fraction}>
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

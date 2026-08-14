import { useRef, useState } from 'react'

import { BodyShort, Box, Button, CopyButton, Popover } from '@navikt/ds-react'

import formelKnapp from '../../assets/formel-knapp.svg'
import type { StaticFormelKode } from '../../utils/formler/formler'
import {
	getFormulaMathML,
	getFormulaText,
} from '../../utils/formler/formlerMathML'

export const RowLabelWithFormula = ({
	label,
	formlerKode,
}: {
	label: string
	formlerKode?: StaticFormelKode
}) => {
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
	const popoverContentRef = useRef<HTMLDivElement>(null)
	const [popoverOpen, setPopoverOpen] = useState(false)
	const mathML = formlerKode ? getFormulaMathML(formlerKode) : null
	if (!mathML) {
		return <BodyShort size="small">{label}</BodyShort>
	}
	const formulaText = formlerKode ? getFormulaText(formlerKode) : null
	return (
		<span
			style={{
				display: 'flex',
				alignItems: 'center',
				gap: 'var(--a-spacing-2)',
				justifyContent: 'space-between',
			}}
		>
			<BodyShort size="small">{label}</BodyShort>
			<Button
				ref={setAnchorEl}
				type="button"
				size="xsmall"
				variant="tertiary"
				icon={<img src={formelKnapp} alt="" aria-hidden />}
				onClick={() => setPopoverOpen((open) => !open)}
				aria-expanded={popoverOpen}
				title={`Vis formel for ${label}`}
			/>
			<Popover
				open={popoverOpen}
				onClose={() => setPopoverOpen(false)}
				anchorEl={anchorEl}
			>
				<Popover.Content ref={popoverContentRef} tabIndex={-1}>
					<BodyShort size="small" weight="semibold">
						{label}
					</BodyShort>
					<Box
						marginBlock="space-8"
						dangerouslySetInnerHTML={{ __html: mathML }}
					/>

					{formulaText && <CopyButton size="xsmall" copyText={formulaText} />}
				</Popover.Content>
			</Popover>
		</span>
	)
}

import type { CSSProperties } from 'react'

import styles from './Divider.module.css'

interface Props {
	xsmallMargin?: boolean
	smallMargin?: boolean
	mediumMargin?: boolean
	largeMargin?: boolean
	extraLargeMargin?: boolean
	customMargin?: CSSProperties['margin']
	noMargin?: boolean
	noMarginBottom?: boolean
	noMarginTop?: boolean
}

export const Divider = ({
	xsmallMargin,
	smallMargin,
	mediumMargin,
	largeMargin,
	extraLargeMargin,
	customMargin,
	noMargin,
	noMarginBottom,
	noMarginTop,
}: Props) => (
	<hr
		style={customMargin ? { marginBlock: customMargin } : undefined}
		className={[
			styles.divider,
			xsmallMargin && styles.xsmallMargin,
			smallMargin && styles.smallMargin,
			mediumMargin && styles.mediumMargin,
			largeMargin && styles.largeMargin,
			extraLargeMargin && styles.extraLargeMargin,
			noMargin && styles.noMargin,
			noMarginBottom && styles.noMarginBottom,
			noMarginTop && styles.noMarginTop,
		]
			.filter(Boolean)
			.join(' ')}
	/>
)

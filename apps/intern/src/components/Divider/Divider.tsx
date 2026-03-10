import styles from './Divider.module.css'

interface Props {
	xsmallMargin?: boolean
	smallMargin?: boolean
	mediumMargin?: boolean
	largeMargin?: boolean
	extraLargeMargin?: boolean
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
	noMargin,
	noMarginBottom,
	noMarginTop,
}: Props) => (
	<hr
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

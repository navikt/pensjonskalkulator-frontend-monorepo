import clsx from 'clsx'

import styles from './Divider.module.scss'

interface Props {
  smallMargin?: boolean
  mediumMargin?: boolean
  noMargin?: boolean
  noMarginBottom?: boolean
  noMarginTop?: boolean
}

export const Divider = ({
  smallMargin,
  mediumMargin,
  noMargin,
  noMarginBottom,
  noMarginTop,
}: Props) => (
  <hr
    className={clsx(styles.divider, {
      [styles.divider__smallMargin]: smallMargin,
      [styles.divider__mediumMargin]: mediumMargin,
      [styles.divider__noMargin]: noMargin,
      [styles.divider__noMarginBottom]: noMarginBottom,
      [styles.divider__noMarginTop]: noMarginTop,
    })}
  />
)

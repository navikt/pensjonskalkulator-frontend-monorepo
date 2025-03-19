import clsx from 'clsx'

import styles from './Divider.module.scss'

interface Props {
  smallMargin?: boolean
  noMargin?: boolean
  noMarginBottom?: boolean
}

export const Divider = ({ smallMargin, noMargin, noMarginBottom }: Props) => (
  <hr
    className={clsx(styles.divider, {
      [styles.divider__smallMargin]: smallMargin,
      [styles.divider__noMargin]: noMargin,
      [styles.divider__noMarginBottom]: noMarginBottom,
    })}
  />
)

import clsx from 'clsx'

import styles from './Divider.module.scss'

interface Props {
  smallMargin?: boolean
  noMargin?: boolean
}
export const Divider: React.FC<Props> = ({ smallMargin, noMargin }) => {
  return (
    <hr
      className={clsx(styles.divider, {
        [styles.divider__SmallMargin]: smallMargin,
        [styles.divider__NoMargin]: noMargin,
      })}
    />
  )
}

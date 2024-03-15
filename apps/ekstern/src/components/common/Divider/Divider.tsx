import clsx from 'clsx'

import styles from './Divider.module.scss'

interface Props {
  noMargin?: boolean
}
// TODO skrive tester
export const Divider: React.FC<Props> = ({ noMargin }) => {
  return (
    <hr
      className={clsx(styles.divider, {
        [styles.divider__NoMargin]: noMargin,
      })}
    />
  )
}

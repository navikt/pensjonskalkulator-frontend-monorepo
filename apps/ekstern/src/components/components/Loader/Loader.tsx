import { Loader as AkselLoader, LoaderProps } from '@navikt/ds-react'
import clsx from 'clsx'

import styles from './Loader.module.scss'

interface Props extends Omit<LoaderProps, 'ref'> {
  isCentered?: boolean
}

export function Loader(props: Props) {
  const { className, isCentered = true, ...rest } = props

  return (
    <AkselLoader
      aria-live="polite"
      className={clsx(className, {
        [styles.loader__isCentered]: isCentered,
      })}
      title="Laster..."
      {...rest}
    />
  )
}

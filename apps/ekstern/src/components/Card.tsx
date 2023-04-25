import React from 'react'

import clsx from 'clsx'

import styles from './Card.module.scss'

type Props = React.HTMLAttributes<HTMLElement>

export function Card({ className, children, ...elementProps }: Props) {
  return (
    <section className={clsx(styles.card, className)} {...elementProps}>
      {children}
    </section>
  )
}

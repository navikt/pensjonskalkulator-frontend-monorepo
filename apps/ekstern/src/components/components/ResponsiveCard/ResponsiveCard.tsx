import React from 'react'

import clsx from 'clsx'

import styles from './ResponsiveCard.module.scss'

export const ResponsiveCard: React.FC<
  React.HTMLAttributes<HTMLElement> & { hasLargePadding?: boolean }
> = ({ className, children, hasLargePadding, ...elementProps }) => {
  return (
    <section
      className={clsx(
        styles.section,
        { [styles.section__largePadding]: hasLargePadding },
        className
      )}
      {...elementProps}
    >
      {children}
    </section>
  )
}

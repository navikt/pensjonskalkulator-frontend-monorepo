import React from 'react'

import clsx from 'clsx'

import styles from './ResponsiveCard.module.scss'

export const ResponsiveCard: React.FC<
  React.HTMLAttributes<HTMLElement> & {
    hasLargePadding?: boolean
    hasMargin?: boolean
  }
> = ({ className, children, hasLargePadding, hasMargin, ...elementProps }) => {
  return (
    <section
      className={clsx(
        styles.section,
        {
          [styles.section__largePadding]: hasLargePadding,
          [styles.section__marginBotton]: hasMargin,
        },
        className
      )}
      {...elementProps}
    >
      {children}
    </section>
  )
}

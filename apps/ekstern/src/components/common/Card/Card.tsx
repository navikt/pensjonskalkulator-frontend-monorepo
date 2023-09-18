import React from 'react'

import clsx from 'clsx'

import { CardContent, CardContentProps } from './CardContent'

import styles from './Card.module.scss'

export interface CardComponent extends React.FC<CardProps> {
  Content: React.FC<CardContentProps>
}

type CardProps = React.HTMLAttributes<HTMLElement> & {
  hasLargePadding?: boolean
  hasMargin?: boolean
  hasNoPadding?: boolean
}

export const Card = (({
  className,
  children,
  hasLargePadding,
  hasMargin,
  hasNoPadding,
  ...elementProps
}) => {
  return (
    <section
      className={clsx(
        styles.section,
        {
          [styles.section__largePadding]: hasLargePadding,
          [styles.section__noPadding]: hasNoPadding,
          [styles.section__marginBotton]: hasMargin,
        },
        className
      )}
      {...elementProps}
    >
      {children}
    </section>
  )
}) as CardComponent

Card.Content = CardContent

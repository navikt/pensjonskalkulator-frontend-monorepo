import React, { PropsWithChildren } from 'react'

import styles from './StegvisningFrame.module.scss'

export const StegvisningFrame: React.FC<
  PropsWithChildren & { className?: string }
> = ({ className, children }) => {
  return (
    <section className={`${styles.section} ${className ?? ''}`}>
      {children}
    </section>
  )
}

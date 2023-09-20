import React, { PropsWithChildren } from 'react'
import { useIntl } from 'react-intl'
import { useLocation } from 'react-router-dom'
import KalkulatorLogo from '../../../assets/kalkulator.svg'

import { Heading } from '@navikt/ds-react'
import clsx from 'clsx'

import styles from './PageFramework.module.scss'

export const PageFramework: React.FC<
  PropsWithChildren & {
    isFullWidth?: boolean
    whiteBg?: boolean
    showLogo?: boolean
  }
> = ({ children, isFullWidth, whiteBg = false, showLogo = false }) => {
  const intl = useIntl()

  const { pathname } = useLocation()

  React.useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <main
      className={clsx(styles.main, {
        [styles.main__white]: whiteBg,
      })}
    >
      <div
        className={clsx(styles.content, {
          [styles.content__isFramed]: !isFullWidth,
        })}
      >
        <div className={styles.headerGroup}>
          <div
            className={clsx(styles.headerGroupTitle, {
              [styles.headerGroupTitle__isFramed]: !isFullWidth,
            })}
          >
            {showLogo && (
              <img
                className={styles.headerGroupTitle__logo}
                src={KalkulatorLogo}
                alt=""
              />
            )}
            <Heading size="large" level="1">
              {intl.formatMessage({ id: 'application.title' })}
            </Heading>
          </div>
        </div>
        {children}
      </div>
    </main>
  )
}

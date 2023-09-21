import React, { PropsWithChildren } from 'react'
import { useIntl } from 'react-intl'
import { useLocation } from 'react-router-dom'

import { Heading } from '@navikt/ds-react'
import clsx from 'clsx'

import KalkulatorLogo from '../../../assets/kalkulator.svg'

import styles from './PageFramework.module.scss'

export const PageFramework: React.FC<
  PropsWithChildren & {
    isFullWidth?: boolean
    hasWhiteBg?: boolean
    shouldShowLogo?: boolean
  }
> = ({ children, isFullWidth, hasWhiteBg = false, shouldShowLogo = false }) => {
  const intl = useIntl()

  const { pathname } = useLocation()

  React.useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <main
      className={clsx(styles.main, {
        [styles.main__white]: hasWhiteBg,
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
            {shouldShowLogo && (
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

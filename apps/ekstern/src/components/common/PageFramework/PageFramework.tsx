import React, { PropsWithChildren } from 'react'
import { useIntl } from 'react-intl'
import { useLocation, useNavigate } from 'react-router-dom'

import { Heading } from '@navikt/ds-react'
import clsx from 'clsx'

import KalkulatorLogo from '../../../assets/kalkulator.svg'
import { HOST_BASEURL } from '@/paths'
import { paths } from '@/router'
import { apiSlice } from '@/state/api/apiSlice'
import { useAppDispatch } from '@/state/hooks'
import useRequest from '@/utils/useRequest'

import styles from './PageFramework.module.scss'

export const PageFramework: React.FC<
  PropsWithChildren & {
    isFullWidth?: boolean
    hasWhiteBg?: boolean
    shouldShowLogo?: boolean
    isAuthenticated?: boolean
  }
> = ({
  children,
  isFullWidth,
  hasWhiteBg = false,
  shouldShowLogo = false,
  isAuthenticated = true,
}) => {
  const intl = useIntl()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const { pathname } = useLocation()

  const { isLoading, status, reload } = useRequest<null>(
    `${HOST_BASEURL}/oauth2/session`
  )

  React.useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  const isLoggedIn = React.useMemo(() => {
    return status === 200 || isLoading
  }, [status, isLoading])

  React.useEffect(() => {
    if (!isLoggedIn && isAuthenticated) {
      navigate(paths.login)
      dispatch(apiSlice.util.resetApiState())
    }
  }, [isLoggedIn])

  React.useEffect(() => {
    const onFocus = () => {
      /* c8 ignore next 3 */
      if (!isLoading) {
        reload()
      }
    }

    window.addEventListener('focus', onFocus)

    return () => {
      window.removeEventListener('focus', onFocus)
    }
  }, [isLoading, status])

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
              {intl.formatMessage({ id: 'pageframework.title' })}
            </Heading>
          </div>
        </div>
        {children}
      </div>
    </main>
  )
}

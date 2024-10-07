import React from 'react'
import { useIntl } from 'react-intl'

import { Heading } from '@navikt/ds-react'
import clsx from 'clsx'

import KalkulatorLogo from '../../../assets/kalkulator.svg'
import { BASE_PATH } from '@/router/constants'

import styles from './FrameComponent.module.scss'

export const FrameComponent: React.FC<{
  isFullWidth?: boolean
  hasWhiteBg?: boolean
  shouldShowLogo?: boolean
  children?: JSX.Element
}> = ({
  isFullWidth,
  hasWhiteBg = false,
  shouldShowLogo = false,
  children,
}) => {
  const intl = useIntl()

  return (
    <div
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
          <representasjon-banner
            representasjonstyper="PENSJON_FULLSTENDIG,PENSJON_BEGRENSET"
            redirectTo={`${window.location.origin}${BASE_PATH}/start`}
          ></representasjon-banner>
          <div
            className={clsx(styles.headerGroupTitle, {
              [styles.headerGroupTitle__isFramed]: !isFullWidth,
            })}
          >
            {shouldShowLogo && (
              <img
                data-testid="framework-logo"
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
    </div>
  )
}

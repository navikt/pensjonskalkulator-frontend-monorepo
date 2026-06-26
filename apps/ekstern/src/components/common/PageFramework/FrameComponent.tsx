import clsx from 'clsx'
import React from 'react'
import { useIntl } from 'react-intl'

import { Heading } from '@navikt/ds-react'

import { BASE_PATH, externalUrls } from '@/router/constants'

import KalkulatorLogo from '../../../assets/kalkulator.svg'

import styles from './FrameComponent.module.scss'

export const FrameComponent: React.FC<{
  isFullWidth?: boolean
  hasWhiteBg?: boolean
  shouldShowLogo?: boolean
  children?: React.JSX.Element
  noMinHeight?: boolean
}> = ({
  isFullWidth,
  hasWhiteBg = false,
  shouldShowLogo = false,
  children,
  noMinHeight = false,
}) => {
  const intl = useIntl()
  const breadcrumbs = [
    {
      url: externalUrls.dinPensjon,
      title: intl.formatMessage({ id: 'dinpensjon-tittel' }),
    },
  ]

  return (
    <div
      className={clsx(styles.main, {
        [styles.main__white]: hasWhiteBg,
        [styles.main__noMinHeight]: noMinHeight,
      })}
    >
      <div
        className={clsx(styles.content, {
          [styles.content__isFramed]: !isFullWidth,
        })}
      >
        <div className={styles.headerGroup}>
          <representasjon-banner
            representasjonstyper="PENSJON_LES,PENSJON_SKRIV,VERGE_PENSJON_LES,VERGE_PENSJON_SKRIV"
            redirectTo={`${window.location.origin}${BASE_PATH}/start`}
            style={{
              marginBottom: 'var(--a-spacing-6)',
            }}
            breadcrumbs={JSON.stringify(breadcrumbs)}
          />

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

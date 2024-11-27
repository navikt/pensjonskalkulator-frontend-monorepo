import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { ExclamationmarkTriangleFillIcon } from '@navikt/aksel-icons'
import { BodyLong, Heading, HeadingProps } from '@navikt/ds-react'

import { Divider } from '@/components/common/Divider'
import { Loader } from '@/components/common/Loader'
import { useOffentligTpQuery } from '@/state/api/apiSlice'

import styles from './OffentligTjenestepensjon.module.scss'

export const OffentligTjenestepensjon = (props: {
  headingLevel: HeadingProps['level']
  showDivider?: boolean
}) => {
  const { headingLevel, showDivider } = props
  const intl = useIntl()
  const [leverandoererString, setleverandoererString] =
    React.useState<string>('')

  const { data: tpo, isError, isLoading } = useOffentligTpQuery()

  React.useEffect(() => {
    if (
      tpo?.muligeTpLeverandoerListe &&
      tpo.muligeTpLeverandoerListe.length > 0
    ) {
      const joinedLeverandoerer = tpo?.muligeTpLeverandoerListe.join(', ')
      setleverandoererString(joinedLeverandoerer)
    }
  }, [tpo])

  if (isLoading) {
    return (
      <Loader
        data-testid="tpo-loader"
        size="3xlarge"
        title={intl.formatMessage({
          id: 'beregning.loading',
        })}
      />
    )
  }

  if (!isLoading && !isError && tpo?.muligeTpLeverandoerListe.length === 0) {
    return
  }

  return (
    <>
      {showDivider && <Divider noMargin />}
      <Heading id="tpo-heading" level={headingLevel} size="small">
        {intl.formatMessage({ id: 'pensjonsavtaler.tpo.title' })}
      </Heading>
      <div className={styles.info}>
        <ExclamationmarkTriangleFillIcon
          className={`${styles.infoIcon} ${styles.infoIcon__orange}`}
          fontSize="1.5rem"
          aria-hidden
        />
        <BodyLong className={styles.infoText}>
          {isError && <FormattedMessage id="pensjonsavtaler.tpo.error" />}
          {!isError &&
            tpo?.muligeTpLeverandoerListe &&
            tpo.muligeTpLeverandoerListe.length > 0 && (
              <FormattedMessage
                id="pensjonsavtaler.tpo.er_medlem"
                values={{
                  chunk: leverandoererString,
                }}
              />
            )}
        </BodyLong>
      </div>
    </>
  )
}

import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { ExclamationmarkTriangleFillIcon } from '@navikt/aksel-icons'
import { BodyLong, Heading, HeadingProps, VStack } from '@navikt/ds-react'

import { Divider } from '@/components/common/Divider'
import { Loader } from '@/components/common/Loader'
import { useGetTpOffentligFeatureToggleQuery } from '@/state/api/apiSlice'
import { formatInntekt } from '@/utils/inntekt'

import styles from './OffentligTjenestepensjon.module.scss'

export const OffentligTjenestepensjon = (props: {
  isLoading: boolean
  isError: boolean
  offentligTp?: OffentligTp
  headingLevel: HeadingProps['level']
  showDivider?: boolean
}) => {
  const { isLoading, isError, offentligTp, headingLevel, showDivider } = props
  const intl = useIntl()
  const [leverandoererString, setleverandoererString] =
    React.useState<string>('')
  const { data: tpOffentligFeatureToggle } =
    useGetTpOffentligFeatureToggleQuery()
  React.useEffect(() => {
    if (
      offentligTp?.muligeTpLeverandoerListe &&
      offentligTp.muligeTpLeverandoerListe.length > 0
    ) {
      const joinedLeverandoerer =
        offentligTp?.muligeTpLeverandoerListe.join(', ')
      setleverandoererString(joinedLeverandoerer)
    }
  }, [offentligTp])

  const subHeadingLevel = React.useMemo(() => {
    return headingLevel
      ? ((
          parseInt(headingLevel as string, 10) + 1
        ).toString() as HeadingProps['level'])
      : '4'
  }, [headingLevel])

  if (isLoading) {
    return (
      <Loader
        data-testid="offentligtp-loader"
        size="3xlarge"
        title={intl.formatMessage({
          id: 'beregning.loading',
        })}
      />
    )
  }

  // Når brukeren ikke har noe tp-medlemskap ikke vis noe som helst
  if (
    !isLoading &&
    !isError &&
    offentligTp?.muligeTpLeverandoerListe.length === 0
  ) {
    return
  }

  return (
    <>
      {showDivider && <Divider noMargin />}
      <Heading id="tpo-heading" level={headingLevel} size="small">
        {intl.formatMessage({ id: 'pensjonsavtaler.tpo.title' })}
      </Heading>

      {tpOffentligFeatureToggle?.enabled ? (
        <>
          <VStack gap="3">
            <div>
              <Heading
                id="tpo-subheading"
                level={subHeadingLevel}
                size="xsmall"
              >
                {intl.formatMessage({ id: 'pensjonsavtaler.tpo.subtitle.spk' })}
              </Heading>
              <table className="full-width">
                <tbody>
                  {offentligTp?.simulertTjenestepensjon?.simuleringsresultat.utbetalingsperioder.map(
                    (utbetalingsperiode) => (
                      <tr key={`${JSON.stringify(utbetalingsperiode)}-mobile`}>
                        <th
                          style={{ fontWeight: 'normal' }}
                          scope="row"
                          align="left"
                        >
                          {`Fra ${utbetalingsperiode.startAlder} år til ${utbetalingsperiode.aarligUtbetaling}`}
                          {
                            // TODO se etter logikk i pensjonsavtaler
                            /* {utbetalingsperiode.sluttAlder
                  ? utils.formaterSluttAlderString(intl)(
                      utbetalingsperiode.startAlder,
                      utbetalingsperiode.sluttAlder
                    )
                  : utils.formaterLivsvarigString(intl)(
                      utbetalingsperiode.startAlder
                    )}
                    
                    
                    

      
      
      */
                          }
                          :
                        </th>
                        <td align="right">
                          {formatInntekt(utbetalingsperiode.aarligUtbetaling)}{' '}
                          <FormattedMessage id="pensjonsavtaler.kr_pr_aar" />
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </VStack>
        </>
      ) : (
        <div className={styles.info}>
          <ExclamationmarkTriangleFillIcon
            className={`${styles.infoIcon} ${styles.infoIcon__orange}`}
            fontSize="1.5rem"
            aria-hidden
          />
          <BodyLong className={styles.infoText}>
            {
              //  Ved feil vis feilmelding om tp-offentlig
              isError && <FormattedMessage id="pensjonsavtaler.tpo.error" />
            }
            {
              //  Ved success vis info om at brukeren kan ha rett på tp-offentlig
              !isError &&
                offentligTp?.muligeTpLeverandoerListe &&
                offentligTp.muligeTpLeverandoerListe.length > 0 && (
                  <FormattedMessage
                    id="pensjonsavtaler.tpo.er_medlem"
                    values={{
                      chunk: leverandoererString,
                    }}
                  />
                )
            }
          </BodyLong>
        </div>
      )}
    </>
  )
}

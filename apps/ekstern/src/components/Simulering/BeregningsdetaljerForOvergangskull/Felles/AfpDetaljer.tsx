import React, { Fragment } from 'react'
import { FormattedMessage } from 'react-intl'

import { HStack, Heading, VStack } from '@navikt/ds-react'

import { useAppSelector } from '@/state/hooks'
import { selectCurrentSimulation } from '@/state/userInput/selectors'
import { getFormatMessageValues } from '@/utils/translations'

import { DetaljRad } from '../hooks'

import styles from './Pensjonsdetaljer.module.scss'

export interface AfpDetaljerProps {
  afpPrivatDetaljerListe?: DetaljRad[][]
  afpOffentligDetaljerListe?: DetaljRad[]
  pre2025OffentligAfpDetaljerListe?: DetaljRad[]
  opptjeningPre2025OffentligAfpListe?: DetaljRad[]
}

export const AfpDetaljer: React.FC<AfpDetaljerProps> = ({
  afpPrivatDetaljerListe,
  afpOffentligDetaljerListe,
  pre2025OffentligAfpDetaljerListe,
  opptjeningPre2025OffentligAfpListe,
}) => {
  const { uttaksalder, gradertUttaksperiode } = useAppSelector(
    selectCurrentSimulation
  )

  const afpPrivatAtUttaksalder =
    afpPrivatDetaljerListe && afpPrivatDetaljerListe.length === 2
      ? afpPrivatDetaljerListe[0]
      : []
  const afpPrivatAt67 =
    afpPrivatDetaljerListe && afpPrivatDetaljerListe.length === 2
      ? afpPrivatDetaljerListe[1]
      : (afpPrivatDetaljerListe?.[0] ?? [])

  const currentAge = gradertUttaksperiode?.uttaksalder?.aar ?? uttaksalder?.aar
  const currentMonths =
    gradertUttaksperiode?.uttaksalder?.maaneder ?? uttaksalder?.maaneder

  const shouldRenderPre2025OffentligAfp =
    (pre2025OffentligAfpDetaljerListe &&
      pre2025OffentligAfpDetaljerListe.length > 0) ||
    (opptjeningPre2025OffentligAfpListe &&
      opptjeningPre2025OffentligAfpListe.length > 0)

  return (
    <section>
      {afpPrivatDetaljerListe && afpPrivatDetaljerListe.length > 0 && (
        <VStack gap="6">
          {afpPrivatAtUttaksalder.length > 0 &&
            currentAge &&
            currentAge < 67 && (
              <div className="afpPrivatAtUttaksalder">
                <Heading size="small" level="4">
                  <FormattedMessage
                    id="beregning.detaljer.afpPrivat.gradertUttak.title"
                    values={{
                      ...getFormatMessageValues(),
                      alderAar: `${currentAge} år`,
                      alderMd:
                        currentMonths && currentMonths > 0
                          ? `og ${currentMonths} måneder`
                          : '',
                    }}
                  />
                </Heading>
                <dl>
                  <div className={styles.hstackRow}>
                    <strong>
                      <FormattedMessage id="beregning.detaljer.OpptjeningDetaljer.afpPrivat.table.title" />
                    </strong>
                  </div>
                  {afpPrivatAtUttaksalder.map((detalj, index) => (
                    <Fragment key={index}>
                      <HStack
                        justify="space-between"
                        className={styles.hstackRow}
                      >
                        <dt>
                          {index === afpPrivatAtUttaksalder.length - 1 ? (
                            <strong>{detalj.tekst}:</strong>
                          ) : (
                            `${detalj.tekst}:`
                          )}
                        </dt>
                        <dd>
                          {index === afpPrivatAtUttaksalder.length - 1 ? (
                            <strong>{detalj.verdi}</strong>
                          ) : (
                            detalj.verdi
                          )}
                        </dd>
                      </HStack>
                    </Fragment>
                  ))}
                </dl>
              </div>
            )}

          <div className="afpPrivatAt67">
            <Heading size="small" level="4">
              <FormattedMessage
                id="beregning.detaljer.afpPrivat.heltUttak.title"
                values={{
                  ...getFormatMessageValues(),
                  alderAar: `${currentAge && currentAge < 67 ? 67 : currentAge} år`,
                  alderMd:
                    currentAge &&
                    currentAge >= 67 &&
                    currentMonths &&
                    currentMonths > 0
                      ? `og ${currentMonths} måneder`
                      : '',
                }}
              />
            </Heading>
            <dl>
              <div className={styles.hstackRow}>
                <strong>
                  <FormattedMessage id="beregning.detaljer.OpptjeningDetaljer.afpPrivat.table.title" />
                </strong>
              </div>
              {afpPrivatAt67.map((detalj, index) => (
                <Fragment key={index}>
                  <HStack justify="space-between" className={styles.hstackRow}>
                    <dt>
                      {index === afpPrivatAt67.length - 1 ? (
                        <strong>{detalj.tekst}:</strong>
                      ) : (
                        `${detalj.tekst}:`
                      )}
                    </dt>
                    <dd>
                      {index === afpPrivatAt67.length - 1 ? (
                        <strong>{detalj.verdi}</strong>
                      ) : (
                        detalj.verdi
                      )}
                    </dd>
                  </HStack>
                </Fragment>
              ))}
            </dl>
          </div>
        </VStack>
      )}

      {shouldRenderPre2025OffentligAfp && (
        <HStack gap="20">
          {pre2025OffentligAfpDetaljerListe &&
            pre2025OffentligAfpDetaljerListe.length > 0 && (
              <div className="pre2025OffentligAfpUttak">
                <Heading size="small" level="4">
                  <FormattedMessage
                    id="beregning.detaljer.grunnpensjon.pre2025OffentligAfp.title"
                    values={{
                      ...getFormatMessageValues(),
                      alderAar: `${uttaksalder?.aar} år`,
                      alderMd: `og ${uttaksalder!.maaneder} måneder`,
                    }}
                  />
                </Heading>
                <dl>
                  <div className={styles.hstackRow}>
                    <strong>
                      <FormattedMessage id="beregning.detaljer.grunnpensjon.afp.table.title" />
                    </strong>
                  </div>
                  {pre2025OffentligAfpDetaljerListe.map((detalj, index) => (
                    <React.Fragment key={index}>
                      <HStack
                        justify="space-between"
                        className={styles.hstackRow}
                      >
                        <dt>
                          {index ===
                          pre2025OffentligAfpDetaljerListe.length - 1 ? (
                            <strong>{detalj.tekst}:</strong>
                          ) : (
                            `${detalj.tekst}:`
                          )}
                        </dt>
                        <dd>
                          {index ===
                          pre2025OffentligAfpDetaljerListe.length - 1 ? (
                            <strong>{detalj.verdi}</strong>
                          ) : (
                            detalj.verdi
                          )}
                        </dd>
                      </HStack>
                    </React.Fragment>
                  ))}
                </dl>
              </div>
            )}

          {opptjeningPre2025OffentligAfpListe &&
            opptjeningPre2025OffentligAfpListe.length > 0 && (
              <dl>
                <div className={styles.hstackRow}>
                  <strong>
                    <FormattedMessage id="beregning.detaljer.OpptjeningDetaljer.pre2025OffentligAfp.table.title" />
                  </strong>
                </div>
                {opptjeningPre2025OffentligAfpListe.map((detalj, index) => (
                  <Fragment key={index}>
                    <HStack
                      justify="space-between"
                      className={styles.hstackRow}
                    >
                      <dt>{`${detalj.tekst}:`}</dt>
                      <dd>{detalj.verdi}</dd>
                    </HStack>
                  </Fragment>
                ))}
              </dl>
            )}
        </HStack>
      )}

      {afpOffentligDetaljerListe && afpOffentligDetaljerListe.length > 0 && (
        <dl>
          <Heading size="small" level="4" spacing>
            <FormattedMessage
              id="beregning.detaljer.afpOffentlig.uttak.title"
              values={{
                ...getFormatMessageValues(),
                alderAar: `${currentAge} år`,
                alderMd:
                  currentMonths && currentMonths > 0
                    ? `og ${currentMonths} måneder`
                    : '',
              }}
            />
          </Heading>
          {afpOffentligDetaljerListe.map((detalj, index) => (
            <Fragment key={index}>
              <HStack justify="space-between" className={styles.hstackRow}>
                <dt>
                  <strong>{`${detalj.tekst}: `}</strong>
                </dt>
                <dd>
                  <strong>{detalj.verdi}</strong>
                </dd>
              </HStack>
            </Fragment>
          ))}
        </dl>
      )}
    </section>
  )
}

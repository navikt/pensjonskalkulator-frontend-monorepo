import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import {
  ExclamationmarkTriangleFillIcon,
  InformationSquareFillIcon,
} from '@navikt/aksel-icons'
import { BodyLong, BodyShort, Link } from '@navikt/ds-react'
import clsx from 'clsx'

import { GrunnlagSection } from '../GrunnlagSection'
import { AccordionItem } from '@/components/common/AccordionItem'
import { AccordionContext } from '@/components/common/AccordionItem'
import { paths } from '@/router'
import { usePensjonsavtalerQuery } from '@/state/api/apiSlice'
import { generatePensjonsavtalerRequestBody } from '@/state/api/utils'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import {
  selectSamtykke,
  selectInntekt,
  selectAfp,
  selectSivilstand,
  selectCurrentSimulation,
} from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputReducer'
import { formatAsDecimal } from '@/utils/currency'
import { capitalize } from '@/utils/string'
import { formatMessageValues } from '@/utils/translations'

import { groupPensjonsavtalerByType, getMaanedString } from './utils'

import styles from './GrunnlagPensjonsavtaler.module.scss'

export const GrunnlagPensjonsavtaler = () => {
  const intl = useIntl()
  const harSamtykket = useAppSelector(selectSamtykke)
  const sivilstand = useAppSelector(selectSivilstand)
  const inntekt = useAppSelector(selectInntekt)
  const afp = useAppSelector(selectAfp)
  const { startAar, startMaaned } = useAppSelector(selectCurrentSimulation)
  const {
    ref: grunnlagPensjonsavtalerRef,
    isOpen: isPensjonsavtalerAccordionItemOpen,
    toggleOpen: togglePensjonsavtalerAccordionItem,
  } = React.useContext(AccordionContext)
  const {
    data: pensjonsavtaler,
    isLoading,
    isError,
    isSuccess,
  } = usePensjonsavtalerQuery(
    generatePensjonsavtalerRequestBody(
      inntekt ? inntekt.beloep : 0,
      afp,
      {
        aar: startAar as number,
        maaneder: startMaaned ?? 0,
      },
      sivilstand
    ),
    {
      skip: !harSamtykket || !startAar || !inntekt,
    }
  )
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const onCancel = (e: React.MouseEvent<HTMLAnchorElement>): void => {
    e.preventDefault()
    dispatch(userInputActions.flush())
    navigate(paths.start)
  }

  return (
    <AccordionItem
      name="Grunnlag: Pensjonsavtaler"
      isOpen={isPensjonsavtalerAccordionItemOpen}
      onClick={togglePensjonsavtalerAccordionItem}
    >
      <GrunnlagSection
        ref={grunnlagPensjonsavtalerRef}
        headerTitle={intl.formatMessage({
          id: 'grunnlag.pensjonsavtaler.title',
        })}
        headerValue={
          !harSamtykket
            ? intl.formatMessage({
                id: 'grunnlag.pensjonsavtaler.title.error.samtykke',
              })
            : isError
            ? intl.formatMessage({
                id: 'grunnlag.pensjonsavtaler.title.error.pensjonsavtaler',
              })
            : `${pensjonsavtaler?.avtaler.length} ${
                pensjonsavtaler?.partialResponse
                  ? intl.formatMessage({
                      id: 'grunnlag.pensjonsavtaler.title.error.pensjonsavtaler.partial',
                    })
                  : ''
              }`
        }
        isLoading={isLoading}
      >
        <>
          {!harSamtykket && (
            <BodyLong>
              <FormattedMessage id="grunnlag.pensjonsavtaler.ingress.error.samtykke_ingress" />
              <Link href={paths.start} onClick={onCancel}>
                {intl.formatMessage({
                  id: 'grunnlag.pensjonsavtaler.ingress.error.samtykke_link_1',
                })}
              </Link>{' '}
              <FormattedMessage
                id="grunnlag.pensjonsavtaler.ingress.error.samtykke_link_2"
                values={{
                  ...formatMessageValues,
                }}
              />
            </BodyLong>
          )}
          {harSamtykket &&
            isSuccess &&
            !pensjonsavtaler?.partialResponse &&
            pensjonsavtaler?.avtaler.length === 0 && (
              <div className={`${styles.info} ${styles.info__hasMargin}`}>
                <InformationSquareFillIcon
                  className={`${styles.infoIcon} ${styles.infoIcon__blue}`}
                  fontSize="1.5rem"
                />
                <BodyLong className={styles.infoText}>
                  <FormattedMessage id="grunnlag.pensjonsavtaler.ingress.ingen" />
                </BodyLong>
              </div>
            )}
          {harSamtykket && isSuccess && pensjonsavtaler?.avtaler.length > 0 && (
            <table
              data-testid="pensjonsavtaler-table"
              className={styles.tabell}
            >
              <thead>
                <tr>
                  <th className={styles.tabellHeader}>
                    <FormattedMessage id="grunnlag.pensjonsavtaler.tabell.title.left" />
                  </th>
                  <th
                    className={clsx(
                      styles.tabellHeader,
                      styles.tabellHeader__Right
                    )}
                  >
                    <FormattedMessage id="grunnlag.pensjonsavtaler.tabell.title.right" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(
                  groupPensjonsavtalerByType(pensjonsavtaler?.avtaler)
                ).map(([avtaleType, avtaler], i) => (
                  <React.Fragment key={`table-left-${avtaleType}`}>
                    <tr>
                      <td colSpan={2}>
                        <BodyShort
                          className={clsx(styles.tabellMellomtittel, {
                            [styles.tabellMellomtittel__First]: i < 1,
                          })}
                        >
                          {capitalize(avtaleType)}
                        </BodyShort>
                      </td>
                    </tr>
                    {avtaler.map((avtale) => (
                      <React.Fragment key={`table-right-${avtale.key}`}>
                        <tr>
                          <td colSpan={2}>
                            <BodyShort className={styles.tabellSubtittel}>
                              {avtale.produktbetegnelse}
                            </BodyShort>
                          </td>
                        </tr>
                        {avtale.utbetalingsperioder.map(
                          (utbetalingsperiode) => {
                            return (
                              <tr
                                key={`${avtale.key}-${utbetalingsperiode.startAlder.aar}-${utbetalingsperiode.startAlder.maaneder}`}
                              >
                                <td className={styles.tabellCell__Small}>
                                  {utbetalingsperiode.sluttAlder
                                    ? `Fra ${
                                        utbetalingsperiode.startAlder.aar
                                      } år${getMaanedString(
                                        utbetalingsperiode.startAlder.maaneder
                                      )} til og med ${
                                        utbetalingsperiode.sluttAlder.aar
                                      } år${
                                        utbetalingsperiode.sluttAlder
                                          .maaneder &&
                                        utbetalingsperiode.sluttAlder.maaneder <
                                          11
                                          ? getMaanedString(
                                              utbetalingsperiode.sluttAlder
                                                .maaneder
                                            )
                                          : ''
                                      }`
                                    : `Livsvarig fra ${
                                        utbetalingsperiode.startAlder.aar
                                      } år${
                                        utbetalingsperiode.startAlder.maaneder
                                          ? getMaanedString(
                                              utbetalingsperiode.startAlder
                                                .maaneder
                                            )
                                          : ''
                                      }`}
                                </td>
                                <td
                                  className={clsx(
                                    styles.tabellCell__Small,
                                    styles.tabellCell__Right
                                  )}
                                >
                                  {`${formatAsDecimal(
                                    utbetalingsperiode.aarligUtbetaling
                                  )} kr`}
                                </td>
                              </tr>
                            )
                          }
                        )}
                      </React.Fragment>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
          {(isError || pensjonsavtaler?.partialResponse) && (
            <div
              className={clsx(styles.info, {
                [styles.info__hasMargin]: pensjonsavtaler?.partialResponse,
              })}
            >
              <ExclamationmarkTriangleFillIcon
                className={`${styles.infoIcon} ${styles.infoIcon__orange}`}
                fontSize="1.5rem"
              />
              <BodyLong className={styles.infoText}>
                <FormattedMessage
                  id={
                    isError
                      ? 'grunnlag.pensjonsavtaler.ingress.error.pensjonsavtaler'
                      : 'grunnlag.pensjonsavtaler.ingress.error.pensjonsavtaler.partial'
                  }
                />
              </BodyLong>
            </div>
          )}
          {harSamtykket && isSuccess && (
            <BodyLong className={styles.paragraph} size="small">
              <FormattedMessage
                id="grunnlag.pensjonsavtaler.ingress"
                values={{
                  ...formatMessageValues,
                }}
              />
            </BodyLong>
          )}
        </>
      </GrunnlagSection>
    </AccordionItem>
  )
}

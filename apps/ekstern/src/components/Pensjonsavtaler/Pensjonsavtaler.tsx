import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import {
  ExclamationmarkTriangleFillIcon,
  InformationSquareFillIcon,
} from '@navikt/aksel-icons'
import { BodyLong, Heading, Link } from '@navikt/ds-react'
import clsx from 'clsx'

import ShowMore from '../common/ShowMore/ShowMore'
import { paths } from '@/router/constants'
import { usePensjonsavtalerQuery } from '@/state/api/apiSlice'
import { generatePensjonsavtalerRequestBody } from '@/state/api/utils'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import {
  selectSamtykke,
  selectAarligInntektFoerUttakBeloep,
  selectAfp,
  selectSivilstand,
  selectCurrentSimulation,
} from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputReducer'
import { getFormatMessageValues } from '@/utils/translations'
import { useIsMobile } from '@/utils/useIsMobile'

import { PensjonsavtalerMobil } from './PensjonsavtalerMobile'
import { PensjonsavtalerTable } from './PensjonsavtalerTable'

import styles from './Pensjonsavtaler.module.scss'

export const Pensjonsavtaler = () => {
  const intl = useIntl()
  const harSamtykket = useAppSelector(selectSamtykke)
  const sivilstand = useAppSelector(selectSivilstand)
  const aarligInntektFoerUttakBeloep = useAppSelector(
    selectAarligInntektFoerUttakBeloep
  )
  const afp = useAppSelector(selectAfp)
  const { uttaksalder, aarligInntektVsaHelPensjon } = useAppSelector(
    selectCurrentSimulation
  )

  const isMobile = useIsMobile()

  const [pensjonsavtalerRequestBody, setPensjonsavtalerRequestBody] =
    React.useState<PensjonsavtalerRequestBody | undefined>(undefined)

  // Hent pensjonsavtaler
  React.useEffect(() => {
    if (harSamtykket && uttaksalder) {
      const requestBody = generatePensjonsavtalerRequestBody({
        aarligInntektFoerUttakBeloep: aarligInntektFoerUttakBeloep ?? 0,
        afp,
        sivilstand,
        heltUttak: {
          uttaksalder,
          aarligInntektVsaPensjon: aarligInntektVsaHelPensjon,
        },
      })
      setPensjonsavtalerRequestBody(requestBody)
    }
  }, [harSamtykket, uttaksalder])

  const {
    data: pensjonsavtaler,
    isError,
    isSuccess,
  } = usePensjonsavtalerQuery(
    pensjonsavtalerRequestBody as PensjonsavtalerRequestBody,
    {
      skip: !pensjonsavtalerRequestBody || !harSamtykket || !uttaksalder,
    }
  )
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const onCancel = (e: React.MouseEvent<HTMLAnchorElement>): void => {
    e.preventDefault()
    dispatch(userInputActions.flush())
    navigate(paths.start)
  }

  const isPartialWith0Avtaler =
    pensjonsavtaler?.partialResponse && pensjonsavtaler?.avtaler.length === 0

  return (
    <section className={styles.section}>
      <Heading size="medium" id="pensjonsavtaler-heading">
        {intl.formatMessage({ id: 'pensjonsavtaler.title' })}
      </Heading>
      <>
        {!harSamtykket && (
          <BodyLong>
            <FormattedMessage id="pensjonsavtaler.ingress.error.samtykke_ingress" />
            <Link href={paths.start} onClick={onCancel}>
              {intl.formatMessage({
                id: 'pensjonsavtaler.ingress.error.samtykke_link_1',
              })}
            </Link>{' '}
            <FormattedMessage
              id="pensjonsavtaler.ingress.error.samtykke_link_2"
              values={{
                ...getFormatMessageValues(intl),
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
                aria-hidden
              />
              <BodyLong className={styles.infoText}>
                <FormattedMessage id="pensjonsavtaler.ingress.ingen" />
              </BodyLong>
            </div>
          )}

        {(isError || pensjonsavtaler?.partialResponse) && (
          <div
            className={clsx(styles.info, {
              [styles.info__hasMargin]:
                pensjonsavtaler?.partialResponse && !isPartialWith0Avtaler,
              [styles.info__hasMarginBottom]: isError || isPartialWith0Avtaler,
            })}
          >
            <ExclamationmarkTriangleFillIcon
              className={`${styles.infoIcon} ${styles.infoIcon__orange}`}
              fontSize="1.5rem"
              aria-hidden
            />
            <BodyLong className={styles.infoText}>
              <FormattedMessage
                id={
                  isError || isPartialWith0Avtaler
                    ? 'pensjonsavtaler.ingress.error.pensjonsavtaler'
                    : 'pensjonsavtaler.ingress.error.pensjonsavtaler.partial'
                }
              />
            </BodyLong>
          </div>
        )}

        {harSamtykket && !isError && (
          <ShowMore
            aria-labelledby="pensjonsavtaler-heading"
            collapsedHeight={
              (pensjonsavtaler?.avtaler?.length ?? 0) > 1 ? '20rem' : '10rem'
            }
          >
            {isSuccess && pensjonsavtaler?.avtaler.length > 0 && (
              <div data-testid="pensjonsavtaler-list">
                {isMobile ? (
                  <div data-testid="pensjonsavtaler-mobil">
                    <PensjonsavtalerMobil
                      pensjonsavtaler={pensjonsavtaler.avtaler}
                    />
                  </div>
                ) : (
                  <div data-testid="pensjonsavtaler-table">
                    <PensjonsavtalerTable
                      pensjonsavtaler={pensjonsavtaler.avtaler}
                    />
                  </div>
                )}
              </div>
            )}
            {(pensjonsavtaler?.avtaler.length ?? 0) > 0 && (
              <BodyLong>
                <FormattedMessage id="pensjonsavtaler.fra_og_med_forklaring" />
              </BodyLong>
            )}
            <BodyLong className={styles.paragraph} size="small">
              <FormattedMessage
                id="pensjonsavtaler.ingress"
                values={{
                  ...getFormatMessageValues(intl),
                }}
              />
            </BodyLong>
          </ShowMore>
        )}
      </>
    </section>
  )
}

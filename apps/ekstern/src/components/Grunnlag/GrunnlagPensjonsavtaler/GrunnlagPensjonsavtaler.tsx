import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import {
  ExclamationmarkTriangleFillIcon,
  InformationSquareFillIcon,
} from '@navikt/aksel-icons'
import { BodyLong, Link } from '@navikt/ds-react'
import clsx from 'clsx'

import { GrunnlagSection } from '../GrunnlagSection'
import {
  AccordionItem,
  AccordionContext as PensjonsavtalerAccordionContext,
} from '@/components/common/AccordionItem'
import { paths } from '@/router/constants'
import { usePensjonsavtalerQuery } from '@/state/api/apiSlice'
import { generatePensjonsavtalerRequestBody } from '@/state/api/utils'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import {
  selectSamtykke,
  selectAarligInntektFoerUttak,
  selectAfp,
  selectSivilstand,
  selectCurrentSimulation,
} from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputReducer'
import { getFormatMessageValues } from '@/utils/translations'

import { GrunnlagPensjonsavtalerTable } from './GrunnlagPensjonsavtalerTable'

import styles from './GrunnlagPensjonsavtaler.module.scss'

export const GrunnlagPensjonsavtaler = () => {
  const intl = useIntl()
  const harSamtykket = useAppSelector(selectSamtykke)
  const sivilstand = useAppSelector(selectSivilstand)
  const aarligInntektFoerUttak = useAppSelector(selectAarligInntektFoerUttak)
  const afp = useAppSelector(selectAfp)
  const { startAlder, aarligInntektVsaPensjon } = useAppSelector(
    selectCurrentSimulation
  )
  const {
    ref: grunnlagPensjonsavtalerRef,
    isOpen: isPensjonsavtalerAccordionItemOpen,
    toggleOpen: togglePensjonsavtalerAccordionItem,
  } = React.useContext(PensjonsavtalerAccordionContext)

  const [pensjonsavtalerRequestBody, setPensjonsavtalerRequestBody] =
    React.useState<PensjonsavtalerRequestBody | undefined>(undefined)

  // Hent pensjonsavtaler
  React.useEffect(() => {
    if (harSamtykket && startAlder) {
      const requestBody = generatePensjonsavtalerRequestBody(
        aarligInntektFoerUttak ?? 0,
        afp,
        {
          uttaksalder: startAlder,
          aarligInntektVsaPensjon: aarligInntektVsaPensjon ?? 0,
        },
        sivilstand
      )
      setPensjonsavtalerRequestBody(requestBody)
    }
  }, [harSamtykket, startAlder])

  const {
    data: pensjonsavtaler,
    isLoading,
    isError,
    isSuccess,
  } = usePensjonsavtalerQuery(
    pensjonsavtalerRequestBody as PensjonsavtalerRequestBody,
    {
      skip: !pensjonsavtalerRequestBody || !harSamtykket || !startAlder,
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
            : isError || isPartialWith0Avtaler
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
                  <FormattedMessage id="grunnlag.pensjonsavtaler.ingress.ingen" />
                </BodyLong>
              </div>
            )}
          {harSamtykket && isSuccess && pensjonsavtaler?.avtaler.length > 0 && (
            <GrunnlagPensjonsavtalerTable
              pensjonsavtaler={pensjonsavtaler.avtaler}
            />
          )}
          {(isError || pensjonsavtaler?.partialResponse) && (
            <div
              className={clsx(styles.info, {
                [styles.info__hasMargin]:
                  pensjonsavtaler?.partialResponse && !isPartialWith0Avtaler,
                [styles.info__hasMarginBottom]:
                  isError || isPartialWith0Avtaler,
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
                      ? 'grunnlag.pensjonsavtaler.ingress.error.pensjonsavtaler'
                      : 'grunnlag.pensjonsavtaler.ingress.error.pensjonsavtaler.partial'
                  }
                />
              </BodyLong>
            </div>
          )}
          {harSamtykket && (
            <BodyLong className={styles.paragraph} size="small">
              <FormattedMessage
                id="grunnlag.pensjonsavtaler.ingress"
                values={{
                  ...getFormatMessageValues(intl),
                }}
              />
            </BodyLong>
          )}
        </>
      </GrunnlagSection>
    </AccordionItem>
  )
}

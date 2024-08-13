import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import {
  ExclamationmarkTriangleFillIcon,
  InformationSquareFillIcon,
} from '@navikt/aksel-icons'
import { BodyLong, Heading, HeadingProps, Link, VStack } from '@navikt/ds-react'

import ShowMore from '../common/ShowMore/ShowMore'
import { paths } from '@/router/constants'
import { usePensjonsavtalerQuery } from '@/state/api/apiSlice'
import { generatePensjonsavtalerRequestBody } from '@/state/api/utils'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import {
  selectSamtykke,
  selectAarligInntektFoerUttakBeloep,
  selectAfp,
  selectUfoeregrad,
  selectSivilstand,
  selectCurrentSimulation,
} from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputReducer'
import { getFormatMessageValues } from '@/utils/translations'
import { useIsMobile } from '@/utils/useIsMobile'

import { OffentligTjenestepensjon } from './OffentligTjenestepensjon'
import { PensjonsavtalerMobil } from './PensjonsavtalerMobile'
import { PensjonsavtalerTable } from './PensjonsavtalerTable'

import styles from './Pensjonsavtaler.module.scss'

export const Pensjonsavtaler = (props: {
  headingLevel: HeadingProps['level']
}) => {
  const { headingLevel } = props
  const intl = useIntl()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const harSamtykket = useAppSelector(selectSamtykke)
  const sivilstand = useAppSelector(selectSivilstand)
  const aarligInntektFoerUttakBeloep = useAppSelector(
    selectAarligInntektFoerUttakBeloep
  )
  const ufoeregrad = useAppSelector(selectUfoeregrad)
  const afp = useAppSelector(selectAfp)
  const { uttaksalder, aarligInntektVsaHelPensjon, gradertUttaksperiode } =
    useAppSelector(selectCurrentSimulation)

  const isMobile = useIsMobile()

  const [pensjonsavtalerRequestBody, setPensjonsavtalerRequestBody] =
    React.useState<PensjonsavtalerRequestBody | undefined>(undefined)

  // Hent pensjonsavtaler
  React.useEffect(() => {
    if (harSamtykket && uttaksalder) {
      const requestBody = generatePensjonsavtalerRequestBody({
        aarligInntektFoerUttakBeloep: aarligInntektFoerUttakBeloep ?? '0',
        ufoeregrad,
        afp,
        sivilstand,
        heltUttak: {
          uttaksalder,
          aarligInntektVsaPensjon: aarligInntektVsaHelPensjon,
        },
        gradertUttak: gradertUttaksperiode ? gradertUttaksperiode : undefined,
      })
      setPensjonsavtalerRequestBody(requestBody)
    }
  }, [harSamtykket, uttaksalder])

  const subHeadingLevel = React.useMemo(() => {
    return headingLevel
      ? ((
          parseInt(headingLevel as string, 10) + 1
        ).toString() as HeadingProps['level'])
      : '4'
  }, [headingLevel])

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

  const onCancel = (e: React.MouseEvent<HTMLAnchorElement>): void => {
    e.preventDefault()
    dispatch(userInputActions.flush())
    navigate(paths.start)
  }

  const isPartialWith0Avtaler =
    pensjonsavtaler?.partialResponse && pensjonsavtaler?.avtaler.length === 0

  return (
    <section className={styles.section}>
      <Heading id="pensjonsavtaler-heading" level={headingLevel} size="medium">
        {intl.formatMessage({ id: 'pensjonsavtaler.title' })}
      </Heading>
      <>
        {
          // Når brukeren ikke har samtykket
        }
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

        {
          // Når brukeren har samtykket og har ingen private pensjonsavtaler
        }
        {harSamtykket &&
          isSuccess &&
          !pensjonsavtaler?.partialResponse &&
          pensjonsavtaler?.avtaler.length === 0 && (
            <>
              <div className={`${styles.info}`}>
                <InformationSquareFillIcon
                  className={`${styles.infoIcon} ${styles.infoIcon__blue}`}
                  fontSize="1.5rem"
                  aria-hidden
                />
                <BodyLong className={styles.infoText}>
                  <FormattedMessage id="pensjonsavtaler.ingress.ingen" />
                </BodyLong>
              </div>
              <BodyLong className={styles.paragraph} size="small">
                <FormattedMessage
                  id="pensjonsavtaler.ingress.norsk_pensjon"
                  values={{
                    ...getFormatMessageValues(intl),
                  }}
                />
              </BodyLong>
              <OffentligTjenestepensjon
                headingLevel={subHeadingLevel}
                showDivider
              />
            </>
          )}

        {
          // Når private pensjonsavtaler feiler helt eller er partial med 0 avtaler
        }
        {(isError || isPartialWith0Avtaler) && (
          <>
            <div className={styles.info}>
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
            <BodyLong className={styles.paragraph} size="small">
              <FormattedMessage
                id="pensjonsavtaler.ingress.norsk_pensjon"
                values={{
                  ...getFormatMessageValues(intl),
                }}
              />
            </BodyLong>
            <OffentligTjenestepensjon
              headingLevel={subHeadingLevel}
              showDivider
            />
          </>
        )}

        {harSamtykket && isSuccess && pensjonsavtaler?.avtaler.length > 0 && (
          <>
            {pensjonsavtaler?.partialResponse && (
              <div className={styles.info}>
                <ExclamationmarkTriangleFillIcon
                  className={`${styles.infoIcon} ${styles.infoIcon__orange}`}
                  fontSize="1.5rem"
                  aria-hidden
                />
                <BodyLong className={styles.infoText}>
                  <FormattedMessage id="pensjonsavtaler.ingress.error.pensjonsavtaler.partial" />
                </BodyLong>
              </div>
            )}
            <ShowMore
              name="pensjonsavtaler"
              aria-labelledby="pensjonsavtaler-heading"
              collapsedHeight={
                (pensjonsavtaler?.avtaler?.length ?? 0) > 1 ? '20rem' : '10rem'
              }
            >
              <VStack gap="4">
                {isSuccess && pensjonsavtaler?.avtaler.length > 0 && (
                  <div data-testid="pensjonsavtaler-list">
                    {isMobile ? (
                      <div data-testid="pensjonsavtaler-mobil">
                        <PensjonsavtalerMobil
                          headingLevel={subHeadingLevel}
                          pensjonsavtaler={pensjonsavtaler.avtaler}
                        />
                      </div>
                    ) : (
                      <div data-testid="pensjonsavtaler-table">
                        <PensjonsavtalerTable
                          headingLevel={subHeadingLevel}
                          pensjonsavtaler={pensjonsavtaler.avtaler}
                        />
                      </div>
                    )}
                  </div>
                )}

                <OffentligTjenestepensjon headingLevel={subHeadingLevel} />
                <BodyLong className={styles.paragraph} size="small">
                  <FormattedMessage
                    id="pensjonsavtaler.ingress.norsk_pensjon"
                    values={{
                      ...getFormatMessageValues(intl),
                    }}
                  />
                </BodyLong>
              </VStack>
            </ShowMore>
          </>
        )}
      </>
    </section>
  )
}

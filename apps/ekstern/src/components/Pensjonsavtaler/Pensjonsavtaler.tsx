import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useNavigate } from 'react-router'

import { BodyLong, Heading, HeadingProps, Link } from '@navikt/ds-react'

import ShowMore from '../common/ShowMore/ShowMore'
import { BeregningContext } from '@/pages/Beregning/context'
import { paths } from '@/router/constants'
import {
  useOffentligTpQuery,
  usePensjonsavtalerQuery,
} from '@/state/api/apiSlice'
import {
  generateOffentligTpRequestBody,
  generatePensjonsavtalerRequestBody,
} from '@/state/api/utils'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import {
  selectSamtykke,
  selectAarligInntektFoerUttakBeloep,
  selectAfp,
  selectFoedselsdato,
  selectUfoeregrad,
  selectSivilstand,
  selectEpsHarInntektOver2G,
  selectEpsHarPensjon,
  selectCurrentSimulation,
} from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputReducer'
import { getFormatMessageValues } from '@/utils/translations'

import { OffentligTjenestepensjon } from './OffentligTjenestePensjon/OffentligTjenestepensjon'
import { PrivatePensjonsavtaler } from './PrivatePensjonsavtaler'

import styles from './Pensjonsavtaler.module.scss'

export const Pensjonsavtaler = (props: {
  headingLevel: Exclude<HeadingProps['level'], undefined>
}) => {
  const { headingLevel } = props
  const { pensjonsavtalerShowMoreRef } = React.useContext(BeregningContext)
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
  const foedselsdato = useAppSelector(selectFoedselsdato)
  const epsHarInntektOver2G = useAppSelector(selectEpsHarInntektOver2G)
  const epsHarPensjon = useAppSelector(selectEpsHarPensjon)
  const {
    uttaksalder,
    aarligInntektVsaHelPensjon,
    gradertUttaksperiode,
    utenlandsperioder,
  } = useAppSelector(selectCurrentSimulation)

  const [offentligTpRequestBody, setOffentligTpRequestBody] = React.useState<
    OffentligTpRequestBody | undefined
  >(undefined)

  const {
    data: offentligTp,
    isLoading: isOffentligTpLoading,
    isError: isOffentligTpError,
  } = useOffentligTpQuery(offentligTpRequestBody as OffentligTpRequestBody, {
    skip: !offentligTpRequestBody || !harSamtykket || !uttaksalder,
  })

  // Hent Offentlig Tjenestepensjon
  React.useEffect(() => {
    if (harSamtykket && uttaksalder) {
      const requestBody = generateOffentligTpRequestBody({
        afp,
        foedselsdato,
        epsHarInntektOver2G,
        epsHarPensjon,
        aarligInntektFoerUttakBeloep: aarligInntektFoerUttakBeloep ?? '0',
        gradertUttak: gradertUttaksperiode ? gradertUttaksperiode : undefined,
        heltUttak: {
          uttaksalder,
          aarligInntektVsaPensjon: aarligInntektVsaHelPensjon,
        },
        utenlandsperioder,
      })
      setOffentligTpRequestBody(requestBody)
    }
  }, [harSamtykket, uttaksalder])

  const [pensjonsavtalerRequestBody, setPensjonsavtalerRequestBody] =
    React.useState<PensjonsavtalerRequestBody | undefined>(undefined)

  // Hent Private Pensjonsavtaler
  React.useEffect(() => {
    if (harSamtykket && uttaksalder) {
      const requestBody = generatePensjonsavtalerRequestBody({
        ufoeregrad,
        afp,
        sivilstand,
        epsHarInntektOver2G,
        epsHarPensjon,
        aarligInntektFoerUttakBeloep: aarligInntektFoerUttakBeloep ?? '0',
        gradertUttak: gradertUttaksperiode ? gradertUttaksperiode : undefined,
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
    isError: isPensjonsavtalerError,
    isSuccess: isPensjonsavtalerSuccess,
  } = usePensjonsavtalerQuery(
    pensjonsavtalerRequestBody as PensjonsavtalerRequestBody,
    {
      skip: !pensjonsavtalerRequestBody || !harSamtykket || !uttaksalder,
    }
  )

  const subHeadingLevel = React.useMemo(() => {
    return (
      headingLevel ? (parseInt(headingLevel, 10) + 1).toString() : '4'
    ) as Exclude<HeadingProps['level'], undefined>
  }, [headingLevel])

  const onCancel = (e: React.MouseEvent<HTMLAnchorElement>): void => {
    e.preventDefault()
    dispatch(userInputActions.flush())
    navigate(paths.start)
  }

  return (
    <section className={styles.section}>
      <Heading id="pensjonsavtaler-heading" level={headingLevel} size="medium">
        {intl.formatMessage({ id: 'pensjonsavtaler.title' })}
      </Heading>

      {harSamtykket ? (
        <ShowMore
          ref={pensjonsavtalerShowMoreRef}
          name="pensjonsavtaler"
          aria-labelledby="pensjonsavtaler-heading"
          collapsedHeight={
            (pensjonsavtaler?.avtaler?.length ?? 0) > 1 ? '20rem' : '10rem'
          }
        >
          <>
            <PrivatePensjonsavtaler
              isPartialResponse={!!pensjonsavtaler?.partialResponse}
              isError={isPensjonsavtalerError}
              isSuccess={isPensjonsavtalerSuccess}
              headingLevel={subHeadingLevel}
              privatePensjonsavtaler={pensjonsavtaler?.avtaler}
            />
            <OffentligTjenestepensjon
              isLoading={isOffentligTpLoading}
              isError={isOffentligTpError}
              offentligTp={offentligTp}
              headingLevel={subHeadingLevel}
            />
            {(isPensjonsavtalerSuccess ||
              offentligTp?.simulertTjenestepensjon) && (
              <BodyLong className={styles.footnote}>
                <FormattedMessage id="pensjonsavtaler.fra_og_med_forklaring" />
              </BodyLong>
            )}
          </>
        </ShowMore>
      ) : (
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
    </section>
  )
}

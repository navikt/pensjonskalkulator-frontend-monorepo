import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { BodyLong } from '@navikt/ds-react'

import { GrunnlagSection } from '../GrunnlagSection'
import { AccordionItem } from '@/components/common/AccordionItem'
import { EndreInntekt } from '@/components/EndreInntekt'
import { InfoModalInntekt } from '@/components/InfoModalInntekt'
import { useGetInntektQuery } from '@/state/api/apiSlice'
import { useAppSelector } from '@/state/hooks'
import {
  selectAarligInntektFoerUttak,
  selectAarligInntektFoerUttakFraBrukerInput,
} from '@/state/userInput/selectors'
import { formatWithoutDecimal } from '@/utils/currency'
import { formatMessageValues } from '@/utils/translations'

import styles from './GrunnlagInntekt.module.scss'

export const GrunnlagInntekt = () => {
  const intl = useIntl()

  const aarligInntektFoerUttak = useAppSelector(selectAarligInntektFoerUttak)
  const aarligInntektFoerUttakFraBrukerInput = useAppSelector(
    selectAarligInntektFoerUttakFraBrukerInput
  )
  const { data: aarligInntektFoerUttakFraSkatt } = useGetInntektQuery()

  const isInntektGreaterThanZero =
    aarligInntektFoerUttakFraBrukerInput !== null ||
    (aarligInntektFoerUttakFraBrukerInput === null &&
      aarligInntektFoerUttakFraSkatt &&
      aarligInntektFoerUttakFraSkatt.beloep > 0)

  return (
    <>
      <AccordionItem name="Grunnlag: Inntekt">
        <GrunnlagSection
          headerTitle={intl.formatMessage({
            id: 'grunnlag.inntekt.title',
          })}
          headerValue={
            isInntektGreaterThanZero
              ? `${formatWithoutDecimal(aarligInntektFoerUttak)} kr`
              : intl.formatMessage({
                  id: 'grunnlag.inntekt.title.error',
                })
          }
        >
          <>
            <BodyLong>
              {isInntektGreaterThanZero ? (
                <FormattedMessage
                  id="grunnlag.inntekt.ingress"
                  values={{
                    ...formatMessageValues,
                    beloep: formatWithoutDecimal(
                      aarligInntektFoerUttakFraSkatt?.beloep
                    ),
                    aar: aarligInntektFoerUttakFraSkatt?.aar,
                  }}
                />
              ) : (
                <FormattedMessage
                  id="grunnlag.inntekt.ingress.error"
                  values={{
                    ...formatMessageValues,
                  }}
                />
              )}
              <br />
            </BodyLong>
            <InfoModalInntekt />

            <EndreInntekt className={styles.button} />
          </>
        </GrunnlagSection>
      </AccordionItem>
    </>
  )
}

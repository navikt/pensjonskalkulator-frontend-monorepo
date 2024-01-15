import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { BodyLong } from '@navikt/ds-react'

import { GrunnlagSection } from '../GrunnlagSection'
import { AccordionItem } from '@/components/common/AccordionItem'
import { EndreInntekt } from '@/components/EndreInntekt'
import { InfoModalInntekt } from '@/components/InfoModalInntekt'
import { useAppSelector } from '@/state/hooks'
import {
  selectAarligInntektFoerUttak,
  selectAarligInntektFoerUttakFraSkatt,
  selectAarligInntektFoerUttakFraBrukerInput,
} from '@/state/userInput/selectors'
import { formatWithoutDecimal } from '@/utils/currency'
import { getFormatMessageValues } from '@/utils/translations'

import styles from './GrunnlagInntekt.module.scss'

export const GrunnlagInntekt = () => {
  const intl = useIntl()

  const aarligInntektFoerUttak = useAppSelector(selectAarligInntektFoerUttak)
  const aarligInntektFoerUttakFraSkatt = useAppSelector(
    selectAarligInntektFoerUttakFraSkatt
  )
  const aarligInntektFoerUttakFraBrukerInput = useAppSelector(
    selectAarligInntektFoerUttakFraBrukerInput
  )

  return (
    <>
      <AccordionItem name="Grunnlag: Inntekt">
        <GrunnlagSection
          headerTitle={intl.formatMessage({
            id: 'grunnlag.inntekt.title',
          })}
          headerValue={`${formatWithoutDecimal(
            aarligInntektFoerUttak ?? 0
          )} kr`}
        >
          <>
            <BodyLong>
              {aarligInntektFoerUttakFraBrukerInput !== null ? (
                <FormattedMessage
                  id="grunnlag.inntekt.ingress.endret_inntekt"
                  values={{
                    ...getFormatMessageValues(intl),
                  }}
                />
              ) : (
                <FormattedMessage
                  id="grunnlag.inntekt.ingress.uendret_inntekt"
                  values={{
                    ...getFormatMessageValues(intl),
                  }}
                />
              )}
              <br /> <br />
              <FormattedMessage
                id="grunnlag.inntekt.ingress"
                values={{
                  ...getFormatMessageValues(intl),
                  beloep: formatWithoutDecimal(
                    aarligInntektFoerUttakFraSkatt?.beloep
                  ),
                  aar: aarligInntektFoerUttakFraSkatt?.aar,
                }}
              />
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

import React from 'react'
import { FormattedMessage } from 'react-intl'

import { BodyLong, Heading, Link, VStack } from '@navikt/ds-react'

import { EndreInntekt } from '@/components/EndreInntekt'
import { SanityReadmore } from '@/components/common/SanityReadmore'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import {
  selectAarligInntektFoerUttakBeloepFraBrukerInput,
  selectAarligInntektFoerUttakBeloepFraSkatt,
} from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputSlice'
import { getFormatMessageValues } from '@/utils/translations'

import styles from './Pensjonsgivendeinntekt.module.scss'

interface Props {
  goToAvansert: React.MouseEventHandler<HTMLAnchorElement>
}

export const Pensjonsgivendeinntekt: React.FC<Props> = ({ goToAvansert }) => {
  const dispatch = useAppDispatch()

  const aarligInntektFoerUttakBeloepFraBrukerInput = useAppSelector(
    selectAarligInntektFoerUttakBeloepFraBrukerInput
  )

  const aarligInntektFoerUttakBeloepFraSkatt = useAppSelector(
    selectAarligInntektFoerUttakBeloepFraSkatt
  )

  return (
    <VStack gap="1">
      <Heading
        level="3"
        size="small"
        data-testid="grunnlag2.endre_inntekt.title"
      >
        <FormattedMessage
          id="grunnlag2.endre_inntekt.title"
          values={{
            ...getFormatMessageValues(),
            beloep:
              aarligInntektFoerUttakBeloepFraBrukerInput ??
              aarligInntektFoerUttakBeloepFraSkatt?.beloep,
          }}
        />
      </Heading>

      <BodyLong
        className={styles.ingress}
        data-testid="grunnlag.inntekt.ingress"
      >
        <FormattedMessage
          id="grunnlag.inntekt.ingress"
          values={{
            ...getFormatMessageValues(),
            beloep: aarligInntektFoerUttakBeloepFraSkatt?.beloep,
            aar: aarligInntektFoerUttakBeloepFraSkatt?.aar,
          }}
        />
        <Link href="#" onClick={goToAvansert}>
          <FormattedMessage id="grunnlag.inntekt.avansert_link" />
        </Link>
        .
      </BodyLong>

      <EndreInntekt
        visning="enkel"
        variant="secondary"
        className={styles.endreInntektButton}
        value={aarligInntektFoerUttakBeloepFraBrukerInput}
        onSubmit={(uformatertInntekt) => {
          dispatch(
            userInputActions.setCurrentSimulationAarligInntektFoerUttakBeloep(
              uformatertInntekt
            )
          )
          dispatch(userInputActions.setCurrentSimulationUttaksalder(null))
        }}
      />

      <SanityReadmore id="om_pensjonsgivende_inntekt" />
    </VStack>
  )
}

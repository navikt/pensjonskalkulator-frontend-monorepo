/* c8 ignore start */
import React from 'react'
import { useIntl, FormattedMessage } from 'react-intl'

import { BodyLong, Button, Label } from '@navikt/ds-react'

import { EndreInntekt } from '@/components/EndreInntekt'
import { InfoModalInntekt } from '@/components/InfoModalInntekt'
import { TemporaryAlderVelgerAvansert } from '@/components/VelgUttaksalder/TemporaryAlderVelgerAvansert'
import { useTidligsteUttaksalderQuery } from '@/state/api/apiSlice'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import {
  selectAfp,
  selectSamboer,
  selectSivilstand,
  selectAarligInntektFoerUttak,
} from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputReducer'
import { unformatUttaksalder } from '@/utils/alder'
import { formatWithoutDecimal } from '@/utils/currency'
import { getFormatMessageValues } from '@/utils/translations'
interface Props {
  onSubmitSuccess: () => void
}

import styles from './RedigerAvansertBeregning.module.scss'

export const RedigerAvansertBeregning: React.FC<Props> = ({
  onSubmitSuccess,
}) => {
  const intl = useIntl()
  const dispatch = useAppDispatch()
  const afp = useAppSelector(selectAfp)
  const harSamboer = useAppSelector(selectSamboer)
  const sivilstand = useAppSelector(selectSivilstand)
  const aarligInntektFoerUttak = useAppSelector(selectAarligInntektFoerUttak)
  const [
    hasValidationFormatertUttaksalderError,
    setHasValidationFormatertUttaksalderError,
  ] = React.useState<boolean>(false)

  const [tidligsteUttaksalderRequestBody, setTidligsteUttaksalderRequestBody] =
    React.useState<TidligsteUttaksalderRequestBody | undefined>(undefined)

  React.useEffect(() => {
    setTidligsteUttaksalderRequestBody({
      sivilstand: sivilstand,
      harEps: harSamboer !== null ? harSamboer : undefined,
      sisteInntekt: aarligInntektFoerUttak ?? 0,
      simuleringstype:
        afp === 'ja_privat' ? 'ALDERSPENSJON_MED_AFP_PRIVAT' : 'ALDERSPENSJON',
    })
  }, [afp, sivilstand, aarligInntektFoerUttak, harSamboer])

  // Hent tidligst mulig uttaksalder
  const {
    data: tidligstMuligUttak,
    isSuccess: isTidligstMuligUttaksalderSuccess,
    isError: isTidligstMuligUttaksalderError,
  } = useTidligsteUttaksalderQuery(tidligsteUttaksalderRequestBody, {
    skip: !tidligsteUttaksalderRequestBody,
  })

  const onSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()

    const data = new FormData(e.currentTarget)
    const avansertBeregningFormatertUttaksalderData = data.get(
      'uttaksalder'
    ) as string | undefined

    if (
      avansertBeregningFormatertUttaksalderData &&
      /\d/.test(avansertBeregningFormatertUttaksalderData)
    ) {
      setHasValidationFormatertUttaksalderError(false)
      const alder = unformatUttaksalder(
        avansertBeregningFormatertUttaksalderData
      )
      dispatch(userInputActions.setCurrentSimulationStartAlder(alder))
      onSubmitSuccess()
    } else {
      setHasValidationFormatertUttaksalderError(true)
    }
  }

  return (
    <div
      className={`${styles.container} ${styles.container__hasMobilePadding}`}
    >
      <form id="avansert-beregning" method="dialog" onSubmit={onSubmit}></form>
      <div>
        <Label>Pensjonsgivende inntekt frem til pensjon</Label>
        <div className={styles.description}>
          <span className={styles.descriptionText}>
            {`${formatWithoutDecimal(
              aarligInntektFoerUttak
            )} kr per år før skatt`}
          </span>

          <EndreInntekt buttonLabel="beregning.avansert.rediger.inntekt.button" />
        </div>
        <InfoModalInntekt />
      </div>
      <hr className={styles.separator} />
      <div>
        <Label>Hvor mye alderspensjon vil du ta ut?</Label>
        <p>lorem ipsum</p>
      </div>
      <hr className={styles.separator} />
      <div>
        {
          // TODO under avklaring - hvordan skal feil ved henting av tidligste uttaksalder vises?
        }
        {isTidligstMuligUttaksalderError && (
          <BodyLong size="medium" className={`${styles.ingress}`}>
            <FormattedMessage
              id="tidligsteuttaksalder.error"
              values={{
                ...getFormatMessageValues(intl),
              }}
            />
          </BodyLong>
        )}

        {isTidligstMuligUttaksalderSuccess && tidligstMuligUttak && (
          <TemporaryAlderVelgerAvansert
            tidligstMuligUttak={tidligstMuligUttak}
            hasValidationError={hasValidationFormatertUttaksalderError}
          />
        )}
      </div>
      <div>
        <Button form="avansert-beregning" className={styles.button}>
          {intl.formatMessage({
            id: 'stegvisning.beregn',
          })}
        </Button>
        {/* <Button type="button" variant="secondary" onClick={() => {}}>
          NULLSTILL
        </Button> */}
      </div>
    </div>
  )
}
/* c8 ignore end */

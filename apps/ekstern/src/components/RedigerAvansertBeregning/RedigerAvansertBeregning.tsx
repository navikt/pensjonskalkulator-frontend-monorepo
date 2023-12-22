import React from 'react'
import { useIntl } from 'react-intl'

import { Button, Label } from '@navikt/ds-react'

import { EndreInntekt } from '@/components/EndreInntekt'
import { InfoModalInntekt } from '@/components/InfoModalInntekt'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import { selectAarligInntektFoerUttak } from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputReducer'
import { formatWithoutDecimal } from '@/utils/currency'
interface Props {
  onSubmitSuccess: () => void
}

import styles from './RedigerAvansertBeregning.module.scss'

export const RedigerAvansertBeregning: React.FC<Props> = ({
  onSubmitSuccess,
}) => {
  const intl = useIntl()
  const dispatch = useAppDispatch()
  const aarligInntektFoerUttak = useAppSelector(selectAarligInntektFoerUttak)

  const onSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()

    const data = new FormData(e.currentTarget)
    const inntektData = data.get('inntekt') as string | undefined

    dispatch(
      userInputActions.updateCurrentSimulation({
        aarligInntektFoerUttak: parseInt(
          (inntektData as string).replace(/ /g, ''),
          10
        ),
      })
    )

    onSubmitSuccess()
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
      <div>
        <Button form="avansert-beregning">
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

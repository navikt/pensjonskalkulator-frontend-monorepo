/* c8 ignore start */
import React from 'react'
import { useIntl } from 'react-intl'

import { Button, Label, Select } from '@navikt/ds-react'

import { EndreInntekt } from '@/components/EndreInntekt'
import { InfoModalInntekt } from '@/components/InfoModalInntekt'
import { TemporaryAlderVelgerAvansert } from '@/components/VelgUttaksalder/TemporaryAlderVelgerAvansert'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import {
  selectCurrentSimulation,
  selectAarligInntektFoerUttak,
} from '@/state/userInput/selectors'
import { Uttaksperiode } from '@/state/userInput/userInputReducer'
import { userInputActions } from '@/state/userInput/userInputReducer'
import { unformatUttaksalder } from '@/utils/alder'
import { formatWithoutDecimal } from '@/utils/currency'

import { validateInput } from './utils'

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
  const { startAlder, uttaksperioder } = useAppSelector(selectCurrentSimulation)
  const [validationErrors, setValidationErrors] = React.useState<
    Record<string, boolean>
  >({
    uttaksgrad: false,
    'uttaksalder-hele-pensjon': false,
    'uttaksalder-gradert-pensjon': false,
  })
  const [uttaksperiode, setUttaksperiode] = React.useState<
    Partial<Uttaksperiode> | undefined
  >(uttaksperioder[0])

  const formaterteUttaksgrad = ['20 %', '40 %', '50 %', '60 %', '80 %', '100 %']

  const onUttaksgradChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValidationErrors((prevState) => {
      return {
        ...prevState,
        uttaksgrad: false,
        'uttaksalder-gradert-pensjon': false,
      }
    })
    const avansertBeregningFormatertUttaksgradAsNumber = e.target.value
      ? parseInt(e.target.value.match(/\d+/)?.[0] as string, 10)
      : 100

    setUttaksperiode(
      avansertBeregningFormatertUttaksgradAsNumber !== 100
        ? {
            grad: avansertBeregningFormatertUttaksgradAsNumber,
          }
        : undefined
    )
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()

    const data = new FormData(e.currentTarget)
    const avansertBeregningFormatertUttaksalderGradertPensjonData = data.get(
      'uttaksalder-gradert-pensjon'
    )
    const avansertBeregningFormatertUttaksalderHelePensjonData = data.get(
      'uttaksalder-hele-pensjon'
    )
    const avansertBeregningFormatertUttaksgrad = data.get('uttaksgrad')

    if (validateInput(data, setValidationErrors)) {
      dispatch(
        userInputActions.setCurrentSimulationStartAlder(
          unformatUttaksalder(
            avansertBeregningFormatertUttaksalderHelePensjonData as string
          )
        )
      )
      if (avansertBeregningFormatertUttaksgrad === '100 %') {
        dispatch(userInputActions.setCurrentSimulationUttaksperioder([]))
      } else {
        dispatch(
          userInputActions.setCurrentSimulationUttaksperioder([
            {
              startAlder: unformatUttaksalder(
                avansertBeregningFormatertUttaksalderGradertPensjonData as string
              ),
              grad: parseInt(
                (avansertBeregningFormatertUttaksgrad as string).match(
                  /\d+/
                )?.[0] as string,
                10
              ),
            },
          ])
        )
      }

      onSubmitSuccess()
    }
  }

  return (
    <div
      className={`${styles.container} ${styles.container__hasMobilePadding}`}
    >
      <div className={styles.form}>
        <form
          id="avansert-beregning"
          method="dialog"
          onSubmit={onSubmit}
        ></form>
        <div>
          <Label className={styles.label}>
            Pensjonsgivende inntekt frem til pensjon
          </Label>
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
          <Select
            form="avansert-beregning"
            name="uttaksgrad"
            label="Hvor mye alderspensjon vil du ta ut?"
            description="Velg uttaksgrad"
            defaultValue={
              uttaksperioder.length > 0 && uttaksperioder[0].grad
                ? `${uttaksperioder[0].grad} %`
                : '100 %'
            }
            onChange={onUttaksgradChange}
            error={validationErrors.uttaksgrad ? 'VALIDATION ERROR' : undefined}
          >
            <option>Velg uttaksgrad</option>
            {formaterteUttaksgrad.map((grad) => (
              <option key={grad} value={grad}>
                {grad}
              </option>
            ))}
          </Select>
        </div>
        <hr className={styles.separator} />

        {uttaksperiode?.grad && (
          <div>
            <TemporaryAlderVelgerAvansert
              defaultValue={uttaksperiode.startAlder ?? undefined}
              grad={uttaksperiode.grad}
              hasValidationError={
                validationErrors['uttaksalder-gradert-pensjon']
              }
            />
            <hr className={styles.separator} />
          </div>
        )}
        <div>
          <TemporaryAlderVelgerAvansert
            defaultValue={startAlder ?? undefined}
            grad={100}
            hasValidationError={validationErrors['uttaksalder-hele-pensjon']}
          />
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
    </div>
  )
}
/* c8 ignore end */

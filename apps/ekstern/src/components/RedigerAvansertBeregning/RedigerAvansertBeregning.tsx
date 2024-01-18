/* c8 ignore start */
import React from 'react'
import { useIntl } from 'react-intl'

import { Button, Label, Select, TextField } from '@navikt/ds-react'

import { EndreInntekt } from '@/components/EndreInntekt'
import { EndreInntektVsaPensjon } from '@/components/EndreInntektVsaPensjon'
import { InfoModalInntekt } from '@/components/InfoModalInntekt'
import { TemporaryAlderVelgerAvansert } from '@/components/VelgUttaksalder/TemporaryAlderVelgerAvansert'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import {
  selectCurrentSimulation,
  selectAarligInntektFoerUttak,
} from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputReducer'
import { unformatUttaksalder } from '@/utils/alder'
import { formatWithoutDecimal } from '@/utils/inntekt'

import { validateAvansertBeregningSkjema } from './utils'

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
  const { uttaksalder, gradertUttaksperiode } = useAppSelector(
    selectCurrentSimulation
  )
  const [validationErrors, setValidationErrors] = React.useState<
    Record<string, string>
  >({
    uttaksgrad: '',
    'uttaksalder-hele-pensjon': '',
    'uttaksalder-gradert-pensjon': '',
    'inntekt-vsa-gradert-pensjon': '',
  })
  const [temporaryStartAlder, setTemporaryStartAlder] = React.useState<
    Alder | undefined
  >(uttaksalder !== null ? uttaksalder : undefined)
  const [temporaryGradertUttaksperiode, setTemporaryGradertUttaksperiode] =
    React.useState<Partial<GradertUttaksperiode> | undefined>(
      gradertUttaksperiode ?? undefined
    )
  const [
    temporaryInntektVsaGradertPensjon,
    setTemporaryInntektVsaGradertPensjon,
  ] = React.useState<string>(
    gradertUttaksperiode?.aarligInntektVsaPensjon?.toString() ?? ''
  )

  const formaterteUttaksgrad = ['20 %', '40 %', '50 %', '60 %', '80 %', '100 %']

  const handleUttaksgradChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValidationErrors((prevState) => {
      return {
        ...prevState,
        uttaksgrad: '',
        'uttaksalder-gradert-pensjon': '',
      }
    })
    const avansertBeregningFormatertUttaksgradAsNumber = e.target.value
      ? parseInt(e.target.value.match(/\d+/)?.[0] as string, 10)
      : 100

    setTemporaryGradertUttaksperiode(
      !isNaN(avansertBeregningFormatertUttaksgradAsNumber) &&
        avansertBeregningFormatertUttaksgradAsNumber !== 100
        ? {
            grad: avansertBeregningFormatertUttaksgradAsNumber,
          }
        : undefined
    )
  }

  const handleInntektVsaGradertPensjonChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setTemporaryInntektVsaGradertPensjon(e.target.value)
    setValidationErrors((prevState) => {
      return {
        ...prevState,
        'inntekt-vsa-gradert-pensjon': '',
      }
    })
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
    const avansertBeregningInntektVsaGradertPensjon = data.get(
      'inntekt-vsa-gradert-pensjon'
    )

    if (validateAvansertBeregningSkjema(data, setValidationErrors)) {
      dispatch(
        userInputActions.setCurrentSimulationUttaksalder(
          unformatUttaksalder(
            avansertBeregningFormatertUttaksalderHelePensjonData as string
          )
        )
      )
      if (avansertBeregningFormatertUttaksgrad === '100 %') {
        dispatch(
          userInputActions.setCurrentSimulationGradertuttaksperiode(null)
        )
      } else {
        const aarligInntektVsaPensjon = parseInt(
          avansertBeregningInntektVsaGradertPensjon as string,
          10
        )
        dispatch(
          userInputActions.setCurrentSimulationGradertuttaksperiode({
            uttaksalder: unformatUttaksalder(
              avansertBeregningFormatertUttaksalderGradertPensjonData as string
            ),
            grad: parseInt(
              (avansertBeregningFormatertUttaksgrad as string).match(
                /\d+/
              )?.[0] as string,
              10
            ),
            aarligInntektVsaPensjon: !isNaN(aarligInntektVsaPensjon)
              ? aarligInntektVsaPensjon
              : 0,
          })
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
              temporaryGradertUttaksperiode?.grad
                ? `${temporaryGradertUttaksperiode.grad} %`
                : '100 %'
            }
            onChange={handleUttaksgradChange}
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

        {temporaryGradertUttaksperiode && (
          <div>
            <TemporaryAlderVelgerAvansert
              form="avansert-beregning"
              name="uttaksalder-gradert-pensjon"
              label={`Når vil du ta ut ${temporaryGradertUttaksperiode.grad} % alderspensjon`}
              description="TODO under avklaring"
              defaultValue={
                temporaryGradertUttaksperiode?.uttaksalder ?? undefined
              }
              hasValidationError={
                validationErrors['uttaksalder-gradert-pensjon'] !== ''
              }
            />
            <TextField
              form="avansert-beregning"
              data-testid="inntekt-vsa-gradert-pensjon-textfield"
              type="text"
              inputMode="numeric"
              name="inntekt-vsa-gradert-pensjon"
              label={`Hva er din forventede årsinntekt mens du tar ut ${temporaryGradertUttaksperiode.grad} % alderspensjon? (Valgfritt)`}
              description={intl.formatMessage({
                id: 'inntekt.endre_inntekt_modal.textfield.description',
              })}
              error={
                validationErrors['inntekt-vsa-gradert-pensjon']
                  ? intl.formatMessage({
                      id: validationErrors['inntekt-vsa-gradert-pensjon'],
                    })
                  : ''
              }
              onChange={handleInntektVsaGradertPensjonChange}
              value={temporaryInntektVsaGradertPensjon}
              max={5}
            />
            <hr className={styles.separator} />
          </div>
        )}
        <div>
          <TemporaryAlderVelgerAvansert
            form="avansert-beregning"
            name="uttaksalder-hele-pensjon"
            label="Når vil du ta ut 100 % alderspensjon"
            defaultValue={uttaksalder ?? undefined}
            hasValidationError={
              validationErrors['uttaksalder-hele-pensjon'] !== ''
            }
            onChange={(alder) => {
              setTemporaryStartAlder(alder)
            }}
          />
        </div>
        <div>
          <EndreInntektVsaPensjon temporaryUttaksalder={temporaryStartAlder} />
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

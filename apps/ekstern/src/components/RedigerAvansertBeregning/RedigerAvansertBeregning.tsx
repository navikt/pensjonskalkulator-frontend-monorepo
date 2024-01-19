/* c8 ignore start */
import React from 'react'
import { useIntl } from 'react-intl'

import { Button, Label, Select, TextField } from '@navikt/ds-react'

import { EndreInntekt } from '@/components/EndreInntekt'
import { EndreInntektVsaPensjon } from '@/components/EndreInntektVsaPensjon'
import { InfoModalInntekt } from '@/components/InfoModalInntekt'
import { TemporaryAlderVelgerAvansert } from '@/components/VelgUttaksalder/TemporaryAlderVelgerAvansert'
import {
  useTidligsteHelUttaksalderQuery,
  useTidligsteGradertUttaksalderQuery,
} from '@/state/api/apiSlice'
import {
  generateTidligsteHelUttaksalderRequestBody,
  generateTidligsteGradertUttaksalderRequestBody,
} from '@/state/api/utils'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import {
  selectAfp,
  selectSamboer,
  selectSivilstand,
  selectCurrentSimulation,
  selectAarligInntektFoerUttakBeloep,
} from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputReducer'
import { formatUttaksalder, unformatUttaksalder } from '@/utils/alder'
import { formatWithoutDecimal } from '@/utils/inntekt'
import { getFormatMessageValues } from '@/utils/translations'

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

  const { uttaksalder, gradertUttaksperiode, aarligInntektVsaHelPensjon } =
    useAppSelector(selectCurrentSimulation)
  const afp = useAppSelector(selectAfp)
  const harSamboer = useAppSelector(selectSamboer)
  const sivilstand = useAppSelector(selectSivilstand)
  const aarligInntektFoerUttakBeloep = useAppSelector(
    selectAarligInntektFoerUttakBeloep
  )
  const [temporaryHelUttaksalder, setTemporaryHelUttaksalder] = React.useState<
    Alder | undefined
  >(uttaksalder !== null ? uttaksalder : undefined)
  const [temporaryGradertUttaksperiode, setTemporaryGradertUttaksperiode] =
    React.useState<Partial<GradertUttaksperiode> | undefined>(
      gradertUttaksperiode ?? undefined
    )

  // Hent tidligst hel uttaksalder
  const [
    tidligsteHelUttaksalderRequestBody,
    setTidligsteHelUttaksalderRequestBody,
  ] = React.useState<TidligsteHelUttaksalderRequestBody | undefined>(undefined)
  const {
    data: tidligstHelUttaksalder,
    isError: isTidligstHelUttaksalderError,
  } = useTidligsteHelUttaksalderQuery(tidligsteHelUttaksalderRequestBody, {
    skip: !tidligsteHelUttaksalderRequestBody,
  })
  // Hent tidligst gradert uttaksalder
  const [
    tidligsteGradertUttaksalderRequestBody,
    setTidligsteGradertUttaksalderRequestBody,
  ] = React.useState<TidligsteGradertUttaksalderRequestBody | undefined>(
    undefined
  )
  const { data: tidligstGradertUttaksalder } =
    useTidligsteGradertUttaksalderQuery(
      tidligsteGradertUttaksalderRequestBody,
      {
        skip: !tidligsteGradertUttaksalderRequestBody,
      }
    )

  React.useEffect(() => {
    setTidligsteHelUttaksalderRequestBody(
      generateTidligsteHelUttaksalderRequestBody({
        afp,
        sivilstand: sivilstand,
        harSamboer,
        aarligInntektFoerUttakBeloep: aarligInntektFoerUttakBeloep ?? 0,
      })
    )

    if (temporaryGradertUttaksperiode?.grad) {
      setTidligsteGradertUttaksalderRequestBody(
        generateTidligsteGradertUttaksalderRequestBody({
          afp,
          sivilstand: sivilstand,
          harSamboer,
          aarligInntektFoerUttakBeloep: aarligInntektFoerUttakBeloep ?? 0,
          heltUttak: {
            uttaksalder: temporaryHelUttaksalder
              ? temporaryHelUttaksalder
              : { aar: 67, maaneder: 0 },
            aarligInntektVsaPensjon: aarligInntektVsaHelPensjon,
          },
          gradertUttak: {
            grad: temporaryGradertUttaksperiode?.grad,
            aarligInntektVsaPensjonBeloep:
              temporaryGradertUttaksperiode.aarligInntektVsaPensjonBeloep,
          },
        })
      )
    }
  }, [
    afp,
    sivilstand,
    aarligInntektFoerUttakBeloep,
    harSamboer,
    temporaryGradertUttaksperiode,
    temporaryHelUttaksalder,
  ])

  const [validationErrors, setValidationErrors] = React.useState<
    Record<string, string>
  >({
    uttaksgrad: '',
    'uttaksalder-hele-pensjon': '',
    'uttaksalder-gradert-pensjon': '',
    'inntekt-vsa-gradert-pensjon': '',
  })

  const [agePickerHelDescription, setAgePickerHelDescription] =
    React.useState<string>('')

  React.useEffect(() => {
    // TODO refactor flytte dette til en util function?
    if (isTidligstHelUttaksalderError) {
      setAgePickerHelDescription(
        intl.formatMessage(
          {
            id: 'tidligsteuttaksalder.error',
          },
          {
            ...getFormatMessageValues(intl),
          }
        )
      )
    } else if (tidligstHelUttaksalder) {
      if (!temporaryGradertUttaksperiode) {
        setAgePickerHelDescription(
          `Du kan tidligst ta ut 100 % alderspensjon når du er ${formatUttaksalder(
            intl,
            tidligstHelUttaksalder
          )}. Vil du ta ut pensjon tidligere, må du velge lavere uttaksgrad.`
        )
      } else if (
        tidligstHelUttaksalder?.aar !== 62 ||
        tidligstHelUttaksalder?.maaneder !== 0
      ) {
        setAgePickerHelDescription(
          'Med gradert uttak, kan kalkulatoren tidligst beregne 100 % alderspensjon fra 67 år. Du kan likevel ha rett til å ta ut 100 % tidligere.'
        )
      }
    }
  }, [
    tidligstHelUttaksalder,
    isTidligstHelUttaksalderError,
    temporaryGradertUttaksperiode,
  ])

  React.useEffect(() => {
    if (
      temporaryGradertUttaksperiode &&
      (tidligstHelUttaksalder?.aar !== 62 ||
        tidligstHelUttaksalder?.maaneder !== 0)
    ) {
      setTemporaryHelUttaksalder({ aar: 67, maaneder: 0 })
    }
  }, [temporaryGradertUttaksperiode, tidligstHelUttaksalder])

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

    setTemporaryGradertUttaksperiode((previous) => {
      return !isNaN(avansertBeregningFormatertUttaksgradAsNumber) &&
        avansertBeregningFormatertUttaksgradAsNumber !== 100
        ? { ...previous, grad: avansertBeregningFormatertUttaksgradAsNumber }
        : undefined
    })
  }

  const handleInntektVsaGradertPensjonChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setTemporaryGradertUttaksperiode((previous) => ({
      ...previous,
      aarligInntektVsaPensjonBeloep: parseInt(e.target.value, 10),
    }))

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
        const aarligInntektVsaGradertPensjon = parseInt(
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
            aarligInntektVsaPensjonBeloep: !isNaN(
              aarligInntektVsaGradertPensjon
            )
              ? aarligInntektVsaGradertPensjon
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
                aarligInntektFoerUttakBeloep
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
            {['20 %', '40 %', '50 %', '60 %', '80 %', '100 %'].map((grad) => (
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
              description={
                tidligstGradertUttaksalder &&
                (tidligstHelUttaksalder?.aar !== 62 ||
                  tidligstHelUttaksalder?.maaneder !== 0)
                  ? `Du kan tidligst ta ut ${
                      temporaryGradertUttaksperiode.grad
                    } % alderspensjon når du er ${formatUttaksalder(
                      intl,
                      tidligstGradertUttaksalder
                    )}.`
                  : ''
              }
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
              value={
                temporaryGradertUttaksperiode.aarligInntektVsaPensjonBeloep?.toString() ??
                ''
              }
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
            description={agePickerHelDescription}
            value={temporaryHelUttaksalder}
            minAlder={
              temporaryGradertUttaksperiode &&
              (tidligstHelUttaksalder?.aar !== 62 ||
                tidligstHelUttaksalder?.maaneder !== 0)
                ? { aar: 67, maaneder: 0 }
                : tidligstHelUttaksalder
            }
            hasValidationError={
              validationErrors['uttaksalder-hele-pensjon'] !== ''
            }
            onChange={(alder) => {
              setTemporaryHelUttaksalder(alder)
            }}
          />
        </div>
        <div>
          <EndreInntektVsaPensjon
            temporaryUttaksalder={temporaryHelUttaksalder}
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

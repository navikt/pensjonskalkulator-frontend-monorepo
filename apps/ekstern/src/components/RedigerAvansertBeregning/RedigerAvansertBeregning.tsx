/* c8 ignore start */
import React from 'react'
import { useIntl } from 'react-intl'

import { Button, Label, Select, TextField } from '@navikt/ds-react'

import { AgePicker } from '@/components/common/AgePicker'
import { EndreInntekt } from '@/components/EndreInntekt'
import { EndreInntektVsaPensjon } from '@/components/EndreInntektVsaPensjon'
import { InfoModalInntekt } from '@/components/InfoModalInntekt'
import {
  useTidligstMuligHeltUttakQuery,
  useTidligstMuligGradertUttakQuery,
} from '@/state/api/apiSlice'
import {
  generateTidligstMuligHeltUttakRequestBody,
  generateTidligstMuligGradertUttakRequestBody,
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
import { formatUttaksalder, isUttaksalderOverMinUttaksaar } from '@/utils/alder'
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

  const { uttaksalder, gradertUttaksperiode, aarligInntektVsaHelPensjon } =
    useAppSelector(selectCurrentSimulation)
  const afp = useAppSelector(selectAfp)
  const harSamboer = useAppSelector(selectSamboer)
  const sivilstand = useAppSelector(selectSivilstand)
  const aarligInntektFoerUttakBeloep = useAppSelector(
    selectAarligInntektFoerUttakBeloep
  )
  const [temporaryHeltUttaksalder, setTemporaryHeltUttaksalder] =
    React.useState<Partial<Alder> | undefined>(
      uttaksalder !== null ? uttaksalder : undefined
    )

  const [temporaryGradertUttaksperiode, setTemporaryGradertUttaksperiode] =
    React.useState<RecursivePartial<GradertUttaksperiode> | undefined>(
      gradertUttaksperiode ?? undefined
    )

  // Hent tidligst hel uttaksalder
  const [
    tidligstMuligHeltUttakRequestBody,
    setTidligstMuligHeltUttakRequestBody,
  ] = React.useState<TidligstMuligHeltUttakRequestBody | undefined>(undefined)
  const {
    data: tidligstMuligHeltUttak,
    isError: isTidligstMuligHeltUttakError,
  } = useTidligstMuligHeltUttakQuery(tidligstMuligHeltUttakRequestBody, {
    skip: !tidligstMuligHeltUttakRequestBody,
  })
  // Hent tidligst gradert uttaksalder
  const [
    tidligstMuligGradertUttakRequestBody,
    setTidligstMuligGradertUttakRequestBody,
  ] = React.useState<TidligstMuligGradertUttakRequestBody | undefined>(
    undefined
  )
  const {
    data: tidligstMuligGradertUttak,
    isError: isTidligstMuligGradertUttakError,
  } = useTidligstMuligGradertUttakQuery(tidligstMuligGradertUttakRequestBody, {
    skip: !tidligstMuligGradertUttakRequestBody,
  })

  React.useEffect(() => {
    console.log('>>> tidligstMuligHeltUttakRequestBody')
    const oppdatertHeltUttaksalderRequestBody =
      generateTidligstMuligHeltUttakRequestBody({
        afp,
        sivilstand: sivilstand,
        harSamboer,
        aarligInntektFoerUttakBeloep: aarligInntektFoerUttakBeloep ?? 0,
      })

    if (oppdatertHeltUttaksalderRequestBody !== undefined) {
      setTidligstMuligHeltUttakRequestBody(oppdatertHeltUttaksalderRequestBody)
    }

    if (temporaryGradertUttaksperiode?.grad) {
      setTidligstMuligGradertUttakRequestBody(
        generateTidligstMuligGradertUttakRequestBody({
          afp,
          sivilstand: sivilstand,
          harSamboer,
          aarligInntektFoerUttakBeloep: aarligInntektFoerUttakBeloep ?? 0,
          heltUttak: {
            uttaksalder:
              temporaryHeltUttaksalder?.aar &&
              temporaryHeltUttaksalder?.maaneder !== undefined
                ? (temporaryHeltUttaksalder as Alder)
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
    temporaryHeltUttaksalder,
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
    if (tidligstMuligHeltUttak) {
      if (!temporaryGradertUttaksperiode) {
        setAgePickerHelDescription(
          `Du kan tidligst ta ut 100 % alderspensjon når du er ${formatUttaksalder(
            intl,
            tidligstMuligHeltUttak
          )}.`
        )
      } else {
        if (isUttaksalderOverMinUttaksaar(tidligstMuligHeltUttak)) {
          setAgePickerHelDescription(
            'Med gradert uttak, kan kalkulatoren tidligst beregne 100 % alderspensjon fra 67 år. Du kan likevel ha rett til å ta ut 100 % tidligere.'
          )
        } else {
          setAgePickerHelDescription('')
        }
      }
    }
  }, [
    tidligstMuligHeltUttak,
    isTidligstMuligHeltUttakError,
    temporaryGradertUttaksperiode,
  ])

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
    const gradertPensjonAarFormData = data.get(
      'uttaksalder-gradert-pensjon-aar'
    )
    const gradertPensjonMaanederFormData = data.get(
      'uttaksalder-gradert-pensjon-maaneder'
    )

    const helPensjonAarFormData = data.get('uttaksalder-hele-pensjon-aar')
    const helPensjonMaanederFormData = data.get(
      'uttaksalder-hele-pensjon-maaneder'
    )
    const avansertBeregningFormatertUttaksgrad = data.get('uttaksgrad')
    const avansertBeregningInntektVsaGradertPensjon = data.get(
      'inntekt-vsa-gradert-pensjon'
    )

    if (validateAvansertBeregningSkjema(data, setValidationErrors)) {
      dispatch(
        userInputActions.setCurrentSimulationUttaksalder({
          aar: parseInt(helPensjonAarFormData as string, 10),
          maaneder: parseInt(helPensjonMaanederFormData as string, 10),
        })
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
            uttaksalder: {
              aar: parseInt(gradertPensjonAarFormData as string, 10),
              maaneder: parseInt(gradertPensjonMaanederFormData as string, 10),
            },
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

        <div className={styles.spacer} />

        {temporaryGradertUttaksperiode && (
          <div>
            <AgePicker
              form="avansert-beregning"
              name="uttaksalder-gradert-pensjon"
              label={`Når vil du ta ut ${temporaryGradertUttaksperiode.grad} % alderspensjon`}
              description={
                tidligstMuligGradertUttak &&
                !isTidligstMuligGradertUttakError &&
                tidligstMuligHeltUttak &&
                isUttaksalderOverMinUttaksaar(tidligstMuligHeltUttak)
                  ? `Du kan tidligst ta ut ${
                      temporaryGradertUttaksperiode.grad
                    } % alderspensjon når du er ${formatUttaksalder(
                      intl,
                      tidligstMuligGradertUttak
                    )}.`
                  : ''
              }
              value={temporaryGradertUttaksperiode?.uttaksalder}
              minAlder={tidligstMuligGradertUttak}
              onChange={(alder) => {
                setValidationErrors((prevState) => {
                  return {
                    ...prevState,
                    'uttaksalder-gradert-pensjon': '',
                  }
                })
                setTemporaryGradertUttaksperiode((previous) => ({
                  ...previous,
                  uttaksalder: alder,
                }))
              }}
              error={validationErrors['uttaksalder-gradert-pensjon']}
            />
            <div className={styles.spacer} />
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
                temporaryGradertUttaksperiode?.aarligInntektVsaPensjonBeloep
                  ? temporaryGradertUttaksperiode.aarligInntektVsaPensjonBeloep?.toString()
                  : undefined
              }
              max={5}
            />
            <div className={styles.spacer} />
          </div>
        )}
        <div>
          <AgePicker
            form="avansert-beregning"
            name="uttaksalder-hele-pensjon"
            label="Når vil du ta ut 100 % alderspensjon"
            description={agePickerHelDescription}
            value={temporaryHeltUttaksalder}
            minAlder={
              temporaryGradertUttaksperiode &&
              tidligstMuligHeltUttak &&
              isUttaksalderOverMinUttaksaar(tidligstMuligHeltUttak)
                ? { aar: 67, maaneder: 0 }
                : tidligstMuligHeltUttak
            }
            onChange={(alder) => {
              setValidationErrors((prevState) => {
                return {
                  ...prevState,
                  'uttaksalder-hele-pensjon': '',
                }
              })
              setTemporaryHeltUttaksalder(alder)
            }}
            error={validationErrors['uttaksalder-hele-pensjon']}
          />
        </div>
        <div>
          <EndreInntektVsaPensjon
            temporaryUttaksalder={temporaryHeltUttaksalder}
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

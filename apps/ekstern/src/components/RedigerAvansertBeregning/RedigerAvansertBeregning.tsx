/* c8 ignore start */
import React from 'react'
import { useIntl, FormattedMessage } from 'react-intl'

import { BodyLong, Button, Label, Select, TextField } from '@navikt/ds-react'

import { AgePicker } from '@/components/common/AgePicker'
import { ReadMore } from '@/components/common/ReadMore'
import { EndreInntekt } from '@/components/EndreInntekt'
import { InfoOmInntekt } from '@/components/EndreInntekt/InfoOmInntekt'
import { EndreInntektVsaPensjon } from '@/components/EndreInntektVsaPensjon'
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
  selectAarligInntektFoerUttakBeloepFraBrukerInput,
} from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputReducer'
import { formatUttaksalder, isUttaksalderOverMinUttaksaar } from '@/utils/alder'
import { formatWithoutDecimal } from '@/utils/inntekt'
import { getFormatMessageValues } from '@/utils/translations'

import { ReadMoreOmPensjonsalder } from './ReadMoreOmPensjonsalder'
import {
  FORM_NAMES,
  validateAvansertBeregningSkjema,
  getMinAlderTilHeltUttak,
} from './utils'

import styles from './RedigerAvansertBeregning.module.scss'

export const RedigerAvansertBeregning: React.FC<{
  gaaTilResultat: () => void
}> = ({ gaaTilResultat }) => {
  const intl = useIntl()
  const dispatch = useAppDispatch()

  const { uttaksalder, gradertUttaksperiode, aarligInntektVsaHelPensjon } =
    useAppSelector(selectCurrentSimulation)
  const afp = useAppSelector(selectAfp)
  const harSamboer = useAppSelector(selectSamboer)
  const sivilstand = useAppSelector(selectSivilstand)
  const aarligInntektFoerUttakBeloepFraBrukerInput = useAppSelector(
    selectAarligInntektFoerUttakBeloepFraBrukerInput
  )
  const aarligInntektFoerUttakBeloep = useAppSelector(
    selectAarligInntektFoerUttakBeloep
  )

  const [
    temporaryOverskrevetInntektFremTilUttak,
    setTemporaryOverskrevetInntektFremTilUttak,
  ] = React.useState<number | null>(
    aarligInntektFoerUttakBeloepFraBrukerInput
      ? aarligInntektFoerUttakBeloepFraBrukerInput
      : null
  )

  const [temporaryHeltUttak, settemporaryHeltUttak] = React.useState<
    RecursivePartial<HeltUttak> | undefined
  >({
    uttaksalder: uttaksalder !== null ? uttaksalder : undefined,
    aarligInntektVsaPensjon: aarligInntektVsaHelPensjon
      ? aarligInntektVsaHelPensjon
      : undefined,
  })

  const [temporaryGradertUttak, setTemporaryGradertUttak] = React.useState<
    RecursivePartial<GradertUttak> | undefined
  >(gradertUttaksperiode ?? undefined)

  const [agePickerHelDescription, setAgePickerHelDescription] =
    React.useState<string>('')

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
    const oppdatertHeltUttakRequestBody =
      generateTidligstMuligHeltUttakRequestBody({
        afp,
        sivilstand: sivilstand,
        harSamboer,
        aarligInntektFoerUttakBeloep: aarligInntektFoerUttakBeloep ?? 0,
      })

    if (oppdatertHeltUttakRequestBody !== undefined) {
      setTidligstMuligHeltUttakRequestBody(oppdatertHeltUttakRequestBody)
    }

    if (temporaryGradertUttak?.grad) {
      setTidligstMuligGradertUttakRequestBody(
        generateTidligstMuligGradertUttakRequestBody({
          afp,
          sivilstand: sivilstand,
          harSamboer,
          aarligInntektFoerUttakBeloep: aarligInntektFoerUttakBeloep ?? 0,
          heltUttak: {
            uttaksalder:
              temporaryHeltUttak?.uttaksalder?.aar &&
              temporaryHeltUttak?.uttaksalder?.maaneder !== undefined
                ? (temporaryHeltUttak?.uttaksalder as Alder)
                : { aar: 67, maaneder: 0 },
            aarligInntektVsaPensjon:
              temporaryHeltUttak?.aarligInntektVsaPensjon?.beloep &&
              temporaryHeltUttak?.aarligInntektVsaPensjon?.sluttAlder
                ? (temporaryHeltUttak?.aarligInntektVsaPensjon as AarligInntektVsaPensjon)
                : undefined,
          },
          gradertUttak: {
            grad: temporaryGradertUttak?.grad,
            aarligInntektVsaPensjonBeloep:
              temporaryGradertUttak.aarligInntektVsaPensjonBeloep,
          },
        })
      )
    }
  }, [
    afp,
    sivilstand,
    aarligInntektFoerUttakBeloep,
    harSamboer,
    temporaryGradertUttak,
    temporaryHeltUttak,
  ])

  const [validationErrors, setValidationErrors] = React.useState<
    Record<string, string>
  >({
    [FORM_NAMES.uttaksgrad]: '',
    [FORM_NAMES.uttaksalderHeltUttak]: '',
    [FORM_NAMES.uttaksalderGradertUttak]: '',
    [FORM_NAMES.inntektVsaGradertUttak]: '',
  })

  React.useEffect(() => {
    // TODO refactor flytte dette til en util function?
    if (tidligstMuligHeltUttak) {
      if (!temporaryGradertUttak) {
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
    temporaryGradertUttak,
  ])

  const handleUttaksgradChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValidationErrors((prevState) => {
      return {
        ...prevState,
        [FORM_NAMES.uttaksgrad]: '',
        [FORM_NAMES.uttaksalderGradertUttak]: '',
      }
    })
    const avansertBeregningFormatertUttaksgradAsNumber = e.target.value
      ? parseInt(e.target.value.match(/\d+/)?.[0] as string, 10)
      : 100

    setTemporaryGradertUttak((previous) => {
      return !isNaN(avansertBeregningFormatertUttaksgradAsNumber) &&
        avansertBeregningFormatertUttaksgradAsNumber !== 100
        ? { ...previous, grad: avansertBeregningFormatertUttaksgradAsNumber }
        : undefined
    })

    settemporaryHeltUttak((previous) => {
      return { ...previous, uttaksalder: undefined }
    })
  }

  const handleInntektVsaGradertPensjonChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setTemporaryGradertUttak((previous) => ({
      ...previous,
      aarligInntektVsaPensjonBeloep: e.target.value
        ? parseInt(e.target.value, 10)
        : undefined,
    }))

    setValidationErrors((prevState) => {
      return {
        ...prevState,
        [FORM_NAMES.inntektVsaGradertUttak]: '',
      }
    })
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()

    const data = new FormData(e.currentTarget)
    const gradertUttakAarFormData = data.get(
      `${FORM_NAMES.uttaksalderGradertUttak}-aar`
    )
    const gradertUttakMaanederFormData = data.get(
      `${FORM_NAMES.uttaksalderGradertUttak}-maaneder`
    )
    const heltUttakAarFormData = data.get(
      `${FORM_NAMES.uttaksalderHeltUttak}-aar`
    )
    const heltUttakMaanederFormData = data.get(
      `${FORM_NAMES.uttaksalderHeltUttak}-maaneder`
    )
    const uttaksgradFormData = data.get('uttaksgrad')
    const inntektVsaGradertPensjonFormData = data.get(
      FORM_NAMES.inntektVsaGradertUttak
    )

    if (
      validateAvansertBeregningSkjema(
        {
          gradertUttakAarFormData,
          gradertUttakMaanederFormData,
          heltUttakAarFormData,
          heltUttakMaanederFormData,
          uttaksgradFormData,
          inntektVsaGradertPensjonFormData,
        },
        setValidationErrors
      )
    ) {
      dispatch(
        userInputActions.setCurrentSimulationUttaksalder({
          aar: parseInt(heltUttakAarFormData as string, 10),
          maaneder: parseInt(heltUttakMaanederFormData as string, 10),
        })
      )
      if (uttaksgradFormData === '100 %') {
        dispatch(
          userInputActions.setCurrentSimulationGradertuttaksperiode(null)
        )
      } else {
        const aarligInntektVsaGradertPensjon = parseInt(
          inntektVsaGradertPensjonFormData as string,
          10
        )
        dispatch(
          userInputActions.setCurrentSimulationGradertuttaksperiode({
            uttaksalder: {
              aar: parseInt(gradertUttakAarFormData as string, 10),
              maaneder: parseInt(gradertUttakMaanederFormData as string, 10),
            },
            grad: parseInt(
              (uttaksgradFormData as string).match(/\d+/)?.[0] as string,
              10
            ),
            aarligInntektVsaPensjonBeloep: !isNaN(
              aarligInntektVsaGradertPensjon
            )
              ? aarligInntektVsaGradertPensjon
              : undefined,
          })
        )
      }
      dispatch(
        userInputActions.setCurrentSimulationAarligInntektVsaHelPensjon(
          temporaryHeltUttak?.aarligInntektVsaPensjon?.beloep !== undefined &&
            temporaryHeltUttak?.aarligInntektVsaPensjon?.sluttAlder
            ? ({
                ...temporaryHeltUttak?.aarligInntektVsaPensjon,
              } as AarligInntektVsaPensjon)
            : undefined
        )
      )
      dispatch(
        userInputActions.setCurrentSimulationaarligInntektFoerUttakBeloep(
          temporaryOverskrevetInntektFremTilUttak
        )
      )

      gaaTilResultat()
    }
  }

  const resetForm = (): void => {
    setValidationErrors({
      [FORM_NAMES.uttaksgrad]: '',
      [FORM_NAMES.uttaksalderHeltUttak]: '',
      [FORM_NAMES.uttaksalderGradertUttak]: '',
      [FORM_NAMES.inntektVsaGradertUttak]: '',
    })
    setTemporaryOverskrevetInntektFremTilUttak(null)
    setTemporaryGradertUttak(undefined)
    settemporaryHeltUttak(undefined)
  }

  const isFormUnderUpdate =
    uttaksalder &&
    ((aarligInntektFoerUttakBeloepFraBrukerInput !== null &&
      temporaryOverskrevetInntektFremTilUttak !==
        aarligInntektFoerUttakBeloepFraBrukerInput) ||
      (aarligInntektFoerUttakBeloepFraBrukerInput === null &&
        temporaryOverskrevetInntektFremTilUttak !== null) ||
      temporaryGradertUttak?.grad !== gradertUttaksperiode?.grad ||
      JSON.stringify(temporaryGradertUttak?.uttaksalder) !==
        JSON.stringify(gradertUttaksperiode?.uttaksalder) ||
      temporaryGradertUttak?.aarligInntektVsaPensjonBeloep !==
        gradertUttaksperiode?.aarligInntektVsaPensjonBeloep ||
      JSON.stringify(temporaryHeltUttak?.uttaksalder) !==
        JSON.stringify(uttaksalder) ||
      temporaryHeltUttak?.aarligInntektVsaPensjon?.beloep !==
        aarligInntektVsaHelPensjon?.beloep ||
      JSON.stringify(
        temporaryHeltUttak?.aarligInntektVsaPensjon?.sluttAlder
      ) !== JSON.stringify(aarligInntektVsaHelPensjon?.sluttAlder))

  return (
    <div
      className={`${styles.container} ${styles.container__hasMobilePadding}`}
    >
      <div className={styles.form}>
        <form id={FORM_NAMES.form} method="dialog" onSubmit={onSubmit}></form>
        <div>
          <Label className={styles.label}>
            Pensjonsgivende inntekt frem til pensjon
          </Label>
          <div className={styles.description}>
            <span className={styles.descriptionText}>
              {`${formatWithoutDecimal(
                temporaryOverskrevetInntektFremTilUttak !== null
                  ? temporaryOverskrevetInntektFremTilUttak
                  : aarligInntektFoerUttakBeloep
              )} kr per år før skatt`}
            </span>

            <EndreInntekt
              visning="avansert"
              buttonLabel="beregning.avansert.rediger.inntekt.button"
              value={temporaryOverskrevetInntektFremTilUttak}
              onSubmit={(inntekt) => {
                if (
                  (aarligInntektFoerUttakBeloepFraBrukerInput !== null &&
                    inntekt !== aarligInntektFoerUttakBeloepFraBrukerInput) ||
                  (aarligInntektFoerUttakBeloepFraBrukerInput === null &&
                    inntekt !== null)
                ) {
                  resetForm()
                }

                setTemporaryOverskrevetInntektFremTilUttak(inntekt)
              }}
            />
          </div>
          <ReadMore
            name="Endring av inntekt i avansert fane"
            header={intl.formatMessage({
              id: 'inntekt.info_om_inntekt.read_more',
            })}
          >
            <InfoOmInntekt />
          </ReadMore>
        </div>
        <hr className={styles.separator} />
        <div>
          <Select
            form={FORM_NAMES.form}
            name={FORM_NAMES.uttaksgrad}
            label="Hvor mye alderspensjon vil du ta ut?"
            description="Velg uttaksgrad"
            value={
              temporaryGradertUttak?.grad
                ? `${temporaryGradertUttak.grad} %`
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
          <div className={styles.spacer__small} />
        </div>
        <ReadMore
          name="Om uttaksgrad"
          header={intl.formatMessage({
            id: 'beregning.avansert.rediger.read_more.uttaksgrad.label',
          })}
        >
          <BodyLong>
            <FormattedMessage
              id="beregning.avansert.rediger.read_more.uttaksgrad.body"
              values={{
                ...getFormatMessageValues(intl),
              }}
            />
          </BodyLong>
        </ReadMore>

        <div className={styles.spacer} />
        {temporaryGradertUttak && (
          <div>
            <AgePicker
              form={FORM_NAMES.form}
              name={FORM_NAMES.uttaksalderGradertUttak}
              label={intl.formatMessage(
                {
                  id: 'beregning.avansert.rediger.gradertuttak.agepicker.label',
                },
                { grad: temporaryGradertUttak.grad }
              )}
              description={
                tidligstMuligGradertUttak &&
                !isTidligstMuligGradertUttakError &&
                tidligstMuligHeltUttak &&
                isUttaksalderOverMinUttaksaar(tidligstMuligHeltUttak)
                  ? `Du kan tidligst ta ut ${
                      temporaryGradertUttak.grad
                    } % alderspensjon når du er ${formatUttaksalder(
                      intl,
                      tidligstMuligGradertUttak
                    )}.`
                  : ''
              }
              value={temporaryGradertUttak?.uttaksalder}
              minAlder={tidligstMuligGradertUttak}
              onChange={(alder) => {
                setValidationErrors((prevState) => {
                  return {
                    ...prevState,
                    [FORM_NAMES.uttaksalderGradertUttak]: '',
                  }
                })
                setTemporaryGradertUttak((previous) => ({
                  ...previous,
                  uttaksalder: alder,
                }))
                if (
                  temporaryHeltUttak?.uttaksalder &&
                  (temporaryHeltUttak.uttaksalder?.aar ?? 0) * 12 +
                    (temporaryHeltUttak.uttaksalder?.maaneder ?? 0) <=
                    (alder?.aar ?? 0) * 12 + (alder?.maaneder ?? 0)
                ) {
                  settemporaryHeltUttak((previous) => ({
                    ...previous,
                    uttaksalder: undefined,
                  }))
                }
              }}
              error={
                validationErrors[FORM_NAMES.uttaksalderGradertUttak]
                  ? intl.formatMessage({
                      id: validationErrors[FORM_NAMES.uttaksalderGradertUttak],
                    }) +
                    intl.formatMessage(
                      {
                        id: 'beregning.avansert.rediger.agepicker.validation_error',
                      },
                      { grad: temporaryGradertUttak.grad }
                    )
                  : ''
              }
            />
            {temporaryGradertUttak?.grad !== 100 && <ReadMoreOmPensjonsalder />}
            <div className={styles.spacer} />
            <TextField
              form={FORM_NAMES.form}
              data-testid="inntekt-vsa-gradert-pensjon-textfield"
              type="text"
              inputMode="numeric"
              name={FORM_NAMES.inntektVsaGradertUttak}
              label={`Hva er din forventede årsinntekt mens du tar ut ${temporaryGradertUttak.grad} % alderspensjon? (Valgfritt)`}
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
                temporaryGradertUttak?.aarligInntektVsaPensjonBeloep
                  ? temporaryGradertUttak.aarligInntektVsaPensjonBeloep?.toString()
                  : undefined
              }
              max={5}
            />
            <div className={styles.spacer} />
          </div>
        )}
        <div>
          <AgePicker
            form={FORM_NAMES.form}
            name={FORM_NAMES.uttaksalderHeltUttak}
            label={intl.formatMessage({
              id: 'beregning.avansert.rediger.heltuttak.agepicker.label',
            })}
            description={agePickerHelDescription}
            value={temporaryHeltUttak?.uttaksalder}
            minAlder={getMinAlderTilHeltUttak({
              tidligstMuligHeltUttak,
              temporaryGradertUttak: temporaryGradertUttak?.uttaksalder,
            })}
            onChange={(alder) => {
              setValidationErrors((prevState) => {
                return {
                  ...prevState,

                  [FORM_NAMES.uttaksalderHeltUttak]: '',
                }
              })
              settemporaryHeltUttak((prevState) => {
                const sluttAlderAntallMaaneder =
                  prevState?.aarligInntektVsaPensjon?.sluttAlder?.aar !==
                  undefined
                    ? prevState?.aarligInntektVsaPensjon?.sluttAlder.aar * 12 +
                      (prevState?.aarligInntektVsaPensjon?.sluttAlder
                        .maaneder ?? 0)
                    : 0
                const shouldDeleteInntektVsaPensjon =
                  alder?.aar &&
                  alder?.aar * 12 + (alder?.maaneder ?? 0) >=
                    sluttAlderAntallMaaneder
                return {
                  ...prevState,
                  uttaksalder: alder,
                  aarligInntektVsaPensjon: shouldDeleteInntektVsaPensjon
                    ? undefined
                    : { ...prevState?.aarligInntektVsaPensjon },
                }
              })
            }}
            error={
              validationErrors[FORM_NAMES.uttaksalderHeltUttak]
                ? intl.formatMessage({
                    id: validationErrors[FORM_NAMES.uttaksalderHeltUttak],
                  }) +
                  intl.formatMessage(
                    {
                      id: 'beregning.avansert.rediger.agepicker.validation_error',
                    },
                    { grad: '100' }
                  )
                : ''
            }
          />
          <div className={styles.spacer__small} />
        </div>

        {(!temporaryGradertUttak ||
          !temporaryGradertUttak?.grad ||
          temporaryGradertUttak?.grad === 100) && <ReadMoreOmPensjonsalder />}

        {temporaryHeltUttak?.uttaksalder?.aar &&
          temporaryHeltUttak?.uttaksalder?.maaneder !== undefined && (
            <div>
              <EndreInntektVsaPensjon
                uttaksperiode={temporaryHeltUttak}
                oppdatereInntekt={(
                  aarligInntektVsaPensjon: AarligInntektVsaPensjon | undefined
                ) => {
                  settemporaryHeltUttak((prevState) => {
                    return {
                      ...prevState,
                      aarligInntektVsaPensjon,
                    }
                  })
                }}
              />
            </div>
          )}
        <hr className={styles.separator} />
        <div>
          <Button form={FORM_NAMES.form}>
            {intl.formatMessage({
              id: isFormUnderUpdate
                ? 'beregning.avansert.button.oppdater'
                : 'beregning.avansert.button.beregn',
            })}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={resetForm}
            className={styles.buttonNullstill}
          >
            {intl.formatMessage({
              id: 'beregning.avansert.button.nullstill',
            })}
          </Button>
        </div>
        {isFormUnderUpdate && (
          <div>
            <Button
              type="button"
              variant="tertiary"
              className={styles.buttonAvbryt}
              onClick={() => {
                gaaTilResultat()
              }}
            >
              {intl.formatMessage({
                id: 'beregning.avansert.button.avbryt',
              })}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
/* c8 ignore end */

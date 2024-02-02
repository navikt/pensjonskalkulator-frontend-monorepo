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

  const [temporaryHelUttak, setTemporaryHelUttak] = React.useState<
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

    if (temporaryGradertUttak?.grad) {
      setTidligstMuligGradertUttakRequestBody(
        generateTidligstMuligGradertUttakRequestBody({
          afp,
          sivilstand: sivilstand,
          harSamboer,
          aarligInntektFoerUttakBeloep: aarligInntektFoerUttakBeloep ?? 0,
          heltUttak: {
            uttaksalder:
              temporaryHelUttak?.uttaksalder?.aar &&
              temporaryHelUttak?.uttaksalder?.maaneder !== undefined
                ? (temporaryHelUttak?.uttaksalder as Alder)
                : { aar: 67, maaneder: 0 },
            aarligInntektVsaPensjon:
              temporaryHelUttak?.aarligInntektVsaPensjon?.beloep &&
              temporaryHelUttak?.aarligInntektVsaPensjon?.sluttAlder
                ? (temporaryHelUttak?.aarligInntektVsaPensjon as AarligInntektVsaPensjon)
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
    temporaryHelUttak,
  ])

  const [validationErrors, setValidationErrors] = React.useState<
    Record<string, string>
  >({
    uttaksgrad: '',
    'uttaksalder-hel-pensjon': '',
    'uttaksalder-gradert-pensjon': '',
    'inntekt-vsa-gradert-pensjon': '',
  })

  const [agePickerHelDescription, setAgePickerHelDescription] =
    React.useState<string>('')

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
        uttaksgrad: '',
        'uttaksalder-gradert-pensjon': '',
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
  }

  const handleInntektVsaGradertPensjonChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setTemporaryGradertUttak((previous) => ({
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

    const helPensjonAarFormData = data.get('uttaksalder-hel-pensjon-aar')
    const helPensjonMaanederFormData = data.get(
      'uttaksalder-hel-pensjon-maaneder'
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
      dispatch(
        userInputActions.setCurrentSimulationAarligInntektVsaHelPensjon(
          temporaryHelUttak?.aarligInntektVsaPensjon?.beloep !== undefined &&
            temporaryHelUttak?.aarligInntektVsaPensjon?.sluttAlder
            ? ({
                ...temporaryHelUttak?.aarligInntektVsaPensjon,
              } as AarligInntektVsaPensjon)
            : undefined
        )
      )
      dispatch(
        userInputActions.setCurrentSimulationaarligInntektFoerUttakBeloep(
          temporaryOverskrevetInntektFremTilUttak
        )
      )

      onSubmitSuccess()
    }
  }

  const resetForm = (): void => {
    setValidationErrors({
      uttaksgrad: '',
      'uttaksalder-hel-pensjon': '',
      'uttaksalder-gradert-pensjon': '',
      'inntekt-vsa-gradert-pensjon': '',
    })
    setTemporaryOverskrevetInntektFremTilUttak(null)
    setTemporaryGradertUttak(undefined)
    setTemporaryHelUttak(undefined)
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
                resetForm()
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
            form="avansert-beregning"
            name="uttaksgrad"
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
              form="avansert-beregning"
              name="uttaksalder-gradert-pensjon"
              label={`Når vil du ta ut ${temporaryGradertUttak.grad} % alderspensjon`}
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
                    'uttaksalder-gradert-pensjon': '',
                  }
                })
                setTemporaryGradertUttak((previous) => ({
                  ...previous,
                  uttaksalder: alder,
                }))
              }}
              error={validationErrors['uttaksalder-gradert-pensjon']}
            />
            {temporaryGradertUttak?.grad !== 100 && <ReadMoreOmPensjonsalder />}
            <div className={styles.spacer} />
            <TextField
              form="avansert-beregning"
              data-testid="inntekt-vsa-gradert-pensjon-textfield"
              type="text"
              inputMode="numeric"
              name="inntekt-vsa-gradert-pensjon"
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
            form="avansert-beregning"
            name="uttaksalder-hel-pensjon"
            label="Når vil du ta ut 100 % alderspensjon"
            description={agePickerHelDescription}
            value={temporaryHelUttak?.uttaksalder}
            minAlder={
              temporaryGradertUttak &&
              tidligstMuligHeltUttak &&
              isUttaksalderOverMinUttaksaar(tidligstMuligHeltUttak)
                ? { aar: 67, maaneder: 0 }
                : tidligstMuligHeltUttak
            }
            onChange={(alder) => {
              setValidationErrors((prevState) => {
                return {
                  ...prevState,
                  'uttaksalder-hel-pensjon': '',
                }
              })
              setTemporaryHelUttak((prevState) => {
                return {
                  ...prevState,
                  uttaksalder: alder,
                }
              })
            }}
            error={validationErrors['uttaksalder-hel-pensjon']}
          />
          <div className={styles.spacer__small} />
        </div>

        {(!temporaryGradertUttak ||
          !temporaryGradertUttak?.grad ||
          temporaryGradertUttak?.grad === 100) && <ReadMoreOmPensjonsalder />}

        {temporaryHelUttak?.uttaksalder?.aar &&
          temporaryHelUttak?.uttaksalder?.maaneder !== undefined && (
            <div>
              <EndreInntektVsaPensjon
                uttaksperiode={temporaryHelUttak}
                oppdatereInntekt={(
                  aarligInntektVsaPensjon: AarligInntektVsaPensjon | undefined
                ) => {
                  setTemporaryHelUttak((prevState) => {
                    return {
                      ...prevState,
                      aarligInntektVsaPensjon,
                    }
                  })
                }}
              />
            </div>
          )}
        <div>
          <Button form="avansert-beregning" className={styles.button}>
            {intl.formatMessage({
              id: 'stegvisning.beregn',
            })}
          </Button>
          <Button type="button" variant="tertiary" onClick={resetForm}>
            {intl.formatMessage({
              id: 'stegvisning.nullstill',
            })}
          </Button>
        </div>
      </div>
    </div>
  )
}
/* c8 ignore end */

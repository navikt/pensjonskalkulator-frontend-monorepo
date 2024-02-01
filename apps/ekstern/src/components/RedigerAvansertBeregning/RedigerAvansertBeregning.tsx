/* c8 ignore start */
import React from 'react'
import { useIntl } from 'react-intl'

import { Button, Label, Select, TextField } from '@navikt/ds-react'

import { AgePicker } from '@/components/common/AgePicker'
import { ReadMore } from '@/components/common/ReadMore'
import { EndreInntekt } from '@/components/EndreInntekt'
import { InfoOmInntekt } from '@/components/EndreInntekt/InfoOmInntekt'
import { EndreInntektVsaPensjon } from '@/components/EndreInntektVsaPensjon'
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
  selectAarligInntektFoerUttakBeloepFraBrukerInput,
} from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputReducer'
import { formatUttaksalder } from '@/utils/alder'
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

  const [temporaryHelUttaksperiode, setTemporaryHelUttaksperiode] =
    React.useState<RecursivePartial<HeltUttaksperiode> | undefined>({
      uttaksalder: uttaksalder !== null ? uttaksalder : undefined,
      aarligInntektVsaPensjon: aarligInntektVsaHelPensjon
        ? aarligInntektVsaHelPensjon
        : undefined,
    })

  const [temporaryGradertUttaksperiode, setTemporaryGradertUttaksperiode] =
    React.useState<RecursivePartial<GradertUttaksperiode> | undefined>(
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
            uttaksalder:
              temporaryHelUttaksperiode?.uttaksalder?.aar &&
              temporaryHelUttaksperiode?.uttaksalder?.maaneder !== undefined
                ? (temporaryHelUttaksperiode?.uttaksalder as Alder)
                : { aar: 67, maaneder: 0 },
            aarligInntektVsaPensjon:
              temporaryHelUttaksperiode?.aarligInntektVsaPensjon?.beloep &&
              temporaryHelUttaksperiode?.aarligInntektVsaPensjon?.sluttAlder
                ? (temporaryHelUttaksperiode?.aarligInntektVsaPensjon as AarligInntektVsaPensjon)
                : undefined,
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
    temporaryHelUttaksperiode,
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
    if (tidligstHelUttaksalder) {
      const isTidligsteUttaksalder62 =
        tidligstHelUttaksalder.aar === 62 &&
        tidligstHelUttaksalder.maaneder === 0
      if (!temporaryGradertUttaksperiode) {
        setAgePickerHelDescription(
          `Du kan tidligst ta ut 100 % alderspensjon når du er ${formatUttaksalder(
            intl,
            tidligstHelUttaksalder
          )}.`
        )
      } else {
        if (!isTidligsteUttaksalder62) {
          setAgePickerHelDescription(
            'Med gradert uttak, kan kalkulatoren tidligst beregne 100 % alderspensjon fra 67 år. Du kan likevel ha rett til å ta ut 100 % tidligere.'
          )
        } else {
          setAgePickerHelDescription('')
        }
      }
    }

    // TODO viser vi at det feilet?
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
    }
  }, [
    tidligstHelUttaksalder,
    isTidligstHelUttaksalderError,
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
      dispatch(
        userInputActions.setCurrentSimulationAarligInntektVsaHelPensjon(
          temporaryHelUttaksperiode?.aarligInntektVsaPensjon?.beloep !==
            undefined &&
            temporaryHelUttaksperiode?.aarligInntektVsaPensjon?.sluttAlder
            ? ({
                ...temporaryHelUttaksperiode?.aarligInntektVsaPensjon,
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
      'uttaksalder-hele-pensjon': '',
      'uttaksalder-gradert-pensjon': '',
      'inntekt-vsa-gradert-pensjon': '',
    })
    setTemporaryOverskrevetInntektFremTilUttak(null)
    setTemporaryGradertUttaksperiode(undefined)
    setTemporaryHelUttaksperiode(undefined)
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
              value={temporaryGradertUttaksperiode?.uttaksalder}
              minAlder={tidligstGradertUttaksalder}
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
            value={temporaryHelUttaksperiode?.uttaksalder}
            minAlder={
              temporaryGradertUttaksperiode &&
              (tidligstHelUttaksalder?.aar !== 62 ||
                tidligstHelUttaksalder?.maaneder !== 0)
                ? { aar: 67, maaneder: 0 }
                : tidligstHelUttaksalder
            }
            onChange={(alder) => {
              setValidationErrors((prevState) => {
                return {
                  ...prevState,
                  'uttaksalder-hele-pensjon': '',
                }
              })
              setTemporaryHelUttaksperiode((prevState) => {
                return {
                  ...prevState,
                  uttaksalder: alder,
                }
              })
            }}
            error={validationErrors['uttaksalder-hele-pensjon']}
          />
        </div>
        <div>
          <EndreInntektVsaPensjon
            uttaksperiode={temporaryHelUttaksperiode}
            oppdatereInntekt={(
              aarligInntektVsaPensjon: AarligInntektVsaPensjon | undefined
            ) => {
              setTemporaryHelUttaksperiode((prevState) => {
                return {
                  ...prevState,
                  aarligInntektVsaPensjon,
                }
              })
            }}
          />
        </div>
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

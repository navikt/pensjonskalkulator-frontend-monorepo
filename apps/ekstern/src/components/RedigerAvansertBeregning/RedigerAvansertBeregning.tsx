import React from 'react'
import { useIntl, FormattedMessage } from 'react-intl'

import { BodyLong, Label, Select, TextField } from '@navikt/ds-react'

import { AgePicker } from '@/components/common/AgePicker'
import { ReadMore } from '@/components/common/ReadMore'
import { EndreInntekt } from '@/components/EndreInntekt'
import { InfoOmInntekt } from '@/components/EndreInntekt/InfoOmInntekt'
import { EndreInntektVsaPensjon } from '@/components/EndreInntektVsaPensjon'
import {
  useTidligstMuligHeltUttakQuery,
  useTidligstMuligGradertUttakQuery,
} from '@/state/api/apiSlice'
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

import { FormButtonRow } from './FormButtonRow'
import {
  useFormLocalState,
  useTidligstMuligUttakRequestBodyState,
} from './hooks'
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
    hasUnsavedChanges,
    localInntektFremTilUttak,
    localHeltUttak,
    localGradertUttak,
    { setLocalInntektFremTilUttak, setLocalHeltUttak, setLocalGradertUttak },
  ] = useFormLocalState({
    aarligInntektFoerUttakBeloepFraBrukerInput,
    uttaksalder,
    aarligInntektVsaHelPensjon,
    gradertUttaksperiode,
  })

  const [
    tidligstMuligHeltUttakRequestBody,
    tidligstMuligGradertUttakRequestBody,
  ] = useTidligstMuligUttakRequestBodyState({
    afp,
    sivilstand,
    harSamboer,
    aarligInntektFoerUttakBeloep,
    localInntektFremTilUttak,
    localGradertUttak,
    localHeltUttak,
  })

  const {
    data: tidligstMuligHeltUttak,
    isError: isTidligstMuligHeltUttakError,
  } = useTidligstMuligHeltUttakQuery(tidligstMuligHeltUttakRequestBody, {
    skip: !tidligstMuligHeltUttakRequestBody,
  })

  const {
    data: tidligstMuligGradertUttak,
    isError: isTidligstMuligGradertUttakError,
  } = useTidligstMuligGradertUttakQuery(tidligstMuligGradertUttakRequestBody, {
    skip: !tidligstMuligGradertUttakRequestBody,
  })

  const [validationErrors, setValidationErrors] = React.useState<
    Record<string, string>
  >({
    [FORM_NAMES.uttaksgrad]: '',
    [FORM_NAMES.uttaksalderHeltUttak]: '',
    [FORM_NAMES.uttaksalderGradertUttak]: '',
    [FORM_NAMES.inntektVsaGradertUttak]: '',
  })

  const minAlderForHeltUttak = React.useMemo(() => {
    const oppdatertMinAlder = getMinAlderTilHeltUttak({
      localGradertUttak: localGradertUttak?.uttaksalder,
      tidligstMuligHeltUttak,
    })

    if (
      localHeltUttak?.uttaksalder &&
      (localHeltUttak.uttaksalder?.aar ?? 0) * 12 +
        (localHeltUttak.uttaksalder?.maaneder ?? 0) <=
        (oppdatertMinAlder?.aar ?? 0) * 12 + (oppdatertMinAlder?.maaneder ?? 0)
    ) {
      setLocalHeltUttak((previous) => ({
        ...previous,
        uttaksalder: undefined,
      }))
    }

    return oppdatertMinAlder
  }, [localGradertUttak, tidligstMuligHeltUttak])

  const handleUttaksgradChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValidationErrors((prevState) => {
      return {
        ...prevState,
        [FORM_NAMES.uttaksgrad]: '',
        [FORM_NAMES.uttaksalderGradertUttak]: '',
        [FORM_NAMES.uttaksalderHeltUttak]: '',
      }
    })
    const avansertBeregningFormatertUttaksgradAsNumber = e.target.value
      ? parseInt(e.target.value.match(/\d+/)?.[0] as string, 10)
      : 100

    setLocalGradertUttak((previous) => {
      return !isNaN(avansertBeregningFormatertUttaksgradAsNumber) &&
        avansertBeregningFormatertUttaksgradAsNumber !== 100
        ? { ...previous, grad: avansertBeregningFormatertUttaksgradAsNumber }
        : undefined
    })

    setLocalHeltUttak((previous) => {
      return { ...previous, uttaksalder: undefined }
    })
  }

  const handleInntektVsaGradertPensjonChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setLocalGradertUttak((previous) => ({
      ...previous,
      aarligInntektVsaPensjonBeloep: e.target.value
        ? e.target.value
        : undefined,
    }))

    setValidationErrors((prevState) => {
      return {
        ...prevState,
        [FORM_NAMES.inntektVsaGradertUttak]: '',
      }
    })
  }

  const handleGradertUttakAlderChange = (alder: Partial<Alder> | undefined) => {
    setValidationErrors((prevState) => {
      return {
        ...prevState,
        [FORM_NAMES.uttaksalderGradertUttak]: '',
      }
    })
    setLocalGradertUttak((previous) => ({
      ...previous,
      uttaksalder: alder,
    }))
  }

  const handleHeltUttakAlderChange = (alder: Partial<Alder> | undefined) => {
    setValidationErrors((prevState) => {
      return {
        ...prevState,

        [FORM_NAMES.uttaksalderHeltUttak]: '',
      }
    })

    setLocalHeltUttak((prevState) => {
      const sluttAlderAntallMaaneder =
        prevState?.aarligInntektVsaPensjon?.sluttAlder?.aar !== undefined
          ? prevState?.aarligInntektVsaPensjon?.sluttAlder.aar * 12 +
            (prevState?.aarligInntektVsaPensjon?.sluttAlder.maaneder ?? 0)
          : 0
      const shouldDeleteInntektVsaPensjon =
        alder?.aar &&
        alder?.aar * 12 + (alder?.maaneder ?? 0) >= sluttAlderAntallMaaneder
      return {
        ...prevState,
        uttaksalder: alder,
        aarligInntektVsaPensjon:
          shouldDeleteInntektVsaPensjon || !prevState?.aarligInntektVsaPensjon
            ? undefined
            : { ...prevState?.aarligInntektVsaPensjon },
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
          localHeltUttak?.aarligInntektVsaPensjon?.beloep !== undefined &&
            localHeltUttak?.aarligInntektVsaPensjon?.sluttAlder?.aar &&
            localHeltUttak?.aarligInntektVsaPensjon?.sluttAlder?.maaneder !==
              undefined
            ? {
                beloep: localHeltUttak?.aarligInntektVsaPensjon?.beloep,
                sluttAlder: localHeltUttak?.aarligInntektVsaPensjon
                  ?.sluttAlder as Alder,
              }
            : undefined
        )
      )
      dispatch(
        userInputActions.setCurrentSimulationaarligInntektFoerUttakBeloep(
          localInntektFremTilUttak
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
    setLocalInntektFremTilUttak(null)
    setLocalGradertUttak(undefined)
    setLocalHeltUttak(undefined)
  }

  const getGradertAgePickerError = (): string => {
    return validationErrors[FORM_NAMES.uttaksalderGradertUttak]
      ? intl.formatMessage({
          id: validationErrors[FORM_NAMES.uttaksalderGradertUttak],
        }) +
          intl.formatMessage(
            {
              id: 'beregning.avansert.rediger.agepicker.validation_error',
            },
            { grad: localGradertUttak?.grad }
          )
      : ''
  }

  const getHeltAgePickerError = (): string => {
    return validationErrors[FORM_NAMES.uttaksalderHeltUttak]
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

  // TODO flytte denne til en util og bruk memo med array: tidligstMuligHeltUttak, localGradertUttak
  const getHeltUttakAgePickerBeskrivelse = (): string | undefined => {
    if (tidligstMuligHeltUttak) {
      if (!localGradertUttak) {
        return `Du kan tidligst ta ut 100 % alderspensjon når du er ${formatUttaksalder(
          intl,
          tidligstMuligHeltUttak
        )}.`
      } else {
        if (isUttaksalderOverMinUttaksaar(tidligstMuligHeltUttak)) {
          return 'Med gradert uttak, kan kalkulatoren tidligst beregne 100 % alderspensjon fra 67 år. Du kan likevel ha rett til å ta ut 100 % tidligere.'
        } else {
          return ''
        }
      }
    }
  }

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
                localInntektFremTilUttak !== null
                  ? localInntektFremTilUttak
                  : aarligInntektFoerUttakBeloep
              )} kr per år før skatt`}
            </span>

            <EndreInntekt
              visning="avansert"
              buttonLabel="beregning.avansert.rediger.inntekt.button"
              value={localInntektFremTilUttak}
              onSubmit={(inntekt) => {
                if (
                  (aarligInntektFoerUttakBeloepFraBrukerInput !== null &&
                    inntekt !== aarligInntektFoerUttakBeloepFraBrukerInput) ||
                  (aarligInntektFoerUttakBeloepFraBrukerInput === null &&
                    inntekt !== null)
                ) {
                  resetForm()
                }

                setLocalInntektFremTilUttak(inntekt)
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
              localGradertUttak?.grad ? `${localGradertUttak.grad} %` : '100 %'
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
        {localGradertUttak && (
          <div>
            <AgePicker
              form={FORM_NAMES.form}
              name={FORM_NAMES.uttaksalderGradertUttak}
              label={intl.formatMessage(
                {
                  id: 'beregning.avansert.rediger.gradertuttak.agepicker.label',
                },
                { grad: localGradertUttak.grad }
              )}
              description={
                tidligstMuligGradertUttak &&
                !isTidligstMuligGradertUttakError &&
                tidligstMuligHeltUttak &&
                isUttaksalderOverMinUttaksaar(tidligstMuligHeltUttak)
                  ? `Du kan tidligst ta ut ${
                      localGradertUttak.grad
                    } % alderspensjon når du er ${formatUttaksalder(
                      intl,
                      tidligstMuligGradertUttak
                    )}.`
                  : ''
              }
              value={localGradertUttak?.uttaksalder}
              minAlder={tidligstMuligGradertUttak}
              maxAlder={{ aar: 74, maaneder: 11 }}
              onChange={handleGradertUttakAlderChange}
              error={getGradertAgePickerError()}
            />
            {localGradertUttak?.grad !== 100 && (
              <ReadMoreOmPensjonsalder
                showTidligstMuligUttakOptionalIngress={
                  !isTidligstMuligGradertUttakError
                }
              />
            )}
            <div className={styles.spacer} />
            <TextField
              form={FORM_NAMES.form}
              data-testid="inntekt-vsa-gradert-pensjon-textfield"
              type="text"
              inputMode="numeric"
              name={FORM_NAMES.inntektVsaGradertUttak}
              className={styles.textfield}
              label={`Hva er din forventede årsinntekt mens du tar ut ${localGradertUttak.grad} % alderspensjon? (Valgfritt)`}
              description={intl.formatMessage({
                id: 'inntekt.endre_inntekt_modal.textfield.description',
              })}
              error={
                validationErrors[FORM_NAMES.inntektVsaGradertUttak]
                  ? intl.formatMessage({
                      id: validationErrors[FORM_NAMES.inntektVsaGradertUttak],
                    })
                  : ''
              }
              onChange={handleInntektVsaGradertPensjonChange}
              value={localGradertUttak?.aarligInntektVsaPensjonBeloep}
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
            description={getHeltUttakAgePickerBeskrivelse()}
            value={localHeltUttak?.uttaksalder}
            minAlder={minAlderForHeltUttak}
            onChange={handleHeltUttakAlderChange}
            error={getHeltAgePickerError()}
          />
          <div className={styles.spacer__small} />
        </div>

        {(!localGradertUttak ||
          !localGradertUttak?.grad ||
          localGradertUttak?.grad === 100) && (
          <ReadMoreOmPensjonsalder
            showTidligstMuligUttakOptionalIngress={
              !isTidligstMuligHeltUttakError
            }
          />
        )}

        {localHeltUttak?.uttaksalder?.aar &&
          localHeltUttak?.uttaksalder?.maaneder !== undefined && (
            <div>
              <EndreInntektVsaPensjon
                uttaksperiode={localHeltUttak}
                oppdatereInntekt={(aarligInntektVsaPensjon?: {
                  beloep: number
                  sluttAlder: {
                    aar: number
                    maaneder: number
                  }
                }) => {
                  setLocalHeltUttak((prevState) => {
                    return {
                      ...prevState,
                      aarligInntektVsaPensjon,
                    }
                  })
                }}
              />
            </div>
          )}
        <FormButtonRow
          resetForm={resetForm}
          gaaTilResultat={gaaTilResultat}
          hasUnsavedChanges={!!hasUnsavedChanges}
        />
      </div>
    </div>
  )
}

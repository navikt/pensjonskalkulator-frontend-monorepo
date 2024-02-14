import React from 'react'
import { useIntl, FormattedMessage } from 'react-intl'

import { BodyLong, Label, Select, TextField } from '@navikt/ds-react'

import { AgePicker } from '@/components/common/AgePicker'
import { Alert as AlertDashBorder } from '@/components/common/Alert'
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
import { formatWithoutDecimal } from '@/utils/inntekt'
import { getFormatMessageValues } from '@/utils/translations'

import { FormButtonRow } from './FormButtonRow'
import {
  useFormLocalState,
  useTidligstMuligUttakRequestBodyState,
  useFormValidationErrors,
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
  hasVilkaarIkkeOppfylt?: boolean
}> = ({ gaaTilResultat, hasVilkaarIkkeOppfylt }) => {
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

  const [
    validationErrors,
    gradertUttakAgePickerError,
    heltUttakAgePickerError,
    gradertUttakAgePickerBeskrivelse,
    heltUttakAgePickerBeskrivelse,
    {
      setValidationErrors,
      setValidationErrorUttaksalderHeltUttak,
      setValidationErrorUttaksalderGradertUttak,
      setValidationErrorInntektVsaGradertUttak,
      resetValidationErrors,
    },
  ] = useFormValidationErrors({
    grad: localGradertUttak?.grad,
    tidligstMuligHeltUttak,
    tidligstMuligGradertUttak,
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
    resetValidationErrors()
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
    setValidationErrorInntektVsaGradertUttak('')
  }

  const handleGradertUttakAlderChange = (alder: Partial<Alder> | undefined) => {
    setValidationErrorUttaksalderGradertUttak('')
    setLocalGradertUttak((previous) => ({
      ...previous,
      uttaksalder: alder,
    }))
  }

  const handleHeltUttakAlderChange = (alder: Partial<Alder> | undefined) => {
    setValidationErrorUttaksalderHeltUttak('')
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

  // TODO - refactor - se om denne kan flyttes ut til util eller deles opp?
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
          (inntektVsaGradertPensjonFormData as string).replace(/ /g, ''),
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
    resetValidationErrors()
    setLocalInntektFremTilUttak(null)
    setLocalGradertUttak(undefined)
    setLocalHeltUttak(undefined)
  }

  return (
    <div
      className={`${styles.container} ${styles.container__hasMobilePadding}`}
    >
      <div className={styles.form}>
        <form id={FORM_NAMES.form} method="dialog" onSubmit={onSubmit}></form>
        <div>
          <Label className={styles.label}>
            <FormattedMessage id="beregning.avansert.rediger.inntekt_frem_til_uttak.label" />
          </Label>
          <div className={styles.description}>
            <span className={styles.descriptionText}>
              <span className="nowrap">
                {formatWithoutDecimal(
                  localInntektFremTilUttak !== null
                    ? localInntektFremTilUttak
                    : aarligInntektFoerUttakBeloep
                )}
              </span>
              {` ${intl.formatMessage({ id: 'beregning.avansert.rediger.inntekt_frem_til_uttak.description' })}`}
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
          <div className={`${styles.spacer} ${styles.spacer__small}`} />
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
            className={styles.select}
            label={intl.formatMessage({
              id: 'beregning.avansert.rediger.uttaksgrad.label',
            })}
            description={intl.formatMessage({
              id: 'beregning.avansert.rediger.uttaksgrad.description',
            })}
            value={
              localGradertUttak?.grad ? `${localGradertUttak.grad} %` : '100 %'
            }
            onChange={handleUttaksgradChange}
          >
            <option>
              <FormattedMessage id="beregning.avansert.rediger.uttaksgrad.description" />
            </option>
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
              label={
                <FormattedMessage
                  id="beregning.avansert.rediger.gradertuttak.agepicker.label"
                  values={{
                    ...getFormatMessageValues(intl),
                    grad: localGradertUttak.grad,
                  }}
                />
              }
              description={gradertUttakAgePickerBeskrivelse}
              value={localGradertUttak?.uttaksalder}
              minAlder={tidligstMuligGradertUttak}
              maxAlder={{ aar: 74, maaneder: 11 }}
              onChange={handleGradertUttakAlderChange}
              error={gradertUttakAgePickerError}
            />
            {localGradertUttak?.grad !== 100 && (
              <>
                <div className={styles.spacer__small} />
                <ReadMoreOmPensjonsalder
                  showTidligstMuligUttakOptionalIngress={
                    !isTidligstMuligGradertUttakError
                  }
                />
              </>
            )}
            <div className={styles.spacer} />
            <TextField
              form={FORM_NAMES.form}
              data-testid="inntekt-vsa-gradert-pensjon-textfield"
              type="text"
              inputMode="numeric"
              name={FORM_NAMES.inntektVsaGradertUttak}
              className={styles.textfield}
              label={
                <FormattedMessage
                  id="beregning.avansert.rediger.inntekt_vsa_gradert_uttak.label"
                  values={{
                    ...getFormatMessageValues(intl),
                    grad: localGradertUttak.grad,
                  }}
                />
              }
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
            label={
              <FormattedMessage
                id="beregning.avansert.rediger.heltuttak.agepicker.label"
                values={{
                  ...getFormatMessageValues(intl),
                }}
              />
            }
            description={heltUttakAgePickerBeskrivelse}
            value={localHeltUttak?.uttaksalder}
            minAlder={minAlderForHeltUttak}
            onChange={handleHeltUttakAlderChange}
            error={heltUttakAgePickerError}
          />
          {hasVilkaarIkkeOppfylt &&
          uttaksalder &&
          uttaksalder.aar < 67 &&
          JSON.stringify(uttaksalder) ===
            JSON.stringify(localHeltUttak?.uttaksalder) ? (
            <AlertDashBorder className={styles.alert}>
              <FormattedMessage
                id="beregning.lav_opptjening"
                values={{ startAar: uttaksalder.aar }}
              />
            </AlertDashBorder>
          ) : (
            <div className={styles.spacer__small} />
          )}
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

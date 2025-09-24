import clsx from 'clsx'
import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useNavigate } from 'react-router'

import {
  Alert,
  Heading,
  Link,
  Radio,
  RadioGroup,
  TextField,
} from '@navikt/ds-react'

import { VilkaarsproevingAlert } from '@/components/VilkaarsproevingAlert'
import { AgePicker } from '@/components/common/AgePicker'
import { Divider } from '@/components/common/Divider'
import { BeregningContext } from '@/pages/Beregning/context'
import { paths } from '@/router/constants'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import {
  selectAarligInntektFoerUttakBeloep,
  selectAarligInntektFoerUttakBeloepFraBrukerInput,
  selectAarligInntektFoerUttakBeloepFraSkatt,
  selectAfpInntektMaanedFoerUttak,
  selectCurrentSimulation,
  selectFoedselsdato,
  selectGrunnbeloep,
  selectIsEndring,
  selectLoependeVedtak,
  selectNedreAldersgrense,
  selectNormertPensjonsalder,
} from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputSlice'
import { getBrukerensAlderISluttenAvMaaneden } from '@/utils/alder'
import {
  formatInntekt,
  updateAndFormatInntektFromInputField,
} from '@/utils/inntekt'
import { logger } from '@/utils/logging'
import { getFormatMessageValues } from '@/utils/translations'

import {
  AvansertSkjemaInntekt,
  AvansertSkjemaIntroEndring,
  FormButtonRow,
} from '../Felles'
import { useFormLocalState, useFormValidationErrors } from '../hooks'
import { AVANSERT_FORM_NAMES, onAvansertBeregningSubmit } from '../utils'

import styles from './AvansertSkjemaForBrukereMedKap19Afp.module.scss'

export const AvansertSkjemaForBrukereMedKap19Afp: React.FC<{
  vilkaarsproeving?: Vilkaarsproeving
}> = ({ vilkaarsproeving }) => {
  const intl = useIntl()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const { setAvansertSkjemaModus } = React.useContext(BeregningContext)

  const foedselsdato = useAppSelector(selectFoedselsdato)
  const normertPensjonsalder = useAppSelector(selectNormertPensjonsalder)
  const grunnbeloep = useAppSelector(selectGrunnbeloep)
  const isEndring = useAppSelector(selectIsEndring)
  const inntektVsaGradertUttakInputRef = React.useRef<HTMLInputElement>(null)
  const loependeVedtak = useAppSelector(selectLoependeVedtak)
  const nedreAldersgrense = useAppSelector(selectNedreAldersgrense)
  const { uttaksalder, gradertUttaksperiode, aarligInntektVsaHelPensjon } =
    useAppSelector(selectCurrentSimulation)
  const aarligInntektFoerUttakBeloepFraBrukerInput = useAppSelector(
    selectAarligInntektFoerUttakBeloepFraBrukerInput
  )
  const aarligInntektFoerUttakBeloepFraBrukerSkatt = useAppSelector(
    selectAarligInntektFoerUttakBeloepFraSkatt
  )
  const aarligInntektFoerUttakBeloep = useAppSelector(
    selectAarligInntektFoerUttakBeloep
  )
  const afpInntektMaanedFoerUttak = useAppSelector(
    selectAfpInntektMaanedFoerUttak
  )
  const { harAvansertSkjemaUnsavedChanges } = React.useContext(BeregningContext)

  const gaaTilResultat = () => {
    setAvansertSkjemaModus('resultat')
    window.scrollTo(0, 0)
  }

  const agePickerMinAlder = loependeVedtak.ufoeretrygd.grad
    ? normertPensjonsalder
    : getBrukerensAlderISluttenAvMaaneden(foedselsdato, nedreAldersgrense)

  const {
    localInntektFremTilUttak,
    localHeltUttak,
    localGradertUttak,
    localHarInntektVsaGradertUttakRadio,
    localHarAfpInntektMaanedFoerUttakRadio,
    handlers: {
      setLocalInntektFremTilUttak,
      setLocalHeltUttak,
      setLocalGradertUttak,
      setLocalHarInntektVsaHeltUttakRadio,
      setLocalHarInntektVsaGradertUttakRadio,
      setLocalHarAfpInntektMaanedFoerUttakRadio,
    },
  } = useFormLocalState({
    isEndring,
    ufoeregrad: loependeVedtak.ufoeretrygd.grad,
    aarligInntektFoerUttakBeloepFraBrukerSkattBeloep:
      aarligInntektFoerUttakBeloepFraBrukerSkatt?.beloep,
    aarligInntektFoerUttakBeloepFraBrukerInput,
    uttaksalder,
    aarligInntektVsaHelPensjon,
    gradertUttaksperiode,
    normertPensjonsalder,
    afpInntektMaanedFoerUttak,
    beregningsvalg: null,
  })

  const {
    validationErrors,
    heltUttakAgePickerError,
    handlers: {
      setValidationErrors,
      setValidationErrorUttaksalderHeltUttak,
      setValidationErrorInntektVsaAfp,
      resetValidationErrors,
    },
  } = useFormValidationErrors({
    grad: localGradertUttak?.grad,
    afp: true,
  })

  const handleHeltUttaksalderChange = (alder: Partial<Alder> | undefined) => {
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

  const handleAfpInntektMaanedFoerUttakRadioChange = (s: BooleanRadio) => {
    setValidationErrors((prevState) => {
      return {
        ...prevState,
        [AVANSERT_FORM_NAMES.afpInntektMaanedFoerUttakRadio]: '',
      }
    })
    setLocalHarAfpInntektMaanedFoerUttakRadio?.(s === 'ja')
    if (s === 'nei') {
      logger('alert vist', {
        tekst: 'Beregning AFP: Ikke høy nok inntekt siste måned',
        variant: 'info',
      })
    }
  }

  const handleInntektVsaGradertUttakRadioChange = (s: BooleanRadio) => {
    setValidationErrors((prevState) => {
      return {
        ...prevState,
        [AVANSERT_FORM_NAMES.inntektVsaAfpRadio]: '',
        [AVANSERT_FORM_NAMES.inntektVsaAfp]: '',
      }
    })
    setLocalHarInntektVsaGradertUttakRadio(s === 'ja')
  }

  const handleInntektVsaGradertUttakChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    updateAndFormatInntektFromInputField(
      inntektVsaGradertUttakInputRef.current,
      e.target.value,
      (s: string) => {
        setLocalGradertUttak((previous) => ({
          ...previous,
          aarligInntektVsaPensjonBeloep: s || undefined,
        }))
      },
      setValidationErrorInntektVsaAfp
    )
  }

  const resetForm = (): void => {
    resetValidationErrors()
    setLocalInntektFremTilUttak(
      aarligInntektFoerUttakBeloepFraBrukerSkatt?.beloep ?? null
    )
    setLocalGradertUttak(undefined)
    setLocalHeltUttak(undefined)
    setLocalHarInntektVsaGradertUttakRadio(null)
    setLocalHarInntektVsaHeltUttakRadio(null)
    setLocalHarAfpInntektMaanedFoerUttakRadio?.(null)
  }

  return (
    <>
      <form
        id={AVANSERT_FORM_NAMES.form}
        data-testid="AVANSERT_SKJEMA_FOR_BRUKERE_KAP19"
        method="dialog"
        onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault()
          const data = new FormData(e.currentTarget)
          onAvansertBeregningSubmit(
            data,
            dispatch,
            setValidationErrors,
            gaaTilResultat,
            {
              foedselsdato: foedselsdato as string,
              normertPensjonsalder,
              loependeVedtak,
              localInntektFremTilUttak,
              hasVilkaarIkkeOppfylt:
                vilkaarsproeving?.vilkaarErOppfylt === false,
              harAvansertSkjemaUnsavedChanges,
            },
            true
          )
        }}
      />

      <div
        className={clsx(styles.container, styles.container__hasMobilePadding)}
      >
        <div className={styles.container_header}>
          <Heading level="2" size="medium">
            <FormattedMessage
              id="beregning.avansert.rediger.afp_etterfulgt_av_ap.title"
              values={{
                ...getFormatMessageValues(),
              }}
            />
          </Heading>
        </div>

        <div className={styles.form}>
          {isEndring && <AvansertSkjemaIntroEndring />}

          <AvansertSkjemaInntekt
            localInntektFremTilUttak={localInntektFremTilUttak}
            aarligInntektFoerUttakBeloep={aarligInntektFoerUttakBeloep}
            setLocalInntektFremTilUttak={setLocalInntektFremTilUttak}
          />

          <Divider noMargin />

          <div className={styles.alertWrapper} aria-live="polite">
            {vilkaarsproeving &&
              !vilkaarsproeving?.vilkaarErOppfylt &&
              uttaksalder && (
                <VilkaarsproevingAlert
                  alternativ={vilkaarsproeving?.alternativ}
                  uttaksalder={uttaksalder}
                />
              )}
          </div>

          <div data-testid="agepicker-helt-uttaksalder">
            <AgePicker
              form={AVANSERT_FORM_NAMES.form}
              name={AVANSERT_FORM_NAMES.uttaksalderHeltUttak}
              label={<FormattedMessage id="velguttaksalderafp.title" />}
              value={localHeltUttak?.uttaksalder}
              onChange={handleHeltUttaksalderChange}
              error={heltUttakAgePickerError}
              minAlder={agePickerMinAlder}
              maxAlder={{ aar: 66, maaneder: 11 }}
            />
          </div>

          <div>
            <RadioGroup
              legend={
                <FormattedMessage
                  id="beregning.avansert.rediger.radio.afp_inntekt_maaned_foer_uttak"
                  values={{
                    ...getFormatMessageValues(),
                    afpInntektMaanedFoerUttak: grunnbeloep
                      ? `${formatInntekt(Math.ceil(grunnbeloep / 12))} kr`
                      : '1G (grunnbeløpet) delt på 12',
                  }}
                />
              }
              description={
                <FormattedMessage id="beregning.avansert.rediger.radio.afp_inntekt_maaned_foer_uttak.description" />
              }
              name={AVANSERT_FORM_NAMES.afpInntektMaanedFoerUttakRadio}
              data-testid={AVANSERT_FORM_NAMES.afpInntektMaanedFoerUttakRadio}
              value={
                localHarAfpInntektMaanedFoerUttakRadio === null
                  ? null
                  : localHarAfpInntektMaanedFoerUttakRadio
                    ? 'ja'
                    : 'nei'
              }
              onChange={handleAfpInntektMaanedFoerUttakRadioChange}
              error={
                validationErrors[
                  AVANSERT_FORM_NAMES.afpInntektMaanedFoerUttakRadio
                ]
                  ? intl.formatMessage(
                      {
                        id: validationErrors[
                          AVANSERT_FORM_NAMES.afpInntektMaanedFoerUttakRadio
                        ],
                      },
                      {
                        grunnbeloep: grunnbeloep
                          ? `${formatInntekt(Math.ceil(grunnbeloep / 12))} kr`
                          : '1G (grunnbeløpet) delt på 12',
                      }
                    )
                  : ''
              }
              role="radiogroup"
              aria-required="true"
            >
              <Radio
                form={AVANSERT_FORM_NAMES.form}
                data-testid={`${AVANSERT_FORM_NAMES.afpInntektMaanedFoerUttakRadio}-ja`}
                value="ja"
                aria-invalid={
                  !!validationErrors[
                    AVANSERT_FORM_NAMES.afpInntektMaanedFoerUttakRadio
                  ]
                }
              >
                <FormattedMessage id="stegvisning.radio_ja" />
              </Radio>
              <Radio
                form={AVANSERT_FORM_NAMES.form}
                data-testid={`${AVANSERT_FORM_NAMES.afpInntektMaanedFoerUttakRadio}-nei`}
                value="nei"
              >
                <FormattedMessage id="stegvisning.radio_nei" />
              </Radio>

              {localHarAfpInntektMaanedFoerUttakRadio === false && (
                <Alert
                  variant="info"
                  data-testid="afp-etterfulgt-ap-informasjon"
                >
                  <FormattedMessage
                    id="beregning.avansert.alert.afp_inntekt_maaned_foer_uttak"
                    values={{
                      ...getFormatMessageValues(),
                      grunnbeloepstekst: grunnbeloep
                        ? `på minst ${formatInntekt(Math.ceil(grunnbeloep / 12))} kr den siste måneden før du tar ut AFP`
                        : 'den siste måneden før du tar ut AFP som tilsvarer en årsinntekt på minst 1G',
                      alderspensjonUtenAFP: (
                        <Link
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            dispatch(
                              userInputActions.setAfpInntektMaanedFoerUttak(
                                null
                              )
                            )
                            dispatch(
                              userInputActions.setCurrentSimulationGradertUttaksperiode(
                                null
                              )
                            )
                            dispatch(
                              userInputActions.setCurrentSimulationUttaksalder(
                                null
                              )
                            )
                            logger('button klikk', {
                              tekst: 'Grunnlag AFP: Gå til AFP',
                            })
                            navigate(paths.afp)
                          }}
                        >
                          {intl.formatMessage({
                            id: 'beregning.avansert.alert.afp_inntekt_maaned_foer_uttak.link.text',
                          })}
                        </Link>
                      ),
                    }}
                  />
                </Alert>
              )}
            </RadioGroup>
          </div>

          <div>
            <RadioGroup
              legend={
                <FormattedMessage
                  id="beregning.avansert.rediger.radio.inntekt_vsa_afp"
                  values={{
                    ...getFormatMessageValues(),
                  }}
                />
              }
              description={
                <FormattedMessage id="beregning.avansert.rediger.radio.inntekt_vsa_afp.description" />
              }
              name={AVANSERT_FORM_NAMES.inntektVsaAfpRadio}
              data-testid={AVANSERT_FORM_NAMES.inntektVsaAfpRadio}
              value={
                localHarInntektVsaGradertUttakRadio === null
                  ? null
                  : localHarInntektVsaGradertUttakRadio
                    ? 'ja'
                    : 'nei'
              }
              onChange={handleInntektVsaGradertUttakRadioChange}
              error={
                validationErrors[AVANSERT_FORM_NAMES.inntektVsaAfpRadio]
                  ? intl.formatMessage({
                      id: validationErrors[
                        AVANSERT_FORM_NAMES.inntektVsaAfpRadio
                      ],
                    })
                  : ''
              }
              role="radiogroup"
              aria-required="true"
            >
              <Radio
                form={AVANSERT_FORM_NAMES.form}
                data-testid={`${AVANSERT_FORM_NAMES.inntektVsaAfpRadio}-ja`}
                value="ja"
                aria-invalid={
                  !!validationErrors[AVANSERT_FORM_NAMES.inntektVsaAfpRadio]
                }
              >
                <FormattedMessage id="stegvisning.radio_ja" />
              </Radio>

              <Radio
                form={AVANSERT_FORM_NAMES.form}
                data-testid={`${AVANSERT_FORM_NAMES.inntektVsaAfpRadio}-nei`}
                value="nei"
              >
                <FormattedMessage id="stegvisning.radio_nei" />
              </Radio>
            </RadioGroup>
          </div>

          {localHarInntektVsaGradertUttakRadio && (
            <TextField
              ref={inntektVsaGradertUttakInputRef}
              form={AVANSERT_FORM_NAMES.form}
              name={AVANSERT_FORM_NAMES.inntektVsaAfp}
              data-testid={AVANSERT_FORM_NAMES.inntektVsaAfp}
              type="text"
              inputMode="numeric"
              className={styles.textfield}
              label={
                <FormattedMessage
                  id="inntekt.endre_inntekt_vsa_afp_modal.textfield.label"
                  values={getFormatMessageValues()}
                />
              }
              description={intl.formatMessage({
                id: 'inntekt.endre_inntekt_vsa_pensjon_modal.textfield.description',
              })}
              error={
                validationErrors[AVANSERT_FORM_NAMES.inntektVsaAfp]
                  ? intl.formatMessage(
                      {
                        id: validationErrors[AVANSERT_FORM_NAMES.inntektVsaAfp],
                      },
                      { ...getFormatMessageValues() }
                    )
                  : undefined
              }
              onChange={handleInntektVsaGradertUttakChange}
              value={localGradertUttak?.aarligInntektVsaPensjonBeloep}
              aria-required="true"
            />
          )}

          <FormButtonRow
            formId={AVANSERT_FORM_NAMES.form}
            resetForm={resetForm}
            gaaTilResultat={gaaTilResultat}
            hasVilkaarIkkeOppfylt={vilkaarsproeving?.vilkaarErOppfylt === false}
          />
        </div>
      </div>
    </>
  )
}

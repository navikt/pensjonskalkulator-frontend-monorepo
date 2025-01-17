import React from 'react'
import { FormEvent, useMemo, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useNavigate } from 'react-router'

import {
  BodyLong,
  Button,
  Heading,
  Radio,
  RadioGroup,
  Select,
} from '@navikt/ds-react'

import { STEGVISNING_FORM_NAMES } from '../utils'
import { Card } from '@/components/common/Card'
import { paths } from '@/router/constants'
import { logger, wrapLogger } from '@/utils/logging'
import { formatSivilstand } from '@/utils/sivilstand'

import styles from './Sivilstand.module.scss'

interface Props {
  shouldRedirectTo?: string
  sivilstand: UtvidetSivilstand
  harSamboer: boolean | null
  epsHarInntektOver2G: boolean | null
  epsHarPensjon: boolean | null
  onCancel?: () => void
  onPrevious: () => void
  onNext: (sivilstandData: {
    sivilstand: UtvidetSivilstand
    epsHarPensjon: boolean
    epsHarInntektOver2G: boolean
  }) => void
}

export function Sivilstand({
  shouldRedirectTo,
  sivilstand,
  epsHarInntektOver2G,
  epsHarPensjon,
  onCancel,
  onPrevious,
  onNext,
}: Props) {
  const intl = useIntl()
  const navigate = useNavigate()
  const [, /* validationError */ setValidationError] = useState<string>('')

  const sivilstandOptions = [
    'UGIFT',
    'GIFT',
    'ENKE_ELLER_ENKEMANN',
    'SKILT',
    'SEPARERT',
    'REGISTRERT_PARTNER',
    'SEPARERT_PARTNER',
    'SKILT_PARTNER',
    'GJENLEVENDE_PARTNER',
    'SAMBOER',
  ]

  React.useEffect(() => {
    if (shouldRedirectTo) {
      navigate(shouldRedirectTo)
    }
  }, [shouldRedirectTo])

  const formatertSivilstand = useMemo(
    () => formatSivilstand(intl, sivilstand).toLowerCase(),
    [sivilstand]
  )

  const onSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault()

    const data = new FormData(e.currentTarget)

    const sivilstandData = data.get('sivilstand') as UtvidetSivilstand
    const epsHarPensjonData =
      (data.get('epsHarPensjon') as BooleanRadio | undefined) === 'ja'
        ? true
        : false
    const epsHarInntektOver2GData =
      (data.get('epsHarInntektOver2G') as BooleanRadio | undefined) === 'ja'
        ? true
        : false

    if (!sivilstandData) {
      const tekst = intl.formatMessage({
        id: 'stegvisning.sivilstand.validation_error',
      })
      setValidationError(tekst)
      logger('skjema validering feilet', {
        skjemanavn: STEGVISNING_FORM_NAMES.sivilstand,
        data: intl.formatMessage({
          id: 'stegvisning.sivilstand.radio_label',
        }),
        tekst,
      })
    } else {
      logger('radiogroup valgt', {
        tekst: 'Samboer',
        valg: sivilstandData,
      })
      logger('button klikk', {
        tekst: `Neste fra ${paths.sivilstand}`,
      })
      onNext({
        sivilstand: sivilstandData,
        epsHarPensjon: epsHarPensjonData,
        epsHarInntektOver2G: epsHarInntektOver2GData,
      })
    }
  }

  interface InputChange {
    field: 'epsHarPensjon' | 'sivilstand'
    value: BooleanRadio | UtvidetSivilstand
  }
  interface ShouldShowInputs {
    epsHarPensjon: boolean
    epsHarInntektOver2G: boolean
  }
  const [shouldShowInput, handleInputChange] = React.useReducer<
    React.Reducer<ShouldShowInputs, InputChange>
  >(
    (_, action) => {
      if (action.field === 'sivilstand') {
        const shouldShowEpsHarPensjon =
          action.value === 'GIFT' ||
          action.value === 'REGISTRERT_PARTNER' ||
          action.value === 'SAMBOER'
        return {
          epsHarPensjon: shouldShowEpsHarPensjon,
          epsHarInntektOver2G: false,
        }
      } else if (action.field === 'epsHarPensjon') {
        const shouldShowEpsHarInntektOver2G = action.value === 'nei'
        return {
          epsHarInntektOver2G: shouldShowEpsHarInntektOver2G,
          epsHarPensjon: true,
        }
      } else {
        return {
          epsHarInntektOver2G: false,
          epsHarPensjon: false,
        }
      }
    },
    {
      epsHarPensjon:
        sivilstand === 'GIFT' ||
        sivilstand === 'REGISTRERT_PARTNER' ||
        sivilstand === 'SAMBOER',
      epsHarInntektOver2G: epsHarPensjon !== null && epsHarPensjon === false,
    }
  )

  if (shouldRedirectTo) {
    return null
  }

  return (
    <Card hasLargePadding hasMargin>
      <form onSubmit={onSubmit}>
        <Heading level="2" size="medium" spacing>
          <FormattedMessage id="stegvisning.sivilstand.title" />
        </Heading>
        <BodyLong size="large" className={styles.ingress}>
          <FormattedMessage id="stegvisning.sivilstand.ingress_1" />
          {formatertSivilstand}
          <FormattedMessage id="stegvisning.sivilstand.ingress_2" />
        </BodyLong>
        <Select
          name="sivilstand"
          defaultValue={sivilstand}
          label={intl.formatMessage({
            id: `stegvisning.sivilstand.select_label`,
          })}
          description={intl.formatMessage({
            id: `stegvisning.sivilstand.select_description`,
          })}
          onChange={(e) =>
            handleInputChange({
              field: 'sivilstand',
              value: e.target.value as UtvidetSivilstand,
            })
          }
        >
          {sivilstandOptions.map((option) => (
            <option key={option} value={option}>
              {intl.formatMessage({
                id: `sivilstand.${option}`,
              })}
            </option>
          ))}
        </Select>
        {shouldShowInput.epsHarPensjon && (
          <RadioGroup
            legend={
              <FormattedMessage id="stegvisning.sivilstand.radio_epsHarPensjon_label" />
            }
            description={intl.formatMessage({
              id: 'stegvisning.sivilstand.radio_epsHarPensjon_description',
            })}
            name="epsHarPensjon"
            defaultValue={
              epsHarPensjon === null ? '' : epsHarPensjon ? 'ja' : 'nei'
            }
            onChange={(value) =>
              handleInputChange({ field: 'epsHarPensjon', value })
            }
            className={styles.radiogroup}
            //error={validationError}
            role="radiogroup"
            aria-required="true"
          >
            <Radio value="ja">
              <FormattedMessage id="stegvisning.sivilstand.radio_ja" />
            </Radio>
            <Radio value="nei">
              <FormattedMessage id="stegvisning.sivilstand.radio_nei" />
            </Radio>
          </RadioGroup>
        )}
        {shouldShowInput.epsHarInntektOver2G && (
          <RadioGroup
            legend={
              <FormattedMessage id="stegvisning.sivilstand.radio_epsHarInntektOver2G_label" />
            }
            description={intl.formatMessage({
              id: 'stegvisning.sivilstand.radio_epsHarInntektOver2G_description',
            })}
            name="epsHarInntektOver2G"
            defaultValue={
              epsHarInntektOver2G === null
                ? ''
                : epsHarInntektOver2G
                  ? 'ja'
                  : 'nei'
            }
            className={styles.radiogroup}
            //error={validationError}
            role="radiogroup"
            aria-required="true"
          >
            <Radio value="ja">
              <FormattedMessage id="stegvisning.sivilstand.radio_ja" />
            </Radio>
            <Radio value="nei">
              <FormattedMessage id="stegvisning.sivilstand.radio_nei" />
            </Radio>
          </RadioGroup>
        )}
        <Button type="submit" className={styles.button}>
          <FormattedMessage id="stegvisning.neste" />
        </Button>
        <Button
          type="button"
          className={styles.button}
          variant="secondary"
          onClick={wrapLogger('button klikk', {
            tekst: `Tilbake fra ${paths.sivilstand}`,
          })(onPrevious)}
        >
          <FormattedMessage id="stegvisning.tilbake" />
        </Button>
        {onCancel && (
          <Button
            type="button"
            className={styles.button}
            variant="tertiary"
            onClick={wrapLogger('button klikk', { tekst: 'Avbryt' })(onCancel)}
          >
            <FormattedMessage id="stegvisning.avbryt" />
          </Button>
        )}
      </form>
    </Card>
  )
}

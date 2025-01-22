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
  epsHarInntektOver2G: boolean | null
  epsHarPensjon: boolean | null
  onCancel?: () => void
  onPrevious: () => void
  onNext: (sivilstandData: {
    sivilstand: UtvidetSivilstand
    epsHarPensjon: boolean | null
    epsHarInntektOver2G: boolean | null
  }) => void
}

const convertBooleanToBooleanRadio = (
  input: boolean | null
): BooleanRadio | null => (input !== null ? (input ? 'ja' : 'nei') : null)

const convertBooleanRadioToBoolean = (
  input: BooleanRadio | null
): boolean | null => {
  if (input === null) {
    return null
  }
  return input === 'ja' ? true : false
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

  const getSivilstandTekst = (sivilstandTekst: UtvidetSivilstand) => {
    switch (sivilstandTekst) {
      case 'GIFT':
        console.log('KOM INN 1')
        return 'ektefellen'
      case 'REGISTRERT_PARTNER':
        console.log('KOM INN 2')
        return 'partneren'
      case 'SAMBOER':
        console.log('KOM INN 3')
        return 'samboeren'
    }
  }

  const [sivilstandInput, setSivilstandInput] = useState(sivilstand)
  const [epsHarPensjonInput, setEpsharPensjonInput] = useState(
    convertBooleanToBooleanRadio(epsHarPensjon)
  )
  const [epsHarInntektOver2GInput, setEpsHarInntektOver2GInput] = useState(
    convertBooleanToBooleanRadio(epsHarInntektOver2G)
  )

  React.useEffect(() => {
    if (shouldRedirectTo) {
      navigate(shouldRedirectTo)
    }
  }, [shouldRedirectTo])

  const formatertSivilstand = useMemo(
    () => formatSivilstand(intl, sivilstand).toLowerCase(),
    [sivilstand]
  )

  const shouldShowInput = React.useMemo(() => {
    const shouldShowEpsHarPensjon =
      sivilstandInput === 'GIFT' ||
      sivilstandInput === 'REGISTRERT_PARTNER' ||
      sivilstandInput === 'SAMBOER'

    const shouldShowEpsHarInntektOver2G =
      shouldShowEpsHarPensjon && epsHarPensjonInput === 'nei'

    return {
      epsHarPensjon: shouldShowEpsHarPensjon,
      epsHarInntektOver2G: shouldShowEpsHarInntektOver2G,
    }
  }, [sivilstandInput, epsHarPensjonInput])

  const onSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    if (!sivilstandInput) {
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
      logger('button klikk', {
        tekst: `Neste fra ${paths.sivilstand}`,
      })

      // TODO: Konverter til true/false før submit
      onNext({
        sivilstand: sivilstandInput,
        epsHarPensjon: shouldShowInput.epsHarPensjon
          ? convertBooleanRadioToBoolean(epsHarPensjonInput)
          : null,
        epsHarInntektOver2G: shouldShowInput.epsHarInntektOver2G
          ? convertBooleanRadioToBoolean(epsHarInntektOver2GInput)
          : null,
      })
    }
  }

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
          value={sivilstandInput}
          onChange={(e) =>
            setSivilstandInput(e.target.value as UtvidetSivilstand)
          }
          label={intl.formatMessage({
            id: `stegvisning.sivilstand.select_label`,
          })}
          description={intl.formatMessage({
            id: `stegvisning.sivilstand.select_description`,
          })}
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
            legend={intl.formatMessage(
              { id: 'stegvisning.sivilstand.radio_epsHarPensjon_label' },
              { sivilstand: getSivilstandTekst(sivilstandInput) }
            )}
            /* legend={
              <FormattedMessage id="stegvisning.sivilstand.radio_epsHarPensjon_label" />
            } */
            description={intl.formatMessage({
              id: 'stegvisning.sivilstand.radio_epsHarPensjon_description',
            })}
            name="epsHarPensjon"
            value={epsHarPensjonInput}
            onChange={(value) => setEpsharPensjonInput(value)}
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
            legend={intl.formatMessage(
              { id: 'stegvisning.sivilstand.radio_epsHarPensjon_label' },
              { sivilstand: getSivilstandTekst(sivilstandInput) }
            )}
            /* legend={
              <FormattedMessage id="stegvisning.sivilstand.radio_epsHarInntektOver2G_label" />
            } */
            description={intl.formatMessage({
              id: 'stegvisning.sivilstand.radio_epsHarInntektOver2G_description',
            })}
            value={epsHarInntektOver2GInput}
            onChange={(value) => setEpsHarInntektOver2GInput(value)}
            name="epsHarInntektOver2G"
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

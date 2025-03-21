import React, { FormEvent, useMemo, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import {
  BodyLong,
  Button,
  Heading,
  Radio,
  RadioGroup,
  Select,
  VStack,
} from '@navikt/ds-react'

import { STEGVISNING_FORM_NAMES } from '../utils'
import { Card } from '@/components/common/Card'
import { paths } from '@/router/constants'
import { formatInntekt } from '@/utils/inntekt'
import { logger, wrapLogger } from '@/utils/logging'
import {
  convertBooleanRadioToBoolean,
  convertBooleanToBooleanRadio,
} from '@/utils/radio'
import {
  sivilstandOptions,
  formatSivilstand,
  getSivilstandTekst,
  isSivilstandUkjent,
} from '@/utils/sivilstand'

import styles from './Sivilstand.module.scss'

interface Props {
  sivilstandFolkeregister: Sivilstand
  grunnbelop?: number
  sivilstand: Sivilstand
  epsHarInntektOver2G: boolean | null
  epsHarPensjon: boolean | null
  onCancel?: () => void
  onPrevious: () => void
  onNext: (sivilstandData: {
    sivilstand: Sivilstand
    epsHarPensjon: boolean | null
    epsHarInntektOver2G: boolean | null
  }) => void
}

export function Sivilstand({
  sivilstandFolkeregister,
  grunnbelop,
  sivilstand,
  epsHarInntektOver2G,
  epsHarPensjon,
  onCancel,
  onPrevious,
  onNext,
}: Props) {
  const intl = useIntl()
  const [validationError, setValidationError] = useState<{
    sivilstand?: string
    epsHarPensjon?: string
    epsHarInntektOver2G?: string
  }>({
    sivilstand: undefined,
    epsHarPensjon: undefined,
    epsHarInntektOver2G: undefined,
  })

  const [sivilstandInput, setSivilstandInput] = useState(sivilstand)
  const [epsHarPensjonInput, setEpsHarPensjonInput] = useState(
    convertBooleanToBooleanRadio(epsHarPensjon)
  )
  const [epsHarInntektOver2GInput, setEpsHarInntektOver2GInput] = useState(
    convertBooleanToBooleanRadio(epsHarInntektOver2G)
  )

  const formatertSivilstand = useMemo(
    () => formatSivilstand(intl, sivilstandFolkeregister).toLowerCase(),
    [sivilstandFolkeregister]
  )

  const shouldShowInput = React.useMemo(() => {
    const shouldShowEpsHarPensjon =
      sivilstandInput === 'GIFT' ||
      sivilstandInput === 'REGISTRERT_PARTNER' ||
      sivilstandInput === 'SAMBOER'

    const shouldShowEpsHarInntektOver2G =
      shouldShowEpsHarPensjon && epsHarPensjonInput === 'nei'

    if (!shouldShowEpsHarPensjon) {
      setValidationError({
        epsHarPensjon: undefined,
        epsHarInntektOver2G: undefined,
      })
    }

    return {
      epsHarPensjon: shouldShowEpsHarPensjon,
      epsHarInntektOver2G: shouldShowEpsHarInntektOver2G,
    }
  }, [sivilstandInput, epsHarPensjonInput])

  React.useEffect(() => {
    if (sivilstandInput !== null) {
      setValidationError((prev) => ({ ...prev, sivilstand: undefined }))
    }
    if (epsHarPensjonInput !== null) {
      setValidationError((prev) => ({ ...prev, epsHarPensjon: undefined }))
    }
    if (epsHarInntektOver2GInput !== null) {
      setValidationError((prev) => ({
        ...prev,
        epsHarInntektOver2G: undefined,
      }))
    }
  }, [sivilstandInput, epsHarPensjonInput, epsHarInntektOver2GInput])

  const onSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    const sivilstand_validationText = intl.formatMessage({
      id: 'stegvisning.sivilstand.select_validation_error',
    })
    const epsHarPensjon_validationText = intl.formatMessage(
      { id: 'stegvisning.sivilstand.epsHarPensjon.validation_error' },
      { sivilstand: getSivilstandTekst(intl, sivilstandInput) }
    )
    const epsHarInntektOver2G_validationText = intl.formatMessage(
      { id: 'stegvisning.sivilstand.epsHarInntektOver2G.validation_error' },
      { sivilstand: getSivilstandTekst(intl, sivilstandInput) }
    )
    if (
      isSivilstandUkjent(sivilstandInput) ||
      (shouldShowInput.epsHarPensjon && epsHarPensjonInput === null) ||
      (shouldShowInput.epsHarInntektOver2G && epsHarInntektOver2GInput === null)
    ) {
      const validationErrorText = {
        sivilstand: isSivilstandUkjent(sivilstandInput)
          ? sivilstand_validationText
          : undefined,
        epsHarPensjon:
          shouldShowInput.epsHarPensjon && epsHarPensjonInput === null
            ? epsHarPensjon_validationText
            : undefined,
        epsHarInntektOver2G:
          shouldShowInput.epsHarInntektOver2G &&
          epsHarInntektOver2GInput === null
            ? epsHarInntektOver2G_validationText
            : undefined,
      }
      setValidationError(validationErrorText)
      if (validationErrorText.epsHarPensjon) {
        logger('skjema validering feilet', {
          skjemanavn: STEGVISNING_FORM_NAMES.sivilstand,
          data: intl.formatMessage({
            id: 'stegvisning.sivilstand.radio_epsHarPensjon_label',
          }),
          tekst: validationErrorText.epsHarPensjon,
        })
      }
      if (validationErrorText.epsHarInntektOver2G) {
        logger('skjema validering feilet', {
          skjemanavn: STEGVISNING_FORM_NAMES.sivilstand,
          data: intl.formatMessage({
            id: 'stegvisning.sivilstand.radio_epsHarInntektOver2G_label',
          }),
          tekst: validationErrorText.epsHarInntektOver2G,
        })
      }
      return
    }

    logger('button klikk', {
      tekst: `Neste fra ${paths.sivilstand}`,
    })

    setValidationError({
      epsHarPensjon: undefined,
      epsHarInntektOver2G: undefined,
    })

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

  return (
    <Card hasLargePadding hasMargin>
      <form onSubmit={onSubmit}>
        <Heading level="2" size="medium" spacing>
          <FormattedMessage id="stegvisning.sivilstand.title" />
        </Heading>
        <BodyLong size="large" className={styles.ingress}>
          {isSivilstandUkjent(sivilstandFolkeregister) ? (
            <FormattedMessage id="stegvisning.sivilstand.ingress_ukjent" />
          ) : (
            <>
              <FormattedMessage id="stegvisning.sivilstand.ingress_1" />
              {formatertSivilstand}
              <FormattedMessage id="stegvisning.sivilstand.ingress_2" />
            </>
          )}
        </BodyLong>
        <VStack gap="6">
          <Select
            className={styles.selectSivilstand}
            name="sivilstand"
            value={isSivilstandUkjent(sivilstandInput) ? '' : sivilstandInput}
            onChange={(e) => setSivilstandInput(e.target.value as Sivilstand)}
            label={intl.formatMessage({
              id: `stegvisning.sivilstand.select_label`,
            })}
            description={
              isSivilstandUkjent(sivilstand)
                ? intl.formatMessage({
                    id: `stegvisning.sivilstand.select_description_ukjent`,
                  })
                : intl.formatMessage({
                    id: `stegvisning.sivilstand.select_description`,
                  })
            }
            error={validationError.sivilstand}
          >
            {isSivilstandUkjent(sivilstandInput) && (
              <option disabled selected value="">
                {' '}
              </option>
            )}
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
                { sivilstand: getSivilstandTekst(intl, sivilstandInput) }
              )}
              description={intl.formatMessage({
                id: 'stegvisning.sivilstand.radio_epsHarPensjon_description',
              })}
              name="epsHarPensjon"
              value={epsHarPensjonInput}
              onChange={setEpsHarPensjonInput}
              error={validationError.epsHarPensjon}
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
                {
                  id: 'stegvisning.sivilstand.radio_epsHarInntektOver2G_label',
                },
                {
                  sivilstand: getSivilstandTekst(intl, sivilstandInput),
                  grunnbelop: grunnbelop
                    ? ` (${formatInntekt(grunnbelop * 2)} kr)`
                    : '',
                }
              )}
              description={intl.formatMessage({
                id: 'stegvisning.sivilstand.radio_epsHarInntektOver2G_description',
              })}
              value={epsHarInntektOver2GInput}
              onChange={(value) => setEpsHarInntektOver2GInput(value)}
              name="epsHarInntektOver2G"
              error={validationError.epsHarInntektOver2G}
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
        </VStack>
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

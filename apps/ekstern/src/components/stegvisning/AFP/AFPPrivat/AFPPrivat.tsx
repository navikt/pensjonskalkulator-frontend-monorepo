import { SanityReadmore } from '@pensjonskalkulator-frontend-monorepo/sanity'
import React, { FormEvent } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { BodyLong, Heading, Radio, RadioGroup } from '@navikt/ds-react'
import { Events } from '@navikt/nav-dekoratoren-moduler'

import { Card } from '@/components/common/Card'
import { paths } from '@/router/constants'
import { logger } from '@/utils/logging'

import Navigation from '../../Navigation/Navigation'
import { STEGVISNING_FORM_NAMES } from '../../utils'

import styles from '../AFP.module.scss'

interface Props {
  previousAfp: AfpRadio | null
  onCancel?: () => void
  onPrevious: () => void
  onNext: (afpInput: AfpRadio) => void
}

export function AFPPrivat({
  previousAfp,
  onCancel,
  onPrevious,
  onNext,
}: Props) {
  const intl = useIntl()

  const [validationError, setValidationError] = React.useState<string>()

  const onSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const afpInput = formData.get('afp') as AfpRadio | null

    if (!afpInput) {
      const tekst = intl.formatMessage({
        id: 'stegvisning.afpPrivat.validation_error',
      })
      setValidationError(tekst)
      logger(Events.SKJEMA_VALIDERING_FEILET, {
        skjemanavn: STEGVISNING_FORM_NAMES.afp,
      })
    } else {
      logger.custom('radiogroup valgt', {
        tekst: 'Rett til AFP',
        valg: afpInput,
      })
      // TODO: fjern når amplitude er ikke i bruk lenger
      logger.custom('button klikk', { tekst: `Neste fra ${paths.afp}` })
      logger(Events.KNAPP_KLIKKET, {
        tekst: `Neste fra ${paths.afp}`,
      })
      onNext(afpInput)
    }
  }

  return (
    <Card hasLargePadding hasMargin data-testid="afp-privat">
      <form onSubmit={onSubmit}>
        <Heading
          level="2"
          size="medium"
          spacing
          data-testid="stegvisning.afp.title"
        >
          <FormattedMessage id="stegvisning.afpPrivat.title" />
        </Heading>

        <BodyLong size="large">
          <FormattedMessage id="stegvisning.afp.ingress" />
        </BodyLong>

        <SanityReadmore
          id="om_livsvarig_AFP_i_privat_sektor"
          className={styles.readmorePrivat}
        />

        <RadioGroup
          className={styles.radiogroup}
          legend={<FormattedMessage id="stegvisning.afpPrivat.radio_label" />}
          name="afp"
          data-testid="stegvisning.afpPrivat.radio_label"
          defaultValue={previousAfp}
          onChange={() => setValidationError('')}
          error={validationError}
        >
          <Radio value="ja_privat">
            <FormattedMessage id="stegvisning.radio_ja" />
          </Radio>
          <Radio value="nei">
            <FormattedMessage id="stegvisning.radio_nei" />
          </Radio>
        </RadioGroup>

        <Navigation onPrevious={onPrevious} onCancel={onCancel} />
      </form>
    </Card>
  )
}

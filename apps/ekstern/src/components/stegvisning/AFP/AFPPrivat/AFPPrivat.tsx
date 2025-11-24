import React, { FormEvent } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { BodyLong, Heading, Radio, RadioGroup } from '@navikt/ds-react'

import { Card } from '@/components/common/Card'
import { SanityReadmore } from '@/components/common/SanityReadmore'
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
      logger('skjemavalidering feilet', {
        skjemanavn: STEGVISNING_FORM_NAMES.afp,
        data: intl.formatMessage({
          id: 'stegvisning.afp.radio_label',
        }),
        tekst,
      })
    } else {
      logger('radiogroup valgt', {
        tekst: 'Rett til AFP',
        valg: afpInput,
      })
      // TODO: fjern når amplitude er ikke i bruk lenger
      logger('button klikk', { tekst: `Neste fra ${paths.afp}` })
      logger('knapp klikket', {
        tekst: `Neste fra ${paths.afp}`,
      })
      onNext(afpInput)
    }
  }

  return (
    <Card hasLargePadding hasMargin data-testid="afp-privat">
      <form onSubmit={onSubmit}>
        <Heading level="2" size="medium" spacing>
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

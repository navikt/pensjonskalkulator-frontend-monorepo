import React, { FormEvent } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { BodyLong, Heading, Radio, RadioGroup } from '@navikt/ds-react'

import { Card } from '@/components/common/Card'
import { ReadMore } from '@/components/common/ReadMore'
import { SanityReadmore } from '@/components/common/SanityReadmore'
import { paths } from '@/router/constants'
import { logger } from '@/utils/logging'

import Navigation from '../../Navigation/Navigation'
import { STEGVISNING_FORM_NAMES } from '../../utils'
import AFPRadioGroup from '../AFPRadiogroup'

import styles from '../AFP.module.scss'

interface Props {
  previousAfp: AfpRadio | null
  previousAfpUtregningValg: AfpUtregningValg
  onCancel?: () => void
  onPrevious: () => void
  onNext: (afpInput: AfpRadio, afpUtregningValg?: AfpUtregningValg) => void
}

export function AFPOvergangskullUtenAP({
  previousAfp,
  previousAfpUtregningValg,
  onCancel,
  onPrevious,
  onNext,
}: Props) {
  const intl = useIntl()

  const [validationError, setValidationError] = React.useState({
    afp: '',
    skalBeregneAfp: '',
  })
  const [showVetIkkeAlert, setShowVetIkkeAlert] = React.useState<boolean>(
    previousAfp === 'vet_ikke'
  )
  const [jaAFPOffentlig, setJaAFPOffentlig] = React.useState<boolean>(
    previousAfp === 'ja_offentlig'
  )

  const onSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const afpInput = formData.get('afp') as AfpRadio | null
    const simuleringstypeInput = formData.get(
      'skalBeregneAfp'
    ) as AfpUtregningValg

    if (!afpInput) {
      const errorMessage = intl.formatMessage({
        id: 'stegvisning.afp.validation_error',
      })
      setValidationError((prev) => ({ ...prev, afp: errorMessage }))
      logger('skjema validering feilet', {
        skjemanavn: STEGVISNING_FORM_NAMES.afp,
        data: intl.formatMessage({
          id: 'stegvisning.afp.radio_label',
        }),
        tekst: errorMessage,
      })
    } else if (jaAFPOffentlig && !simuleringstypeInput) {
      const errorMessage = intl.formatMessage({
        id: 'stegvisning.afpOverganskull.validation_error',
      })
      setValidationError((prev) => ({
        ...prev,
        skalBeregneAfp: errorMessage,
      }))
      logger('skjema validering feilet', {
        skjemanavn: STEGVISNING_FORM_NAMES.afp,
        data: intl.formatMessage({
          id: 'stegvisning.afp.radio_label',
        }),
        tekst: errorMessage,
      })
    } else {
      logger('radiogroup valgt', {
        tekst: 'Rett til AFP',
        valg: afpInput,
      })
      logger('button klikk', {
        tekst: `Neste fra ${paths.afp}`,
      })

      if (
        !jaAFPOffentlig &&
        simuleringstypeInput === 'AFP_ETTERFULGT_AV_ALDERSPENSJON'
      ) {
        onNext(afpInput, null)
      } else {
        onNext(afpInput, simuleringstypeInput)
      }
    }
  }

  const handleRadioChange = (value: AfpRadio): void => {
    setValidationError((prev) => ({ ...prev, afp: '' }))
    setShowVetIkkeAlert(value === 'vet_ikke')
    setJaAFPOffentlig(value === 'ja_offentlig')
    if (value === 'vet_ikke') {
      logger('alert vist', {
        tekst: 'Rett til AFP: Vet ikke',
        variant: 'info',
      })
    }
  }

  return (
    <Card hasLargePadding hasMargin data-testid="afp-overganskull">
      <form onSubmit={onSubmit}>
        <Heading level="2" size="medium" spacing>
          <FormattedMessage id="stegvisning.afp.title" />
        </Heading>

        <BodyLong size="large">
          <FormattedMessage id="stegvisning.afp.ingress" />
        </BodyLong>

        <ReadMore
          name="Avtalefestet pensjon i offentlig sektor"
          className={styles.readmoreOffentlig}
          header={
            <FormattedMessage id="stegvisning.afpOvergangskull.readmore_offentlig_title" />
          }
        >
          <FormattedMessage id="stegvisning.afp.readmore_offentlig_list_title" />
          <ul className={styles.list}>
            <li>
              <FormattedMessage id="stegvisning.afpOvergangskull.readmore_offentlig_list_item1" />
            </li>
            <li>
              <FormattedMessage id="stegvisning.afpOvergangskull.readmore_offentlig_list_item2" />
            </li>
            <li>
              <FormattedMessage id="stegvisning.afpOvergangskull.readmore_offentlig_list_item3" />
            </li>
          </ul>
          <FormattedMessage id="stegvisning.afpOvergangskull.readmore_offentlig_ingress" />
        </ReadMore>

        <SanityReadmore
          id="om_livsvarig_AFP_i_privat_sektor"
          className={styles.readmorePrivat}
        />

        <AFPRadioGroup
          afp={previousAfp}
          handleRadioChange={handleRadioChange}
          validationError={validationError.afp}
          showVetIkkeAlert={showVetIkkeAlert}
        />

        {jaAFPOffentlig && (
          <RadioGroup
            className={styles.radiogroup}
            legend={
              <FormattedMessage id="stegvisning.afp.overgangskullUtenAP.radio_label" />
            }
            name="skalBeregneAfp"
            defaultValue={previousAfpUtregningValg}
            onChange={() => setValidationError({ afp: '', skalBeregneAfp: '' })}
            error={validationError.skalBeregneAfp}
          >
            <Radio value="AFP_ETTERFULGT_AV_ALDERSPENSJON">
              <FormattedMessage id="stegvisning.afp.overgangskullUtenAP.radio_ja" />
            </Radio>
            <Radio value="KUN_ALDERSPENSJON">
              <FormattedMessage id="stegvisning.afp.overgangskullUtenAP.radio_nei" />
            </Radio>
          </RadioGroup>
        )}

        <Navigation onPrevious={onPrevious} onCancel={onCancel} />
      </form>
    </Card>
  )
}

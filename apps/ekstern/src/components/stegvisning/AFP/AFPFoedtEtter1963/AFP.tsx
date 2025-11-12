import React, { FormEvent } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { BodyLong, Heading } from '@navikt/ds-react'

import { Card } from '@/components/common/Card'
import { SanityReadmore } from '@/components/common/SanityReadmore'
import { paths } from '@/router/constants'
import { useAppSelector } from '@/state/hooks'
import { selectHasErApotekerError } from '@/state/session/selectors'
import { selectFoedselsdato } from '@/state/userInput/selectors'
import { isFoedtEtter1963 } from '@/utils/alder'
import { logger } from '@/utils/logging'

import Navigation from '../../Navigation/Navigation'
import { STEGVISNING_FORM_NAMES } from '../../utils'
import AFPRadioGroup from '../AFPRadiogroup'

import styles from '../AFP.module.scss'

interface Props {
  previousAfp: AfpRadio | null
  onCancel?: () => void
  onPrevious: () => void
  onNext: (afpInput: AfpRadio) => void
}

export function AFP({ previousAfp, onCancel, onPrevious, onNext }: Props) {
  const intl = useIntl()

  const foedselsdato = useAppSelector(selectFoedselsdato)
  const foedtEtter1963 = isFoedtEtter1963(foedselsdato)
  const hasErApotekerError = useAppSelector(selectHasErApotekerError)

  const [validationError, setValidationError] = React.useState<string>('')
  const [showVetIkkeAlert, setShowVetIkkeAlert] = React.useState<boolean>(
    previousAfp === 'vet_ikke'
  )
  const [showApotekerAlert, setShowApotekerAlert] = React.useState<boolean>(
    Boolean(
      previousAfp === 'ja_offentlig' && foedtEtter1963 && hasErApotekerError
    )
  )

  const onSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const afpInput = formData.get('afp') as AfpRadio | null

    if (!afpInput) {
      const errorMessage = intl.formatMessage({
        id: 'stegvisning.afp.validation_error',
      })
      setValidationError(errorMessage)
      logger('skjemavalidering feilet', {
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
      // TODO: fjern når amplitude er ikke i bruk lenger
      logger('button klikk', { tekst: `Neste fra ${paths.afp}` })
      logger('knapp klikket', {
        tekst: `Neste fra ${paths.afp}`,
      })
      onNext(afpInput)
    }
  }

  const handleRadioChange = (value: AfpRadio): void => {
    setValidationError('')
    setShowVetIkkeAlert(value === 'vet_ikke')

    if (value === 'ja_offentlig' && foedtEtter1963 && hasErApotekerError) {
      setShowApotekerAlert(true)
    } else {
      setShowApotekerAlert(false)
    }
  }

  return (
    <Card hasLargePadding hasMargin data-testid="afp-etter-1963">
      <form onSubmit={onSubmit}>
        <Heading level="2" size="medium" spacing>
          <FormattedMessage id="stegvisning.afp.title" />
        </Heading>

        <BodyLong size="large">
          <FormattedMessage id="stegvisning.afp.ingress" />
        </BodyLong>

        <SanityReadmore
          id="om_livsvarig_AFP_i_offentlig_sektor"
          className={styles.readmoreOffentlig}
        />

        <SanityReadmore
          id="om_livsvarig_AFP_i_privat_sektor"
          className={styles.readmorePrivat}
        />

        <AFPRadioGroup
          afp={previousAfp}
          handleRadioChange={handleRadioChange}
          validationError={validationError}
          showApotekerAlert={showApotekerAlert}
          showVetIkkeAlert={showVetIkkeAlert}
        />

        <Navigation onPrevious={onPrevious} onCancel={onCancel} />
      </form>
    </Card>
  )
}

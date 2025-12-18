import { FormEvent, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { Alert, BodyLong, Heading, Radio, RadioGroup } from '@navikt/ds-react'

import { ApotekereWarning } from '@/components/common/ApotekereWarning/ApotekereWarning'
import { Card } from '@/components/common/Card'
import { SanityReadmore } from '@/components/common/SanityReadmore/SanityReadmore'
import { paths } from '@/router/constants'
import { useAppSelector } from '@/state/hooks'
import { selectHasErApotekerError } from '@/state/session/selectors'
import {
  selectAfp,
  selectFoedselsdato,
  selectLoependeVedtak,
  selectSkalBeregneAfpKap19,
} from '@/state/userInput/selectors'
import { isFoedtEtter1963 } from '@/utils/alder'
import { ALERT_VIST } from '@/utils/loggerConstants'
import { logger } from '@/utils/logging'
import { getFormatMessageValues } from '@/utils/translations'

import Navigation from '../Navigation/Navigation'
import { STEGVISNING_FORM_NAMES } from '../utils'

import styles from './SamtykkePensjonsavtaler.module.scss'

interface Props {
  harSamtykket: boolean | null
  onCancel?: () => void
  onPrevious: () => void
  onNext: (samtykkeData: BooleanRadio) => void
  erApoteker: boolean
  isKap19: boolean
}

export function SamtykkePensjonsavtaler({
  harSamtykket,
  onCancel,
  onPrevious,
  onNext,
  erApoteker,
  isKap19,
}: Props) {
  const intl = useIntl()

  const foedselsdato = useAppSelector(selectFoedselsdato)
  const foedtEtter1963 = isFoedtEtter1963(foedselsdato)
  const loependeVedtak = useAppSelector(selectLoependeVedtak)
  const skalBeregneAfpKap19 = useAppSelector(selectSkalBeregneAfpKap19)
  const hasErApotekerError = useAppSelector(selectHasErApotekerError)
  const afp = useAppSelector(selectAfp)

  const [validationError, setValidationError] = useState<string>('')

  const [jaPensjonsavtaler, setJaPensjonsavtaler] = useState<boolean>(
    harSamtykket ?? true
  )

  const onSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault()

    const data = new FormData(e.currentTarget)
    const samtykkeData = data.get('samtykke') as BooleanRadio | undefined

    if (!samtykkeData) {
      const tekst = intl.formatMessage({
        id: 'stegvisning.samtykke_pensjonsavtaler.validation_error',
      })
      setValidationError(tekst)
      logger('skjemavalidering feilet', {
        skjemanavn: STEGVISNING_FORM_NAMES.samtykkePensjonsavtaler,
        data: intl.formatMessage({
          id: 'stegvisning.samtykke_pensjonsavtaler.radio_label',
        }),
        tekst,
      })
    } else {
      logger('radiogroup valgt', {
        tekst: 'Samtykke',
        valg: samtykkeData,
      })
      // TODO: fjern når amplitude er ikke i bruk lenger
      logger('button klikk', { tekst: `Neste fra ${paths.samtykke}` })
      logger('knapp klikket', {
        tekst: `Neste fra ${paths.samtykke}`,
      })
      onNext(samtykkeData)
    }
  }

  const handleRadioChange = (value: string): void => {
    setValidationError('')
    setJaPensjonsavtaler(value === 'ja')
    if (
      !loependeVedtak?.harLoependeVedtak &&
      skalBeregneAfpKap19 &&
      value === 'ja'
    ) {
      logger(ALERT_VIST, {
        tekst:
          'Er du medlem av SPK, kan du få en mer fullstendig beregning av AFP hvis du samtykker.',
        variant: 'info',
      })
    }
  }

  return (
    <Card hasLargePadding hasMargin>
      <ApotekereWarning
        showWarning={Boolean(
          afp === 'ja_offentlig' && hasErApotekerError && foedtEtter1963
        )}
      />

      <form onSubmit={onSubmit}>
        <Heading
          level="2"
          size="medium"
          spacing
          data-testid="stegvisning.samtykke_pensjonsavtaler.title"
        >
          <FormattedMessage id="stegvisning.samtykke_pensjonsavtaler.title" />
        </Heading>
        <BodyLong size="large">
          <FormattedMessage
            id="stegvisning.samtykke_pensjonsavtaler.ingress"
            values={getFormatMessageValues()}
          />
        </BodyLong>

        {(isKap19 &&
          (loependeVedtak?.ufoeretrygd.grad ||
            loependeVedtak?.pre2025OffentligAfp)) ||
        erApoteker ? (
          <>
            <SanityReadmore
              id="dette_henter_vi_NP"
              className={styles.readmoreOffentlig}
            />
            <SanityReadmore
              id="dette_sjekker_vi_OFTP"
              data-testid="dette_sjekker_vi_OFTP"
              className={styles.readmorePrivat}
            />
          </>
        ) : (
          <>
            <SanityReadmore
              id="dette_henter_vi_OFTP"
              data-testid="dette_henter_vi_OFTP"
              className={styles.readmoreOffentlig}
            />
            <SanityReadmore
              id="dette_henter_vi_NP"
              className={styles.readmorePrivat}
            />
          </>
        )}

        <RadioGroup
          legend={
            <FormattedMessage id="stegvisning.samtykke_pensjonsavtaler.radio_label" />
          }
          description={
            <FormattedMessage id="stegvisning.samtykke_pensjonsavtaler.radio_description" />
          }
          name="samtykke"
          data-testid="stegvisning.samtykke_pensjonsavtaler.radio_label"
          defaultValue={
            harSamtykket ? 'ja' : harSamtykket === false ? 'nei' : null
          }
          onChange={handleRadioChange}
          error={validationError}
        >
          <Radio value="ja">
            <FormattedMessage id="stegvisning.samtykke_pensjonsavtaler.radio_ja" />
          </Radio>
          <Radio value="nei">
            <FormattedMessage id="stegvisning.samtykke_pensjonsavtaler.radio_nei" />
          </Radio>
        </RadioGroup>
        {!loependeVedtak?.harLoependeVedtak &&
          skalBeregneAfpKap19 &&
          jaPensjonsavtaler === false && (
            <Alert
              data-testid="samtykke-pensjonsavtaler-alert"
              className={styles.pensjonsavtaleAlert as string}
              variant="info"
              size="medium"
            >
              <FormattedMessage
                id="stegvisning.samtykke_pensjonsavtaler.alert"
                values={{
                  ...getFormatMessageValues(),
                }}
              />
            </Alert>
          )}

        <Navigation onPrevious={onPrevious} onCancel={onCancel} />
      </form>
    </Card>
  )
}

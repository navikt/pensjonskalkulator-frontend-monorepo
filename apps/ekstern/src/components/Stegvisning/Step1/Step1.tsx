import { FormattedMessage } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import {
  BodyLong,
  Button,
  Heading,
  Radio,
  RadioGroup,
  ReadMore,
} from '@navikt/ds-react'

import { useAppDispatch, useAppSelector } from '@/state/hooks'
import { selectSamtykke } from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputReducer'

import styles from './Step1.module.scss'

export function Step1() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const harSamtykket = useAppSelector(selectSamtykke)

  const onCancelClick = (): void => {
    dispatch(userInputActions.flush())
    navigate('/')
  }

  const onPreviousClick = (): void => {
    dispatch(userInputActions.flush())
    navigate('/stegvisning/0')
  }

  const onNextClick = (): void => {
    // TODO legge til kall for å sjekke TPO
    navigate('/stegvisning/2')
  }

  const handleRadioChange = (val: string): void => {
    dispatch(userInputActions.setSamtykke(val === 'ja'))
  }

  return (
    <section className={styles.section}>
      <Heading size="large" level="2" spacing>
        <FormattedMessage id="stegvisning.steg1.title" />
      </Heading>
      <BodyLong>
        <FormattedMessage id="stegvisning.steg1.ingress" />
      </BodyLong>
      <ReadMore
        className={styles.readmore}
        header={<FormattedMessage id="stegvisning.steg1.readmore_title" />}
      >
        <FormattedMessage id="stegvisning.steg1.readmore_ingress" />
        <br />
        <br />
        <FormattedMessage id="stegvisning.steg1.readmore_list_title" />
        <ul>
          <li>
            <FormattedMessage id="stegvisning.steg1.readmore_list_item1" />
          </li>
          <li>
            <FormattedMessage id="stegvisning.steg1.readmore_list_item2" />
          </li>
          <li>
            <FormattedMessage id="stegvisning.steg1.readmore_list_item3" />
          </li>
        </ul>
      </ReadMore>

      {
        // TODO Validering. Bør brukeren bli hindret til å gå videre uten å ha valgt noe?
      }
      <RadioGroup
        legend={<FormattedMessage id="stegvisning.steg1.radio_label" />}
        value={harSamtykket ? 'ja' : harSamtykket === false ? 'nei' : null}
        onChange={(val) => handleRadioChange(val)}
        // required
      >
        <Radio value="ja">
          <FormattedMessage id="stegvisning.steg1.radio_ja" />
        </Radio>
        <Radio value="nei">
          <FormattedMessage id="stegvisning.steg1.radio_nei" />
        </Radio>
      </RadioGroup>

      <Button className={styles.button} onClick={onNextClick}>
        <FormattedMessage id="stegvisning.neste" />
      </Button>
      <Button
        className={styles.button}
        variant="secondary"
        onClick={onPreviousClick}
      >
        <FormattedMessage id="stegvisning.tilbake" />
      </Button>
      <Button variant="tertiary" onClick={onCancelClick}>
        <FormattedMessage id="stegvisning.avbryt" />
      </Button>
    </section>
  )
}

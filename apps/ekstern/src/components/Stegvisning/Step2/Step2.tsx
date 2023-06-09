import { FormEvent, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import {
  BodyLong,
  Button,
  Heading,
  Radio,
  RadioGroup,
  ReadMore,
} from '@navikt/ds-react'

import { apiSlice } from '@/state/api/apiSlice'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import { selectSamtykke } from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputReducer'

import styles from './Step2.module.scss'

export function Step2() {
  const intl = useIntl()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const harSamtykket = useAppSelector(selectSamtykke)

  const [validationError, setValidationError] = useState('')

  const onSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault()

    const data = new FormData(e.currentTarget)
    const samtykke = data.get('samtykke')

    if (!samtykke) {
      setValidationError(
        intl.formatMessage({ id: 'stegvisning.steg2.validation_error' })
      )
    } else {
      if (samtykke === 'ja') {
        dispatch(apiSlice.endpoints.getPensjonsavtaler.initiate())
      }
      navigate('/stegvisning/3')
    }
  }

  const onCancelClick = (): void => {
    dispatch(userInputActions.flush())
    navigate('/')
  }

  const onPreviousClick = (): void => {
    dispatch(userInputActions.flush())
    navigate('/stegvisning/1')
  }

  const handleRadioChange = (val: string): void => {
    setValidationError('')
    dispatch(userInputActions.setSamtykke(val === 'ja'))
  }

  return (
    <form onSubmit={onSubmit}>
      <section className={styles.section}>
        <Heading size="large" level="2" spacing>
          <FormattedMessage id="stegvisning.steg2.title" />
        </Heading>
        <BodyLong>
          <FormattedMessage id="stegvisning.steg2.ingress" />
        </BodyLong>
        <ReadMore
          className={styles.readmore}
          header={<FormattedMessage id="stegvisning.steg2.readmore_title" />}
        >
          <FormattedMessage id="stegvisning.steg2.readmore_ingress" />
          <br />
          <br />
          <FormattedMessage id="stegvisning.steg2.readmore_list_title" />
          <ul>
            <li>
              <FormattedMessage id="stegvisning.steg2.readmore_list_item1" />
            </li>
            <li>
              <FormattedMessage id="stegvisning.steg2.readmore_list_item2" />
            </li>
            <li>
              <FormattedMessage id="stegvisning.steg2.readmore_list_item3" />
            </li>
          </ul>
        </ReadMore>

        <RadioGroup
          legend={<FormattedMessage id="stegvisning.steg2.radio_label" />}
          name={'samtykke'}
          value={harSamtykket ? 'ja' : harSamtykket === false ? 'nei' : null}
          onChange={(val) => handleRadioChange(val)}
          error={validationError}
        >
          <Radio value="ja">
            <FormattedMessage id="stegvisning.steg2.radio_ja" />
          </Radio>
          <Radio value="nei">
            <FormattedMessage id="stegvisning.steg2.radio_nei" />
          </Radio>
        </RadioGroup>

        <Button type={'submit'} className={styles.button}>
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
    </form>
  )
}

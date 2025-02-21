import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { BodyLong, Button, Heading, Radio, RadioGroup } from '@navikt/ds-react'
import { PortableText } from '@portabletext/react'

import { Card } from '@/components/common/Card'
import { Divider } from '@/components/common/Divider'
import { ReadMore } from '@/components/common/ReadMore'
import { UtenlandsoppholdListe } from '@/components/UtenlandsoppholdListe/UtenlandsoppholdListe'
import { SanityContext } from '@/context/SanityContext'
import { paths } from '@/router/constants'
import { useGetSanityFeatureToggleQuery } from '@/state/api/apiSlice'
import { useAppSelector } from '@/state/hooks'
import { selectCurrentSimulationUtenlandsperioder } from '@/state/userInput/selectors'
import { wrapLogger } from '@/utils/logging'
import { getSanityPortableTextComponents } from '@/utils/sanity'
import { getFormatMessageValues } from '@/utils/translations'

import { onSubmit } from './utils'

import styles from './Utenlandsopphold.module.scss'

interface Props {
  harUtenlandsopphold: boolean | null
  onCancel?: () => void
  onPrevious: () => void
  onNext: (utenlandsoppholdData: BooleanRadio) => void
}

export function Utenlandsopphold({
  harUtenlandsopphold,
  onCancel,
  onPrevious,
  onNext,
}: Props) {
  const intl = useIntl()

  const { readMoreData } = React.useContext(SanityContext)
  const readMore1 = readMoreData['hva_er_opphold_utenfor_norge']
  const readMore2 = readMoreData['betydning_av_opphold_utenfor_norge']

  const { data: sanityFeatureToggle } = useGetSanityFeatureToggleQuery()

  const utenlandsperioder = useAppSelector(
    selectCurrentSimulationUtenlandsperioder
  )

  const [validationErrors, setValidationErrors] = React.useState<
    Record<'top' | 'bottom', string>
  >({
    top: '',
    bottom: '',
  })

  const [showUtenlandsperioder, setShowUtenlandsperioder] =
    React.useState<boolean>(!!harUtenlandsopphold)

  React.useEffect(() => {
    if (validationErrors.bottom && utenlandsperioder.length > 0) {
      setValidationErrors((prevState) => {
        return {
          ...prevState,
          bottom: '',
        }
      })
    }
  }, [utenlandsperioder])

  const handleRadioChange = (value: BooleanRadio): void => {
    setShowUtenlandsperioder(value === 'ja')
    setValidationErrors({ top: '', bottom: '' })
  }

  return (
    <Card hasLargePadding hasMargin>
      <form
        id="har-utenlandsopphold"
        onSubmit={(e) => {
          e.preventDefault()
          const data = new FormData(e.currentTarget)
          onSubmit(
            data.get('har-utenlandsopphold-radio'),
            intl,
            setValidationErrors,
            utenlandsperioder.length,
            onNext
          )
        }}
      ></form>
      <Heading level="2" size="medium" spacing>
        <FormattedMessage id="stegvisning.utenlandsopphold.title" />
      </Heading>
      <BodyLong size="large">
        <FormattedMessage id="stegvisning.utenlandsopphold.ingress" />
      </BodyLong>
      {sanityFeatureToggle?.enabled && readMore1 ? (
        <ReadMore
          data-testid={readMore1.name}
          name={readMore1.name}
          header={readMore1.overskrift}
          className={styles.readmore1}
        >
          <PortableText
            value={readMore1.innhold}
            components={{ ...getSanityPortableTextComponents(intl) }}
          />
        </ReadMore>
      ) : (
        <ReadMore
          name="Hva som er opphold utenfor Norge"
          className={styles.readmore1}
          header={
            <FormattedMessage id="stegvisning.utenlandsopphold.readmore_1.title" />
          }
        >
          <FormattedMessage
            id="stegvisning.utenlandsopphold.readmore_1.opphold.subtitle"
            values={{
              ...getFormatMessageValues(intl),
            }}
          />
          <ul>
            <li>
              <FormattedMessage id="stegvisning.utenlandsopphold.readmore_1.opphold.list_item1" />
            </li>
            <li>
              <FormattedMessage id="stegvisning.utenlandsopphold.readmore_1.opphold.list_item2" />
            </li>
          </ul>
          <FormattedMessage
            id="stegvisning.utenlandsopphold.readmore_1.ikke_opphold.subtitle"
            values={{
              ...getFormatMessageValues(intl),
            }}
          />
          <ul>
            <li>
              <FormattedMessage id="stegvisning.utenlandsopphold.readmore_1.ikke_opphold.list_item1" />
            </li>
            <li>
              <FormattedMessage id="stegvisning.utenlandsopphold.readmore_1.ikke_opphold.list_item2" />
            </li>
            <li>
              <FormattedMessage id="stegvisning.utenlandsopphold.readmore_1.ikke_opphold.list_item3" />
            </li>
            <li>
              <FormattedMessage id="stegvisning.utenlandsopphold.readmore_1.ikke_opphold.list_item4" />
            </li>
            <li>
              <FormattedMessage id="stegvisning.utenlandsopphold.readmore_1.ikke_opphold.list_item5" />
            </li>
            <li>
              <FormattedMessage id="stegvisning.utenlandsopphold.readmore_1.ikke_opphold.list_item6" />
            </li>
          </ul>
          <FormattedMessage
            id="stegvisning.utenlandsopphold.readmore_1.ingress"
            values={{
              ...getFormatMessageValues(intl),
            }}
          />
        </ReadMore>
      )}
      {sanityFeatureToggle?.enabled && readMore2 ? (
        <ReadMore
          data-testid={readMore2.name}
          name={readMore2.name}
          header={readMore2.overskrift}
          className={styles.readmore2}
        >
          <PortableText
            value={readMore2.innhold}
            components={{ ...getSanityPortableTextComponents(intl) }}
          />
        </ReadMore>
      ) : (
        <ReadMore
          name="Betydning av opphold utenfor Norge for pensjon"
          className={styles.readmore2}
          header={
            <FormattedMessage id="stegvisning.utenlandsopphold.readmore_2.title" />
          }
        >
          <FormattedMessage
            id="stegvisning.utenlandsopphold.readmore_2.ingress"
            values={{
              ...getFormatMessageValues(intl),
            }}
          />
        </ReadMore>
      )}
      <RadioGroup
        name="har-utenlandsopphold-radio"
        className={styles.radiogroup}
        legend={
          <FormattedMessage id="stegvisning.utenlandsopphold.radio_label" />
        }
        description={
          <FormattedMessage id="stegvisning.utenlandsopphold.radio_label.description" />
        }
        defaultValue={
          harUtenlandsopphold
            ? 'ja'
            : harUtenlandsopphold === false
              ? 'nei'
              : null
        }
        onChange={handleRadioChange}
        error={validationErrors.top}
        role="radiogroup"
        aria-required="true"
      >
        <Radio form="har-utenlandsopphold" value="ja">
          <FormattedMessage id="stegvisning.utenlandsopphold.radio_ja" />
        </Radio>
        <Radio form="har-utenlandsopphold" value="nei">
          <FormattedMessage id="stegvisning.utenlandsopphold.radio_nei" />
        </Radio>
      </RadioGroup>

      {showUtenlandsperioder && (
        <>
          <UtenlandsoppholdListe validationError={validationErrors.bottom} />
          <BodyLong size="medium" className={styles.ingressBottom}>
            <FormattedMessage id="stegvisning.utenlandsopphold.ingress.bottom" />
          </BodyLong>
          <Divider smallMargin />
        </>
      )}

      <Button
        form="har-utenlandsopphold"
        type="submit"
        className={styles.button}
      >
        <FormattedMessage id="stegvisning.neste" />
      </Button>
      <Button
        type="button"
        className={styles.button}
        variant="secondary"
        onClick={wrapLogger('button klikk', {
          tekst: `Tilbake fra ${paths.utenlandsopphold}`,
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
    </Card>
  )
}

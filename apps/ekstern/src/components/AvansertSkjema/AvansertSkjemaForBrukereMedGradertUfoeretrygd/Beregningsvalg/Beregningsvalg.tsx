import { FormattedMessage, useIntl } from 'react-intl'

import { BodyLong, Heading, Radio, RadioGroup } from '@navikt/ds-react'

import { useAppSelector } from '@/state/hooks'
import { selectNedreAldersgrense } from '@/state/userInput/selectors'
import { formatUttaksalder } from '@/utils/alder'
import { getFormatMessageValues } from '@/utils/translations'

import { AVANSERT_FORM_NAMES } from '../../utils'

import styles from './Beregningsvalg.module.scss'

interface Props {
  localBeregningsTypeRadio: Beregningsvalg | null
  onChange: (newBeregningsvalg: Beregningsvalg) => void
}

export const Beregningsvalg = ({
  localBeregningsTypeRadio,
  onChange,
}: Props) => {
  const intl = useIntl()
  const nedreAldersgrense = useAppSelector(selectNedreAldersgrense)

  return (
    <div>
      <RadioGroup
        legend={intl.formatMessage({
          id: 'beregning.avansert.rediger.radio.beregningsvalg.label',
        })}
        role="radiogroup"
        aria-required="true"
        name={AVANSERT_FORM_NAMES.beregningsTypeRadio}
        data-testid={AVANSERT_FORM_NAMES.beregningsTypeRadio}
        value={localBeregningsTypeRadio}
        onChange={onChange}
      >
        <Radio
          form={AVANSERT_FORM_NAMES.form}
          data-testid="uten_afp"
          value="uten_afp"
        >
          <FormattedMessage id="beregning.avansert.rediger.radio.beregningsvalg.uten_afp.label" />
        </Radio>

        <Radio
          form={AVANSERT_FORM_NAMES.form}
          data-testid="med_afp"
          value="med_afp"
        >
          <FormattedMessage
            id="beregning.avansert.rediger.radio.beregningsvalg.med_afp.label"
            values={{
              ...getFormatMessageValues(),
              nedreAldersgrense: formatUttaksalder(intl, nedreAldersgrense),
            }}
          />
        </Radio>
      </RadioGroup>

      {localBeregningsTypeRadio === 'med_afp' && (
        <div className={styles.description}>
          <Heading level="2" size="medium" spacing>
            <FormattedMessage
              id="beregning.avansert.rediger.beregningsvalg.med_afp.title"
              values={{
                ...getFormatMessageValues(),
                nedreAldersgrense: formatUttaksalder(intl, nedreAldersgrense),
              }}
            />
          </Heading>

          <BodyLong>
            <FormattedMessage
              id="beregning.avansert.rediger.beregningsvalg.med_afp.description"
              values={{
                ...getFormatMessageValues(),
                nedreAldersgrense: formatUttaksalder(intl, nedreAldersgrense),
              }}
            />
          </BodyLong>
        </div>
      )}
    </div>
  )
}

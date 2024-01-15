/* c8 ignore start */
import React from 'react'
import { useIntl } from 'react-intl'

import { Select } from '@navikt/ds-react'

import { useTidligsteUttaksalderQuery } from '@/state/api/apiSlice'
import { useAppSelector } from '@/state/hooks'
import {
  selectAfp,
  selectSamboer,
  selectSivilstand,
  selectAarligInntektFoerUttak,
} from '@/state/userInput/selectors'
import { formatUttaksalder } from '@/utils/alder'

import { DEFAULT_TIDLIGST_UTTAKSALDER, getFormaterteAldere } from './utils'

interface Props {
  grad: number
  defaultValue?: Alder
  hasValidationError?: boolean
  onChangeCallback?: (s: string) => void
}

export const TemporaryAlderVelgerAvansert: React.FC<Props> = ({
  grad,
  defaultValue,
  hasValidationError,
  onChangeCallback,
}) => {
  const intl = useIntl()
  const afp = useAppSelector(selectAfp)
  const harSamboer = useAppSelector(selectSamboer)
  const sivilstand = useAppSelector(selectSivilstand)
  const aarligInntektFoerUttak = useAppSelector(selectAarligInntektFoerUttak)

  const [tidligsteUttaksalderRequestBody, setTidligsteUttaksalderRequestBody] =
    React.useState<TidligsteUttaksalderRequestBody | undefined>(undefined)
  const [value, setValue] = React.useState<string | undefined>(
    defaultValue
      ? formatUttaksalder(intl, defaultValue, { compact: true })
      : undefined
  )

  React.useEffect(() => {
    setTidligsteUttaksalderRequestBody({
      sivilstand: sivilstand,
      harEps: harSamboer !== null ? harSamboer : undefined,
      sisteInntekt: aarligInntektFoerUttak ?? 0,
      simuleringstype:
        afp === 'ja_privat' ? 'ALDERSPENSJON_MED_AFP_PRIVAT' : 'ALDERSPENSJON',
    })
  }, [afp, sivilstand, aarligInntektFoerUttak, harSamboer])

  // Hent tidligst mulig uttaksalder
  const {
    data: tidligstMuligUttak,
    isLoading,
    isSuccess,
  } = useTidligsteUttaksalderQuery(tidligsteUttaksalderRequestBody, {
    skip: !tidligsteUttaksalderRequestBody,
  })

  const [showValidationError, setShowValidationError] =
    React.useState<boolean>(true)

  React.useEffect(() => {
    setShowValidationError(true)
  }, [hasValidationError])

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValue(e.target.value)
    ;(prevShowValidationError: boolean) =>
      setShowValidationError(!prevShowValidationError)
    onChangeCallback && onChangeCallback(e.target.value)
  }

  const formaterteAldere = React.useMemo(
    () =>
      getFormaterteAldere(
        intl,
        isSuccess ? tidligstMuligUttak : { ...DEFAULT_TIDLIGST_UTTAKSALDER }
      ),
    [tidligstMuligUttak]
  )

  if (isLoading) {
    return 'LOADING'
  }

  return (
    <div>
      {
        // TODO under avklaring - hvordan skal feil ved henting av tidligste uttaksalder vises?
        /* {isTidligstMuligUttaksalderError && (
          <BodyLong size="medium" className={`${styles.ingress}`}>
            <FormattedMessage
              id="tidligsteuttaksalder.error"
              values={{
                ...getFormatMessageValues(intl),
              }}
            />
          </BodyLong>
        )} */
      }
      <Select
        form="avansert-beregning"
        name={`uttaksalder-${
          grad === 100 ? 'hele-pensjon' : 'gradert-pensjon'
        }`}
        label={`Når vil du ta ut ${grad} % alderspensjon`}
        description={
          isSuccess && tidligstMuligUttak
            ? `Du kan tidligst ta ut ${grad} % alderspensjon når du er ${formatUttaksalder(
                intl,
                tidligstMuligUttak
              )}. Vil du ta ut pensjon tidligere, må du velge lavere uttaksgrad.`
            : ''
        }
        value={value}
        error={
          hasValidationError && showValidationError
            ? 'VALIDATION ERROR'
            : undefined
        }
        onChange={onChange}
      >
        <option>Velg alder</option>
        {formaterteAldere.slice(0, formaterteAldere.length).map((alderChip) => (
          <option key={alderChip} value={alderChip}>
            {alderChip}
          </option>
        ))}
      </Select>
    </div>
  )
}
/* c8 ignore end */

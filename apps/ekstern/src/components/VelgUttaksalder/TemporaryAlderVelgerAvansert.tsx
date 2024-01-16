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
import { formatUttaksalder, unformatUttaksalder } from '@/utils/alder'

import { DEFAULT_TIDLIGST_UTTAKSALDER, getFormaterteAldere } from './utils'

interface Props {
  name: string
  label: string
  description?: string
  defaultValue?: Alder | null
  value?: Alder | null // controlled component
  hasValidationError?: boolean
  onChange?: (alder: Alder | undefined) => void
}

export const TemporaryAlderVelgerAvansert: React.FC<Props> = ({
  name,
  label,
  description,
  defaultValue,
  value,
  hasValidationError,
  onChange,
}) => {
  const intl = useIntl()
  const afp = useAppSelector(selectAfp)
  const harSamboer = useAppSelector(selectSamboer)
  const sivilstand = useAppSelector(selectSivilstand)
  const aarligInntektFoerUttak = useAppSelector(selectAarligInntektFoerUttak)

  const [tidligsteUttaksalderRequestBody, setTidligsteUttaksalderRequestBody] =
    React.useState<TidligsteUttaksalderRequestBody | undefined>(undefined)
  const [localValue, setLocalValue] = React.useState<string>(
    defaultValue ? formatUttaksalder(intl, defaultValue, { compact: true }) : ''
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

  React.useEffect(() => {
    if (value !== undefined) {
      setLocalValue(
        value !== null ? formatUttaksalder(intl, value, { compact: true }) : ''
      )
    }
  }, [value])

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

  const onLocalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    ;(prevShowValidationError: boolean) =>
      setShowValidationError(!prevShowValidationError)
    if (value === undefined) {
      setLocalValue(e.target.value)
    }
    if (onChange) {
      onChange(e.target.value ? unformatUttaksalder(e.target.value) : undefined)
    }
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
        data-testid={`temporaryAlderVelger-${name}`}
        form="avansert-beregning"
        name={name}
        label={label}
        description={
          description !== undefined
            ? description
            : isSuccess && tidligstMuligUttak
              ? `Du kan tidligst ta ut 100 % alderspensjon når du er ${formatUttaksalder(
                  intl,
                  tidligstMuligUttak
                )}. Vil du ta ut pensjon tidligere, må du velge lavere uttaksgrad.`
              : ''
        }
        value={
          value !== undefined
            ? value !== null
              ? formatUttaksalder(intl, value, { compact: true })
              : ''
            : localValue
        }
        error={
          hasValidationError && showValidationError
            ? 'VALIDATION ERROR'
            : undefined
        }
        onChange={onLocalChange}
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

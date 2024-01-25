/* c8 ignore start */
import React from 'react'
import { useIntl } from 'react-intl'

import { Select } from '@navikt/ds-react'

import { formatUttaksalder, unformatUttaksalder } from '@/utils/alder'

import {
  DEFAULT_TIDLIGST_UTTAKSALDER,
  DEFAULT_SENEST_UTTAKSALDER,
  getFormaterteAldere,
} from './utils'

interface Props {
  form?: string
  name: string
  label: string
  description?: string
  defaultValue?: Alder | null
  value?: Alder | null // controlled component
  minAlder?: Alder
  maxAlder?: Alder
  hasValidationError?: boolean
  onChange?: (alder: Alder | undefined) => void
}

export const TemporaryAlderVelgerAvansert: React.FC<Props> = ({
  form,
  name,
  label,
  description,
  defaultValue,
  value,
  minAlder,
  maxAlder,
  hasValidationError,
  onChange,
}) => {
  const intl = useIntl()

  const [localValue, setLocalValue] = React.useState<string>(
    defaultValue ? formatUttaksalder(intl, defaultValue, { compact: true }) : ''
  )

  React.useEffect(() => {
    if (value !== undefined) {
      setLocalValue(
        value !== null ? formatUttaksalder(intl, value, { compact: true }) : ''
      )
    }
  }, [value])

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
        minAlder ?? { ...DEFAULT_TIDLIGST_UTTAKSALDER },
        maxAlder ?? { ...DEFAULT_SENEST_UTTAKSALDER }
      ),
    [minAlder, maxAlder]
  )

  return (
    <div>
      <Select
        data-testid={`temporaryAlderVelger-${name}`}
        form={form}
        name={name}
        label={label}
        description={description !== undefined ? description : ''}
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

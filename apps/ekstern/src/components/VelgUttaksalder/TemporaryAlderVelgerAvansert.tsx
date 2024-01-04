/* c8 ignore start */
import React from 'react'
import { useIntl } from 'react-intl'

import { Select } from '@navikt/ds-react'

import { useAppSelector } from '@/state/hooks'
import { selectFormatertUttaksalderReadOnly } from '@/state/userInput/selectors'
import { formatUttaksalder } from '@/utils/alder'

import { DEFAULT_TIDLIGST_UTTAKSALDER, getFormaterteAldere } from './utils'

interface Props {
  tidligstMuligUttak: Alder
  hasValidationError?: boolean
}

export const TemporaryAlderVelgerAvansert: React.FC<Props> = ({
  tidligstMuligUttak = { ...DEFAULT_TIDLIGST_UTTAKSALDER },
  hasValidationError,
}) => {
  const intl = useIntl()
  const formatertUttaksalderReadOnly = useAppSelector(
    selectFormatertUttaksalderReadOnly
  )

  const [showValidationError, setShowValidationError] =
    React.useState<boolean>(true)

  React.useEffect(() => {
    setShowValidationError(true)
  }, [hasValidationError])

  const formaterteAldere = React.useMemo(
    () => getFormaterteAldere(intl, tidligstMuligUttak),
    [tidligstMuligUttak]
  )

  return (
    <div>
      <Select
        form="avansert-beregning"
        name="uttaksalder"
        label="Når vil du ta ut 100% alderspensjon"
        description={`Du kan tidligst ta ut 100 % alderspensjon når du er ${formatUttaksalder(
          intl,
          tidligstMuligUttak
        )}. Vil du ta ut pensjon tidligere, må du velge lavere uttaksgrad.`}
        defaultValue={formatertUttaksalderReadOnly ?? undefined}
        error={
          hasValidationError && showValidationError
            ? 'VALIDATION ERROR'
            : undefined
        }
        onChange={(prevShowValidationError) =>
          setShowValidationError(!prevShowValidationError)
        }
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

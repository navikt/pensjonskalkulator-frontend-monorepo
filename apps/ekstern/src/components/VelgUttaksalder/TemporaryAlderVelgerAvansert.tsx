/* c8 ignore start */
import React from 'react'
import { useIntl } from 'react-intl'

import { Select } from '@navikt/ds-react'

import { formatUttaksalder } from '@/components/VelgUttaksalder/utils'
import { useAppSelector } from '@/state/hooks'
import { selectFormatertUttaksalder } from '@/state/userInput/selectors'

import { DEFAULT_TIDLIGST_UTTAKSALDER, getFormaterteAldere } from './utils'

interface Props {
  tidligstMuligUttak: Alder
}

export const TemporaryAlderVelgerAvansert: React.FC<Props> = ({
  tidligstMuligUttak = { ...DEFAULT_TIDLIGST_UTTAKSALDER },
}) => {
  const intl = useIntl()
  const formatertUttaksalder = useAppSelector(selectFormatertUttaksalder)

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
        defaultValue={formatertUttaksalder ? formatertUttaksalder : undefined}
      >
        <option>Velg alder</option>
        {formaterteAldere.slice(0, formaterteAldere.length).map((alderChip) => (
          <option
            key={alderChip}
            value={alderChip}
            // selected={formatertUttaksalder === alderChip}
          >
            {alderChip}
          </option>
        ))}
      </Select>
    </div>
  )
}
/* c8 ignore end */
